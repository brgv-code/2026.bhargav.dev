# Contributing

Thanks for your interest in contributing.

## Setup

1. Fork and clone the repo.
2. Install dependencies: `pnpm install`
3. Copy `.env.example` to `.env.local` (and `apps/cms/.env.local` if you work on the CMS) and set any required variables.
4. Run `pnpm dev` to start the apps.

## Workflow

- Open an issue first for larger changes so we can align on approach.
- Create a branch from `main` (e.g. `feature/short-description` or `fix/issue-description`).
- Make your changes. Keep commits focused and messages clear.

## Checks before submitting a PR

- **Lint:** `pnpm lint` passes in all workspaces.
- **Types:** `pnpm typecheck` passes.
- **Build:** `pnpm build` succeeds.

Your PR will be reviewed and may need a few follow-ups. Once approved, a maintainer will merge it.
