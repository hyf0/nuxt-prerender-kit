import { describe, expect, it } from 'vitest'
import { ssgTransformPlugin } from '../src/vite/transform-plugin'

describe('transform plugin', () => {
  const plugin = ssgTransformPlugin() as { transform: Function }

  it('wraps usePrerenderData handler', () => {
    const code = `usePrerenderData('key', async () => { return 1 })`
    const result = plugin.transform(code, 'test.ts')

    expect(result?.code).toMatchInlineSnapshot(`
      "import { __neverReachable as __neverReachable_prerender } from '#nuxt-prerender-kit/runtime';
      usePrerenderData('key', false ? async () => { return 1 } : __neverReachable_prerender())"
    `)
  })

  it('preserves third argument (options)', () => {
    const code = `usePrerenderData('key', fn, { transform: x => x })`
    const result = plugin.transform(code, 'test.ts')

    expect(result?.code).toMatchInlineSnapshot(`
      "import { __neverReachable as __neverReachable_prerender } from '#nuxt-prerender-kit/runtime';
      usePrerenderData('key', false ? fn : __neverReachable_prerender(), { transform: x => x })"
    `)
  })

  it('skips files without usePrerenderData', () => {
    const code = `const x = useAsyncData('key', fn)`
    const result = plugin.transform(code, 'test.ts')

    expect(result).toBeNull()
  })

  it('transforms TSX files with JSX syntax', () => {
    const code = `usePrerenderData('key', async () => { return <div>Hello</div> })`
    const result = plugin.transform(code, 'test.tsx')

    expect(result?.code).toMatchInlineSnapshot(`
      "import { __neverReachable as __neverReachable_prerender } from '#nuxt-prerender-kit/runtime';
      usePrerenderData('key', false ? async () => { return <div>Hello</div> } : __neverReachable_prerender())"
    `)
  })
})
