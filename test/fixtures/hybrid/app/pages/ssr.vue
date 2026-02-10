<script setup lang="ts">
const data = await usePrerenderData('test-data-ssr', async () => {
  const { getData } = await import('~~/server/data')
  return getData()
})
</script>

<template>
  <div data-testid="message">{{ data.message }}</div>
</template>
