<script setup lang="ts">
const data = await useTestData()
</script>

<template>
  <div data-testid="message">{{ data.message }}</div>
</template>
