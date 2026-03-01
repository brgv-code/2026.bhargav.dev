/**
 * Ensures all markdown/rich-text columns exist on every table. Use when earlier
 * migrations were marked complete but some tables (e.g. work_experience) never
 * received the columns (e.g. due to partial failure or migration order).
 *
 * Tables: posts, series, tags, work_experience, favorites, streaks.
 * Idempotent: skips adding columns that already exist.
 */
import type { MigrateUpArgs, MigrateDownArgs } from "@payloadcms/db-sqlite";
import { sql as sqliteSql } from "@payloadcms/db-sqlite";
import type {
  MigrateUpArgs as PgMigrateUpArgs,
  MigrateDownArgs as PgMigrateDownArgs,
} from "@payloadcms/db-postgres";
import { sql as pgSql } from "@payloadcms/db-postgres";

const TABLES = [
  "posts",
  "series",
  "tags",
  "work_experience",
  "favorites",
  "streaks",
] as const;

function isSqlite(
  db: unknown
): db is { run: (q: unknown) => Promise<unknown> } {
  return typeof (db as { run?: unknown })?.run === "function";
}

function isDuplicateColumnError(e: unknown): boolean {
  const err = e as Error & { cause?: Error };
  const msg = [
    err?.message,
    err?.cause?.message,
    String(e),
  ]
    .filter(Boolean)
    .join(" ");
  return /duplicate column name/i.test(msg);
}

function isDuplicateIndexError(e: unknown): boolean {
  const err = e as Error & { cause?: Error };
  const msg = [
    err?.message,
    err?.cause?.message,
    String(e),
  ]
    .filter(Boolean)
    .join(" ");
  return /duplicate index name|already exists/i.test(msg);
}

async function runUp(
  db: MigrateUpArgs["db"] | PgMigrateUpArgs["db"]
): Promise<void> {
  if (isSqlite(db)) {
    for (const table of TABLES) {
      try {
        await db.run(
          sqliteSql.raw(`ALTER TABLE ${table} ADD COLUMN markdown_input text`)
        );
      } catch (e) {
        if (!isDuplicateColumnError(e)) throw e;
      }
      try {
        await db.run(
          sqliteSql.raw(`ALTER TABLE ${table} ADD COLUMN content_html text`)
        );
      } catch (e) {
        if (!isDuplicateColumnError(e)) throw e;
      }
      try {
        await db.run(
          sqliteSql.raw(
            `ALTER TABLE ${table} ADD COLUMN source_document_id integer REFERENCES documents(id)`
          )
        );
      } catch (e) {
        if (!isDuplicateColumnError(e)) throw e;
      }
      try {
        await db.run(
          sqliteSql.raw(
            `CREATE INDEX IF NOT EXISTS ${table}_source_document_idx ON ${table} (source_document_id)`
          )
        );
      } catch (e) {
        if (!isDuplicateIndexError(e)) throw e;
      }
      try {
        await db.run(
          sqliteSql.raw(`ALTER TABLE ${table} ADD COLUMN content text`)
        );
      } catch (e) {
        if (!isDuplicateColumnError(e)) throw e;
      }
    }
  } else {
    const pgDb = db as { execute: (q: unknown) => Promise<unknown> };
    for (const table of TABLES) {
      await pgDb.execute(
        pgSql.raw(
          `ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS markdown_input text`
        )
      );
      await pgDb.execute(
        pgSql.raw(
          `ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS content_html text`
        )
      );
      await pgDb.execute(
        pgSql.raw(
          `ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS source_document_id integer REFERENCES documents(id)`
        )
      );
      await pgDb.execute(
        pgSql.raw(
          `CREATE INDEX IF NOT EXISTS ${table}_source_document_idx ON ${table} (source_document_id)`
        )
      );
      await pgDb.execute(
        pgSql.raw(
          `ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS content text`
        )
      );
    }
  }
}

async function runDown(
  db: MigrateDownArgs["db"] | PgMigrateDownArgs["db"]
): Promise<void> {
  // No-op: this migration only ensures columns exist; we don't drop them on down
  // to avoid breaking DBs that relied on the previous migrations.
  void db;
}

export async function up(args: MigrateUpArgs): Promise<void> {
  await runUp(args.db);
}

export async function down(args: MigrateDownArgs): Promise<void> {
  await runDown(args.db);
}
