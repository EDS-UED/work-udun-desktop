import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { siteContent, type SiteContent } from '@/content/siteContent';

const pageTitles: Record<keyof SiteContent, string> = {
  home: 'UDun Wallet 3.0',
  wallet: 'UDun Wallet 3.0',
  mpc: 'Multi-Party Computation',
  solutions: 'Solutions',
  download: 'Download UDun Wallet 3.0',
  developers: 'Developer Center',
  help: 'Help Center',
};

export function usePageSeo(page: keyof SiteContent) {
  const { locale } = useI18n();
  const activeLocale = computed(() => (locale.value === 'en-US' ? 'en-US' : 'zh-CN'));
  const description = computed(() => siteContent[activeLocale.value][page].subtitle);

  useSeoMeta({
    title: pageTitles[page],
    description,
    ogTitle: pageTitles[page],
    ogDescription: description,
    ogType: 'website',
    twitterCard: 'summary_large_image',
    twitterTitle: pageTitles[page],
    twitterDescription: description,
  });
}
