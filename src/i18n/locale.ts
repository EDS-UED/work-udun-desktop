const LOCALE_STORAGE_KEY = 'udun-locale';

export const SUPPORTED_LOCALES = ['zh-CN', 'zh-TW', 'en-US'] as const;
export type AppLocale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: AppLocale = 'en-US';

export function isAppLocale(value: string): value is AppLocale {
  return SUPPORTED_LOCALES.includes(value as AppLocale);
}

export function getStoredLocale(): AppLocale {
  if (typeof window === 'undefined') return DEFAULT_LOCALE;

  const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
  return stored && isAppLocale(stored) ? stored : DEFAULT_LOCALE;
}

export function storeLocale(locale: AppLocale) {
  localStorage.setItem(LOCALE_STORAGE_KEY, locale);
}
