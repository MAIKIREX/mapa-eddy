---
name: nextjs-frontend-structure
description: |
  Use this skill when:
  - starting a new Next.js frontend project, or
  - the user asks to scaffold/standardize the folder architecture, or
  - adding a new domain feature under /features.

  This skill must be safe across different repository layouts (src/ vs root, app router vs pages router, monorepos).
license: MIT
metadata:
  author: "papi"
  version: "1.1.0"
  stack: "Next.js + TypeScript + Tailwind (optional)"
  goals:
    - "Consistent structure across projects"
    - "Separation: UI vs features vs shared libs"
    - "No duplicates, no breaking changes by default"
compatibility:
  platforms: ["codex"]
allowed-tools:
  - shell
  - filesystem
---

# Next.js Frontend Standard Structure (Flexible + Safe)

## Purpose

Create and maintain a scalable frontend structure for Next.js projects with:

- App Router (`/app`) when present
- TypeScript
- Tailwind (if present or requested)
- Feature-based organization (`/features`)
- Shared utilities (`/lib`) and global types (`/types`)

## Preflight detection (MUST DO FIRST)

Before creating/moving anything, detect the project layout:

### 1) Choose the project root (WORKSPACE_ROOT)

- If monorepo:
  - Prefer the Next app folder that contains `next.config.*` or `app/` or `pages/` and `package.json`.
  - Apply structure inside that app folder only (do NOT create at repo root unless that is the app).
- Otherwise:
  - WORKSPACE_ROOT is repository root.

### 2) Choose the code root (CODE_ROOT)

- If `WORKSPACE_ROOT/src` exists → `CODE_ROOT = WORKSPACE_ROOT/src`
- Else → `CODE_ROOT = WORKSPACE_ROOT`

### 3) Detect router type

- If `CODE_ROOT/app` exists → App Router (OK)
- Else if `CODE_ROOT/pages` exists and `CODE_ROOT/app` does not:
  - Do NOT create `app/` unless the user explicitly requests migration to App Router.
  - You may still create `components/`, `features/`, `lib/`, `types/` under CODE_ROOT if requested.

## Non-negotiable rules (guardrails)

1. **No duplicates**:
   - Do not create duplicate `globals.css` or duplicate Tailwind configs.
   - Prefer `CODE_ROOT/app/globals.css` as the single global stylesheet when App Router is used.
   - Prefer a single Tailwind config at `WORKSPACE_ROOT/tailwind.config.ts` (or existing config location if already present).

2. **Respect existing layout**:
   - If `src/` exists, DO NOT create parallel `components/`/`features/` at root.
   - Never rename `src/`, `app/`, or `pages/`.
   - Do not move files unless the user explicitly asked for a refactor/re-organization.

3. **Safe-by-default**:
   - If user asked to “create structure” → scaffold folders/files only.
   - If user asked to “reorganize/refactor” → then and only then propose moves and update imports.

4. **UI vs domain separation**:
   - `CODE_ROOT/components/ui` = atomic, generic UI components
   - `CODE_ROOT/components/layout` = Header/Footer/Sidebar, global layout pieces
   - Domain/business logic lives under `CODE_ROOT/features/<domain>`

## Target structure (relative to CODE_ROOT)

Ensure (create if missing, respecting rules above):

CODE_ROOT/
├── app/ # only if App Router exists or user requested it
│ ├── page.tsx
│ ├── layout.tsx
│ └── globals.css # SINGLE global CSS entry (no duplicates)
│
├── components/
│ ├── ui/
│ └── layout/
│
├── features/
│ └── <feature>/
│ ├── components/
│ ├── hooks/
│ ├── services/
│ ├── lib/ # optional
│ ├── types.ts
│ └── validators.ts # optional
│
├── lib/
│ ├── api.ts # optional scaffold (only if user wants API client)
│ ├── fetcher.ts # optional scaffold
│ └── constants.ts
│
└── types/
└── index.d.ts

Additionally (relative to WORKSPACE_ROOT):
WORKSPACE_ROOT/
├── public/
│ └── images/
├── middleware.ts # if present, keep
├── next.config._ # if present, keep
├── tsconfig.json
└── tailwind.config._ # SINGLE tailwind config (keep existing location)

## No-duplicate policy (explicit)

### Global CSS

- If `CODE_ROOT/app/globals.css` exists → use it, do not create another `styles/globals.css`.
- If App Router is not present:
  - Do not create `app/globals.css`.
  - Only create global css if user asked (respect current pattern).

### Tailwind config

- If any of these exist, DO NOT create a second one:
  - `WORKSPACE_ROOT/tailwind.config.ts`
  - `WORKSPACE_ROOT/tailwind.config.js`
  - `WORKSPACE_ROOT/tailwind.config.cjs`
- If none exist and user wants Tailwind:
  - Create ONE at `WORKSPACE_ROOT/tailwind.config.ts`.

## Implementation steps (scaffold mode)

1. Preflight detection: set WORKSPACE_ROOT and CODE_ROOT.
2. Create folders under CODE_ROOT:
   - `components/ui`, `components/layout`, `features`, `lib`, `types`
3. Create `WORKSPACE_ROOT/public/images` if missing.
4. Create minimal placeholder files ONLY if missing and relevant:
   - `CODE_ROOT/lib/constants.ts` (safe)
   - `CODE_ROOT/types/index.d.ts` (safe)
   - `CODE_ROOT/lib/api.ts` and `CODE_ROOT/lib/fetcher.ts` ONLY if the user requests an API client layer.

## Implementation steps (refactor mode; only if user requested)

- Move generic UI components → `CODE_ROOT/components/ui`
- Move layout components → `CODE_ROOT/components/layout`
- Move domain code → `CODE_ROOT/features/<domain>`
- Update imports.
- Preserve routes and routing behavior.

## Examples: App Router pages mapped to Features (recommended)

### Example 1 — Public page: `/login`

Goal: keep `app` thin; feature owns UI + logic.

**Route files**

- `CODE_ROOT/app/login/page.tsx`

**Feature files**

- `CODE_ROOT/features/auth/components/LoginForm.tsx`
- `CODE_ROOT/features/auth/services/auth.service.ts`
- `CODE_ROOT/features/auth/hooks/useLogin.ts`
- `CODE_ROOT/features/auth/types.ts`

**page.tsx (composition only)**

- `app/login/page.tsx` should:
  - render a feature component (e.g. `<LoginPage />` or `<LoginForm />`)
  - avoid business logic (API calls, state machines, validation) inside `page.tsx`

Suggested structure for the feature:

- `features/auth/components/LoginPage.tsx` (page-level UI composition)
- `features/auth/components/LoginForm.tsx` (form component)
- `features/auth/hooks/useLogin.ts` (mutation/state)
- `features/auth/services/auth.service.ts` (API calls)

---

### Example 2 — Nested route: `/mapa/rutas`

Goal: route grouping maps to feature domain `mapa`.

**Route files**

- `CODE_ROOT/app/mapa/rutas/page.tsx`
- (optional) `CODE_ROOT/app/mapa/layout.tsx` (layout for all /mapa/\*)

**Feature files**

- `CODE_ROOT/features/mapa/components/RutasPage.tsx`
- `CODE_ROOT/features/mapa/components/RouteMap.tsx`
- `CODE_ROOT/features/mapa/lib/osrm.ts`
- `CODE_ROOT/features/mapa/types.ts`

**How it connects**

- `app/mapa/rutas/page.tsx` imports and renders `features/mapa/components/RutasPage`

---

### Example 3 — Dynamic route: `/productos/[id]`

Goal: route params handled at the boundary; feature consumes typed params and fetch logic.

**Route files**

- `CODE_ROOT/app/productos/[id]/page.tsx`

**Feature files**

- `CODE_ROOT/features/productos/components/ProductoDetallePage.tsx`
- `CODE_ROOT/features/productos/services/productos.service.ts`
- `CODE_ROOT/features/productos/types.ts`

**Guideline**

- In `app/productos/[id]/page.tsx`:
  - read params (`{ params }`)
  - pass `id` into feature component
  - feature service handles API calls (or server action, if used)

---

### Example 4 — Loading and Error boundaries (per-route)

Goal: use App Router conventions without polluting features.

**Route files**

- `CODE_ROOT/app/mapa/rutas/loading.tsx` (UI skeleton for this route)
- `CODE_ROOT/app/mapa/rutas/error.tsx` (error boundary for this route)

**Feature relationship**

- loading/error are route-level concerns; keep them in `app/`.
- Features may expose skeleton components (optional), e.g.:
  - `features/mapa/components/RutasSkeleton.tsx`
    Then `loading.tsx` can render that skeleton.

---

### Example 5 — Route Groups (optional): `(auth)` and `(dashboard)`

Goal: keep URL clean while organizing layouts.

**Route group**

- `CODE_ROOT/app/(auth)/login/page.tsx` → URL: `/login`
- `CODE_ROOT/app/(auth)/register/page.tsx` → URL: `/register`
- `CODE_ROOT/app/(dashboard)/dashboard/page.tsx` → URL: `/dashboard`

**Mapping rule**

- Group name is purely organizational in `app/`; features remain domain-based:
  - `features/auth/*` still owns auth logic/components
  - `features/dashboard/*` owns dashboard domain

---

## Page design rule of thumb (enforced)

- `app/**/page.tsx`: composition + routing concerns only.
- `features/**`: business logic, data fetching layer (services), domain components, hooks, types.
- `components/ui`: generic UI primitives only (no domain logic).
- `components/layout`: global shell pieces (header/footer/sidebar).

## Minimal default templates (only when requested)

### lib/api.ts (minimal)

- Create a small client scaffold.
- No hardcoded secrets.
- Base URL comes from env and can be empty.

### lib/fetcher.ts (minimal)

- Provide a generic `fetcher<T>()` wrapper.
- Prefer built-in `fetch` unless the repo already uses axios.

## Output expectations (always)

After applying:

- Print the resolved WORKSPACE_ROOT and CODE_ROOT.
- Provide a tree of created folders/files.
- Provide a list:
  - Created:
  - Moved: (if refactor mode)
  - Updated imports: (if refactor mode)

## Things you must NOT do

- Do not create duplicates of config/styles.
- Do not introduce new dependencies unless asked.
- Do not migrate Pages Router → App Router unless explicitly asked.
- Do not reorganize existing code unless explicitly asked.
