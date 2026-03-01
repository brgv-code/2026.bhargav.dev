/**
 * Creates the documents table so that later migrations can add foreign keys
 * referencing documents(id). Safe to run if the table already exists (IF NOT EXISTS).
 *
 * Works with both SQLite (local) and Postgres (production).
 */
import type { MigrateUpArgs, MigrateDownArgs } from "@payloadcms/db-sqlite";
import { sql as sqliteSql } from "@payloadcms/db-sqlite";
import type {
  MigrateUpArgs as PgMigrateUpArgs,
  MigrateDownArgs as PgMigrateDownArgs,
} from "@payloadcms/db-postgres";
import { sql as pgSql } from "@payloadcms/db-postgres";

const LEXICAL_EMPTY_DEFAULT = `{"root":{"type":"root","version":1,"children":[{"type":"paragraph","version":1,"children":[],"direction":null,"format":"","indent":0}],"direction":null,"format":"","indent":0}}`;

function isSqlite(db: unknown): db is { run: (q: unknown) => Promise<unknown> } {
  return typeof (db as { run?: unknown })?.run === "function";
}

async function runUp(
  db: MigrateUpArgs["db"] | PgMigrateUpArgs["db"]
): Promise<void> {
  if (isSqlite(db)) {
    await db.run(
      sqliteSql.raw(`
        CREATE TABLE IF NOT EXISTS documents (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          parsed_content TEXT DEFAULT '${LEXICAL_EMPTY_DEFAULT.replace(/'/g, "''")}',
          content_html TEXT,
          updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
          created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
          url TEXT,
          thumbnail_u_r_l TEXT,
          filename TEXT,
          mime_type TEXT,
          filesize REAL,
          width REAL,
          height REAL,
          focal_x REAL,
          focal_y REAL
        )
      `)
    );
    await db.run(
      sqliteSql.raw(
        "CREATE INDEX IF NOT EXISTS documents_updated_at_idx ON documents (updated_at)"
      )
    );
    await db.run(
      sqliteSql.raw(
        "CREATE INDEX IF NOT EXISTS documents_created_at_idx ON documents (created_at)"
      )
    );
    await db.run(
      sqliteSql.raw(
        "CREATE UNIQUE INDEX IF NOT EXISTS documents_filename_idx ON documents (filename)"
      )
    );
  } else {
    const pgDb = db as { execute: (q: unknown) => Promise<unknown> };
    await pgDb.execute(
      pgSql.raw(`
        CREATE TABLE IF NOT EXISTS documents (
          id SERIAL PRIMARY KEY,
          parsed_content TEXT DEFAULT '${LEXICAL_EMPTY_DEFAULT.replace(/'/g, "''")}',
          content_html TEXT,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          url TEXT,
          thumbnail_u_r_l TEXT,
          filename TEXT,
          mime_type TEXT,
          filesize NUMERIC,
          width NUMERIC,
          height NUMERIC,
          focal_x NUMERIC,
          focal_y NUMERIC
        )
      `)
    );
    await pgDb.execute(
      pgSql.raw(
        "CREATE INDEX IF NOT EXISTS documents_updated_at_idx ON documents (updated_at)"
      )
    );
    await pgDb.execute(
      pgSql.raw(
        "CREATE INDEX IF NOT EXISTS documents_created_at_idx ON documents (created_at)"
      )
    );
    await pgDb.execute(
      pgSql.raw(
        "CREATE UNIQUE INDEX IF NOT EXISTS documents_filename_idx ON documents (filename)"
      )
    );
  }
}

async function runDown(
  db: MigrateDownArgs["db"] | PgMigrateDownArgs["db"]
): Promise<void> {
  if (isSqlite(db)) {
    await db.run(sqliteSql.raw("DROP INDEX IF EXISTS documents_filename_idx"));
    await db.run(sqliteSql.raw("DROP INDEX IF EXISTS documents_created_at_idx"));
    await db.run(sqliteSql.raw("DROP INDEX IF EXISTS documents_updated_at_idx"));
    await db.run(sqliteSql.raw("DROP TABLE IF EXISTS documents"));
  } else {
    const pgDb = db as { execute: (q: unknown) => Promise<unknown> };
    await pgDb.execute(pgSql.raw("DROP INDEX IF EXISTS documents_filename_idx"));
    await pgDb.execute(
      pgSql.raw("DROP INDEX IF EXISTS documents_created_at_idx")
    );
    await pgDb.execute(
      pgSql.raw("DROP INDEX IF EXISTS documents_updated_at_idx")
    );
    await pgDb.execute(pgSql.raw("DROP TABLE IF EXISTS documents"));
  }
}

export async function up(args: MigrateUpArgs): Promise<void> {
  await runUp(args.db);
}

export async function down(args: MigrateDownArgs): Promise<void> {
  await runDown(args.db);
}
