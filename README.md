# Celebrato — Personalized Digital Invitation Platform

A modular monolith Turborepo for creating and distributing beautiful, individually personalized digital invitations with group and per-recipient capability URLs.

## Repository Structure

```
invitation-platform/
├── apps/
│   ├── web/          Next.js 16 — Creator dashboard, editor & public invitation renderer
│   └── api/          NestJS 12  — REST API, business logic, MongoDB, R2 assets
│
├── packages/
│   ├── types/        Shared TypeScript domain types (Invitation, Recipient, RSVP, Asset…)
│   ├── validation/   Shared Zod schemas for all API inputs
│   ├── config/       Shared constants (default templates, API version)
│   └── ui/           Shared React component library (Button, Card, Badge, Input, Modal)
│
├── docker-compose.yml   Local MongoDB 7.0
├── .env.example         Environment variable template
└── turbo.json
```

## Quick Start

### 1. Install dependencies
```bash
pnpm install
```

### 2. Start local MongoDB
```bash
docker compose up -d
```

### 3. Configure environment
```bash
cp .env.example apps/api/.env
```

### 4. Run all apps in dev mode
```bash
pnpm dev
```

| Service | URL |
|---------|-----|
| Next.js (web) | http://localhost:3000 |
| NestJS (api) | http://localhost:3001 |
| API Health | http://localhost:3001/api/v1/health |

## Public Invitation URLs

| Pattern | Description |
|---------|-------------|
| `/i/:slug` | Base public invitation |
| `/i/:slug/p/:token` | Personalized per-recipient (cryptographic capability) |
| `/i/:slug/g/:group` | Group invitation link |

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Run all apps in development mode |
| `pnpm build` | Production build of all packages |
| `pnpm check-types` | TypeScript type checking across monorepo |
| `pnpm lint` | Lint all packages |

## Architecture

- **Frontend**: Next.js 16 + Tailwind CSS v4 + `@repo/ui` shared components
- **Backend**: NestJS 12 modular monolith with `api/v1` prefix, global exception filter, response envelope
- **Database**: MongoDB Atlas via Mongoose (local via Docker)
- **Storage**: Cloudflare R2 for binary assets (photos, videos, OG images)
- **Auth**: External provider (Supabase / Firebase) — backend validates JWT, extracts `userId`
- **Caching**: Cloudflare CDN edge caching for public invitation pages

## Implementation Phases

| Phase | Status | Scope |
|-------|--------|-------|
| 1–2 | ✅ Complete | Turborepo, shared packages, NestJS foundation, Next.js with Tailwind |
| 3 | 🔜 Next | Auth guard (JWT validation), Users module |
| 4 | 🔜 | Invitation CRUD (Mongoose schemas, REST endpoints) |
| 5 | 🔜 | Template system + public invitation renderer |
| 6 | 🔜 | R2 assets, presigned upload URLs |
| 7 | 🔜 | Recipients, groups, personalized URLs |
| 8 | 🔜 | RSVP engine (idempotent), dashboard summary |
| 9–10 | 🔜 | CDN caching, OG images, SEO, observability |
