# nuxt-prerender-kit

Nuxt module that tree-shakes server-only code from client bundles in statically generated sites.

## The Problem

In Nuxt SSG, data-fetching handlers passed to `useAsyncData` get bundled into the client even though they only run at build time. This pulls server-only code (database clients, API secrets, heavy libraries) into what users download.

## The Solution

A Vite plugin wraps `usePrerenderData` handlers with an `import.meta.prerender` guard. Since bundlers statically replace this flag, Dead Code Elimination removes the handler — and everything it imports — from the client bundle.

```
  usePrerenderData('key', import.meta.prerender ? handler : neverReachable())
                                    |
            ┌───────────────────────┼───────────────────┐
            |                       |                   |
      ┌─────┴─────┐          ┌─────┴─────┐       ┌─────┴─────┐
      │ Prerender │          │ SSR/CSR   │       │  Client   │
      │  (Build)  │          │ (Runtime) │       │  Bundle   │
      └─────┬─────┘          └─────┬─────┘       └─────┬─────┘
            │                      │                    │
       prerender                prerender            prerender
       = true                   = false              = false
       → handler runs           → throws error       → DCE removes
```

## Installation

```bash
npm install nuxt-prerender-kit
# or
pnpm add nuxt-prerender-kit
```

```typescript
export default defineNuxtConfig({
  modules: ['nuxt-prerender-kit'],
})
```

## Quick Start

`usePrerenderData` is auto-imported. Use dynamic imports inside the handler so server code is fully tree-shaken:

```typescript
const data = await usePrerenderData('my-key', async () => {
  const { db } = await import('~/server/database')
  return db.query('SELECT * FROM posts')
})
```

## Documentation

See the [full documentation](https://github.com/pindapixels/nuxt-prerender-kit/blob/main/docs) for detailed usage, API reference, and best practices.

## License

MIT
