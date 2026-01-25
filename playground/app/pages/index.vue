<script setup lang="ts">
const data = await useBuildAsyncData('home-data', async () => {
  const { getData } = await import('~~/server/data')
  return getData()
})
</script>

<template>
  <div>
    <h1>nuxt-ssg Playground</h1>
    <p>Message: {{ data.message }}</p>
    <p>Timestamp: {{ data.timestamp }}</p>
  </div>
</template>
