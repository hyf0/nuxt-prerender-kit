import MyModule from '../../../src/module'

export default defineNuxtConfig({
  modules: [MyModule],
  compatibilityDate: 'latest',
  // No prerender routes - SSR mode only
})
