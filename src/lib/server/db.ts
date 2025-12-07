import { Kysely, PostgresDialect } from 'kysely';
import pg from 'pg';
import type { Database } from '$lib/types';
import { env } from '$env/dynamic/private';

const dialect = new PostgresDialect({
	pool: new pg.Pool({
		connectionString: env.DB_URL
	})
});

export const db = new Kysely<Database>({
	dialect
});
