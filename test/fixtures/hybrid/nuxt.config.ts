import MyModule from '../../../src/module'

export default defineNuxtConfig({
  modules: [MyModule],
  compatibilityDate: 'latest',
  routeRules: {
    '/': { prerender: true },
    '/ssr': { prerender: false },
  },
})
