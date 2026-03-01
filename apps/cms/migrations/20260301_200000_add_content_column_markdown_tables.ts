/**
 * Adds the missing `content` column (rich text / Lexical JSON) to tables that
 * have markdown paste fields. The migration 20260301_171234_add_posts_markdown_fields
 * only added markdown_input, content_html, and source_document_id; Payload expects
 * a `content` column for the rich text field.
 *
 * Tables: posts, series, tags, work_experience, favorites, streaks.
 * Safe to run if columns already exist (IF NOT EXISTS for Postgres).
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

async function runUp(
  db: MigrateUpArgs["db"] | PgMigrateUpArgs["db"]
): Promise<void> {
  if (isSqlite(db)) {
    for (const table of TABLES) {
      try {
        await db.run(
          sqliteSql.raw(`ALTER TABLE ${table} ADD COLUMN content text`)
        );
      } catch (e) {
        const msg = String((e as Error)?.message ?? e);
        if (!msg.includes("duplicate column name")) throw e;
      }
    }
  } else {
    const pgDb = db as { execute: (q: unknown) => Promise<unknown> };
    for (const table of TABLES) {
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
  if (isSqlite(db)) {
    for (const table of TABLES) {
      await db.run(sqliteSql.raw(`ALTER TABLE ${table} DROP COLUMN content`));
    }
  } else {
    const pgDb = db as { execute: (q: unknown) => Promise<unknown> };
    for (const table of TABLES) {
      await pgDb.execute(
        pgSql.raw(`ALTER TABLE ${table} DROP COLUMN IF EXISTS content`)
      );
    }
  }
}

export async function up(args: MigrateUpArgs): Promise<void> {
  await runUp(args.db);
}

export async function down(args: MigrateDownArgs): Promise<void> {
  await runDown(args.db);
}
