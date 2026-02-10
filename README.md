# nuxt-prerender-kit

Nuxt module for prerender-optimized data fetching with automatic tree-shaking.

## Installation

```bash
npm install nuxt-prerender-kit
# or
pnpm add nuxt-prerender-kit
```

Add to your `nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
  modules: ['nuxt-prerender-kit'],
})
```

## Usage

`usePrerenderData` is auto-imported globally by Nuxt, so you can use it directly:

```typescript
const data = await usePrerenderData('my-key', async () => {
  const { Server } = await import('~/server/data')
  return Server.getData()
})
```

You can also import it manually if preferred:

```typescript
import { usePrerenderData } from 'nuxt-prerender-kit/runtime'
```

## How It Works

**`nuxt-prerender-kit` is designed for static site generation (SSG).** It ensures data fetching only happens during prerender and prevents accidental usage in wrong render contexts.

1. **Build-time transformation**: A Vite plugin detects `usePrerenderData` calls and wraps the handler:
   ```typescript
   // Before
   usePrerenderData('key', handler)

   // After
   usePrerenderData('key', import.meta.prerender ? handler : __neverReachable_prerender())
   ```

2. **Prerender (SSG) context**: During build-time prerendering, `import.meta.prerender` is `true` → handler executes and fetches data

3. **Client bundle**: `import.meta.prerender` is **statically replaced** with `false` at compile time. This enables Dead Code Elimination (DCE) — the handler branch is completely removed from the client bundle. With dynamic imports inside the handler, all server code is tree-shaken.

4. **SSR context (wrong usage)**: In the server bundle, `import.meta.prerender` is a **runtime value** set by Nitro. It's `true` during prerender but `false` during SSR requests. If someone accidentally uses `usePrerenderData` on an SSR page, `__neverReachable_prerender()` throws an error indicating the module is for SSG only.

```
┌─────────────────────────────────────────────────────────────┐
│  Transformed Code                                           │
│  usePrerenderData('key', import.meta.prerender              │
│    ? handler                                                │
│    : __neverReachable_prerender())                          │
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
  modules: ['nuxt-prerender-kit'],
})
```

## Limitations

- **Key is required**: Unlike `useAsyncData`, `usePrerenderData` requires an explicit key as the first argument. The auto-generated key pattern is not supported.

  ```typescript
  // ❌ Not supported
  usePrerenderData(async () => { ... })

  // ✅ Must provide a key
  usePrerenderData('my-key', async () => { ... })
  ```

## Why Dynamic Imports?

Static imports at the top of the file are resolved before any conditionals. Use dynamic `import()` inside the handler to ensure server code is only loaded during prerender.

```typescript
// ❌ Static import - bundled regardless of conditional
import { Server } from '~/server/data'

usePrerenderData('key', async () => {
  return Server.getData() // Server already bundled!
})

// ✅ Dynamic import - tree-shaken from client
usePrerenderData('key', async () => {
  const { Server } = await import('~/server/data')
  return Server.getData()
})
```

## API

### `usePrerenderData(key, handler, options?)`

A wrapper around `useAsyncData` optimized for SSG.

- **key**: `string` - Unique key for data deduplication
- **handler**: `(ctx: NuxtApp) => Promise<T>` - Async function that fetches data
- **options**: `AsyncDataOptions<T>` - Optional options (same as `useAsyncData`)

Returns the resolved data directly (not wrapped in `AsyncData`).

```typescript
// With transform option
const items = await usePrerenderData(
  'items-key',
  async () => {
    const { Server } = await import('~/server/data')
    return Server.getAllItems()
  },
  { transform: (data) => data.items },
)
```

## Disabling Automatic Wrapping

If you prefer manual control, you can disable the automatic wrapping as an escape hatch:

```typescript
export default defineNuxtConfig({
  modules: ['nuxt-prerender-kit'],
  prerenderKit: {
    debug: {
      disableWrapping: true,
    },
  },
})
```

Then wrap handlers manually:

```typescript
usePrerenderData(
  'key',
  import.meta.prerender
    ? async () => {
        const { Server } = await import('~/server/data')
        return Server.getData()
      }
    : neverReachable(),
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
