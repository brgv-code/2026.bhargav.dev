import * as migration_20250101_000000_create_documents_table from './20250101_000000_create_documents_table';
import * as migration_20260301_171234_add_posts_markdown_fields from './20260301_171234_add_posts_markdown_fields';
import * as migration_20260301_200000_add_content_column_markdown_tables from './20260301_200000_add_content_column_markdown_tables';
import * as migration_20260301_220000_ensure_markdown_columns_sqlite from './20260301_220000_ensure_markdown_columns_sqlite';
import * as migration_20260305_000000_notebooks from './20260305_000000_notebooks';
import * as migration_20260307_220000_runtime_collections from './20260307_220000_runtime_collections';
import * as migration_20260310_000000_streaks_sources_links from './20260310_000000_streaks_sources_links';

export const migrations = [
  {
    up: migration_20250101_000000_create_documents_table.up,
    down: migration_20250101_000000_create_documents_table.down,
    name: '20250101_000000_create_documents_table',
  },
  {
    up: migration_20260301_171234_add_posts_markdown_fields.up,
    down: migration_20260301_171234_add_posts_markdown_fields.down,
    name: '20260301_171234_add_posts_markdown_fields',
  },
  {
    up: migration_20260301_200000_add_content_column_markdown_tables.up,
    down: migration_20260301_200000_add_content_column_markdown_tables.down,
    name: '20260301_200000_add_content_column_markdown_tables',
  },
  {
    up: migration_20260301_220000_ensure_markdown_columns_sqlite.up,
    down: migration_20260301_220000_ensure_markdown_columns_sqlite.down,
    name: '20260301_220000_ensure_markdown_columns_sqlite',
  },
  {
    up: migration_20260305_000000_notebooks.up,
    down: migration_20260305_000000_notebooks.down,
    name: '20260305_000000_notebooks',
  },
  {
    up: migration_20260307_220000_runtime_collections.up,
    down: migration_20260307_220000_runtime_collections.down,
    name: '20260307_220000_runtime_collections'
  },
  {
    up: migration_20260310_000000_streaks_sources_links.up,
    down: migration_20260310_000000_streaks_sources_links.down,
    name: '20260310_000000_streaks_sources_links'
  },
];
