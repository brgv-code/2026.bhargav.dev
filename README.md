# 2026.bhargav.dev

Portfolio and blog: Next.js frontend with Payload CMS for content. Monorepo managed with Turborepo and pnpm.

## Stack

- **apps/web** — Next.js 16 public site (portfolio, blog, streaks, favorites)
- **apps/cms** — Next.js 15 + Payload CMS (admin and API)
- **packages/tsconfig** — Shared TypeScript configs
- **packages/ui** — Shared UI (placeholder)
- **packages/cms-plugin** — Payload plugin for technical blog

## Getting started

1. Clone and install:

   ```bash
   pnpm install
   ```

2. Set up environment variables. Copy the example and fill in values:

   ```bash
   cp .env.example .env.local
   ```

   For local development you can run only the web app (with fallback behavior when CMS is not running) or run both. See below.

3. Run the dev servers:

   ```bash
   pnpm dev
   ```

   This starts both apps (web on port 3000, CMS on 3001). To run only web or only CMS:

   ```bash
   pnpm dev:web   # web only (port 3000)
   pnpm dev:cms   # CMS only (port 3001)
   ```

## Project structure

```
apps/
  web/     # Public site (Next.js 16)
  cms/     # Payload CMS admin + API (Next.js 15)
packages/
  tsconfig/    # Shared tsconfig
  ui/          # Shared UI (placeholder)
  cms-plugin/  # Payload technical blog plugin
```

## Scripts

| Command           | Description                 |
|-------------------|-----------------------------|
| `pnpm dev`        | Run web + CMS in development |
| `pnpm dev:web`    | Run web app only            |
| `pnpm dev:cms`     | Run CMS only                |
| `pnpm build`      | Build all apps              |
| `pnpm lint`       | Lint all workspaces         |
| `pnpm typecheck`  | Type-check all workspaces   |
| `pnpm format`     | Format with Prettier        |
| `pnpm format:check` | Check formatting          |

## License

MIT — see [LICENSE](LICENSE).

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).
