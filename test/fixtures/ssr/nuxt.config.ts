import MyModule from '../../../src/module'

export default defineNuxtConfig({
  modules: [MyModule],
  compatibilityDate: 'latest',
  ssg: { transform: true },
  // No prerender routes - SSR mode only
})
