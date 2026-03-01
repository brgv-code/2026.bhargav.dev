import * as migration_20260301_171234_add_posts_markdown_fields from './20260301_171234_add_posts_markdown_fields';

export const migrations = [
  {
    up: migration_20260301_171234_add_posts_markdown_fields.up,
    down: migration_20260301_171234_add_posts_markdown_fields.down,
    name: '20260301_171234_add_posts_markdown_fields'
  },
];
