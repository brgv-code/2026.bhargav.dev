/**
 * Adds markdown plugin fields to all collections that use the paste field:
 * markdown_input, content_html, source_document_id.
 * Tables: posts, series, tags, work_experience, favorites, streaks.
 * Depends on 20250101_000000_create_documents_table (documents table must exist).
 *
 * Works with both SQLite (local) and Postgres (production).
 */
import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-sqlite'
import { sql as sqliteSql } from '@payloadcms/db-sqlite'
import type { MigrateUpArgs as PgMigrateUpArgs, MigrateDownArgs as PgMigrateDownArgs } from '@payloadcms/db-postgres'
import { sql as pgSql } from '@payloadcms/db-postgres'

const TABLES = ['posts', 'series', 'tags', 'work_experience', 'favorites', 'streaks'] as const

function isSqlite(db: unknown): db is { run: (q: unknown) => Promise<unknown> } {
  return typeof (db as { run?: unknown })?.run === 'function'
}

async function runUp(db: MigrateUpArgs['db'] | PgMigrateUpArgs['db']): Promise<void> {
  if (isSqlite(db)) {
    for (const table of TABLES) {
      await db.run(sqliteSql.raw(`ALTER TABLE ${table} ADD COLUMN markdown_input text`))
      await db.run(sqliteSql.raw(`ALTER TABLE ${table} ADD COLUMN content_html text`))
      await db.run(sqliteSql.raw(`ALTER TABLE ${table} ADD COLUMN source_document_id integer REFERENCES documents(id)`))
      await db.run(sqliteSql.raw(`CREATE INDEX IF NOT EXISTS ${table}_source_document_idx ON ${table} (source_document_id)`))
    }
  } else {
    const pgDb = db as { execute: (q: unknown) => Promise<unknown> }
    for (const table of TABLES) {
      await pgDb.execute(pgSql.raw(`ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS markdown_input text`))
      await pgDb.execute(pgSql.raw(`ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS content_html text`))
      await pgDb.execute(pgSql.raw(`ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS source_document_id integer REFERENCES documents(id)`))
      await pgDb.execute(pgSql.raw(`CREATE INDEX IF NOT EXISTS ${table}_source_document_idx ON ${table} (source_document_id)`))
    }
  }
}

async function runDown(db: MigrateDownArgs['db'] | PgMigrateDownArgs['db']): Promise<void> {
  if (isSqlite(db)) {
    for (const table of TABLES) {
      await db.run(sqliteSql.raw(`DROP INDEX IF EXISTS ${table}_source_document_idx`))
      await db.run(sqliteSql.raw(`ALTER TABLE ${table} DROP COLUMN markdown_input`))
      await db.run(sqliteSql.raw(`ALTER TABLE ${table} DROP COLUMN content_html`))
      await db.run(sqliteSql.raw(`ALTER TABLE ${table} DROP COLUMN source_document_id`))
    }
  } else {
    const pgDb = db as { execute: (q: unknown) => Promise<unknown> }
    for (const table of TABLES) {
      await pgDb.execute(pgSql.raw(`DROP INDEX IF EXISTS ${table}_source_document_idx`))
      await pgDb.execute(pgSql.raw(`ALTER TABLE ${table} DROP COLUMN IF EXISTS markdown_input`))
      await pgDb.execute(pgSql.raw(`ALTER TABLE ${table} DROP COLUMN IF EXISTS content_html`))
      await pgDb.execute(pgSql.raw(`ALTER TABLE ${table} DROP COLUMN IF EXISTS source_document_id`))
    }
  }
}

export async function up(args: MigrateUpArgs): Promise<void> {
  await runUp(args.db)
}

export async function down(args: MigrateDownArgs): Promise<void> {
  await runDown(args.db)
}
