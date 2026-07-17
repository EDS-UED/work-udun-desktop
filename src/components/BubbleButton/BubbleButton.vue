<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref } from 'vue';
import styles from './BubbleButton.module.css';

const props = withDefaults(
  defineProps<{
    standardCta?: boolean;
  }>(),
  {
    standardCta: false,
  },
);

const isPlaying = ref(false);
const surface = ref<HTMLElement>();
let animationTimer: ReturnType<typeof setTimeout> | undefined;
let glowFrame = 0;
let pointerX = 0;
let pointerY = 0;

async function play() {
  if (props.standardCta) return;

  clearTimeout(animationTimer);
  isPlaying.value = false;
  await nextTick();
  isPlaying.value = true;
  animationTimer = setTimeout(() => {
    isPlaying.value = false;
  }, 1200);
}

function updateGlow(event: PointerEvent) {
  if (props.standardCta || event.pointerType !== 'mouse' || !surface.value) return;

  pointerX = event.clientX;
  pointerY = event.clientY;
  if (glowFrame) return;

  glowFrame = requestAnimationFrame(() => {
    glowFrame = 0;
    if (!surface.value) return;

    const rect = surface.value.getBoundingClientRect();
    surface.value.style.setProperty('--bubble-glow-x', `${pointerX - rect.left}px`);
    surface.value.style.setProperty('--bubble-glow-y', `${pointerY - rect.top}px`);
  });
}

onBeforeUnmount(() => {
  clearTimeout(animationTimer);
  cancelAnimationFrame(glowFrame);
});
</script>

<template>
  <span
    :class="[styles.container, isPlaying && styles.isPlaying, props.standardCta && styles.standardCta]"
    data-bubble-button
    data-no-corner-smoothing
    @mouseenter="play"
    @pointermove="updateGlow"
  >
    <span ref="surface" :class="styles.surface">
      <slot />
    </span>
    <span :class="styles.effect" aria-hidden="true">
      <span :class="[styles.circle, styles.topLeft]" />
      <span :class="[styles.circle, styles.topLeft]" />
      <span :class="[styles.circle, styles.topLeft]" />
      <span :class="styles.core" />
      <span :class="[styles.circle, styles.bottomRight]" />
      <span :class="[styles.circle, styles.bottomRight]" />
      <span :class="[styles.circle, styles.bottomRight]" />
    </span>
    <svg :class="styles.filter" aria-hidden="true">
      <defs>
        <filter id="bubble-goo">
          <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
          <feColorMatrix
            in="blur"
            mode="matrix"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9"
            result="goo"
          />
          <feComposite in="SourceGraphic" in2="goo" />
        </filter>
      </defs>
    </svg>
  </span>
</template>
