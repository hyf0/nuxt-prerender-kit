<script setup lang="ts">
const data = await usePrerenderData('null-data', async () => {
  const { getNullData } = await import('~~/server/data')
  return getNullData()
})
</script>

<template>
  <div data-testid="null-result">{{ data === null ? 'null-value' : 'unexpected' }}</div>
</template>
