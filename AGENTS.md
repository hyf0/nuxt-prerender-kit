# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

`nuxt-prerender-kit` is a Nuxt 4 module that tree-shakes server-only code from client bundles in statically generated (SSG/prerendered) sites. It provides `usePrerenderData`, a wrapper around `useAsyncData` that uses a Vite transform plugin to guard handlers behind `import.meta.prerender`, enabling dead code elimination.

## Commands

```bash
pnpm install              # Install deps + auto-runs prepare (stubs module, prepares playground + fixtures)
pnpm dev                  # Run playground (Nuxi dev server)
pnpm test                 # Run all tests (vitest)
pnpm test:watch           # Watch mode
npx vitest run test/transform.test.ts   # Run a single test file
pnpm test:types           # Type-check everything (playground + test fixtures)
pnpm prepack              # Build the module for publishing
pnpm run docs             # Run docs dev server
```

## Architecture

### Core flow

The module has two cooperating parts:

1. **Vite transform plugin** (`src/vite/transform-plugin.ts`) — At build time, rewrites `usePrerenderData('key', handler)` into `usePrerenderData('key', import.meta.prerender ? handler : __neverReachable_prerender())`. Since bundlers statically replace `import.meta.prerender`, DCE removes the handler (and its imports) from client bundles. The transform is skipped in dev mode (`config.command === 'serve'`).

2. **Runtime composable** (`src/runtime/composables/usePrerenderData.ts`) — A thin wrapper around Nuxt's `useAsyncData` that throws fatal errors on null data or fetch failures. Auto-imported by the module.

### Module registration (`src/module.ts`)

- Auto-imports `usePrerenderData` and `neverReachable`
- Registers alias `#nuxt-prerender-kit/runtime` → the neverReachable util (used by the transform's injected import)
- Adds the Vite transform plugin (can be disabled via `prerenderKit.debug.disableWrapping`)
- `configKey` is `prerenderKit`

### Tests

- **Unit**: `test/transform.test.ts` — Tests the Vite plugin transform output directly (no Nuxt context needed)
- **E2E**: `test/e2e-{ssg,ssr,csr,hybrid}.test.ts` — Each uses `@nuxt/test-utils` with a corresponding fixture in `test/fixtures/`. The SSG test runs `nuxt generate` in `beforeAll` and checks both HTML output and that client bundles don't contain server strings. SSR/CSR tests verify the expected error behavior.

### Key design constraints

- Handlers inside `usePrerenderData` should use **dynamic imports** (`await import(...)`) so server code is fully tree-shakeable; static imports defeat the purpose.
- The transform only matches direct `usePrerenderData(...)` calls (not aliased/renamed calls).
- Uses Babel parser + estree-walker + magic-string for AST-based transforms with sourcemap support.
