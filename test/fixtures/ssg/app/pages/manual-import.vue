<script setup lang="ts">
import { usePrerenderData } from 'nuxt-prerender-kit/runtime'

const data = await usePrerenderData('test-data-manual', async () => {
  const { getData } = await import('~~/server/data')
  return getData()
})
</script>

<template>
  <div data-testid="message">{{ data.message }}</div>
</template>
