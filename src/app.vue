<script setup lang="ts">
const route = useRoute();
</script>

<template>
  <NuxtLayout>
    <!-- The route key remounts shared pages so their reveal motion replays. -->
    <NuxtPage :key="route.fullPath" />
  </NuxtLayout>
</template>