import { describe, expect, it } from 'vitest'
import { createPage, setup } from '@nuxt/test-utils/e2e'

describe('nuxt-prerender-kit CSR (failure)', async () => {
  await setup({ rootDir: './test/fixtures/csr' })

  it('throws error when called in .vue file in CSR context', async () => {
    const page = await createPage('/')
    const errorText = await page.locator('body').textContent()
    expect(errorText).toMatchInlineSnapshot(`"500Internal Server ErrorCannot read properties of undefined (reading 'message')window.__NUXT__={};window.__NUXT__.config={public:{},app:{baseURL:"/",buildId:"test",buildAssetsDir:"/_nuxt/",cdnURL:""}}[{"serverRendered":1},false]"`)
  })

  it('throws error when called from composable .ts file in CSR context', async () => {
    const page = await createPage('/composable')
    const errorText = await page.locator('body').textContent()
    expect(errorText).toMatchInlineSnapshot(`"500Internal Server ErrorCannot read properties of undefined (reading 'message')window.__NUXT__={};window.__NUXT__.config={public:{},app:{baseURL:"/",buildId:"test",buildAssetsDir:"/_nuxt/",cdnURL:""}}[{"serverRendered":1},false]"`)
  })
})
