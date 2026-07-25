<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { EgIcon } from '@eds/website-components';
import { useI18n } from 'vue-i18n';
import { storeLocale, type AppLocale } from '@/i18n/locale';
import { publicAsset } from '@/utils/publicAsset';
import styles from './SiteHeader.module.css';

const logoSrc = publicAsset('/udun-logo.svg');
const chevronDownSrc = publicAsset('/eds-arrow-down-ios.svg');
const chevronUpSrc = publicAsset('/eds-arrow-up-ios.svg');
const localeIconSrc = publicAsset('/eds-website.svg');

type LiquidGlassSurface = {
  updateMap: () => void;
  applyStyles: () => void;
};

const { t, locale } = useI18n();
const route = useRoute();
const productsOpen = ref(false);
const menuOpen = ref(false);
const localeOpen = ref(false);
const hoverFlyouts = ref(false);
const isPinned = ref(false);
const bar = ref<HTMLElement>();
const localeNav = ref<HTMLElement>();
let scrollFrame = 0;
let liquidGlassRefreshFrame = 0;
let liquidGlassRefreshTimer: ReturnType<typeof setTimeout> | undefined;
let liquidGlassRequest = 0;
let liquidGlassAttached = false;
let liquidGlassStyleObserver: MutationObserver | undefined;
let liquidGlassSurface: LiquidGlassSurface | undefined;

const usesPinnedSurface = computed(() => isPinned.value || menuOpen.value);

const navItems = computed(() => [
  { to: '/', label: t('common.home') },
  { to: '/solutions', label: t('common.advantages') },
  { to: '/developers', label: t('common.developers') },
  { to: '/help-center', label: t('common.helpCenter') },
]);

function isActive(path: string) {
  return route.path === path;
}

function setLocale(nextLocale: AppLocale) {
  locale.value = nextLocale;
  document.documentElement.lang = nextLocale;
  storeLocale(nextLocale);
  localeOpen.value = false;
  (document.activeElement as HTMLElement | null)?.blur();
}

function toggleLocaleMenu() {
  localeOpen.value = !localeOpen.value;
}

function updatePinnedState() {
  cancelAnimationFrame(scrollFrame);
  scrollFrame = requestAnimationFrame(() => {
    isPinned.value = window.scrollY > 24;
  });
}

function closeMenus() {
  productsOpen.value = false;
  menuOpen.value = false;
  localeOpen.value = false;
}

function supportsLiquidGlassBackdrop() {
  if (typeof navigator === 'undefined' || typeof CSS === 'undefined') return false;

  const isChromium = /Chrome\/|Chromium\/|Edg\//.test(navigator.userAgent);
  return isChromium && CSS.supports('backdrop-filter', 'url("#liquid-glass-test")');
}

function refreshPinnedLiquidGlass() {
  if (!liquidGlassSurface || !usesPinnedSurface.value) return;

  clearTimeout(liquidGlassRefreshTimer);
  liquidGlassRefreshTimer = setTimeout(() => {
    cancelAnimationFrame(liquidGlassRefreshFrame);
    liquidGlassRefreshFrame = requestAnimationFrame(() => {
      liquidGlassSurface?.updateMap();
      liquidGlassSurface?.applyStyles();
    });
  }, 120);
}

async function syncPinnedLiquidGlass(active: boolean) {
  const request = ++liquidGlassRequest;

  if (!active) {
    if (liquidGlassAttached && bar.value) {
      const { detachLiquidGlass } = await import('@eds/website-tokens/liquid-glass');
      if (request !== liquidGlassRequest) return;
      detachLiquidGlass(bar.value);
      bar.value.removeAttribute('data-liquid-glass');
      bar.value.style.removeProperty('backdrop-filter');
      bar.value.style.removeProperty('-webkit-backdrop-filter');
      bar.value.style.removeProperty('background');
      liquidGlassAttached = false;
      liquidGlassSurface = undefined;
    }
    return;
  }

  if (liquidGlassAttached || !supportsLiquidGlassBackdrop()) return;

  await nextTick();
  const { attachLiquidGlass } = await import('@eds/website-tokens/liquid-glass');
  if (request !== liquidGlassRequest || !usesPinnedSurface.value || !bar.value) return;

  liquidGlassSurface = attachLiquidGlass(bar.value, { varPrefix: '--site-header-liquid' });
  bar.value.setAttribute('data-liquid-glass', 'true');
  liquidGlassAttached = true;
}

watch(() => route.fullPath, closeMenus);
watch(menuOpen, (open) => {
  document.body.style.overflow = open ? 'hidden' : '';
});
watch(usesPinnedSurface, syncPinnedLiquidGlass);

onMounted(() => {
  closeMenus();
  hoverFlyouts.value = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  updatePinnedState();
  window.addEventListener('scroll', updatePinnedState, { passive: true });

  if (supportsLiquidGlassBackdrop()) {
    liquidGlassStyleObserver = new MutationObserver(refreshPinnedLiquidGlass);
    liquidGlassStyleObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });
  }
});

onBeforeUnmount(() => {
  liquidGlassRequest += 1;
  liquidGlassStyleObserver?.disconnect();
  clearTimeout(liquidGlassRefreshTimer);
  window.removeEventListener('scroll', updatePinnedState);
  cancelAnimationFrame(scrollFrame);
  cancelAnimationFrame(liquidGlassRefreshFrame);
  document.body.style.overflow = '';

  const element = bar.value;
  if (liquidGlassAttached && element) {
    void import('@eds/website-tokens/liquid-glass').then(({ detachLiquidGlass }) => {
      if (liquidGlassAttached && element) detachLiquidGlass(element);
    });
  }
});
</script>

<template>
  <header
    :class="[
      styles.header,
      (isPinned || menuOpen) && styles.pinned,
      menuOpen && styles.menuActive,
    ]"
  >
    <div ref="bar" :class="styles.bar" data-no-corner-smoothing>
      <RouterLink to="/" :class="styles.brand" aria-label="UDun home">
        <img :class="styles.brandLogo" :src="logoSrc" alt="" />
      </RouterLink>

      <nav :class="styles.nav" aria-label="Primary">
        <RouterLink
          v-for="item in navItems.slice(0, 1)"
          :key="item.to"
          :to="item.to"
          :class="[styles.navLink, isActive(item.to) && styles.navLinkActive]"
        >
          {{ item.label }}
        </RouterLink>

        <div data-product-nav :class="styles.productNav">
          <button
            type="button"
            :class="[styles.navLink, route.path === '/wallet' || route.path === '/mpc' ? styles.navLinkActive : '']"
            :aria-expanded="productsOpen"
            @click="productsOpen = !productsOpen"
          >
            {{ t('common.products') }}
            <span :class="[styles.chevron, productsOpen && styles.chevronOpen]">
              <img
                :class="[styles.chevronIcon, styles.chevronIconDown]"
                :src="chevronDownSrc"
                alt=""
              />
              <img
                :class="[styles.chevronIcon, styles.chevronIconUp]"
                :src="chevronUpSrc"
                alt=""
              />
            </span>
          </button>
          <div
            data-header-flyout
            :data-flyout-open="productsOpen || undefined"
            :class="[
              styles.dropdownMenu,
              styles.productMenu,
              productsOpen && styles.dropdownMenuOpen,
            ]"
            :hidden="!hoverFlyouts && !productsOpen ? true : undefined"
          >
            <RouterLink
              to="/wallet"
              :class="[
                styles.productCard,
                isActive('/wallet') && styles.dropdownOptionActive,
              ]"
            >
              <span>01</span>
              <strong>UDun Wallet 3.0</strong>
              <small>{{ t('common.walletNote') }}</small>
            </RouterLink>
            <RouterLink
              to="/mpc"
              :class="[
                styles.productCard,
                isActive('/mpc') && styles.dropdownOptionActive,
              ]"
            >
              <span>02</span>
              <strong>Multi-Party Computation</strong>
              <small>{{ t('common.mpcNote') }}</small>
            </RouterLink>
          </div>
        </div>

        <RouterLink
          v-for="item in navItems.slice(1)"
          :key="item.to"
          :to="item.to"
          :class="[styles.navLink, isActive(item.to) && styles.navLinkActive]"
        >
          {{ item.label }}
        </RouterLink>
      </nav>

      <div :class="styles.controls">
        <div ref="localeNav" data-locale-nav :class="styles.localeNav">
          <button
            type="button"
            :class="styles.iconButton"
            :aria-expanded="localeOpen"
            :aria-haspopup="true"
            :aria-label="t('common.language')"
            @click="toggleLocaleMenu"
          >
            <img :class="styles.localeIcon" :src="localeIconSrc" alt="" />
          </button>
          <div
            data-header-flyout
            :data-flyout-open="localeOpen || undefined"
            :class="[styles.dropdownMenu, styles.localeMenu, localeOpen && styles.dropdownMenuOpen]"
            role="menu"
            :hidden="!hoverFlyouts && !localeOpen ? true : undefined"
          >
            <button
              type="button"
              role="menuitemradio"
              :class="[
                styles.dropdownOption,
                locale === 'en-US' && styles.dropdownOptionActive,
              ]"
              :aria-checked="locale === 'en-US'"
              @click="setLocale('en-US')"
            >
              English
            </button>
            <button
              type="button"
              role="menuitemradio"
              :class="[
                styles.dropdownOption,
                locale === 'zh-CN' && styles.dropdownOptionActive,
              ]"
              :aria-checked="locale === 'zh-CN'"
              @click="setLocale('zh-CN')"
            >
              繁体中文
            </button>
          </div>
        </div>
        <RouterLink to="/download" :class="styles.download">
          {{ t('common.download') }}
        </RouterLink>
        <button
          type="button"
          :class="styles.menuButton"
          :aria-expanded="menuOpen"
          :aria-label="menuOpen ? 'Close menu' : 'Open menu'"
          @click="menuOpen = !menuOpen"
        >
          <EgIcon :name="menuOpen ? 'close' : 'menu'" />
        </button>
      </div>
    </div>

    <div :class="[styles.mobilePanel, menuOpen && styles.mobilePanelOpen]">
      <nav aria-label="Mobile">
        <RouterLink to="/">{{ t('common.home') }}</RouterLink>
        <RouterLink to="/wallet">{{ t('common.wallet') }}</RouterLink>
        <RouterLink to="/mpc">MPC</RouterLink>
        <RouterLink to="/solutions">{{ t('common.advantages') }}</RouterLink>
        <RouterLink to="/developers">{{ t('common.developers') }}</RouterLink>
        <RouterLink to="/help-center">{{ t('common.helpCenter') }}</RouterLink>
        <RouterLink to="/download">{{ t('common.download') }}</RouterLink>
      </nav>
      <p>{{ t('common.mobileMenuNote') }}</p>
    </div>
  </header>
</template>

<style>
/* Flyout visibility must not depend on CSS-module hashes (SSR can mismatch class names). */
[data-header-flyout] {
  visibility: hidden;
  opacity: 0;
  pointer-events: none;
}

[data-header-flyout][hidden] {
  display: none !important;
}

@media (hover: hover) and (pointer: fine) {
  [data-product-nav]:hover > [data-header-flyout],
  [data-product-nav]:focus-within > [data-header-flyout],
  [data-locale-nav]:hover > [data-header-flyout],
  [data-locale-nav]:focus-within > [data-header-flyout],
  [data-header-flyout][data-flyout-open] {
    display: flex !important;
    visibility: visible;
    opacity: 1;
    pointer-events: auto;
  }
}

@media (hover: none), (pointer: coarse) {
  [data-header-flyout][data-flyout-open] {
    display: flex !important;
    visibility: visible;
    opacity: 1;
    pointer-events: auto;
  }
}
</style>
