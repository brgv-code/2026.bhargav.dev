/**
 * Single migration for the notebooks collection.
 * Creates notebooks + notebooks_blocks tables, adds markdown/rich-text columns,
 * and registers notebooks in payload_locked_documents_rels.
 * Idempotent: safe to run on fresh DB or when tables/columns already exist.
 */
import type { MigrateUpArgs, MigrateDownArgs } from "@payloadcms/db-postgres";
import { sql } from "@payloadcms/db-postgres";

const LOCKED_RELS = "payload_locked_documents_rels";
const NOTEBOOKS = "notebooks";
const NOTEBOOKS_BLOCKS = "notebooks_blocks";
const NOTEBOOKS_ID_COL = "notebooks_id";

type Db = { execute: (q: unknown) => Promise<unknown> };

function isDuplicateColumnError(e: unknown): boolean {
  const err = e as Error & { cause?: Error };
  const msg = [err?.message, err?.cause?.message, String(e)]
    .filter(Boolean)
    .join(" ");
  return /duplicate column name|already exists/i.test(msg);
}

function isDuplicateIndexError(e: unknown): boolean {
  const err = e as Error & { cause?: Error };
  const msg = [err?.message, err?.cause?.message, String(e)]
    .filter(Boolean)
    .join(" ");
  return /duplicate index name|already exists/i.test(msg);
}

export async function up({ db }: MigrateUpArgs): Promise<void> {
  const pgDb = db as unknown as Db;

  await pgDb.execute(
    sql.raw(`
      CREATE TABLE IF NOT EXISTS ${NOTEBOOKS} (
        id SERIAL PRIMARY KEY,
        date TEXT NOT NULL UNIQUE,
        visibility TEXT NOT NULL DEFAULT 'private',
        pinned BOOLEAN NOT NULL DEFAULT false,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `)
  );
  await pgDb.execute(
    sql.raw(`CREATE INDEX IF NOT EXISTS notebooks_updated_at_idx ON ${NOTEBOOKS} (updated_at)`)
  );
  await pgDb.execute(
    sql.raw(`CREATE INDEX IF NOT EXISTS notebooks_created_at_idx ON ${NOTEBOOKS} (created_at)`)
  );
  await pgDb.execute(
    sql.raw(`CREATE UNIQUE INDEX IF NOT EXISTS notebooks_date_idx ON ${NOTEBOOKS} (date)`)
  );

  await pgDb.execute(
    sql.raw(`
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
    `)
  );
  await pgDb.execute(
    sql.raw(`CREATE INDEX IF NOT EXISTS notebooks_blocks_order_idx ON ${NOTEBOOKS_BLOCKS} (_order)`)
  );
  await pgDb.execute(
    sql.raw(`CREATE INDEX IF NOT EXISTS notebooks_blocks_parent_id_idx ON ${NOTEBOOKS_BLOCKS} (_parent_id)`)
  );

  for (const col of [
    "markdown_input text",
    "content text",
    "content_html text",
    "source_document_id integer REFERENCES documents(id)",
  ]) {
    try {
      await pgDb.execute(
        sql.raw(`ALTER TABLE ${NOTEBOOKS} ADD COLUMN IF NOT EXISTS ${col}`)
      );
    } catch (e) {
      if (!isDuplicateColumnError(e)) throw e;
    }
  }
  try {
    await pgDb.execute(
      sql.raw(
        `CREATE INDEX IF NOT EXISTS ${NOTEBOOKS}_source_document_idx ON ${NOTEBOOKS} (source_document_id)`
      )
    );
  } catch (e) {
    if (!isDuplicateIndexError(e)) throw e;
  }

  try {
    await pgDb.execute(
      sql.raw(
        `ALTER TABLE ${LOCKED_RELS} ADD COLUMN IF NOT EXISTS ${NOTEBOOKS_ID_COL} integer`
      )
    );
  } catch (e) {
    if (!isDuplicateColumnError(e)) throw e;
  }
  try {
    await pgDb.execute(
      sql.raw(
        `CREATE INDEX IF NOT EXISTS ${LOCKED_RELS}_${NOTEBOOKS_ID_COL}_idx ON ${LOCKED_RELS} (${NOTEBOOKS_ID_COL})`
      )
    );
  } catch (e) {
    if (!isDuplicateIndexError(e)) throw e;
  }
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  const pgDb = db as unknown as Db;
  await pgDb.execute(
    sql.raw(`DROP INDEX IF EXISTS ${LOCKED_RELS}_${NOTEBOOKS_ID_COL}_idx`)
  );
  await pgDb.execute(
    sql.raw(`ALTER TABLE ${LOCKED_RELS} DROP COLUMN IF EXISTS ${NOTEBOOKS_ID_COL}`)
  );
  await pgDb.execute(sql.raw(`DROP TABLE IF EXISTS ${NOTEBOOKS_BLOCKS}`));
  await pgDb.execute(sql.raw(`DROP TABLE IF EXISTS ${NOTEBOOKS}`));
}
