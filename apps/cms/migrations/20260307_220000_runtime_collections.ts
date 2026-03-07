/**
 * Runtime domains migrated from Supabase/hardcoded state into Payload:
 * projects, books, reading_notes, habit_completions, error_logs.
 *
 * Also updates favorites schema:
 * - rename notes -> thoughts
 * - add thumbnail_url
 * - add date_added
 *
 * Idempotent and dual-adapter (SQLite + Postgres).
 */
import type { MigrateUpArgs, MigrateDownArgs } from "@payloadcms/db-sqlite";
import { sql as sqliteSql } from "@payloadcms/db-sqlite";
import type {
  MigrateDownArgs as PgMigrateDownArgs,
} from "@payloadcms/db-postgres";
import { sql as pgSql } from "@payloadcms/db-postgres";

const NOW_SQLITE = "strftime('%Y-%m-%dT%H:%M:%fZ', 'now')";
const LOCKED_RELS = "payload_locked_documents_rels";

function isSqlite(
  db: unknown,
): db is { run: (q: unknown) => Promise<unknown> } {
  return typeof (db as { run?: unknown })?.run === "function";
}

function errorMessage(e: unknown): string {
  const err = e as Error & { cause?: Error };
  return [err?.message, err?.cause?.message, String(e)].filter(Boolean).join(" ");
}

function isDuplicateColumnError(e: unknown): boolean {
  return /duplicate column name|already exists|column .* already exists/i.test(
    errorMessage(e),
  );
}

function isMissingColumnError(e: unknown): boolean {
  return /no such column|does not exist/i.test(errorMessage(e));
}

function isDuplicateIndexError(e: unknown): boolean {
  return /duplicate index name|already exists/i.test(errorMessage(e));
}

async function renameFavoritesNotesToThoughtsSqlite(
  db: { run: (q: unknown) => Promise<unknown> },
): Promise<void> {
  try {
    await db.run(
      sqliteSql.raw(`ALTER TABLE favorites RENAME COLUMN notes TO thoughts`),
    );
  } catch (e) {
    if (!isMissingColumnError(e) && !isDuplicateColumnError(e)) {
      throw e;
    }
  }
}

async function renameFavoritesNotesToThoughtsPostgres(
  db: { execute: (q: unknown) => Promise<unknown> },
): Promise<void> {
  await db.execute(
    pgSql.raw(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_name = 'favorites' AND column_name = 'notes'
        ) AND NOT EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_name = 'favorites' AND column_name = 'thoughts'
        ) THEN
          ALTER TABLE favorites RENAME COLUMN notes TO thoughts;
        END IF;
      END$$;
    `),
  );
}

async function upSqlite(db: { run: (q: unknown) => Promise<unknown> }): Promise<void> {
  await renameFavoritesNotesToThoughtsSqlite(db);

  for (const col of ["thumbnail_url text", "date_added text"]) {
    try {
      await db.run(sqliteSql.raw(`ALTER TABLE favorites ADD COLUMN ${col}`));
    } catch (e) {
      if (!isDuplicateColumnError(e)) throw e;
    }
  }
  await db.run(
    sqliteSql.raw(
      `UPDATE favorites SET date_added = COALESCE(date_added, created_at, (${NOW_SQLITE}))`,
    ),
  );

  await db.run(
    sqliteSql.raw(`
      CREATE TABLE IF NOT EXISTS projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        title TEXT,
        description TEXT NOT NULL,
        url TEXT NOT NULL,
        status TEXT DEFAULT 'wip',
        year TEXT,
        github TEXT,
        markdown_input TEXT,
        content TEXT,
        content_html TEXT,
        source_document_id INTEGER REFERENCES documents(id),
        updated_at TEXT NOT NULL DEFAULT (${NOW_SQLITE}),
        created_at TEXT NOT NULL DEFAULT (${NOW_SQLITE})
      )
    `),
  );
  await db.run(
    sqliteSql.raw(`CREATE INDEX IF NOT EXISTS projects_source_document_idx ON projects (source_document_id)`),
  );
  await db.run(
    sqliteSql.raw(`CREATE INDEX IF NOT EXISTS projects_updated_at_idx ON projects (updated_at)`),
  );
  await db.run(
    sqliteSql.raw(`CREATE INDEX IF NOT EXISTS projects_created_at_idx ON projects (created_at)`),
  );

  await db.run(
    sqliteSql.raw(`
      CREATE TABLE IF NOT EXISTS projects_tech (
        _order INTEGER NOT NULL,
        _parent_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        id TEXT PRIMARY KEY,
        label TEXT NOT NULL
      )
    `),
  );
  await db.run(
    sqliteSql.raw(`CREATE INDEX IF NOT EXISTS projects_tech_order_idx ON projects_tech (_order)`),
  );
  await db.run(
    sqliteSql.raw(`CREATE INDEX IF NOT EXISTS projects_tech_parent_id_idx ON projects_tech (_parent_id)`),
  );

  await db.run(
    sqliteSql.raw(`
      CREATE TABLE IF NOT EXISTS books (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        author TEXT,
        total_pages NUMERIC,
        current_page NUMERIC NOT NULL DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'reading',
        cover_image_id INTEGER REFERENCES media(id),
        started_at TEXT,
        finished_at TEXT,
        summary TEXT,
        markdown_input TEXT,
        content TEXT,
        content_html TEXT,
        source_document_id INTEGER REFERENCES documents(id),
        updated_at TEXT NOT NULL DEFAULT (${NOW_SQLITE}),
        created_at TEXT NOT NULL DEFAULT (${NOW_SQLITE})
      )
    `),
  );
  await db.run(
    sqliteSql.raw(`CREATE INDEX IF NOT EXISTS books_cover_image_idx ON books (cover_image_id)`),
  );
  await db.run(
    sqliteSql.raw(`CREATE INDEX IF NOT EXISTS books_source_document_idx ON books (source_document_id)`),
  );
  await db.run(
    sqliteSql.raw(`CREATE INDEX IF NOT EXISTS books_updated_at_idx ON books (updated_at)`),
  );
  await db.run(
    sqliteSql.raw(`CREATE INDEX IF NOT EXISTS books_created_at_idx ON books (created_at)`),
  );

  await db.run(
    sqliteSql.raw(`
      CREATE TABLE IF NOT EXISTS reading_notes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE SET NULL,
        date TEXT NOT NULL,
        page_start NUMERIC NOT NULL,
        page_end NUMERIC NOT NULL,
        pages_read NUMERIC NOT NULL DEFAULT 0,
        thoughts TEXT,
        habit_completion_id INTEGER REFERENCES habit_completions(id) ON DELETE SET NULL,
        markdown_input TEXT,
        content TEXT,
        content_html TEXT,
        source_document_id INTEGER REFERENCES documents(id),
        updated_at TEXT NOT NULL DEFAULT (${NOW_SQLITE}),
        created_at TEXT NOT NULL DEFAULT (${NOW_SQLITE})
      )
    `),
  );
  await db.run(
    sqliteSql.raw(`CREATE INDEX IF NOT EXISTS reading_notes_book_idx ON reading_notes (book_id)`),
  );
  await db.run(
    sqliteSql.raw(`CREATE INDEX IF NOT EXISTS reading_notes_habit_completion_idx ON reading_notes (habit_completion_id)`),
  );
  await db.run(
    sqliteSql.raw(`CREATE INDEX IF NOT EXISTS reading_notes_source_document_idx ON reading_notes (source_document_id)`),
  );
  await db.run(
    sqliteSql.raw(`CREATE INDEX IF NOT EXISTS reading_notes_updated_at_idx ON reading_notes (updated_at)`),
  );
  await db.run(
    sqliteSql.raw(`CREATE INDEX IF NOT EXISTS reading_notes_created_at_idx ON reading_notes (created_at)`),
  );

  await db.run(
    sqliteSql.raw(`
      CREATE TABLE IF NOT EXISTS habit_completions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        habit_key TEXT NOT NULL,
        date TEXT NOT NULL,
        completed INTEGER NOT NULL DEFAULT 0,
        value NUMERIC DEFAULT 0,
        notes TEXT,
        reading_note_id INTEGER REFERENCES reading_notes(id) ON DELETE SET NULL,
        markdown_input TEXT,
        content TEXT,
        content_html TEXT,
        source_document_id INTEGER REFERENCES documents(id),
        updated_at TEXT NOT NULL DEFAULT (${NOW_SQLITE}),
        created_at TEXT NOT NULL DEFAULT (${NOW_SQLITE})
      )
    `),
  );
  await db.run(
    sqliteSql.raw(`CREATE INDEX IF NOT EXISTS habit_completions_reading_note_idx ON habit_completions (reading_note_id)`),
  );
  await db.run(
    sqliteSql.raw(`CREATE INDEX IF NOT EXISTS habit_completions_source_document_idx ON habit_completions (source_document_id)`),
  );
  await db.run(
    sqliteSql.raw(`CREATE INDEX IF NOT EXISTS habit_completions_updated_at_idx ON habit_completions (updated_at)`),
  );
  await db.run(
    sqliteSql.raw(`CREATE INDEX IF NOT EXISTS habit_completions_created_at_idx ON habit_completions (created_at)`),
  );

  await db.run(
    sqliteSql.raw(`
      CREATE TABLE IF NOT EXISTS error_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        level TEXT NOT NULL DEFAULT 'error',
        source TEXT NOT NULL,
        message TEXT NOT NULL,
        stack TEXT,
        context TEXT,
        occurred_at TEXT NOT NULL,
        resolved INTEGER DEFAULT 0,
        resolved_at TEXT,
        resolution_notes TEXT,
        markdown_input TEXT,
        content TEXT,
        content_html TEXT,
        source_document_id INTEGER REFERENCES documents(id),
        updated_at TEXT NOT NULL DEFAULT (${NOW_SQLITE}),
        created_at TEXT NOT NULL DEFAULT (${NOW_SQLITE})
      )
    `),
  );
  await db.run(
    sqliteSql.raw(`CREATE INDEX IF NOT EXISTS error_logs_source_document_idx ON error_logs (source_document_id)`),
  );
  await db.run(
    sqliteSql.raw(`CREATE INDEX IF NOT EXISTS error_logs_updated_at_idx ON error_logs (updated_at)`),
  );
  await db.run(
    sqliteSql.raw(`CREATE INDEX IF NOT EXISTS error_logs_created_at_idx ON error_logs (created_at)`),
  );

  const lockedCols = [
    { col: "projects_id", table: "projects" },
    { col: "books_id", table: "books" },
    { col: "reading_notes_id", table: "reading_notes" },
    { col: "habit_completions_id", table: "habit_completions" },
    { col: "error_logs_id", table: "error_logs" },
  ] as const;

  for (const { col, table } of lockedCols) {
    try {
      await db.run(
        sqliteSql.raw(
          `ALTER TABLE ${LOCKED_RELS} ADD COLUMN ${col} integer REFERENCES ${table}(id)`,
        ),
      );
    } catch (e) {
      if (!isDuplicateColumnError(e)) throw e;
    }
    try {
      await db.run(
        sqliteSql.raw(`CREATE INDEX IF NOT EXISTS ${LOCKED_RELS}_${col}_idx ON ${LOCKED_RELS} (${col})`),
      );
    } catch (e) {
      if (!isDuplicateIndexError(e)) throw e;
    }
  }
}

async function upPostgres(
  db: { execute: (q: unknown) => Promise<unknown> },
): Promise<void> {
  await renameFavoritesNotesToThoughtsPostgres(db);

  await db.execute(
    pgSql.raw(`ALTER TABLE favorites ADD COLUMN IF NOT EXISTS thumbnail_url text`),
  );
  await db.execute(
    pgSql.raw(`ALTER TABLE favorites ADD COLUMN IF NOT EXISTS date_added timestamptz`),
  );
  await db.execute(
    pgSql.raw(`UPDATE favorites SET date_added = COALESCE(date_added, created_at, NOW())`),
  );

  await db.execute(
    pgSql.raw(`
      CREATE TABLE IF NOT EXISTS projects (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        title TEXT,
        description TEXT NOT NULL,
        url TEXT NOT NULL,
        status TEXT DEFAULT 'wip',
        year TEXT,
        github TEXT,
        markdown_input TEXT,
        content TEXT,
        content_html TEXT,
        source_document_id INTEGER REFERENCES documents(id) ON DELETE SET NULL,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `),
  );
  await db.execute(
    pgSql.raw(`CREATE INDEX IF NOT EXISTS projects_source_document_idx ON projects (source_document_id)`),
  );
  await db.execute(
    pgSql.raw(`CREATE INDEX IF NOT EXISTS projects_updated_at_idx ON projects (updated_at)`),
  );
  await db.execute(
    pgSql.raw(`CREATE INDEX IF NOT EXISTS projects_created_at_idx ON projects (created_at)`),
  );

  await db.execute(
    pgSql.raw(`
      CREATE TABLE IF NOT EXISTS projects_tech (
        _order INTEGER NOT NULL,
        _parent_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        id TEXT PRIMARY KEY,
        label TEXT NOT NULL
      )
    `),
  );
  await db.execute(
    pgSql.raw(`CREATE INDEX IF NOT EXISTS projects_tech_order_idx ON projects_tech (_order)`),
  );
  await db.execute(
    pgSql.raw(`CREATE INDEX IF NOT EXISTS projects_tech_parent_id_idx ON projects_tech (_parent_id)`),
  );

  await db.execute(
    pgSql.raw(`
      CREATE TABLE IF NOT EXISTS books (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        author TEXT,
        total_pages NUMERIC,
        current_page NUMERIC NOT NULL DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'reading',
        cover_image_id INTEGER REFERENCES media(id) ON DELETE SET NULL,
        started_at TIMESTAMPTZ,
        finished_at TIMESTAMPTZ,
        summary TEXT,
        markdown_input TEXT,
        content TEXT,
        content_html TEXT,
        source_document_id INTEGER REFERENCES documents(id) ON DELETE SET NULL,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `),
  );
  await db.execute(
    pgSql.raw(`CREATE INDEX IF NOT EXISTS books_cover_image_idx ON books (cover_image_id)`),
  );
  await db.execute(
    pgSql.raw(`CREATE INDEX IF NOT EXISTS books_source_document_idx ON books (source_document_id)`),
  );
  await db.execute(
    pgSql.raw(`CREATE INDEX IF NOT EXISTS books_updated_at_idx ON books (updated_at)`),
  );
  await db.execute(
    pgSql.raw(`CREATE INDEX IF NOT EXISTS books_created_at_idx ON books (created_at)`),
  );

  await db.execute(
    pgSql.raw(`
      CREATE TABLE IF NOT EXISTS reading_notes (
        id SERIAL PRIMARY KEY,
        book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE SET NULL,
        date TEXT NOT NULL,
        page_start NUMERIC NOT NULL,
        page_end NUMERIC NOT NULL,
        pages_read NUMERIC NOT NULL DEFAULT 0,
        thoughts TEXT,
        habit_completion_id INTEGER REFERENCES habit_completions(id) ON DELETE SET NULL,
        markdown_input TEXT,
        content TEXT,
        content_html TEXT,
        source_document_id INTEGER REFERENCES documents(id) ON DELETE SET NULL,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `),
  );
  await db.execute(
    pgSql.raw(`CREATE INDEX IF NOT EXISTS reading_notes_book_idx ON reading_notes (book_id)`),
  );
  await db.execute(
    pgSql.raw(`CREATE INDEX IF NOT EXISTS reading_notes_habit_completion_idx ON reading_notes (habit_completion_id)`),
  );
  await db.execute(
    pgSql.raw(`CREATE INDEX IF NOT EXISTS reading_notes_source_document_idx ON reading_notes (source_document_id)`),
  );
  await db.execute(
    pgSql.raw(`CREATE INDEX IF NOT EXISTS reading_notes_updated_at_idx ON reading_notes (updated_at)`),
  );
  await db.execute(
    pgSql.raw(`CREATE INDEX IF NOT EXISTS reading_notes_created_at_idx ON reading_notes (created_at)`),
  );

  await db.execute(
    pgSql.raw(`
      CREATE TABLE IF NOT EXISTS habit_completions (
        id SERIAL PRIMARY KEY,
        habit_key TEXT NOT NULL,
        date TEXT NOT NULL,
        completed BOOLEAN NOT NULL DEFAULT false,
        value NUMERIC DEFAULT 0,
        notes TEXT,
        reading_note_id INTEGER REFERENCES reading_notes(id) ON DELETE SET NULL,
        markdown_input TEXT,
        content TEXT,
        content_html TEXT,
        source_document_id INTEGER REFERENCES documents(id) ON DELETE SET NULL,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `),
  );
  await db.execute(
    pgSql.raw(`CREATE INDEX IF NOT EXISTS habit_completions_reading_note_idx ON habit_completions (reading_note_id)`),
  );
  await db.execute(
    pgSql.raw(`CREATE INDEX IF NOT EXISTS habit_completions_source_document_idx ON habit_completions (source_document_id)`),
  );
  await db.execute(
    pgSql.raw(`CREATE INDEX IF NOT EXISTS habit_completions_updated_at_idx ON habit_completions (updated_at)`),
  );
  await db.execute(
    pgSql.raw(`CREATE INDEX IF NOT EXISTS habit_completions_created_at_idx ON habit_completions (created_at)`),
  );

  await db.execute(
    pgSql.raw(`
      CREATE TABLE IF NOT EXISTS error_logs (
        id SERIAL PRIMARY KEY,
        level TEXT NOT NULL DEFAULT 'error',
        source TEXT NOT NULL,
        message TEXT NOT NULL,
        stack TEXT,
        context JSONB,
        occurred_at TIMESTAMPTZ NOT NULL,
        resolved BOOLEAN DEFAULT false,
        resolved_at TIMESTAMPTZ,
        resolution_notes TEXT,
        markdown_input TEXT,
        content TEXT,
        content_html TEXT,
        source_document_id INTEGER REFERENCES documents(id) ON DELETE SET NULL,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `),
  );
  await db.execute(
    pgSql.raw(`CREATE INDEX IF NOT EXISTS error_logs_source_document_idx ON error_logs (source_document_id)`),
  );
  await db.execute(
    pgSql.raw(`CREATE INDEX IF NOT EXISTS error_logs_updated_at_idx ON error_logs (updated_at)`),
  );
  await db.execute(
    pgSql.raw(`CREATE INDEX IF NOT EXISTS error_logs_created_at_idx ON error_logs (created_at)`),
  );

  const lockedCols = [
    { col: "projects_id", table: "projects" },
    { col: "books_id", table: "books" },
    { col: "reading_notes_id", table: "reading_notes" },
    { col: "habit_completions_id", table: "habit_completions" },
    { col: "error_logs_id", table: "error_logs" },
  ] as const;

  for (const { col, table } of lockedCols) {
    await db.execute(
      pgSql.raw(
        `ALTER TABLE ${LOCKED_RELS} ADD COLUMN IF NOT EXISTS ${col} integer REFERENCES ${table}(id)`,
      ),
    );
    await db.execute(
      pgSql.raw(`CREATE INDEX IF NOT EXISTS ${LOCKED_RELS}_${col}_idx ON ${LOCKED_RELS} (${col})`),
    );
  }
}

async function runDown(
  db: MigrateDownArgs["db"] | PgMigrateDownArgs["db"],
): Promise<void> {
  // Intentionally no-op to avoid destructive drops for runtime content tables.
  void db;
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
  await runDown(args.db);
}
