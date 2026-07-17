import { initCornerSmoothing } from '@evergreen/tokens/corner-smoothing';
import { applyTheme, getPreferredTheme } from '@/composables/useTheme';

export default defineNuxtPlugin((nuxtApp) => {
  applyTheme(getPreferredTheme());
  nuxtApp.hook('app:mounted', () => {
    initCornerSmoothing();
  });
});
