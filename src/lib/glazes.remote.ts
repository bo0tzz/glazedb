import { query, command } from '$app/server';
import * as v from 'valibot';
import { db } from '$lib/server/db';
import { sql } from 'kysely';
import type { GlazeWithVariants, GlazeVariantInfo } from '$lib/types';

// Helper to select variant fields without raw photo data
async function selectVariants(glazeId?: string): Promise<GlazeVariantInfo[]> {
	let query = db
		.selectFrom('glaze_variants')
		.select([
			'id',
			'glaze_id',
			'colour_code',
			'temp_min',
			'temp_max',
			'created_at',
			sql<boolean>`photo IS NOT NULL`.as('photo')
		])
		.orderBy('temp_min', 'asc');

	if (glazeId) {
		query = query.where('glaze_id', '=', glazeId);
	}

	return await query.execute();
}

// Queries

export const getGlazes = query(async (): Promise<GlazeWithVariants[]> => {
	const glazes = await db.selectFrom('glazes').selectAll().orderBy('name', 'asc').execute();
	const variants = await selectVariants();

	return glazes.map((glaze) => ({
		...glaze,
		variants: variants.filter((variant) => variant.glaze_id === glaze.id)
	}));
});

export const getGlaze = query(v.string(), async (id: string): Promise<GlazeWithVariants | null> => {
	const glaze = await db.selectFrom('glazes').selectAll().where('id', '=', id).executeTakeFirst();

	if (!glaze) return null;

	const variants = await selectVariants(id);

	return { ...glaze, variants };
});

export const getChartData = query(
	async (): Promise<
		{
			id: string;
			name: string;
			variants: { colour_code: string; temp_min: number; temp_max: number }[];
		}[]
	> => {
		const glazes = await db
			.selectFrom('glazes')
			.select(['id', 'name'])
			.orderBy('name', 'asc')
			.execute();

		const variants = await db
			.selectFrom('glaze_variants')
			.select(['glaze_id', 'colour_code', 'temp_min', 'temp_max'])
			.orderBy('temp_min', 'asc')
			.execute();

		return glazes.map((glaze) => ({
			...glaze,
			variants: variants
				.filter((variant) => variant.glaze_id === glaze.id)
				.map(({ colour_code, temp_min, temp_max }) => ({ colour_code, temp_min, temp_max }))
		}));
	}
);

// Commands (mutations)

const createGlazeSchema = v.object({
	name: v.pipe(v.string(), v.nonEmpty('Name is required')),
	foodsafe: v.nullable(v.boolean()),
	watertight: v.optional(v.boolean(), false),
	notes: v.optional(v.string()),
	colour_code: v.pipe(v.string(), v.regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid colour code')),
	temp_min: v.pipe(v.number(), v.integer(), v.minValue(0)),
	temp_max: v.pipe(v.number(), v.integer(), v.minValue(0))
});

export const createGlaze = command(
	createGlazeSchema,
	async (data: v.InferOutput<typeof createGlazeSchema>) => {
		const { name, foodsafe, watertight, notes, colour_code, temp_min, temp_max } = data;

		const glaze = await db
			.insertInto('glazes')
			.values({
				name,
				foodsafe,
				watertight: watertight ?? false,
				notes: notes ?? null
			})
			.returningAll()
			.executeTakeFirstOrThrow();

		const variant = await db
			.insertInto('glaze_variants')
			.values({
				glaze_id: glaze.id,
				colour_code,
				temp_min,
				temp_max,
				photo: null
			})
			.returningAll()
			.executeTakeFirstOrThrow();

		return { glazeId: glaze.id, variantId: variant.id };
	}
);

const updateGlazeSchema = v.object({
	id: v.string(),
	name: v.pipe(v.string(), v.nonEmpty('Name is required')),
	foodsafe: v.nullable(v.boolean()),
	watertight: v.boolean(),
	notes: v.optional(v.string())
});

export const updateGlaze = command(
	updateGlazeSchema,
	async (data: v.InferOutput<typeof updateGlazeSchema>) => {
		const { id, name, foodsafe, watertight, notes } = data;

		await db
			.updateTable('glazes')
			.set({
				name,
				foodsafe,
				watertight,
				notes: notes ?? null,
				updated_at: new Date()
			})
			.where('id', '=', id)
			.execute();

		return { id };
	}
);

const addVariantSchema = v.object({
	glaze_id: v.string(),
	colour_code: v.pipe(v.string(), v.regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid colour code')),
	temp_min: v.pipe(v.number(), v.integer(), v.minValue(0)),
	temp_max: v.pipe(v.number(), v.integer(), v.minValue(0))
});

export const addVariant = command(
	addVariantSchema,
	async (data: v.InferOutput<typeof addVariantSchema>) => {
		const { glaze_id, colour_code, temp_min, temp_max } = data;

		const variant = await db
			.insertInto('glaze_variants')
			.values({
				glaze_id,
				colour_code,
				temp_min,
				temp_max,
				photo: null
			})
			.returningAll()
			.executeTakeFirstOrThrow();

		await db
			.updateTable('glazes')
			.set({ updated_at: new Date() })
			.where('id', '=', glaze_id)
			.execute();

		return { id: variant.id };
	}
);

const updateVariantSchema = v.object({
	id: v.string(),
	colour_code: v.pipe(v.string(), v.regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid colour code')),
	temp_min: v.pipe(v.number(), v.integer(), v.minValue(0)),
	temp_max: v.pipe(v.number(), v.integer(), v.minValue(0))
});

export const updateVariant = command(
	updateVariantSchema,
	async (data: v.InferOutput<typeof updateVariantSchema>) => {
		const { id, colour_code, temp_min, temp_max } = data;

		const variant = await db
			.updateTable('glaze_variants')
			.set({ colour_code, temp_min, temp_max })
			.where('id', '=', id)
			.returningAll()
			.executeTakeFirstOrThrow();

		await db
			.updateTable('glazes')
			.set({ updated_at: new Date() })
			.where('id', '=', variant.glaze_id)
			.execute();

		return { id };
	}
);

export const deleteGlaze = command(v.string(), async (id: string) => {
	await db.deleteFrom('glazes').where('id', '=', id).execute();
});

export const deleteVariant = command(v.string(), async (id: string) => {
	const variant = await db
		.selectFrom('glaze_variants')
		.select(['glaze_id'])
		.where('id', '=', id)
		.executeTakeFirst();

	if (!variant) return;

	const count = await db
		.selectFrom('glaze_variants')
		.select(db.fn.count('id').as('count'))
		.where('glaze_id', '=', variant.glaze_id)
		.executeTakeFirstOrThrow();

	if (Number(count.count) <= 1) {
		throw new Error('Cannot delete the only variant. Delete the glaze instead.');
	}

	await db.deleteFrom('glaze_variants').where('id', '=', id).execute();

	await db
		.updateTable('glazes')
		.set({ updated_at: new Date() })
		.where('id', '=', variant.glaze_id)
		.execute();
});
