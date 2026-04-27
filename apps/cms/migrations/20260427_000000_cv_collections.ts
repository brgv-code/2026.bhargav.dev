/**
 * CV collections: education, research, community, skills, languages.
 * work_experience: add summary, location, order; replace tech_stack with tech array.
 * profile global: add resume_summary.
 * Idempotent — all statements use IF NOT EXISTS or IF EXISTS guards.
 */
import type { MigrateUpArgs, MigrateDownArgs } from "@payloadcms/db-postgres";
import { sql } from "@payloadcms/db-postgres";

const LOCKED_RELS = "payload_locked_documents_rels";

type Db = { execute: (q: unknown) => Promise<unknown> };

export async function up({ db }: MigrateUpArgs): Promise<void> {
  const pgDb = db as unknown as Db;

  // ── work_experience: new columns ─────────────────────────────────────────
  await pgDb.execute(
    sql.raw(`ALTER TABLE work_experience ADD COLUMN IF NOT EXISTS summary TEXT`)
  );
  await pgDb.execute(
    sql.raw(`ALTER TABLE work_experience ADD COLUMN IF NOT EXISTS location TEXT`)
  );
  await pgDb.execute(
    sql.raw(`ALTER TABLE work_experience ADD COLUMN IF NOT EXISTS "order" NUMERIC DEFAULT 0`)
  );

  // ── work_experience_tech (replaces tech_stack text column) ───────────────
  await pgDb.execute(
    sql.raw(`
      CREATE TABLE IF NOT EXISTS work_experience_tech (
        _order INTEGER NOT NULL,
        _parent_id INTEGER NOT NULL REFERENCES work_experience(id) ON DELETE CASCADE,
        id TEXT PRIMARY KEY,
        label TEXT NOT NULL
      )
    `)
  );
  await pgDb.execute(
    sql.raw(`CREATE INDEX IF NOT EXISTS work_experience_tech_order_idx ON work_experience_tech (_order)`)
  );
  await pgDb.execute(
    sql.raw(`CREATE INDEX IF NOT EXISTS work_experience_tech_parent_id_idx ON work_experience_tech (_parent_id)`)
  );

  // ── profile global: resume_summary ───────────────────────────────────────
  await pgDb.execute(
    sql.raw(`ALTER TABLE profile ADD COLUMN IF NOT EXISTS resume_summary TEXT`)
  );

  // ── education ────────────────────────────────────────────────────────────
  await pgDb.execute(
    sql.raw(`
      CREATE TABLE IF NOT EXISTS education (
        id SERIAL PRIMARY KEY,
        institution TEXT NOT NULL,
        degree TEXT NOT NULL,
        location TEXT,
        start_year TEXT,
        end_year TEXT,
        note TEXT,
        "order" NUMERIC DEFAULT 0,
        markdown_input TEXT,
        parsed_content JSONB,
        content_html TEXT,
        source_document_id INTEGER REFERENCES documents(id) ON DELETE SET NULL,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `)
  );
  await pgDb.execute(
    sql.raw(`CREATE INDEX IF NOT EXISTS education_order_idx ON education ("order")`)
  );
  await pgDb.execute(
    sql.raw(`CREATE INDEX IF NOT EXISTS education_updated_at_idx ON education (updated_at)`)
  );
  await pgDb.execute(
    sql.raw(`CREATE INDEX IF NOT EXISTS education_created_at_idx ON education (created_at)`)
  );

  // ── research ─────────────────────────────────────────────────────────────
  await pgDb.execute(
    sql.raw(`
      CREATE TABLE IF NOT EXISTS research (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        subtitle TEXT,
        institution TEXT,
        year TEXT,
        description TEXT,
        url TEXT,
        "order" NUMERIC DEFAULT 0,
        markdown_input TEXT,
        parsed_content JSONB,
        content_html TEXT,
        source_document_id INTEGER REFERENCES documents(id) ON DELETE SET NULL,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `)
  );
  await pgDb.execute(
    sql.raw(`CREATE INDEX IF NOT EXISTS research_order_idx ON research ("order")`)
  );
  await pgDb.execute(
    sql.raw(`CREATE INDEX IF NOT EXISTS research_updated_at_idx ON research (updated_at)`)
  );
  await pgDb.execute(
    sql.raw(`CREATE INDEX IF NOT EXISTS research_created_at_idx ON research (created_at)`)
  );

  // ── community ────────────────────────────────────────────────────────────
  await pgDb.execute(
    sql.raw(`
      CREATE TABLE IF NOT EXISTS community (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        role TEXT NOT NULL,
        url TEXT,
        start_date TEXT,
        end_date TEXT,
        description TEXT,
        "order" NUMERIC DEFAULT 0,
        markdown_input TEXT,
        parsed_content JSONB,
        content_html TEXT,
        source_document_id INTEGER REFERENCES documents(id) ON DELETE SET NULL,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `)
  );
  await pgDb.execute(
    sql.raw(`CREATE INDEX IF NOT EXISTS community_order_idx ON community ("order")`)
  );
  await pgDb.execute(
    sql.raw(`CREATE INDEX IF NOT EXISTS community_updated_at_idx ON community (updated_at)`)
  );
  await pgDb.execute(
    sql.raw(`CREATE INDEX IF NOT EXISTS community_created_at_idx ON community (created_at)`)
  );

  // ── skills ───────────────────────────────────────────────────────────────
  await pgDb.execute(
    sql.raw(`
      CREATE TABLE IF NOT EXISTS skills (
        id SERIAL PRIMARY KEY,
        category TEXT NOT NULL,
        "order" NUMERIC DEFAULT 0,
        markdown_input TEXT,
        parsed_content JSONB,
        content_html TEXT,
        source_document_id INTEGER REFERENCES documents(id) ON DELETE SET NULL,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `)
  );
  await pgDb.execute(
    sql.raw(`
      CREATE TABLE IF NOT EXISTS skills_items (
        _order INTEGER NOT NULL,
        _parent_id INTEGER NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL
      )
    `)
  );
  await pgDb.execute(
    sql.raw(`CREATE INDEX IF NOT EXISTS skills_order_idx ON skills ("order")`)
  );
  await pgDb.execute(
    sql.raw(`CREATE INDEX IF NOT EXISTS skills_updated_at_idx ON skills (updated_at)`)
  );
  await pgDb.execute(
    sql.raw(`CREATE INDEX IF NOT EXISTS skills_created_at_idx ON skills (created_at)`)
  );
  await pgDb.execute(
    sql.raw(`CREATE INDEX IF NOT EXISTS skills_items_order_idx ON skills_items (_order)`)
  );
  await pgDb.execute(
    sql.raw(`CREATE INDEX IF NOT EXISTS skills_items_parent_id_idx ON skills_items (_parent_id)`)
  );

  // ── languages ────────────────────────────────────────────────────────────
  await pgDb.execute(
    sql.raw(`
      CREATE TABLE IF NOT EXISTS languages (
        id SERIAL PRIMARY KEY,
        language TEXT NOT NULL,
        level TEXT NOT NULL,
        "order" NUMERIC DEFAULT 0,
        markdown_input TEXT,
        parsed_content JSONB,
        content_html TEXT,
        source_document_id INTEGER REFERENCES documents(id) ON DELETE SET NULL,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `)
  );
  await pgDb.execute(
    sql.raw(`CREATE INDEX IF NOT EXISTS languages_order_idx ON languages ("order")`)
  );
  await pgDb.execute(
    sql.raw(`CREATE INDEX IF NOT EXISTS languages_updated_at_idx ON languages (updated_at)`)
  );
  await pgDb.execute(
    sql.raw(`CREATE INDEX IF NOT EXISTS languages_created_at_idx ON languages (created_at)`)
  );

  // ── payload_locked_documents_rels columns ─────────────────────────────────
  const newCols = [
    { col: "education_id", table: "education" },
    { col: "research_id", table: "research" },
    { col: "community_id", table: "community" },
    { col: "skills_id", table: "skills" },
    { col: "languages_id", table: "languages" },
  ] as const;

  for (const { col, table } of newCols) {
    await pgDb.execute(
      sql.raw(
        `ALTER TABLE ${LOCKED_RELS} ADD COLUMN IF NOT EXISTS ${col} integer REFERENCES ${table}(id) ON DELETE SET NULL`
      )
    );
    await pgDb.execute(
      sql.raw(
        `CREATE INDEX IF NOT EXISTS ${LOCKED_RELS}_${col}_idx ON ${LOCKED_RELS} (${col})`
      )
    );
  }
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  // Intentionally no-op — dropping CV content tables is destructive.
}
