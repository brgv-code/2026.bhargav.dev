/**
 * Creates the documents table so that later migrations can add foreign keys
 * referencing documents(id). Safe to run if the table already exists (IF NOT EXISTS).
 */
import type { MigrateUpArgs, MigrateDownArgs } from "@payloadcms/db-postgres";
import { sql } from "@payloadcms/db-postgres";

const LEXICAL_EMPTY_DEFAULT = `{"root":{"type":"root","version":1,"children":[{"type":"paragraph","version":1,"children":[],"direction":null,"format":"","indent":0}],"direction":null,"format":"","indent":0}}`;

type Db = { execute: (q: unknown) => Promise<unknown> };

export async function up({ db }: MigrateUpArgs): Promise<void> {
  const pgDb = db as unknown as Db;
  await pgDb.execute(
    sql.raw(`
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
    sql.raw("CREATE INDEX IF NOT EXISTS documents_updated_at_idx ON documents (updated_at)")
  );
  await pgDb.execute(
    sql.raw("CREATE INDEX IF NOT EXISTS documents_created_at_idx ON documents (created_at)")
  );
  await pgDb.execute(
    sql.raw("CREATE UNIQUE INDEX IF NOT EXISTS documents_filename_idx ON documents (filename)")
  );
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  const pgDb = db as unknown as Db;
  await pgDb.execute(sql.raw("DROP INDEX IF EXISTS documents_filename_idx"));
  await pgDb.execute(sql.raw("DROP INDEX IF EXISTS documents_created_at_idx"));
  await pgDb.execute(sql.raw("DROP INDEX IF EXISTS documents_updated_at_idx"));
  await pgDb.execute(sql.raw("DROP TABLE IF EXISTS documents"));
}
