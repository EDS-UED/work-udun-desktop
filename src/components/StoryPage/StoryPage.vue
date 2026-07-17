<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { EgButton } from '@evergreen/components';
import { useI18n } from 'vue-i18n';
import BubbleButton from '@/components/BubbleButton/BubbleButton.vue';
import ProductWindowMock from '@/components/StoryPage/ProductWindowMock.vue';
import GlobeVisual from '@/components/StoryPage/GlobeVisual.vue';
import RotatingInline, {
  type RotatingInlineItem,
} from '@/components/RotatingInline/RotatingInline.vue';
import { siteContent, type SiteContent } from '@/content/siteContent';
import styles from './StoryPage.module.css';

const props = defineProps<{
  page: keyof SiteContent;
}>();

const { locale, t } = useI18n();
const content = computed(() => {
  const activeLocale = locale.value === 'zh-CN' ? 'zh-CN' : 'en-US';
  return siteContent[activeLocale][props.page];
});
const homeCards = computed(() => content.value.showcaseCards ?? []);
const activeHomeCard = ref(0);
const activeHomeCardTitle = computed(() => homeCards.value[activeHomeCard.value]?.[0] ?? '');
const pageRoot = ref<HTMLElement>();
const showcaseCardsRef = ref<HTMLElement>();
const showcaseCanScrollLeft = ref(false);
const showcaseCanScrollRight = ref(false);
let animationObserver: IntersectionObserver | undefined;
const showcaseScrollEpsilon = 2;
const showcaseFadeWidth = 'clamp(24px, 3.5vw, 48px)';
const assetPlaceholders: RotatingInlineItem[] = [
  { label: 'BTC', src: '/eds-ban-btc.svg' },
  { label: 'ETH', src: '/eds-ban-eth.svg' },
  { label: 'USDT', src: '/eds-ban-udst.svg' },
  { label: 'BNB', src: '/eds-ban-bnb.svg' },
  { label: 'SOL', src: '/eds-ban-sol.svg' },
  { label: 'TRX', src: '/eds-ban-trx.svg' },
  { label: 'SUI', src: '/eds-ban-sui.svg' },
  { label: 'XRP', src: '/eds-ban-xrp.svg' },
  { label: 'USDC', src: '/eds-ban-usdc.svg' },
  { label: 'LINK', src: '/eds-ban-link.svg' },
];
const showcaseGridColumns = Array.from({ length: 15 }, (_, index) => {
  const x = index * 100;
  const floorX = 700 + (x - 700) * 1.35;
  return `M ${x} 0 L ${x} 412 Q ${x} 500 ${floorX} 824`;
});
const showcaseGridRows = [0, 82, 165, 247, 330, 412, 470, 540, 624, 720, 824];

function isHashLink(to: string) {
  return to.startsWith('#');
}

function scrollActiveHomeCardIntoView() {
  const container = showcaseCardsRef.value;
  if (!container) return;

  const card = container.querySelector<HTMLElement>(
    `[data-showcase-card-index="${activeHomeCard.value}"]`,
  );
  card?.scrollIntoView({
    behavior: 'smooth',
    inline: 'center',
    block: 'nearest',
  });
}

function updateShowcaseScrollEdges() {
  const container = showcaseCardsRef.value;
  if (!container) {
    showcaseCanScrollLeft.value = false;
    showcaseCanScrollRight.value = false;
    return;
  }

  const { scrollLeft, scrollWidth, clientWidth } = container;
  const hasOverflow = scrollWidth > clientWidth + showcaseScrollEpsilon;

  showcaseCanScrollLeft.value =
    hasOverflow && scrollLeft > showcaseScrollEpsilon;
  showcaseCanScrollRight.value =
    hasOverflow && scrollLeft + clientWidth < scrollWidth - showcaseScrollEpsilon;
}

function showPreviousHomeCard() {
  const total = homeCards.value.length;
  if (!total) return;
  activeHomeCard.value = (activeHomeCard.value - 1 + total) % total;
}

function showNextHomeCard() {
  const total = homeCards.value.length;
  if (!total) return;
  activeHomeCard.value = (activeHomeCard.value + 1) % total;
}

watch(activeHomeCard, async () => {
  await nextTick();
  scrollActiveHomeCardIntoView();
});

watch(showcaseCardsRef, (container, _, onCleanup) => {
  if (!container) return;

  container.addEventListener('scroll', updateShowcaseScrollEdges, { passive: true });
  const resizeObserver = new ResizeObserver(updateShowcaseScrollEdges);
  resizeObserver.observe(container);
  void nextTick(updateShowcaseScrollEdges);

  onCleanup(() => {
    container.removeEventListener('scroll', updateShowcaseScrollEdges);
    resizeObserver.disconnect();
  });
});

watch(homeCards, () => {
  void nextTick(updateShowcaseScrollEdges);
});

onMounted(() => {
  if (!pageRoot.value || typeof IntersectionObserver === 'undefined') return;

  animationObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const region = entry.target as HTMLElement;
        const paused = !entry.isIntersecting;
        region.classList.toggle(styles.animationPaused!, paused);
        region.dataset.animationPaused = String(paused);

        const grid = region.querySelector(`.${styles.showcaseGrid}`);
        if (grid instanceof SVGSVGElement) {
          if (paused) {
            grid.pauseAnimations();
          } else {
            grid.unpauseAnimations();
          }
        }
      });
    },
    { rootMargin: '200px 0px' },
  );

  pageRoot.value
    .querySelectorAll<HTMLElement>('[data-animation-region]')
    .forEach((region) => animationObserver?.observe(region));
});

onBeforeUnmount(() => animationObserver?.disconnect());
</script>

<template>
  <article ref="pageRoot" :class="styles.page">
    <section :class="[styles.hero, page === 'home' && styles.homeHero]">
      <div :class="styles.heroCopy" data-reveal data-animation-region>
        <p v-if="content.eyebrow" :class="styles.eyebrow">{{ content.eyebrow }}</p>
        <h1 :class="styles.heroTitle">{{ content.title }}</h1>
        <p v-if="page === 'home'" :class="styles.heroSubtitle">
          <template v-if="locale === 'en-US'">
            Enterprise Digital Asset
            <RotatingInline :items="assetPlaceholders" />
            Management, Reimagined
          </template>
          <template v-else>
            企业数字资产<RotatingInline :items="assetPlaceholders" />管理，全新升级
          </template>
        </p>
        <p v-else :class="styles.heroSubtitle">{{ content.subtitle }}</p>
        <div
          v-if="content.primaryCta || content.secondaryCta"
          :class="styles.actions"
        >
          <a
            v-if="content.primaryCta && isHashLink(content.primaryCta.to)"
            :href="content.primaryCta.to"
          >
            <BubbleButton v-if="page === 'home'">
              <EgButton :class="styles.homePrimaryAction" size="lg">
                {{ content.primaryCta.label }}
              </EgButton>
            </BubbleButton>
            <EgButton v-else :class="styles.primaryAction" size="lg">
              {{ content.primaryCta.label }}
            </EgButton>
          </a>
          <RouterLink
            v-else-if="content.primaryCta"
            :to="content.primaryCta.to"
            custom
            v-slot="{ navigate }"
          >
            <BubbleButton v-if="page === 'home'">
              <EgButton :class="styles.homePrimaryAction" size="lg" @click="navigate">
                {{ content.primaryCta.label }}
              </EgButton>
            </BubbleButton>
            <EgButton v-else :class="styles.primaryAction" size="lg" @click="navigate">
              {{ content.primaryCta.label }}
            </EgButton>
          </RouterLink>

          <RouterLink
            v-if="content.secondaryCta && !isHashLink(content.secondaryCta.to)"
            :to="content.secondaryCta.to"
            :class="[styles.textLink, styles.homeHeroTextLink]"
          >
            {{ content.secondaryCta.label }}
          </RouterLink>
          <a
            v-else-if="content.secondaryCta"
            :href="content.secondaryCta.to"
            :class="[styles.textLink, styles.homeHeroTextLink]"
          >
            {{ content.secondaryCta.label }}
          </a>
        </div>
      </div>

      <div
        v-if="page === 'home'"
        :class="styles.homeHeroVisual"
        data-reveal
      data-animation-region
      >
        <div :class="styles.productShowcase">
          <svg
            :class="styles.showcaseGrid"
            viewBox="0 0 1400 824"
            preserveAspectRatio="none"
            aria-hidden="true"
            data-scroll-animated-svg
            data-no-corner-smoothing
          >
            <defs>
              <linearGradient
                id="showcase-grid-flow"
                x1="0"
                y1="-260"
                x2="0"
                y2="40"
                gradientUnits="userSpaceOnUse"
              >
                <stop
                  offset="0"
                  stop-color="var(--material-same-white-primary)"
                  stop-opacity="0"
                />
                <stop
                  offset="0.5"
                  stop-color="var(--material-same-white-primary)"
                  stop-opacity="0.65"
                />
                <stop
                  offset="1"
                  stop-color="var(--material-same-white-primary)"
                  stop-opacity="0"
                />
                <animate
                  attributeName="y1"
                  values="-260;824"
                  dur="6s"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="y2"
                  values="40;1124"
                  dur="6s"
                  repeatCount="indefinite"
                />
              </linearGradient>
            </defs>

            <g :class="styles.showcaseGridBase">
              <path v-for="path in showcaseGridColumns" :key="path" :d="path" />
              <line
                v-for="row in showcaseGridRows"
                :key="row"
                x1="0"
                :y1="row"
                x2="1400"
                :y2="row"
              />
            </g>
            <g :class="styles.showcaseGridFlow">
              <path v-for="path in showcaseGridColumns" :key="`flow-${path}`" :d="path" />
              <line
                v-for="row in showcaseGridRows"
                :key="`flow-${row}`"
                x1="0"
                :y1="row"
                x2="1400"
                :y2="row"
              />
            </g>
          </svg>
          <ProductWindowMock />
          <div :class="styles.showcaseAvatar" aria-hidden="true">
            <video
              :class="styles.expertVideo"
              src="/udun-expert-commentary.mp4"
              autoplay
              loop
              muted
              playsinline
            />
          </div>
          <div :class="[styles.showcaseGlassSurface, styles.showcaseName]">{{ activeHomeCardTitle }}</div>
        </div>

        <div :class="styles.showcaseCardsShell">
          <div
            v-if="showcaseCanScrollLeft"
            :class="styles.showcaseCardsFadeLeft"
            aria-hidden="true"
          />
          <div
            v-if="showcaseCanScrollRight"
            :class="styles.showcaseCardsFadeRight"
            aria-hidden="true"
          />
          <button
            v-if="showcaseCanScrollLeft"
            type="button"
            :class="[
              styles.showcaseGlassSurface,
              styles.showcaseCardsNav,
              styles.showcaseCardsNavPrev,
            ]"
            :aria-label="t('common.showcaseCardsPrev')"
            @click="showPreviousHomeCard"
          >
            <img
              :class="styles.showcaseCardsNavIcon"
              src="/eds-arrow-left.svg"
              alt=""
            />
          </button>
          <button
            v-if="showcaseCanScrollRight"
            type="button"
            :class="[
              styles.showcaseGlassSurface,
              styles.showcaseCardsNav,
              styles.showcaseCardsNavNext,
            ]"
            :aria-label="t('common.showcaseCardsNext')"
            @click="showNextHomeCard"
          >
            <img
              :class="styles.showcaseCardsNavIcon"
              src="/eds-arrow-right.svg"
              alt=""
            />
          </button>
          <div
            ref="showcaseCardsRef"
            :class="styles.showcaseCards"
            :style="{
              '--showcase-active-index': activeHomeCard,
              '--showcase-scroll-padding-start': showcaseCanScrollLeft
                ? showcaseFadeWidth
                : '0px',
              '--showcase-scroll-padding-end': showcaseCanScrollRight
                ? showcaseFadeWidth
                : '0px',
            }"
          >
            <div :class="styles.showcaseCardIndicator" aria-hidden="true" />
            <article
              v-for="(card, cardIndex) in homeCards"
              :key="card[0]"
              :data-showcase-card-index="cardIndex"
              :class="[
                styles.showcaseCard,
                cardIndex === activeHomeCard && styles.showcaseCardFeatured,
              ]"
              role="button"
              tabindex="0"
              data-no-corner-smoothing
              :aria-pressed="cardIndex === activeHomeCard"
              @focus="activeHomeCard = cardIndex"
              @keydown.enter="activeHomeCard = cardIndex"
              @keydown.space.prevent="activeHomeCard = cardIndex"
            >
              <div
                :class="styles.showcaseCardSurface"
                data-no-corner-smoothing
              >
                <div :class="styles.showcaseCardVisual" aria-hidden="true">
                  <div :class="styles.homeFeatureGraphicPlaceholder" />
                </div>
                <div :class="styles.showcaseCardCopy">
                  <strong>{{ card[0] }}</strong>
                  <span>{{ card[1] }}</span>
                </div>
              </div>
            </article>
          </div>
        </div>
      </div>

      <div
        v-else
        :class="styles.heroVisual"
        aria-hidden="true"
        data-reveal
        data-animation-region
      >
        <div :class="styles.orbit">
          <span :class="styles.orbitCore">U</span>
          <span :class="[styles.orbitNode, styles.orbitNodeOne]" />
          <span :class="[styles.orbitNode, styles.orbitNodeTwo]" />
          <span :class="[styles.orbitNode, styles.orbitNodeThree]" />
        </div>
      </div>
    </section>

    <section
      v-for="(section, sectionIndex) in content.sections"
      :id="sectionIndex === 0 ? 'features' : undefined"
      :key="section.title"
      :class="[
        styles.storySection,
        section.tone === 'soft' && styles.soft,
        section.tone === 'dark' && styles.dark,
        section.visual === 'globe' && styles.globeStorySection,
      ]"
      data-reveal
      data-animation-region
    >
      <div
        v-if="section.visual === 'globe'"
        :class="styles.globeSection"
      >
        <div :class="styles.globeSectionMain">
          <div :class="styles.sectionIntro">
            <p v-if="section.eyebrow" :class="styles.eyebrow">{{ section.eyebrow }}</p>
            <h2 :class="styles.sectionTitle">{{ section.title }}</h2>
            <p v-if="section.body" :class="styles.sectionBody">{{ section.body }}</p>

            <RouterLink
              v-if="section.cta && !isHashLink(section.cta.to)"
              :to="section.cta.to"
              :class="styles.textLink"
            >
              {{ section.cta.label }}
              <span :class="styles.textLinkIcon" aria-hidden="true" />
            </RouterLink>
            <a
              v-else-if="section.cta"
              :href="section.cta.to"
              :class="styles.textLink"
            >
              {{ section.cta.label }}
              <span :class="styles.textLinkIcon" aria-hidden="true" />
            </a>
          </div>

          <div v-if="section.features" :class="[styles.featureGrid, styles.featureGridVertical]">
            <article
              v-for="feature in section.features"
              :key="feature.title"
              :class="styles.feature"
              data-reveal
            >
              <h3>{{ feature.title }}</h3>
              <p>{{ feature.body }}</p>
            </article>
          </div>
        </div>

        <GlobeVisual :class="styles.globeVisual" />
      </div>

      <template v-else>
        <div :class="styles.sectionIntro">
          <p v-if="section.eyebrow" :class="styles.eyebrow">{{ section.eyebrow }}</p>
          <h2 :class="styles.sectionTitle">{{ section.title }}</h2>
          <p v-if="section.body" :class="styles.sectionBody">{{ section.body }}</p>

          <RouterLink
            v-if="section.cta && !isHashLink(section.cta.to)"
            :to="section.cta.to"
            :class="styles.textLink"
          >
            {{ section.cta.label }}
            <span :class="styles.textLinkIcon" aria-hidden="true" />
          </RouterLink>
          <a
            v-else-if="section.cta"
            :href="section.cta.to"
            :class="styles.textLink"
          >
            {{ section.cta.label }}
            <span :class="styles.textLinkIcon" aria-hidden="true" />
          </a>
        </div>

        <div
          v-if="section.visual && !(page === 'home' && sectionIndex === 0)"
          :class="[styles.miniVisual, styles[section.visual]]"
          aria-hidden="true"
        >
          <template v-if="section.visual === 'security'">
            <span>KEY</span>
            <span>TEE</span>
            <span>Ownership</span>
            <span>MCP</span>
            <span>
              <img src="/favicon.svg" alt="" />
            </span>
            <span>SIGN</span>
          </template>
          <template v-else>
            <span v-for="item in 6" :key="item" />
          </template>
        </div>

        <div
          v-if="section.features"
          :class="[
            styles.featureGrid,
            page === 'home' && sectionIndex === 0 && styles.homeFeatureGrid,
          ]"
        >
          <article
            v-for="(feature, featureIndex) in section.features"
            :key="feature.title"
            :class="[
              styles.feature,
              page === 'home' && sectionIndex === 0 && styles.homeFeatureCard,
            ]"
            data-reveal
          >
            <template v-if="page === 'home' && sectionIndex === 0">
              <div
                v-if="featureIndex === 1"
                :class="styles.homeFeatureGraphicPlaceholder"
                aria-hidden="true"
              />
              <div :class="styles.homeFeatureCopy">
                <h3>{{ feature.title }}</h3>
                <p>{{ feature.body }}</p>
              </div>
              <div
                v-if="featureIndex !== 1"
                :class="styles.homeFeatureGraphicPlaceholder"
                aria-hidden="true"
              />
            </template>
            <template v-else>
              <span :class="styles.featureNumber">
                {{ String(featureIndex + 1).padStart(2, '0') }}
              </span>
              <h3>{{ feature.title }}</h3>
              <p>{{ feature.body }}</p>
            </template>
          </article>
        </div>
      </template>

      <div
        v-if="section.tags"
        :class="[
          styles.tags,
          section.tags.length === 4 && styles.tagsSquare,
        ]"
      >
        <template v-if="section.tags.length === 4">
          <span v-for="tag in section.tags" :key="tag">
            <span
              :class="styles.homeFeatureGraphicPlaceholder"
              aria-hidden="true"
            />
            {{ tag }}
          </span>
        </template>
        <template v-else>
          <span v-for="tag in section.tags" :key="tag">{{ tag }}</span>
        </template>
      </div>
    </section>

    <section v-if="content.closing" :class="styles.closing" data-reveal>
      <div>
        <p :class="styles.eyebrow">{{ t('common.closingEyebrow') }}</p>
        <h2>{{ content.closing.title }}</h2>
        <p v-if="content.closing.body">{{ content.closing.body }}</p>
      </div>
      <div :class="styles.actions">
        <RouterLink :to="content.closing.primaryCta.to" custom v-slot="{ navigate }">
          <EgButton :class="styles.primaryAction" size="lg" @click="navigate">
            {{ content.closing.primaryCta.label }}
          </EgButton>
        </RouterLink>
        <RouterLink
          v-if="content.closing.secondaryCta"
          :to="content.closing.secondaryCta.to"
          custom
          v-slot="{ navigate }"
        >
          <EgButton variant="ghost" size="lg" @click="navigate">
            {{ content.closing.secondaryCta.label }}
          </EgButton>
        </RouterLink>
      </div>
    </section>
  </article>
</template>
