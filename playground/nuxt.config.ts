export default defineNuxtConfig({
  modules: ['../src/module'],
  devtools: { enabled: true },
  compatibilityDate: 'latest',
  ssg: {
    transform: true,
  },
  nitro: {
    prerender: {
      routes: ['/'],
    },
  },
})
