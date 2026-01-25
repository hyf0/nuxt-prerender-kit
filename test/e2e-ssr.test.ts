import { describe, expect, it } from 'vitest'
import { $fetch, setup } from '@nuxt/test-utils/e2e'

describe('nuxt-ssg SSR (failure)', async () => {
  await setup({ rootDir: './test/fixtures/ssr' })

  it('throws error when called in .vue file outside prerender context', async () => {
    await expect($fetch('/')).rejects.toThrow(/500/)
  })

  it('throws error when called from composable .ts file outside prerender context', async () => {
    await expect($fetch('/composable')).rejects.toThrow(/500/)
  })
})
