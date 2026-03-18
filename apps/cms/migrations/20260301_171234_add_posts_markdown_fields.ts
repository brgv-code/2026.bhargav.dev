/**
 * Adds markdown plugin fields to all collections that use the paste field:
 * markdown_input, content_html, source_document_id.
 * Tables: posts, series, tags, work_experience, favorites, streaks.
 * Depends on 20250101_000000_create_documents_table (documents table must exist).
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
  }
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  const pgDb = db as unknown as Db;
  for (const table of TABLES) {
    await pgDb.execute(
      sql.raw(`DROP INDEX IF EXISTS ${table}_source_document_idx`)
    );
    await pgDb.execute(
      sql.raw(`ALTER TABLE ${table} DROP COLUMN IF EXISTS markdown_input`)
    );
    await pgDb.execute(
      sql.raw(`ALTER TABLE ${table} DROP COLUMN IF EXISTS content_html`)
    );
    await pgDb.execute(
      sql.raw(`ALTER TABLE ${table} DROP COLUMN IF EXISTS source_document_id`)
    );
  }
}
