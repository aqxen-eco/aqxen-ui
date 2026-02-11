# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Upscale UI is the frontend for the AqXen Reputation System — a social platform for organizations to track and recognize achievements via blockchain-backed badges. Built with Next.js 15 (App Router), it integrates with EOSIO smart contracts on the Jungle 4 testnet and uses a PostgreSQL database via Prisma for local data (users, posts, mentions).

## Commands

```bash
pnpm dev                # Dev server with Turbopack (localhost:3000)
pnpm build              # Prisma generate + Next.js build
pnpm lint               # ESLint check
pnpm eslint:fix         # Auto-fix lint errors
pnpm prettier:fix       # Format all src files
pnpm prisma:migrate     # Create/run database migrations
pnpm prisma:studio      # Visual database editor
pnpm prisma:generate    # Regenerate Prisma client
```

Database setup: `docker compose up -d` (PostgreSQL on port 5433, user: docker, pass: docker, db: upscale).

No test framework is configured.

## Architecture

### Tech Stack
- **Next.js 15** with App Router, React 19, TypeScript (strict), Tailwind CSS v4
- **Radix UI** for accessible primitives, **tailwind-variants (`tv()`)** for component styling
- **React Query** for server state, **react-hook-form + zod** for forms
- **Wharfkit** for EOSIO wallet auth (Anchor wallet, Jungle 4 testnet)
- **Prisma 7** with PostgreSQL (Prisma client outputs to `generated/prisma`)
- **motion (Framer Motion)** for animations

### Provider Hierarchy (in `src/app/template.tsx`)
```
QueryProvider → ChainProvider → OrganizationProvider → AppBar + children + Footer + ToastContainer
```
- `ChainProvider` — wallet session via Wharfkit SessionKit, exposes `useChain()` hook
- `OrganizationProvider` — fetches org data for authenticated user, exposes `useOrganization()` hook
- `QueryProvider` — React Query client setup

### Key Directories
- `src/app/` — Next.js App Router pages. Public routes at top level, admin routes under `admin/`
- `src/api/chain/` — EOSIO blockchain API functions organized by domain (organization, badge, series, cycle, subscription, badge-automation, billing, season). Uses `jungleClient` from `jungle-client.ts`
- `src/api/model/` — TypeScript types/interfaces for blockchain data
- `src/components/ui/` — Base UI component library (Button, Box, Input, Select, Dropdown, etc.)
- `src/contexts/` — React context providers (chain, organization, query)
- `src/hooks/query/` — React Query custom hooks wrapping chain API calls
- `src/constants.ts` — Contract account names (all `*dev` suffixed), chain URL, IPFS source

### Data Fetching Pattern
Blockchain calls go through chain API functions → wrapped in React Query hooks → consumed in components:
```
src/api/chain/{domain}/ → src/hooks/query/use-get-*.ts → components
```
Actions that write to the chain use `execute-action.ts` with the user's Wharfkit session.

### Component Patterns
- UI components use `tv()` from tailwind-variants for variant-based styling
- Radix `asChild` via `@radix-ui/react-slot` for component polymorphism
- `twMerge` for safely combining Tailwind classes
- `'use client'` directive on components needing hooks, events, or browser APIs

## Code Style

- **No semicolons**, single quotes, 2-space indent, trailing commas (es5), 80 char print width
- **Arrow callbacks enforced**, template literals preferred over concatenation
- **Imports auto-sorted** by `simple-import-sort` (externals first, then `@/` aliased imports)
- **Unused imports** are errors; unused vars prefixed with `_` are allowed
- Prettier sorts Tailwind classes including inside `tv()` calls (`tailwindFunctions: ["tv"]`)
- Path alias: `@/*` maps to `./src/*`
- Dark theme throughout: `bg-black text-white` on body, custom colors defined in `src/globals.css` `@theme` block
