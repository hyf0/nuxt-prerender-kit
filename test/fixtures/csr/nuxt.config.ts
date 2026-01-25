import MyModule from '../../../src/module'

export default defineNuxtConfig({
  modules: [MyModule],
  compatibilityDate: 'latest',
  ssr: false, // Enable CSR-only mode
})
