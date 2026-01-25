import { addImports, addVitePlugin, createResolver, defineNuxtModule } from '@nuxt/kit'
import { ssgTransformPlugin } from './vite/transform-plugin'

export interface ModuleOptions {
  /**
   * Enable automatic transformation of useBuildAsyncData calls.
   * When enabled, the handler is wrapped with `import.meta.prerender ? handler : __neverReachable`.
   * @default true
   */
  transform?: boolean
  /**
   * Glob patterns for files to include in transformation.
   * @default ['**\/*.ts', '**\/*.vue']
   */
  include?: string[]
  /**
   * Glob patterns for files to exclude from transformation.
   * @default ['node_modules/**']
   */
  exclude?: string[]
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'nuxt-ssg',
    configKey: 'ssg',
    compatibility: {
      nuxt: '^4.0.0',
    },
  },
  defaults: {
    transform: true,
    include: ['**/*.ts', '**/*.vue'],
    exclude: ['node_modules/**'],
  },
  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)

    // Add runtime composables
    addImports([
      {
        name: 'useBuildAsyncData',
        from: resolver.resolve('./runtime/composables/useBuildAsyncData'),
      },
      {
        name: 'neverReachable',
        from: resolver.resolve('./runtime/utils/neverReachable'),
      },
    ])

    // Add the internal neverReachable function used by the transform plugin
    nuxt.options.alias['#nuxt-ssg/runtime'] = resolver.resolve(
      './runtime/utils/neverReachable',
    )

    // Add Vite transform plugin if enabled
    if (options.transform) {
      addVitePlugin(
        ssgTransformPlugin({
          include: options.include,
          exclude: options.exclude,
        }),
      )
    }
  },
})

declare module '@nuxt/schema' {
  interface NuxtConfig {
    ssg?: ModuleOptions
  }
  interface NuxtOptions {
    ssg?: ModuleOptions
  }
}
