/**
 * Adds sources and links JSON columns to streaks for activity aggregation.
 * Idempotent; safe for SQLite and Postgres.
 */
import type { MigrateUpArgs, MigrateDownArgs } from "@payloadcms/db-sqlite";
import { sql as sqliteSql } from "@payloadcms/db-sqlite";
import { sql as pgSql } from "@payloadcms/db-postgres";

function isSqlite(
  db: unknown
): db is { run: (q: unknown) => Promise<unknown> } {
  return typeof (db as { run?: unknown })?.run === "function";
}

function isDuplicateColumnError(e: unknown): boolean {
  const msg = String((e as Error)?.message ?? e);
  return /duplicate column name|already exists/i.test(msg);
}

type PgDb = { execute: (q: unknown) => Promise<unknown> };

export async function up(args: MigrateUpArgs): Promise<void> {
  const db = args.db;
  if (isSqlite(db)) {
    for (const col of ["sources", "links"]) {
      try {
        await db.run(
          sqliteSql.raw(`ALTER TABLE streaks ADD COLUMN ${col} text`)
        );
      } catch (e) {
        if (!isDuplicateColumnError(e)) throw e;
      }
    }
    return;
  }
  // safe: branch is only taken when db is Postgres adapter (has execute)
  const pgDb = db as unknown as PgDb;
  for (const col of ["sources", "links"]) {
    await pgDb.execute(pgSql.raw(`
      ALTER TABLE streaks ADD COLUMN IF NOT EXISTS ${col} jsonb
    `));
  }
}

export async function down(args: MigrateDownArgs): Promise<void> {
  const db = args.db;
  if (isSqlite(db)) {
    return;
  }
  // safe: branch is only taken when db is Postgres adapter
  const pgDb = db as unknown as PgDb;
  await pgDb.execute(pgSql.raw(`ALTER TABLE streaks DROP COLUMN IF EXISTS sources`));
  await pgDb.execute(pgSql.raw(`ALTER TABLE streaks DROP COLUMN IF EXISTS links`));
}
