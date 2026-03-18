/**
 * Ensures all markdown/rich-text columns exist on every table.
 * Idempotent catch-all: skips adding columns that already exist.
 * Tables: posts, series, tags, work_experience, favorites, streaks.
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
      sql.raw(`ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS markdown_input text`)
    );
    await pgDb.execute(
      sql.raw(`ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS content_html text`)
    );
    await pgDb.execute(
      sql.raw(
        `ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS source_document_id integer REFERENCES documents(id)`
      )
    );
    await pgDb.execute(
      sql.raw(
        `CREATE INDEX IF NOT EXISTS ${table}_source_document_idx ON ${table} (source_document_id)`
      )
    );
    await pgDb.execute(
      sql.raw(`ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS content text`)
    );
  }
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  // No-op: this migration only ensures columns exist; we don't drop them on down
  // to avoid breaking DBs that relied on the previous migrations.
}
