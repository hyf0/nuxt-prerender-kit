/**
 * A placeholder function that throws an error if called.
 * Used with the Vite transform plugin to ensure `usePrerenderData` handlers
 * are only executed during prerender (SSG) and tree-shaken from client bundles.
 *
 * @throws Error if called outside of prerender context
 */
export function neverReachable(): never {
  throw new Error(
    '[nuxt-prerender-kit] This function should never be called. ' +
      'It indicates that usePrerenderData was invoked outside of prerender context. ' +
      'This module is designed for SSG (Static Site Generation) only. ' +
      'If you need data fetching for SSR pages, use useAsyncData instead.',
  )
}

/**
 * Internal alias used by the transform plugin.
 * This is exported separately to avoid name collisions with user code.
 */
export const __neverReachable = neverReachable
