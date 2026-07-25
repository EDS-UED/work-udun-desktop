import { createAppI18n } from '@/i18n';
import { DEFAULT_LOCALE, getStoredLocale } from '@/i18n/locale';

export default defineNuxtPlugin((nuxtApp) => {
  const i18n = createAppI18n(DEFAULT_LOCALE);
  nuxtApp.vueApp.use(i18n);

  if (import.meta.client) {
    nuxtApp.hook('app:mounted', () => {
      const locale = getStoredLocale();
      i18n.global.locale.value = locale;
      document.documentElement.lang = locale === 'zh-TW' ? 'zh-HK' : locale;
    });
  }
});
