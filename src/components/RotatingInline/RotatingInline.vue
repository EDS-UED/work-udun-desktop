<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import styles from './RotatingInline.module.css';

export type RotatingInlineItem = {
  label: string;
  src?: string;
  color?: string;
};

const props = withDefaults(
  defineProps<{
    items: RotatingInlineItem[];
    initialIndex?: number;
    intervalMs?: number;
    phaseOffsetMs?: number;
  }>(),
  {
    initialIndex: 0,
    intervalMs: 2400,
    phaseOffsetMs: 0,
  },
);

const activeIndex = ref(
  props.items.length
    ? ((props.initialIndex % props.items.length) + props.items.length) % props.items.length
    : 0,
);
const phase = ref<'in' | 'out'>('in');
const activeItem = computed(() => props.items[activeIndex.value]);

let initialTimer: ReturnType<typeof setTimeout> | undefined;
let intervalTimer: ReturnType<typeof setInterval> | undefined;
let swapTimer: ReturnType<typeof setTimeout> | undefined;

function rotate() {
  if (props.items.length < 2) return;

  phase.value = 'out';
  swapTimer = setTimeout(() => {
    activeIndex.value = (activeIndex.value + 1) % props.items.length;
    phase.value = 'in';
  }, 380);
}

onMounted(() => {
  if (props.items.length < 2) return;

  initialTimer = setTimeout(() => {
    rotate();
    intervalTimer = setInterval(rotate, props.intervalMs);
  }, props.phaseOffsetMs);
});

onBeforeUnmount(() => {
  clearTimeout(initialTimer);
  clearTimeout(swapTimer);
  clearInterval(intervalTimer);
});
</script>

<template>
  <span :class="styles.slot" aria-live="polite">
    <span :class="[styles.layer, styles.placeholder]" aria-hidden="true">
      <span :class="styles.icon" />
    </span>
    <span
      :class="[
        styles.layer,
        phase === 'in' ? styles.rotatingIn : styles.rotatingOut,
      ]"
    >
      <img
        v-if="activeItem?.src"
        :class="styles.icon"
        :src="activeItem.src"
        alt=""
        decoding="async"
      />
      <span
        v-else
        :class="[styles.icon, styles.colorPlaceholder]"
        :style="{ backgroundColor: activeItem?.color }"
        aria-hidden="true"
      />
      <span :class="styles.srOnly">{{ activeItem?.label }}</span>
    </span>
  </span>
</template>
