# Multi-tenant Task Management (Monorepo)

Live demo:

* [https://multi-tenant-task-management.gambonny.workers.dev](https://multi-tenant-task-management.gambonny.workers.dev)

This repository implements a small **multi-tenant task management system** composed of:

* A Cloudflare Worker API (Hono + Drizzle + Neon Postgres)
* A React frontend (TanStack Router + TanStack Query + Tailwind)

---

# Monorepo Structure

```
.
├── packages
│   ├── worker   # Cloudflare Worker API
│   └── app      # React frontend
```

## Root Scripts

* `pnpm typecheck` – TypeScript project references type checking
* `pnpm lint:check` – Biome lint
* `pnpm lint:write` – Biome autofix
* `pnpm format:write` – Biome formatting

---

# Local Development

## Prerequisites

* Node.js
* pnpm
* Neon Postgres database

---

## Install Dependencies

From the repository root:

```bash
pnpm install
```

---

# Worker Setup (`packages/worker`)

## Environment

Copy the example file:

```bash
cp packages/worker/.env.example packages/worker/.env
```

Configure:

* `DATABASE_URL` – Neon connection string
* `TENANT_A_TOKEN`
* `TENANT_B_TOKEN`

⚠ These tokens must match the frontend tokens for the UI to work.

---

## CORS

Allowed origins are configured in `wrangler.jsonc` under `ALLOWED_ORIGINS`.

If your frontend runs on a different origin, add it there.

---

## Run Worker

```bash
pnpm -C packages/worker db:migrate
pnpm -C packages/worker dev
```

Default:

```
http://localhost:8787
```

---

# App Setup (`packages/app`)

## Environment

Copy the example file:

```bash
cp packages/app/.env.example packages/app/.env
```

Configure:

* `VITE_API_URL` (default: `http://localhost:8787`)
* `VITE_TENANT_A_TOKEN`
* `VITE_TENANT_B_TOKEN`

Tokens must match the worker.

---

## Run App

```bash
pnpm -C packages/app dev
```

Default:

```
http://localhost:5173
```

# Tech Stack

* pnpm workspaces
* Cloudflare Workers + Hono
* Drizzle ORM
* Neon Postgres
* Valibot
* React + TypeScript
* TanStack Router
* TanStack Query
* TailwindCSS
* Biome

## Additional Utilities

The project uses two small utility packages I maintain:

- `cflo` – lightweight logger for Cloudflare environments
- `valext` – small extensions around Valibot for schema ergonomics

These are thin utilities and not required for understanding the core challenge implementation.
