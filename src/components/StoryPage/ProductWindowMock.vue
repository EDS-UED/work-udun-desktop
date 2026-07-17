<script setup lang="ts">
import { publicAsset } from '@/utils/publicAsset';
import styles from './StoryPage.module.css';

defineProps<{
  compact?: boolean;
}>();

const productImageSrc = publicAsset('/udun-product-1.png');
</script>

<template>
  <div :class="[styles.productWindow, compact && styles.productWindowCompact]">
    <img
      :class="styles.productWindowImage"
      :src="productImageSrc"
      :alt="compact ? '' : 'UDun Wallet 3.0 product interface'"
    />
  </div>
</template>
