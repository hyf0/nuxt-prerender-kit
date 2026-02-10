import { describe, expect, it } from 'vitest'
import { $fetch, setup } from '@nuxt/test-utils/e2e'

describe('nuxt-prerender-kit SSR (failure)', async () => {
  await setup({ rootDir: './test/fixtures/ssr' })

  it('throws error when called in .vue file outside prerender context', async () => {
    try {
      await $fetch('/')
      expect.unreachable('should have thrown')
    } catch (e: any) {
      expect(e.statusCode).toBe(500)
      expect(e.statusMessage).toContain('nuxt-prerender-kit')
    }
  })

  it('throws error when called from composable .ts file outside prerender context', async () => {
    try {
      await $fetch('/composable')
      expect.unreachable('should have thrown')
    } catch (e: any) {
      expect(e.statusCode).toBe(500)
      expect(e.statusMessage).toContain('nuxt-prerender-kit')
    }
  })
})
