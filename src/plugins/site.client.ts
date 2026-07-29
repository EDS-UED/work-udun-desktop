import {
  detachCornerSmoothing,
  initCornerSmoothing,
} from '@eds/website-tokens/corner-smoothing';
import { applyTheme } from '@/composables/useTheme';

function detachAllCornerSmoothing() {
  if (typeof document === 'undefined') return;
  document.querySelectorAll('.eds-corner-smoothed').forEach((node) => {
    if (node instanceof HTMLElement) {
      detachCornerSmoothing(node);
    }
  });
}

function syncCornerSmoothingForRoute() {
  if (typeof document === 'undefined') return;
  if (document.documentElement.getAttribute('data-invite-page') === 'true') {
    detachAllCornerSmoothing();
    return;
  }
  initCornerSmoothing();
}

export default defineNuxtPlugin((nuxtApp) => {
  applyTheme('light');
  nuxtApp.hook('app:mounted', () => {
    syncCornerSmoothingForRoute();
  });
  nuxtApp.hook('page:finish', () => {
    syncCornerSmoothingForRoute();
  });
});
