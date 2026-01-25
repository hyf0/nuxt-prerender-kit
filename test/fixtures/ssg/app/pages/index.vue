<script setup lang="ts">
const data = await useBuildAsyncData('test-data', async () => {
  const { getData } = await import('~~/server/data')
  return getData()
})
</script>

<template>
  <div data-testid="message">{{ data.message }}</div>
</template>
