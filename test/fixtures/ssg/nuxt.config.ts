import MyModule from '../../../src/module'

export default defineNuxtConfig({
  modules: [MyModule],
  compatibilityDate: 'latest',
  nitro: { prerender: { routes: ['/', '/composable', '/manual-import'] } },
})
