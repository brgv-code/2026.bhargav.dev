/**
 * Single production-ready migration for the notebooks collection.
 * Creates notebooks + notebooks_blocks tables, adds markdown/rich-text columns,
 * and registers notebooks in payload_locked_documents_rels.
 * Idempotent: safe to run on fresh DB or when tables/columns already exist.
 * Supports SQLite (local) and Postgres (production).
 */
import type { MigrateUpArgs, MigrateDownArgs } from "@payloadcms/db-sqlite";
import { sql as sqliteSql } from "@payloadcms/db-sqlite";
import type {
  MigrateUpArgs as PgMigrateUpArgs,
  MigrateDownArgs as PgMigrateDownArgs,
} from "@payloadcms/db-postgres";
import { sql as pgSql } from "@payloadcms/db-postgres";

const NOW_SQLITE = "strftime('%Y-%m-%dT%H:%M:%fZ', 'now')";
const LOCKED_RELS = "payload_locked_documents_rels";
const NOTEBOOKS = "notebooks";
const NOTEBOOKS_BLOCKS = "notebooks_blocks";
const NOTEBOOKS_ID_COL = "notebooks_id";

function isSqlite(
  db: unknown,
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
  return /duplicate column name|already exists/i.test(msg);
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

async function upSqlite(db: { run: (q: unknown) => Promise<unknown> }): Promise<void> {
  await db.run(
    sqliteSql.raw(`
      CREATE TABLE IF NOT EXISTS ${NOTEBOOKS} (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL UNIQUE,
        visibility TEXT NOT NULL DEFAULT 'private',
        pinned INTEGER NOT NULL DEFAULT 0,
        updated_at TEXT NOT NULL DEFAULT (${NOW_SQLITE}),
        created_at TEXT NOT NULL DEFAULT (${NOW_SQLITE})
      )
    `),
  );
  await db.run(
    sqliteSql.raw(`CREATE INDEX IF NOT EXISTS notebooks_updated_at_idx ON ${NOTEBOOKS} (updated_at)`),
  );
  await db.run(
    sqliteSql.raw(`CREATE INDEX IF NOT EXISTS notebooks_created_at_idx ON ${NOTEBOOKS} (created_at)`),
  );
  await db.run(
    sqliteSql.raw(`CREATE UNIQUE INDEX IF NOT EXISTS notebooks_date_idx ON ${NOTEBOOKS} (date)`),
  );

  await db.run(
    sqliteSql.raw(`
      CREATE TABLE IF NOT EXISTS ${NOTEBOOKS_BLOCKS} (
        _order INTEGER NOT NULL,
        _parent_id INTEGER NOT NULL REFERENCES ${NOTEBOOKS}(id) ON DELETE CASCADE,
        id TEXT PRIMARY KEY,
        block_id TEXT NOT NULL,
        type TEXT NOT NULL,
        content TEXT NOT NULL,
        lang TEXT,
        meta TEXT,
        tags TEXT
      )
    `),
  );
  await db.run(
    sqliteSql.raw(`CREATE INDEX IF NOT EXISTS notebooks_blocks_order_idx ON ${NOTEBOOKS_BLOCKS} (_order)`),
  );
  await db.run(
    sqliteSql.raw(`CREATE INDEX IF NOT EXISTS notebooks_blocks_parent_id_idx ON ${NOTEBOOKS_BLOCKS} (_parent_id)`),
  );

  for (const col of [
    "markdown_input text",
    "content text",
    "content_html text",
    "source_document_id integer REFERENCES documents(id)",
  ]) {
    try {
      await db.run(sqliteSql.raw(`ALTER TABLE ${NOTEBOOKS} ADD COLUMN ${col}`));
    } catch (e) {
      if (!isDuplicateColumnError(e)) throw e;
    }
  }
  try {
    await db.run(
      sqliteSql.raw(`CREATE INDEX IF NOT EXISTS ${NOTEBOOKS}_source_document_idx ON ${NOTEBOOKS} (source_document_id)`),
    );
  } catch (e) {
    if (!isDuplicateIndexError(e)) throw e;
  }

  try {
    await db.run(
      sqliteSql.raw(`ALTER TABLE ${LOCKED_RELS} ADD COLUMN ${NOTEBOOKS_ID_COL} integer`),
    );
  } catch (e) {
    if (!isDuplicateColumnError(e)) throw e;
  }
  try {
    await db.run(
      sqliteSql.raw(`CREATE INDEX IF NOT EXISTS ${LOCKED_RELS}_${NOTEBOOKS_ID_COL}_idx ON ${LOCKED_RELS} (${NOTEBOOKS_ID_COL})`),
    );
  } catch (e) {
    if (!isDuplicateColumnError(e) && !isDuplicateIndexError(e)) throw e;
  }
}

async function upPostgres(
  db: { execute: (q: unknown) => Promise<unknown> },
): Promise<void> {
  await db.execute(
    pgSql.raw(`
      CREATE TABLE IF NOT EXISTS ${NOTEBOOKS} (
        id SERIAL PRIMARY KEY,
        date TEXT NOT NULL UNIQUE,
        visibility TEXT NOT NULL DEFAULT 'private',
        pinned BOOLEAN NOT NULL DEFAULT false,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `),
  );
  await db.execute(
    pgSql.raw(`CREATE INDEX IF NOT EXISTS notebooks_updated_at_idx ON ${NOTEBOOKS} (updated_at)`),
  );
  await db.execute(
    pgSql.raw(`CREATE INDEX IF NOT EXISTS notebooks_created_at_idx ON ${NOTEBOOKS} (created_at)`),
  );
  await db.execute(
    pgSql.raw(`CREATE UNIQUE INDEX IF NOT EXISTS notebooks_date_idx ON ${NOTEBOOKS} (date)`),
  );

  await db.execute(
    pgSql.raw(`
      CREATE TABLE IF NOT EXISTS ${NOTEBOOKS_BLOCKS} (
        _order INTEGER NOT NULL,
        _parent_id INTEGER NOT NULL REFERENCES ${NOTEBOOKS}(id) ON DELETE CASCADE,
        id TEXT PRIMARY KEY,
        block_id TEXT NOT NULL,
        type TEXT NOT NULL,
        content TEXT NOT NULL,
        lang TEXT,
        meta TEXT,
        tags TEXT
      )
    `),
  );
  await db.execute(
    pgSql.raw(`CREATE INDEX IF NOT EXISTS notebooks_blocks_order_idx ON ${NOTEBOOKS_BLOCKS} (_order)`),
  );
  await db.execute(
    pgSql.raw(`CREATE INDEX IF NOT EXISTS notebooks_blocks_parent_id_idx ON ${NOTEBOOKS_BLOCKS} (_parent_id)`),
  );

  for (const col of [
    "markdown_input text",
    "content text",
    "content_html text",
    "source_document_id integer REFERENCES documents(id)",
  ]) {
    try {
      await db.execute(
        pgSql.raw(`ALTER TABLE ${NOTEBOOKS} ADD COLUMN IF NOT EXISTS ${col}`),
      );
    } catch (e) {
      if (!isDuplicateColumnError(e)) throw e;
    }
  }
  try {
    await db.execute(
      pgSql.raw(`CREATE INDEX IF NOT EXISTS ${NOTEBOOKS}_source_document_idx ON ${NOTEBOOKS} (source_document_id)`),
    );
  } catch (e) {
    if (!isDuplicateIndexError(e)) throw e;
  }

  try {
    await db.execute(
      pgSql.raw(`ALTER TABLE ${LOCKED_RELS} ADD COLUMN IF NOT EXISTS ${NOTEBOOKS_ID_COL} integer`),
    );
  } catch (e) {
    if (!isDuplicateColumnError(e)) throw e;
  }
  try {
    await db.execute(
      pgSql.raw(`CREATE INDEX IF NOT EXISTS ${LOCKED_RELS}_${NOTEBOOKS_ID_COL}_idx ON ${LOCKED_RELS} (${NOTEBOOKS_ID_COL})`),
    );
  } catch (e) {
    if (!isDuplicateIndexError(e)) throw e;
  }
}

async function downSqlite(db: { run: (q: unknown) => Promise<unknown> }): Promise<void> {
  await db.run(sqliteSql.raw(`DROP INDEX IF EXISTS ${LOCKED_RELS}_${NOTEBOOKS_ID_COL}_idx`));
  await db.run(sqliteSql.raw(`ALTER TABLE ${LOCKED_RELS} DROP COLUMN IF EXISTS ${NOTEBOOKS_ID_COL}`));
  await db.run(sqliteSql.raw(`DROP TABLE IF EXISTS ${NOTEBOOKS_BLOCKS}`));
  await db.run(sqliteSql.raw(`DROP TABLE IF EXISTS ${NOTEBOOKS}`));
}

async function downPostgres(db: { execute: (q: unknown) => Promise<unknown> }): Promise<void> {
  await db.execute(pgSql.raw(`DROP INDEX IF EXISTS ${LOCKED_RELS}_${NOTEBOOKS_ID_COL}_idx`));
  await db.execute(pgSql.raw(`ALTER TABLE ${LOCKED_RELS} DROP COLUMN IF EXISTS ${NOTEBOOKS_ID_COL}`));
  await db.execute(pgSql.raw(`DROP TABLE IF EXISTS ${NOTEBOOKS_BLOCKS}`));
  await db.execute(pgSql.raw(`DROP TABLE IF EXISTS ${NOTEBOOKS}`));
}

type PgDb = { execute: (q: unknown) => Promise<unknown> };

export async function up(args: MigrateUpArgs): Promise<void> {
  if (isSqlite(args.db)) {
    await upSqlite(args.db);
  } else {
    await upPostgres(args.db as unknown as PgDb);
  }
}

export async function down(args: MigrateDownArgs): Promise<void> {
  if (isSqlite(args.db)) {
    await downSqlite(args.db);
  } else {
    await downPostgres(args.db as unknown as PgDb);
  }
}
