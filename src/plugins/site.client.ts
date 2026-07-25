import { initCornerSmoothing } from '@eds/website-tokens/corner-smoothing';
import { applyTheme } from '@/composables/useTheme';

export default defineNuxtPlugin((nuxtApp) => {
  applyTheme('light');
  nuxtApp.hook('app:mounted', () => {
    initCornerSmoothing();
  });
});
