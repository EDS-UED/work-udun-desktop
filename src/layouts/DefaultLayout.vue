<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import SiteHeader from '@/components/SiteHeader/SiteHeader.vue';
import SiteFooter from '@/components/SiteFooter/SiteFooter.vue';
import PageBackgroundGrid from './PageBackgroundGrid.vue';
import { applyTheme } from '@/composables/useTheme';
import styles from './DefaultLayout.module.css';

const main = ref<HTMLElement>();
let observer: IntersectionObserver | undefined;
let mutationObserver: MutationObserver | undefined;
let scrollIdleTimer: ReturnType<typeof setTimeout> | undefined;
let isScrolling = false;
const revealThreshold = 0.12;
const scrollIdleDelay = 140;
const revealedElements = new WeakSet<Element>();

function observeRevealElements(root: ParentNode) {
  if (!observer) return;

  if (root instanceof Element && root.matches('[data-reveal]')) {
    observer.observe(root);
  }

  root.querySelectorAll('[data-reveal]').forEach((element) => observer?.observe(element));
}

function setScrollActivity(active: boolean) {
  if (isScrolling === active) return;
  isScrolling = active;
  document.documentElement.classList.toggle('is-scrolling', active);

  main.value
    ?.querySelectorAll<SVGSVGElement>('[data-scroll-animated-svg]')
    .forEach((svg) => {
      if (active) {
        svg.pauseAnimations();
        return;
      }

      const region = svg.closest<HTMLElement>('[data-animation-region]');
      if (region?.dataset.animationPaused !== 'true') {
        svg.unpauseAnimations();
      }
    });
}

function handleScrollActivity() {
  setScrollActivity(true);
  clearTimeout(scrollIdleTimer);
  scrollIdleTimer = setTimeout(() => setScrollActivity(false), scrollIdleDelay);
}

onMounted(() => {
  applyTheme('light');

  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.intersectionRatio >= revealThreshold) {
          entry.target.classList.add('is-visible');
          revealedElements.add(entry.target);
          return;
        }

        if (!entry.isIntersecting) {
          const rootTop = entry.rootBounds?.top ?? 0;
          const exitedThroughTop = entry.boundingClientRect.bottom <= rootTop;
          entry.target.classList.toggle('reveal-repeat', revealedElements.has(entry.target));
          entry.target.classList.toggle('reveal-from-top', exitedThroughTop);
          entry.target.classList.remove('is-visible');
        }
      });
    },
    { threshold: [0, revealThreshold], rootMargin: '0px 0px -8% 0px' },
  );

  if (main.value) {
    observeRevealElements(main.value);
  }

  mutationObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node instanceof Element) {
          observeRevealElements(node);
        }
      });
    });
  });

  if (main.value) mutationObserver.observe(main.value, { childList: true, subtree: true });
  window.addEventListener('scroll', handleScrollActivity, { passive: true });
});

onBeforeUnmount(() => {
  observer?.disconnect();
  mutationObserver?.disconnect();
  window.removeEventListener('scroll', handleScrollActivity);
  clearTimeout(scrollIdleTimer);
  document.documentElement.classList.remove('is-scrolling');
});
</script>

<template>
  <div :class="styles.layout">
    <PageBackgroundGrid />
    <SiteHeader />
    <main ref="main" :class="styles.main">
      <slot />
    </main>
    <SiteFooter />
  </div>
</template>
