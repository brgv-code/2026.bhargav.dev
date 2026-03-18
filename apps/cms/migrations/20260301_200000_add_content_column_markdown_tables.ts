/**
 * Adds the missing `content` column (rich text / Lexical JSON) to tables that
 * have markdown paste fields.
 * Tables: posts, series, tags, work_experience, favorites, streaks.
 * Safe to run if columns already exist (IF NOT EXISTS).
 */
import type { MigrateUpArgs, MigrateDownArgs } from "@payloadcms/db-postgres";
import { sql } from "@payloadcms/db-postgres";

const TABLES = [
  "posts",
  "series",
  "tags",
  "work_experience",
  "favorites",
  "streaks",
] as const;

type Db = { execute: (q: unknown) => Promise<unknown> };

export async function up({ db }: MigrateUpArgs): Promise<void> {
  const pgDb = db as unknown as Db;
  for (const table of TABLES) {
    await pgDb.execute(
      sql.raw(`ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS content text`)
    );
  }
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  const pgDb = db as unknown as Db;
  for (const table of TABLES) {
    await pgDb.execute(
      sql.raw(`ALTER TABLE ${table} DROP COLUMN IF EXISTS content`)
    );
  }
}
