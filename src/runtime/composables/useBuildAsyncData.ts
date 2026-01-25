import type { AsyncDataOptions, NuxtApp } from '#app'
import { useAsyncData } from '#app'

/**
 * Handler function type for useBuildAsyncData.
 * Matches the signature expected by useAsyncData.
 */
export type AsyncDataHandler<T> = (ctx: NuxtApp) => Promise<T>

/**
 * A wrapper around useAsyncData optimized for static site generation (SSG).
 *
 * This composable is designed to be used with the nuxt-ssg transform plugin,
 * which automatically wraps the handler to ensure it only runs during prerender
 * and is tree-shaken from client bundles.
 *
 * @param key - Unique key to ensure data fetching is properly de-duplicated across requests
 * @param handler - Async function that fetches data. Should use dynamic imports for server code.
 * @param options - Optional AsyncData options (transform, pick, watch, etc.)
 * @returns The resolved data value
 * @throws Error if data fetching fails or returns null/undefined
 *
 * @example
 * ```typescript
 * const data = await useBuildAsyncData('my-key', async () => {
 *   const { Server } = await import('~/server/data')
 *   return Server.getData()
 * })
 * ```
 *
 * @example
 * ```typescript
 * // With transform option
 * const items = await useBuildAsyncData(
 *   'items-key',
 *   async () => {
 *     const { Server } = await import('~/server/data')
 *     return Server.getAllItems()
 *   },
 *   { transform: (data) => data.items }
 * )
 * ```
 */
export async function useBuildAsyncData<T, TransformResult = T>(
  key: string,
  handler: AsyncDataHandler<T>,
  options?: AsyncDataOptions<T, TransformResult>,
): Promise<TransformResult> {
  const ret = await useAsyncData(key, handler, options)

  if (ret.error.value) {
    throw new Error(
      `[nuxt-ssg] Failed to fetch data for key "${key}": ${ret.error.value.message}`,
    )
  }

  if (ret.data.value === null || ret.data.value === undefined) {
    throw new Error(
      `[nuxt-ssg] Data for key "${key}" was null or undefined. ` +
        'Ensure your handler returns a value.',
    )
  }

  return ret.data.value as TransformResult
}
