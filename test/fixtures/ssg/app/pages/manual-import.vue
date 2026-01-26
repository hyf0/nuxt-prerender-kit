<script setup lang="ts">
import { useBuildAsyncData } from 'nuxt-ssg/runtime'

const data = await useBuildAsyncData('test-data-manual', async () => {
  const { getData } = await import('~~/server/data')
  return getData()
})
</script>

<template>
  <div data-testid="message">{{ data.message }}</div>
</template>
