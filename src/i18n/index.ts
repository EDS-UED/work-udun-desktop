import { createI18n } from 'vue-i18n';
import enUS from './locales/en-US';
import zhCN from './locales/zh-CN';
import { DEFAULT_LOCALE, type AppLocale } from './locale';

export const messages = {
  'zh-CN': zhCN,
  'en-US': enUS,
};

export function createAppI18n(locale: AppLocale = DEFAULT_LOCALE) {
  return createI18n({
    legacy: false,
    locale,
    fallbackLocale: DEFAULT_LOCALE,
    messages,
  });
}
