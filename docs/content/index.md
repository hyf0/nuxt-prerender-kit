---
seo:
  title: Nuxt Prerender Kit
  description: Nuxt module for prerender-optimized data fetching with automatic tree-shaking.
---

::u-page-hero
#title
Nuxt Prerender Kit

#description
Nuxt module for prerender-optimized data fetching with automatic tree-shaking.

#links
  :::u-button
  ---
  color: neutral
  size: xl
  to: /getting-started/installation
  trailing-icon: i-lucide-arrow-right
  ---
  Get started
  :::

  :::u-button
  ---
  color: neutral
  icon: simple-icons-github
  size: xl
  to: https://github.com/yunfeihe/nuxt-prerender-kit
  variant: outline
  ---
  Star on GitHub
  :::
::

::u-page-section
#title
Features

#features
  :::u-page-feature
  ---
  icon: i-lucide-clock
  ---
  #title
  Build-time data fetching

  #description
  `usePrerenderData` fetches data during prerender (SSG) and ensures the handler is never executed at runtime.
  :::

  :::u-page-feature
  ---
  icon: i-lucide-scissors
  ---
  #title
  Automatic tree-shaking

  #description
  A Vite plugin wraps handlers with `import.meta.prerender` conditionals, enabling dead code elimination so server-only code is completely removed from the client bundle.
  :::

  :::u-page-feature
  ---
  icon: i-lucide-replace
  ---
  #title
  Drop-in replacement

  #description
  Works like `useAsyncData` but designed exclusively for SSG pages.
  :::

  :::u-page-feature
  ---
  icon: i-lucide-settings
  ---
  #title
  Zero configuration

  #description
  Works out of the box with sensible defaults. `usePrerenderData` is auto-imported globally — just use it directly in any page or component.
  :::

  :::u-page-feature
  ---
  icon: i-lucide-bot
  ---
  #title
  AI friendly

  #description
  Ships with an agent skill that teaches AI coding assistants best practices for `usePrerenderData`, preventing common mistakes automatically.
  :::
::
