<script setup lang="ts">
import DefaultLayout from '@/layouts/DefaultLayout.vue'

const route = useRoute()
</script>

<template>
  <DefaultLayout>
    <!-- The route key remounts shared pages so their reveal motion replays. -->
    <NuxtPage :key="route.fullPath" />
  </DefaultLayout>
</template>
