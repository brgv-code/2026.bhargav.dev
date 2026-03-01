import * as migration_20250101_000000_create_documents_table from './20250101_000000_create_documents_table';
import * as migration_20260301_171234_add_posts_markdown_fields from './20260301_171234_add_posts_markdown_fields';

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
];
