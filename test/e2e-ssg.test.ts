import { describe, expect, it, beforeAll } from 'vitest'
import { $fetch, setup } from '@nuxt/test-utils/e2e'
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { execSync } from 'node:child_process'

const fixtureDir = resolve('./test/fixtures/ssg')

describe('nuxt-ssg prerender (success)', async () => {
  // Run nuxt generate before tests to produce static output
  beforeAll(() => {
    execSync('npx nuxt generate', {
      cwd: fixtureDir,
      stdio: 'inherit',
      env: { ...process.env, NUXT_TELEMETRY_DISABLED: '1' },
    })
  }, 120000)

  await setup({ rootDir: './test/fixtures/ssg' })

  it('prerenders data correctly when called in .vue file', async () => {
    const html = await $fetch('/')
    expect(html).toContain('Hello from server')
    expect(html).toContain('data-testid="message"')
  })

  it('prerenders data correctly when called from composable .ts file', async () => {
    const html = await $fetch('/composable')
    expect(html).toContain('Hello from server')
    expect(html).toContain('data-testid="message"')
  })

  it('tree-shakes server code from client bundle', async () => {
    const nuxtDir = join(fixtureDir, '.output/public/_nuxt')

    expect(existsSync(nuxtDir)).toBe(true)

    // Read all JS files in the _nuxt directory
    const files = readdirSync(nuxtDir).filter((f) => f.endsWith('.js'))
    const bundleContent = files.map((f) => readFileSync(join(nuxtDir, f), 'utf-8')).join('\n')

    // Server code should NOT be in client bundle
    // The string 'Hello from server' should only be in prerendered HTML, not in JS
    expect(bundleContent).not.toContain('Hello from server')
  })
})
