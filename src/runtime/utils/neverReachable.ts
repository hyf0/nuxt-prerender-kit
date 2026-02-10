const ERROR_MESSAGE =
  '[nuxt-prerender-kit] This function should never be called. ' +
  'It indicates that usePrerenderData was invoked outside of prerender context. ' +
  'This module is designed for SSG (Static Site Generation) only. ' +
  'If you need data fetching for SSR pages, use useAsyncData instead.'

/**
 * A placeholder function used by the Vite transform plugin to ensure
 * `usePrerenderData` handlers are only executed during prerender (SSG)
 * and tree-shaken from client bundles.
 *
 * - **Dev**: Throws immediately for a clear, fast error during development.
 * - **Prod**: Returns an async function that throws when called by `useAsyncData`,
 *   allowing the error to flow through Nuxt's standard error handling pipeline.
 */
export function neverReachable(): (() => Promise<never>) {
  if (import.meta.dev) {
    throw new Error(ERROR_MESSAGE)
  }
  return async () => {
    throw new Error(ERROR_MESSAGE)
  }
}

/**
 * Internal alias used by the transform plugin.
 * This is exported separately to avoid name collisions with user code.
 */
export const __neverReachable = neverReachable
