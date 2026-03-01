import * as migration_20250101_000000_create_documents_table from './20250101_000000_create_documents_table';
import * as migration_20260301_171234_add_posts_markdown_fields from './20260301_171234_add_posts_markdown_fields';
import * as migration_20260301_200000_add_content_column_markdown_tables from './20260301_200000_add_content_column_markdown_tables';

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
];
