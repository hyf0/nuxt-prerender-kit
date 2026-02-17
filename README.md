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
// usePrerenderData returns the resolved value directly — no .value, no .error
const data = await usePrerenderData('my-key', async () => {
  const { db } = await import('~/server/database')
  return db.query('SELECT * FROM posts')
})

// Use it right away, it's already unwrapped
console.log(data.title)
```

Compare with `useAsyncData`:

```typescript
// useAsyncData returns refs — you need .value everywhere
const { data, error } = await useAsyncData('my-key', () => fetchPosts())
console.log(data.value?.title)
if (error.value) { /* handle error */ }

// usePrerenderData — data is fetched at build time, errors throw immediately
const data = await usePrerenderData('my-key', handler)
console.log(data.title) // plain value, no .value needed
// no error handling needed — failures are fatal build errors
```

## Gotchas

- **`nuxt dev` won't catch misuse.** The Vite transform is skipped in dev mode, so `usePrerenderData` behaves like a normal `useAsyncData` call. You won't see errors until you build.
- **`nuxt generate` (full SSG) is 100% safe.** Every route is prerendered, so handlers always run at build time and get tree-shaken from client bundles.
- **Hybrid rendering needs care.** If you use `routeRules` to mix prerendered and server-rendered routes, any SSR/CSR route that hits a `usePrerenderData` call will throw a fatal error at runtime — the handler is guarded behind `import.meta.prerender` which is `false` outside of prerendering. Make sure `usePrerenderData` is only used in routes that are actually prerendered.

## Documentation

See the [full documentation](https://hyf0.github.io/nuxt-prerender-kit/) for detailed usage, API reference, and best practices.

## License

MIT
