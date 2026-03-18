/**
 * Adds sources and links JSONB columns to streaks for activity aggregation.
 * Idempotent.
 */
import type { MigrateUpArgs, MigrateDownArgs } from "@payloadcms/db-postgres";
import { sql } from "@payloadcms/db-postgres";

type Db = { execute: (q: unknown) => Promise<unknown> };

export async function up({ db }: MigrateUpArgs): Promise<void> {
  const pgDb = db as unknown as Db;
  for (const col of ["sources", "links"]) {
    await pgDb.execute(
      sql.raw(`ALTER TABLE streaks ADD COLUMN IF NOT EXISTS ${col} jsonb`)
    );
  }
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  const pgDb = db as unknown as Db;
  await pgDb.execute(sql.raw(`ALTER TABLE streaks DROP COLUMN IF EXISTS sources`));
  await pgDb.execute(sql.raw(`ALTER TABLE streaks DROP COLUMN IF EXISTS links`));
}
