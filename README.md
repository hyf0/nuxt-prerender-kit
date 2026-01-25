# nuxt-ssg

Nuxt module for SSG-optimized data fetching with automatic tree-shaking.

## Installation

```bash
npm install nuxt-ssg
# or
pnpm add nuxt-ssg
```

Add to your `nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
  modules: ['nuxt-ssg'],
})
```

## Usage

```typescript
const data = await useBuildAsyncData('my-key', async () => {
  const { Server } = await import('~/server/data')
  return Server.getData()
})
```

## How It Works

**`nuxt-ssg` is designed for static site generation (SSG).** It ensures data fetching only happens during prerender and prevents accidental usage in wrong render contexts.

1. **Build-time transformation**: A Vite plugin detects `useBuildAsyncData` calls and wraps the handler:
   ```typescript
   // Before
   useBuildAsyncData('key', handler)

   // After
   useBuildAsyncData('key', import.meta.prerender ? handler : __neverReachable)
   ```

2. **Prerender (SSG) context**: During build-time prerendering, `import.meta.prerender` is `true` → handler executes and fetches data

3. **Client bundle**: `import.meta.prerender` is **statically replaced** with `false` at compile time. This enables Dead Code Elimination (DCE) — the handler branch is completely removed from the client bundle. With dynamic imports inside the handler, all server code is tree-shaken.

4. **SSR context (wrong usage)**: In the server bundle, `import.meta.prerender` is a **runtime value** set by Nitro. It's `true` during prerender but `false` during SSR requests. If someone accidentally uses `useBuildAsyncData` on an SSR page, `__neverReachable` throws an error indicating the module is for SSG only.

```
┌─────────────────────────────────────────────────────────────┐
│  Transformed Code                                           │
│  useBuildAsyncData('key', import.meta.prerender             │
│    ? handler                                                │
│    : __neverReachable)                                      │
└─────────────────────────────────────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          │                   │                   │
    ┌─────┴─────┐       ┌─────┴─────┐       ┌─────┴─────┐
    │ Prerender │       │ SSR/CSR   │       │  Client   │
    │  (SSG)    │       │ (Runtime) │       │  Bundle   │
    └─────┬─────┘       └─────┬─────┘       └─────┬─────┘
          │                   │                   │
    ┌─────┴─────┐       ┌─────┴─────┐       ┌─────┴─────┐
    │ prerender │       │ prerender │       │ prerender │
    │ = true    │       │ = false   │       │ = false   │
    │ → handler │       │ → ERROR!  │       │ → DCE     │
    │   runs    │       │ (wrong    │       │ (removed) │
    │           │       │  context) │       │           │
    └───────────┘       └───────────┘       └───────────┘
```

**This module is NOT for SSR.** If you need data fetching for SSR pages, use Nuxt's standard `useAsyncData` instead.

## Configuration

The module works out of the box with sensible defaults. No configuration is required.

```typescript
export default defineNuxtConfig({
  modules: ['nuxt-ssg'],
})
```

## Why Dynamic Imports?

Static imports at the top of the file are resolved before any conditionals. Use dynamic `import()` inside the handler to ensure server code is only loaded during prerender.

```typescript
// ❌ Static import - bundled regardless of conditional
import { Server } from '~/server/data'

useBuildAsyncData('key', async () => {
  return Server.getData() // Server already bundled!
})

// ✅ Dynamic import - tree-shaken from client
useBuildAsyncData('key', async () => {
  const { Server } = await import('~/server/data')
  return Server.getData()
})
```

## API

### `useBuildAsyncData(key, handler, options?)`

A wrapper around `useAsyncData` optimized for SSG.

- **key**: `string` - Unique key for data deduplication
- **handler**: `(ctx: NuxtApp) => Promise<T>` - Async function that fetches data
- **options**: `AsyncDataOptions<T>` - Optional options (same as `useAsyncData`)

Returns the resolved data directly (not wrapped in `AsyncData`).

```typescript
// With transform option
const items = await useBuildAsyncData(
  'items-key',
  async () => {
    const { Server } = await import('~/server/data')
    return Server.getAllItems()
  },
  { transform: (data) => data.items },
)
```

### `neverReachable`

Placeholder function for manual usage when transform is disabled. Throws an error if called.

```typescript
import { neverReachable } from 'nuxt-ssg'

useBuildAsyncData(
  'key',
  import.meta.prerender ? handler : neverReachable,
)
```

## Disabling Automatic Wrapping

If you prefer manual control, you can disable the automatic wrapping as an escape hatch:

```typescript
export default defineNuxtConfig({
  modules: ['nuxt-ssg'],
  ssg: {
    debug: {
      disableWrapping: true,
    },
  },
})
```

Then wrap handlers manually:

```typescript
useBuildAsyncData(
  'key',
  import.meta.prerender
    ? async () => {
        const { Server } = await import('~/server/data')
        return Server.getData()
      }
    : neverReachable,
)
```

## Development

```bash
# Install dependencies
pnpm install

# Prepare module
pnpm dev:prepare

# Run playground
pnpm dev

# Build module
pnpm prepack
```

## License

MIT
