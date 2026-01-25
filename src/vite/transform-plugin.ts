import type { Plugin } from 'vite'
import type { Node, CallExpression, Identifier } from 'estree'
import { createFilter, type FilterPattern } from '@rollup/pluginutils'
import { parse } from '@babel/parser'
import { walk } from 'estree-walker'
import MagicString from 'magic-string'

export interface TransformPluginOptions {
  include?: FilterPattern
  exclude?: FilterPattern
}

const IMPORT_STATEMENT =
  "import { __neverReachable as __neverReachable_ssg } from '#nuxt-ssg/runtime';\n"

/**
 * Vite plugin that transforms useBuildAsyncData calls to wrap the handler
 * with `import.meta.prerender ? handler : __neverReachable_ssg`.
 *
 * This enables:
 * 1. Handler execution only during prerender (SSG)
 * 2. Dead code elimination of the handler in client bundles
 * 3. Runtime errors if accidentally used in SSR/CSR context
 */
export function ssgTransformPlugin(options: TransformPluginOptions = {}): Plugin {
  const filter = createFilter(
    options.include ?? ['**/*.ts', '**/*.vue'],
    options.exclude ?? ['node_modules/**'],
  )

  return {
    name: 'nuxt-ssg-transform',
    enforce: 'pre',

    transform(code, id) {
      // Skip files that don't match the filter
      if (!filter(id)) {
        return null
      }

      // Quick check: skip if no useBuildAsyncData in the code
      if (!code.includes('useBuildAsyncData')) {
        return null
      }

      // For Vue files, transform when Vite extracts the script block
      // Nuxt/Vite uses query params like: .vue?vue&type=script&setup=true&lang.ts
      if (id.includes('.vue?')) {
        // Transform Vue script blocks
        if (id.includes('type=script') || id.includes('setup=true')) {
          return transformCode(code, id)
        }
        // Skip other Vue queries (template, style, etc.)
        return null
      }

      // Skip raw .vue files - we transform the extracted script instead
      if (id.endsWith('.vue')) {
        return null
      }

      // For .ts files, transform directly
      return transformCode(code, id)
    },
  }
}

function transformCode(
  code: string,
  id: string,
): { code: string; map: ReturnType<MagicString['generateMap']> } | null {
  return performTransformation(code, id)
}

function performTransformation(
  code: string,
  id: string,
): { code: string; map: ReturnType<MagicString['generateMap']> } | null {
  let ast: Node

  try {
    const babelAst = parse(code, {
      sourceType: 'module',
      plugins: ['typescript'],
    })
    // Babel's Program node is compatible with estree for our purposes
    ast = babelAst.program as unknown as Node
  } catch {
    // Cannot parse (might be template-only or have unsupported syntax)
    return null
  }

  const s = new MagicString(code)
  let needsImport = false
  let hasTransformations = false

  walk(ast, {
    enter(node) {
      if (!isCallExpression(node)) {
        return
      }

      // Check if this is a useBuildAsyncData call
      if (!isUseBuildAsyncDataCall(node)) {
        return
      }

      const args = node.arguments
      if (args.length < 2) {
        return
      }

      const handlerArg = args[1]

      // Get the handler source using babel's location info
      const handlerStart = (handlerArg as unknown as { start: number }).start
      const handlerEnd = (handlerArg as unknown as { end: number }).end

      if (handlerStart === undefined || handlerEnd === undefined) {
        return
      }

      const handlerSource = code.slice(handlerStart, handlerEnd)

      // Wrap the handler: import.meta.prerender ? handler : __neverReachable_ssg
      const wrappedHandler = `import.meta.prerender ? ${handlerSource} : __neverReachable_ssg`

      s.overwrite(handlerStart, handlerEnd, wrappedHandler)
      needsImport = true
      hasTransformations = true
    },
  })

  if (!hasTransformations) {
    return null
  }

  // Add the import statement at the beginning
  if (needsImport) {
    // Check if the import already exists
    if (!code.includes("from '#nuxt-ssg/runtime'")) {
      s.prepend(IMPORT_STATEMENT)
    }
  }

  return {
    code: s.toString(),
    map: s.generateMap({ hires: true, source: id }),
  }
}

function isCallExpression(node: Node): node is CallExpression {
  return node.type === 'CallExpression'
}

function isUseBuildAsyncDataCall(node: CallExpression): boolean {
  const callee = node.callee

  // Direct call: useBuildAsyncData(...)
  if (callee.type === 'Identifier') {
    return (callee as Identifier).name === 'useBuildAsyncData'
  }

  return false
}
