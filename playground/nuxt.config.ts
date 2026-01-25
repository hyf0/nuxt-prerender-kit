export default defineNuxtConfig({
  modules: ['../src/module'],
  devtools: { enabled: true },
  compatibilityDate: 'latest',
  nitro: {
    prerender: {
      routes: ['/'],
    },
  },
})
