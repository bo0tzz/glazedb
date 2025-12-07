import { Migrator, FileMigrationProvider } from 'kysely';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { db } from './db';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function migrate() {
	const migrator = new Migrator({
		db,
		provider: new FileMigrationProvider({
			fs,
			path,
			migrationFolder: path.join(__dirname, 'migrations')
		})
	});

	const { error, results } = await migrator.migrateToLatest();

	results?.forEach((it) => {
		if (it.status === 'Success') {
			console.log(`Migration "${it.migrationName}" executed successfully`);
		} else if (it.status === 'Error') {
			console.error(`Migration "${it.migrationName}" failed`);
		}
	});

	if (error) {
		console.error('Migration failed');
		console.error(error);
		throw error;
	}
}
