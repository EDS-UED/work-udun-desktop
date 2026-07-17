<script setup lang="ts">
import styles from './StoryPage.module.css';

defineProps<{
  compact?: boolean;
}>();
</script>

<template>
  <div :class="[styles.productWindow, compact && styles.productWindowCompact]">
    <img
      :class="styles.productWindowImage"
      src="/udun-product-1.png"
      :alt="compact ? '' : 'UDun Wallet 3.0 product interface'"
    />
  </div>
</template>
