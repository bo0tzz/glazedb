import type { Kysely } from 'kysely';
import { sql } from 'kysely';

export async function up(db: Kysely<unknown>): Promise<void> {
	await db.schema
		.createTable('glazes')
		.addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
		.addColumn('name', 'varchar(255)', (col) => col.notNull())
		.addColumn('foodsafe', 'boolean', (col) => col.notNull().defaultTo(false))
		.addColumn('watertight', 'boolean', (col) => col.notNull().defaultTo(false))
		.addColumn('notes', 'text')
		.addColumn('created_at', 'timestamptz', (col) => col.defaultTo(sql`NOW()`))
		.addColumn('updated_at', 'timestamptz', (col) => col.defaultTo(sql`NOW()`))
		.execute();

	await db.schema
		.createTable('glaze_variants')
		.addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
		.addColumn('glaze_id', 'uuid', (col) =>
			col.notNull().references('glazes.id').onDelete('cascade')
		)
		.addColumn('colour_code', 'varchar(7)', (col) => col.notNull())
		.addColumn('temp_min', 'integer', (col) => col.notNull())
		.addColumn('temp_max', 'integer', (col) => col.notNull())
		.addColumn('photo', 'bytea')
		.addColumn('created_at', 'timestamptz', (col) => col.defaultTo(sql`NOW()`))
		.execute();

	await db.schema
		.createIndex('idx_variants_glaze_id')
		.on('glaze_variants')
		.column('glaze_id')
		.execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
	await db.schema.dropTable('glaze_variants').execute();
	await db.schema.dropTable('glazes').execute();
}
