<script setup lang="ts">
const data = await usePrerenderData('home-data', async () => {
  const { getData } = await import('~~/server/data')
  return getData()
})
</script>

<template>
  <div>
    <h1>nuxt-prerender-kit Playground</h1>
    <p>Message: {{ data.message }}</p>
    <p>Timestamp: {{ data.timestamp }}</p>
  </div>
</template>
