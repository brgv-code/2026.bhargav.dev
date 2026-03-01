/**
 * Adds markdown plugin fields to the posts table:
 * markdown_input, content_html, source_document_id.
 * Safe to run on an existing database.
 *
 * Works with both SQLite (local) and Postgres (production).
 */
import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-sqlite'
import { sql as sqliteSql } from '@payloadcms/db-sqlite'
import type { MigrateUpArgs as PgMigrateUpArgs, MigrateDownArgs as PgMigrateDownArgs } from '@payloadcms/db-postgres'
import { sql as pgSql } from '@payloadcms/db-postgres'

function isSqlite(db: unknown): db is { run: (q: unknown) => Promise<unknown> } {
  return typeof (db as { run?: unknown })?.run === 'function'
}

async function runUp(db: MigrateUpArgs['db'] | PgMigrateUpArgs['db']): Promise<void> {
  if (isSqlite(db)) {
    await db.run(sqliteSql`ALTER TABLE posts ADD COLUMN markdown_input text`)
    await db.run(sqliteSql`ALTER TABLE posts ADD COLUMN content_html text`)
    await db.run(sqliteSql`ALTER TABLE posts ADD COLUMN source_document_id integer REFERENCES documents(id)`)
    await db.run(sqliteSql`CREATE INDEX IF NOT EXISTS posts_source_document_idx ON posts (source_document_id)`)
  } else {
    const pgDb = db as { execute: (q: unknown) => Promise<unknown> }
    await pgDb.execute(pgSql`ALTER TABLE posts ADD COLUMN markdown_input text`)
    await pgDb.execute(pgSql`ALTER TABLE posts ADD COLUMN content_html text`)
    await pgDb.execute(pgSql`ALTER TABLE posts ADD COLUMN source_document_id integer REFERENCES documents(id)`)
    await pgDb.execute(pgSql`CREATE INDEX IF NOT EXISTS posts_source_document_idx ON posts (source_document_id)`)
  }
}

async function runDown(db: MigrateDownArgs['db'] | PgMigrateDownArgs['db']): Promise<void> {
  if (isSqlite(db)) {
    await db.run(sqliteSql`DROP INDEX IF EXISTS posts_source_document_idx`)
    await db.run(sqliteSql`ALTER TABLE posts DROP COLUMN markdown_input`)
    await db.run(sqliteSql`ALTER TABLE posts DROP COLUMN content_html`)
    await db.run(sqliteSql`ALTER TABLE posts DROP COLUMN source_document_id`)
  } else {
    const pgDb = db as { execute: (q: unknown) => Promise<unknown> }
    await pgDb.execute(pgSql`DROP INDEX IF EXISTS posts_source_document_idx`)
    await pgDb.execute(pgSql`ALTER TABLE posts DROP COLUMN markdown_input`)
    await pgDb.execute(pgSql`ALTER TABLE posts DROP COLUMN content_html`)
    await pgDb.execute(pgSql`ALTER TABLE posts DROP COLUMN source_document_id`)
  }
}

export async function up(args: MigrateUpArgs): Promise<void> {
  await runUp(args.db)
}

export async function down(args: MigrateDownArgs): Promise<void> {
  await runDown(args.db)
}
