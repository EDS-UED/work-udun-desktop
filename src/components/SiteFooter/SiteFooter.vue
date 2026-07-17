<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import styles from './SiteFooter.module.css';

const { t } = useI18n();

const columns = computed(() => [
  {
    title: t('footer.products'),
    links: [
      { label: t('footer.wallet'), to: '/wallet' },
      { label: t('footer.mpc'), to: '/mpc' },
    ],
  },
  {
    title: t('footer.useCases'),
    links: [
      { label: t('footer.exchanges'), to: '/solutions' },
      { label: t('footer.payments'), to: '/solutions' },
      { label: t('footer.cards'), to: '/solutions' },
      { label: t('footer.web3'), to: '/solutions' },
    ],
  },
  {
    title: t('common.developers'),
    links: [
      { label: t('footer.generateAddress'), to: '/developers' },
      { label: t('footer.withdrawal'), to: '/developers' },
      { label: t('footer.callback'), to: '/developers' },
      { label: t('footer.sdk'), to: '/developers' },
    ],
  },
  {
    title: t('common.helpCenter'),
    links: [
      { label: t('footer.gettingStarted'), to: '/help-center' },
      { label: t('footer.faq'), to: '/help-center' },
      { label: t('footer.integration'), to: '/help-center' },
      { label: t('footer.tokens'), to: '/help-center' },
    ],
  },
]);

const socialLinks = [
  { label: 'UDun on X', text: 'X' },
  { label: 'UDun on Telegram', text: 'TG' },
  { label: 'UDun on Medium', text: 'M' },
] as const;
</script>

<template>
  <footer :class="styles.footer">
    <div :class="styles.content">
      <section :class="styles.callout" data-reveal>
        <p>{{ t('footer.calloutEyebrow') }}</p>
        <h2>{{ t('footer.calloutTitle') }}</h2>
      </section>

      <section :class="styles.identity">
        <RouterLink to="/" :class="styles.brand">
          <img :class="styles.brandLogo" src="/favicon.svg" alt="" />
          UDun
        </RouterLink>
        <p>{{ t('footer.description') }}</p>
        <div :class="styles.socials">
          <a v-for="link in socialLinks" :key="link.text" href="#" :aria-label="link.label">
            {{ link.text }}
          </a>
        </div>
      </section>

      <nav v-for="column in columns" :key="column.title" :aria-label="column.title">
        <h3>{{ column.title }}</h3>
        <RouterLink v-for="link in column.links" :key="link.label" :to="link.to">
          {{ link.label }}
        </RouterLink>
      </nav>

      <div :class="styles.legal">
        <span>© {{ new Date().getFullYear() }} UDun. {{ t('footer.rights') }}</span>
        <nav :aria-label="t('footer.legalLinks')">
          <a href="#">{{ t('footer.privacy') }}</a>
          <a href="#">{{ t('footer.terms') }}</a>
          <a href="mailto:contact@uduncloud.com">{{ t('footer.contact') }}</a>
        </nav>
      </div>
    </div>
  </footer>
</template>
