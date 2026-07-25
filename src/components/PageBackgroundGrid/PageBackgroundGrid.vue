<script setup lang="ts">
import { HOME_PAGE_GRID_COLUMNS, HOME_PAGE_GRID_ROWS } from '@/components/StoryPage/showcaseGrid';
import styles from './PageBackgroundGrid.module.css';

const { variant } = withDefaults(
  defineProps<{
    variant?: 'page' | 'contained';
  }>(),
  {
    variant: 'page',
  },
);
</script>

<template>
  <svg
    :class="[styles.root, variant === 'contained' ? styles.contained : styles.page]"
    viewBox="0 0 1400 824"
    preserveAspectRatio="none"
    aria-hidden="true"
    data-no-corner-smoothing
  >
    <g :class="styles.lines">
      <path v-for="path in HOME_PAGE_GRID_COLUMNS" :key="`bg-${path}`" :d="path" />
      <line
        v-for="row in HOME_PAGE_GRID_ROWS"
        :key="`bg-${row}`"
        x1="0"
        :y1="row"
        x2="1400"
        :y2="row"
      />
    </g>
  </svg>
</template>
