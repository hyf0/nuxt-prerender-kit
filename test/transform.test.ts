import { describe, expect, it } from 'vitest'
import { ssgTransformPlugin } from '../src/vite/transform-plugin'

describe('transform plugin', () => {
  const plugin = ssgTransformPlugin() as { transform: Function }

  it('wraps useBuildAsyncData handler', () => {
    const code = `useBuildAsyncData('key', async () => { return 1 })`
    const result = plugin.transform(code, 'test.ts')

    expect(result?.code).toMatchInlineSnapshot(`
      "import { __neverReachable as __neverReachable_ssg } from '#nuxt-ssg/runtime';
      useBuildAsyncData('key', false ? async () => { return 1 } : __neverReachable_ssg)"
    `)
  })

  it('preserves third argument (options)', () => {
    const code = `useBuildAsyncData('key', fn, { transform: x => x })`
    const result = plugin.transform(code, 'test.ts')

    expect(result?.code).toMatchInlineSnapshot(`
      "import { __neverReachable as __neverReachable_ssg } from '#nuxt-ssg/runtime';
      useBuildAsyncData('key', false ? fn : __neverReachable_ssg, { transform: x => x })"
    `)
  })

  it('skips files without useBuildAsyncData', () => {
    const code = `const x = useAsyncData('key', fn)`
    const result = plugin.transform(code, 'test.ts')

    expect(result).toBeNull()
  })
})
