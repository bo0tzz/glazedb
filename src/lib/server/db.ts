import { Kysely, PostgresDialect } from 'kysely';
import pg from 'pg';
import type { Database } from '$lib/types';
import { DB_URL } from '$env/static/private';

const dialect = new PostgresDialect({
	pool: new pg.Pool({
		connectionString: DB_URL
	})
});

export const db = new Kysely<Database>({
	dialect
});
