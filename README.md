# Pulse

Pulse is a production-minded, **original** real-time messenger (not affiliated with Telegram). It targets similar everyday UX—fast lists, calm density, rich threads—while using its own naming, palette, and layout.

## Stack

- **Web**: Next.js 15 (App Router), TypeScript, Tailwind, Zustand, TanStack Query, React Hook Form + Zod, Socket.IO client, Framer Motion, TanStack Virtual.
- **API**: NestJS, Prisma, PostgreSQL, Redis (presence, typing, Socket.IO adapter), JWT + opaque refresh sessions, Swagger at `/docs`.
- **Media**: S3-compatible SDK with **local `./uploads` fallback** when `S3_ENDPOINT` is unset.

## Repo layout

```
apps/
  server/     NestJS + Prisma
  web/        Next.js client
packages/
  types/      Shared DTO-style types (optional consumers)
```

## Prerequisites

- Node.js 20+
- Docker (for Postgres, Redis, optional MinIO)

## 1. Start infrastructure

```bash
docker compose up -d
```

This starts Postgres (`pulse` / `pulse_dev`), Redis, and MinIO (optional for S3-style uploads).

## 2. Install dependencies

From the repository root:

```bash
npm install
```

## 3. Database

```bash
cd apps/server
npx prisma migrate dev --name init
npx prisma db seed
```

Demo users (password `password123`):

- `alice@pulse.app`
- `bob@pulse.app`
- `carol@pulse.app`
- `dave@pulse.app`

## 4. Run locally

From the **repository root**:

```bash
npm run dev
```

- Web: http://localhost:3000  
- API + WebSocket: http://localhost:4000  
- OpenAPI: http://localhost:4000/docs  

## Environment

- Root `.env.example` documents all variables.
- `apps/server/.env` is pre-filled for local Docker Postgres/Redis.
- `apps/web/.env.local` points the client at the API.

To use MinIO, set `S3_*` variables in `apps/server/.env` (see `.env.example`) and create a bucket named `pulse-media`.

## Scripts

| Command            | Description                              |
| ------------------ | ---------------------------------------- |
| `npm run dev`      | Server + web concurrently                |
| `npm run build`    | Build types, server, web                   |
| `npm run db:seed`  | Reseed demo data                         |
| `npm run test`     | Server unit tests (Jest)                 |

## Security notes (baseline)

- Passwords hashed with bcrypt.
- DTO validation via `class-validator`.
- Throttling on auth routes.
- Refresh tokens are opaque, stored hashed; rotation on refresh.
- Upload MIME/size checks; serve local files only from `/uploads`.

## Legal

Pulse is an **independent** product. Do not use Telegram trademarks, logos, or proprietary assets. This codebase is built to be **inspired-by**, not a clone.

## Next improvements (backlog)

- BullMQ workers for heavy media processing and outbound digests.
- Postgres full-text search (or OpenSearch) replacing `ILIKE` scans.
- End-to-end encryption groundwork (double-ratchet architecture TBD).
- Push notifications (FCM/Web Push) and granular notification rules.
- Invite links, mentions, polls, scheduled messages (schemas stubbed in backlog only).
- Mobile native shells (Capacitor/React Native) reusing the API.
