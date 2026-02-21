# QuestBoard

Plataforma all-in-one para RPG de mesa. Mobile-first (React Native) com interface web (React + Tailwind).

## Quick Start

```bash
pnpm install
pnpm db:generate
pnpm dev
```

## Monorepo Structure

- `apps/api` — Fastify backend API
- `apps/web` — React + Vite + Tailwind CSS 4 web app
- `apps/mobile` — React Native (Expo SDK 52 + NativeWind v4)
- `apps/worker` — BullMQ background workers
- `packages/shared` — Types, Zod schemas, constants, utils
- `packages/db` — Prisma schema, migrations, seed
- `packages/game-engine` — Grid, dice, fog, combat logic (pure functions)
- `packages/ui` — Cross-platform UI components

See `CLAUDE.md` for full documentation.
