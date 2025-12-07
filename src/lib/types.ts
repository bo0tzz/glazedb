import type { Generated, Insertable, Selectable, Updateable } from 'kysely';

export interface Database {
	glazes: GlazesTable;
	glaze_variants: GlazeVariantsTable;
}

export interface GlazesTable {
	id: Generated<string>;
	name: string;
	foodsafe: boolean | null;
	watertight: boolean;
	notes: string | null;
	created_at: Generated<Date>;
	updated_at: Generated<Date>;
}

export interface GlazeVariantsTable {
	id: Generated<string>;
	glaze_id: string;
	colour_code: string;
	temp_min: number;
	temp_max: number;
	photo: Buffer | null;
	created_at: Generated<Date>;
}

export type Glaze = Selectable<GlazesTable>;
export type NewGlaze = Insertable<GlazesTable>;
export type GlazeUpdate = Updateable<GlazesTable>;

export type GlazeVariant = Selectable<GlazeVariantsTable>;
export type NewGlazeVariant = Insertable<GlazeVariantsTable>;
export type GlazeVariantUpdate = Updateable<GlazeVariantsTable>;

// Variant without raw photo data - just a boolean flag
export interface GlazeVariantInfo {
	id: string;
	glaze_id: string;
	colour_code: string;
	temp_min: number;
	temp_max: number;
	photo: boolean; // true if photo exists, load via /api/photos/[id]
	created_at: Date;
}

export interface GlazeWithVariants extends Glaze {
	variants: GlazeVariantInfo[];
}
