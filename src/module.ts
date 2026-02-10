import { addImports, addVitePlugin, createResolver, defineNuxtModule } from '@nuxt/kit'
import { ssgTransformPlugin } from './vite/transform-plugin'

export interface ModuleOptions {
  debug?: {
    /**
     * Disable the automatic wrapping behavior.
     * When disabled, you must manually wrap handlers with the conditional pattern.
     * @default false
     */
    disableWrapping?: boolean
  }
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'nuxt-prerender-kit',
    configKey: 'prerenderKit',
    compatibility: {
      nuxt: '^4.0.0',
    },
  },
  defaults: {},
  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)

    // Add runtime composables
    addImports([
      {
        name: 'usePrerenderData',
        from: resolver.resolve('./runtime/composables/usePrerenderData'),
      },
      {
        name: 'neverReachable',
        from: resolver.resolve('./runtime/utils/neverReachable'),
      },
    ])

    // Add the internal neverReachable function used by the transform plugin
    nuxt.options.alias['#nuxt-prerender-kit/runtime'] = resolver.resolve(
      './runtime/utils/neverReachable',
    )

    // Add Vite transform plugin unless disabled
    if (!options.debug?.disableWrapping) {
      addVitePlugin(ssgTransformPlugin())
    }
  },
})
