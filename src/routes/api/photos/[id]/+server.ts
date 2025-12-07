import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import sharp from 'sharp';

async function processImage(buffer: Buffer): Promise<Buffer> {
	return sharp(buffer)
		.resize(2000, 2000, { fit: 'inside', withoutEnlargement: true })
		.webp({ quality: 85 })
		.toBuffer();
}

export const GET: RequestHandler = async ({ params }) => {
	const variant = await db
		.selectFrom('glaze_variants')
		.select(['photo'])
		.where('id', '=', params.id)
		.executeTakeFirst();

	if (!variant?.photo) {
		throw error(404, 'Photo not found');
	}

	return new Response(new Uint8Array(variant.photo), {
		headers: {
			'Content-Type': 'image/webp',
			'Cache-Control': 'public, max-age=31536000, immutable'
		}
	});
};

export const POST: RequestHandler = async ({ params, request }) => {
	const formData = await request.formData();
	const file = formData.get('photo') as File | null;

	if (!file || file.size === 0) {
		throw error(400, 'No photo provided');
	}

	const buffer = Buffer.from(await file.arrayBuffer());
	const processed = await processImage(buffer);

	const variant = await db
		.selectFrom('glaze_variants')
		.select(['glaze_id'])
		.where('id', '=', params.id)
		.executeTakeFirst();

	if (!variant) {
		throw error(404, 'Variant not found');
	}

	await db
		.updateTable('glaze_variants')
		.set({ photo: processed })
		.where('id', '=', params.id)
		.execute();

	await db
		.updateTable('glazes')
		.set({ updated_at: new Date() })
		.where('id', '=', variant.glaze_id)
		.execute();

	return json({ success: true });
};

export const DELETE: RequestHandler = async ({ params }) => {
	const variant = await db
		.selectFrom('glaze_variants')
		.select(['glaze_id'])
		.where('id', '=', params.id)
		.executeTakeFirst();

	if (!variant) {
		throw error(404, 'Variant not found');
	}

	await db.updateTable('glaze_variants').set({ photo: null }).where('id', '=', params.id).execute();

	await db
		.updateTable('glazes')
		.set({ updated_at: new Date() })
		.where('id', '=', variant.glaze_id)
		.execute();

	return json({ success: true });
};
