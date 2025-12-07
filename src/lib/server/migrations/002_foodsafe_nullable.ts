import type { Kysely } from 'kysely';
import { sql } from 'kysely';

export async function up(db: Kysely<unknown>): Promise<void> {
	// Make foodsafe nullable (tri-state: true, false, null)
	await sql`ALTER TABLE glazes ALTER COLUMN foodsafe DROP NOT NULL`.execute(db);
	await sql`ALTER TABLE glazes ALTER COLUMN foodsafe DROP DEFAULT`.execute(db);
}

export async function down(db: Kysely<unknown>): Promise<void> {
	// Restore NOT NULL constraint with default false
	await sql`UPDATE glazes SET foodsafe = false WHERE foodsafe IS NULL`.execute(db);
	await sql`ALTER TABLE glazes ALTER COLUMN foodsafe SET NOT NULL`.execute(db);
	await sql`ALTER TABLE glazes ALTER COLUMN foodsafe SET DEFAULT false`.execute(db);
}
