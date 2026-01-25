import MyModule from '../../../src/module'

export default defineNuxtConfig({
  modules: [MyModule],
  compatibilityDate: 'latest',
  ssg: { transform: true },
  nitro: { prerender: { routes: ['/', '/composable'] } },
})
