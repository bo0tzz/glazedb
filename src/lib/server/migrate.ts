import { Migrator } from 'kysely';
import type { MigrationProvider, Migration } from 'kysely';
import { db } from './db';

// Import migrations explicitly so they get bundled
import * as m001 from './migrations/001_initial';
import * as m002 from './migrations/002_foodsafe_nullable';

// Inline migration provider that doesn't rely on filesystem scanning
const migrationProvider: MigrationProvider = {
	async getMigrations(): Promise<Record<string, Migration>> {
		return {
			'001_initial': m001,
			'002_foodsafe_nullable': m002
		};
	}
};

export async function migrate() {
	const migrator = new Migrator({
		db,
		provider: migrationProvider
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
