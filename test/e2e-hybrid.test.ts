import { describe, expect, it, beforeAll } from 'vitest'
import { $fetch, setup } from '@nuxt/test-utils/e2e'
import { resolve } from 'node:path'
import { execSync } from 'node:child_process'

const fixtureDir = resolve('./test/fixtures/hybrid')

describe('nuxt-prerender-kit hybrid SSG/SSR', async () => {
  // Build the app before tests to generate prerendered pages
  beforeAll(() => {
    execSync('npx nuxt build', {
      cwd: fixtureDir,
      stdio: 'inherit',
      env: { ...process.env, NUXT_TELEMETRY_DISABLED: '1' },
    })
  }, 120000)

  await setup({ rootDir: './test/fixtures/hybrid' })

  it('works on prerendered SSG page', async () => {
    const html = await $fetch('/')
    expect(html).toContain('Hello from server')
    expect(html).toContain('data-testid="message"')
  })

  it('throws error on SSR page', async () => {
    await expect($fetch('/ssr')).rejects.toThrow(/500/)
  })
})
