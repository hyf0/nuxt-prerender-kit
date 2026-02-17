---
name: nuxt-prerender-kit-best-practices
description: "Provides nuxt-prerender-kit best practices and prevents common mistakes. Automatically applies when writing or reviewing code that calls usePrerenderData in a project with nuxt-prerender-kit installed. Do NOT use for general Nuxt, Vite, or useAsyncData questions unrelated to this module."
license: MIT
user-invocable: false
metadata:
  author: github.com/hyf0
  version: "1.1.0"
  category: domain-knowledge
  tags: [nuxt, ssg, prerender, tree-shaking]
---

# nuxt-prerender-kit Best Practices

`nuxt dev` skips the Vite transform entirely — all `usePrerenderData` mistakes are invisible during development and only surface during `nuxt generate`. Get it right while writing code.

## Verification checklist

Verify every `usePrerenderData` call against these checks:

- [ ] Handler is self-contained — uses dynamic imports, avoids referencing outer scope variables/imports
- [ ] Return value is consumed as a plain value (no `.value`, no `{ data, error }` destructuring)
- [ ] Call is a direct `usePrerenderData(...)`, not aliased or wrapped
- [ ] The route is prerendered (not SSR/CSR in hybrid mode)

## How usePrerenderData works

A Vite transform wraps the handler with `import.meta.prerender ? handler : neverReachable()` at build time:

- **Prerendering** (`nuxt generate`): handler runs, data is baked into HTML
- **Client bundles**: `import.meta.prerender` is `false`, DCE removes the handler and everything it imports
- **Return value**: the resolved data directly — not refs like `useAsyncData`

## Details per check

### Keep handlers self-contained

The handler gets DCE'd from client bundles, but anything it references from the outer scope (static imports, top-level variables) stays in the bundle. Use dynamic imports inside the handler and avoid referencing outside variables.

```typescript
// WRONG — db and config stay in client bundle even though the handler is removed
import { db } from '~/server/database'
import { config } from '~/server/config'
const data = await usePrerenderData('key', async () => db.query(config.sql))

// RIGHT — everything is inside the handler, fully tree-shaken
const data = await usePrerenderData('key', async () => {
  const { db } = await import('~/server/database')
  const { config } = await import('~/server/config')
  return db.query(config.sql)
})
```

### Consume the return value directly

Unlike `useAsyncData`, there are no refs. Data is resolved, errors are fatal.

```typescript
// WRONG — useAsyncData pattern doesn't apply here
const { data, error } = await usePrerenderData('key', handler)
console.log(data.value?.title)

// RIGHT — plain value, no .value needed
const data = await usePrerenderData('key', handler)
console.log(data.title)
```

### Call usePrerenderData directly

The Vite transform matches only literal `usePrerenderData(...)` calls by identifier. Aliasing, re-exporting, or wrapping silently breaks the transform.

```typescript
// WRONG
const fetchData = usePrerenderData
const data = await fetchData('key', handler)

// RIGHT
const data = await usePrerenderData('key', handler)
```

### Rendering mode constraints

- **`nuxt generate` (full SSG):** All routes are prerendered — always safe.
- **Hybrid rendering:** Only use `usePrerenderData` on prerendered routes. SSR/CSR routes throw fatal errors at runtime.

## Installation

1. **Via [skills-npm](https://github.com/antfu/skills-npm) (preferred)** — When `nuxt-prerender-kit` is installed as an npm dependency, the skill is auto-discovered from the published package (the `skills` directory is included in the `files` array). The skill stays in sync with the module version automatically.

2. **Via [skills-cli](https://github.com/antfu/skills-cli)** — Install directly from the GitHub repository as a fallback:
   ```bash
   npx skills add hyf0/nuxt-prerender-kit
   ```

## The Problem

In SSG sites, `useAsyncData` handlers contain server-only code — database queries, filesystem reads, API secrets — that runs exclusively at build time. But the handler code still gets bundled into client JavaScript. This means server logic and secrets leak into the browser bundle, and bundle size grows with dead code that never executes on the client.

## The Solution

`nuxt-prerender-kit` provides `usePrerenderData`, a drop-in replacement backed by a Vite transform plugin. At build time, the transform wraps each handler with an `import.meta.prerender` guard. Since bundlers statically evaluate `import.meta.prerender`, dead code elimination strips the handler (and everything it imports) from client bundles entirely. The data itself is baked into HTML during `nuxt generate` — client JavaScript never sees the handler code, only the pre-resolved data.
