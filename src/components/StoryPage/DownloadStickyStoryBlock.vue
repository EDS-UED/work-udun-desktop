<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import styles from './StoryPage.module.css';

/** Sticky card mock UI — always English regardless of site locale. */
const STICKY_VISUAL_COPY = {
  legacyHeader: 'Legacy access',
  legacyChipMpc: 'MPC security architecture',
  legacyChipUnified: 'Unified desktop & mobile',
  legacyStatusSupportLabel: 'Support',
  legacyStatusSupportPath: '2.0 maintenance window',
  legacyStatusSupportCode: 'Active',
  legacyStatusUpgradeLabel: 'Upgrade',
  legacyStatusUpgradePath: 'Move to Wallet 3.0',
  legacyStatusUpgradeCode: 'Advised',
} as const;

type StorySectionSlice = {
  eyebrow?: string;
  title: string;
  body?: string;
  cta?: { label: string; to: string };
};

const props = defineProps<{
  apiSection: StorySectionSlice;
  legacySection: StorySectionSlice;
  faviconSrc: string;
}>();

const visualPhase = ref<'api' | 'legacy'>('api');
const apiSectionEl = ref<HTMLElement | null>(null);
const legacySectionEl = ref<HTMLElement | null>(null);
const stickyStageEl = ref<HTMLElement | null>(null);

function isHashLink(to: string) {
  return to.startsWith('#');
}

function rectsOverlap(a: DOMRect, b: DOMRect) {
  return a.top < b.bottom && a.bottom > b.top;
}

function updateVisualPhase() {
  const stage = stickyStageEl.value;
  const apiSection = apiSectionEl.value;
  const legacySection = legacySectionEl.value;
  if (!stage || !apiSection || !legacySection) return;

  const graphicRect = stage.getBoundingClientRect();
  const legacyRect = legacySection.getBoundingClientRect();
  const apiRect = apiSection.getBoundingClientRect();

  const legacyInGraphicZone = rectsOverlap(legacyRect, graphicRect);
  const apiInGraphicZone = rectsOverlap(apiRect, graphicRect);

  if (legacyInGraphicZone && !apiInGraphicZone) {
    visualPhase.value = 'legacy';
    return;
  }

  if (apiInGraphicZone) {
    visualPhase.value = 'api';
    return;
  }

  if (legacyRect.top < graphicRect.top) {
    visualPhase.value = 'legacy';
  } else {
    visualPhase.value = 'api';
  }
}

function bindScrollSwap() {
  if (typeof window === 'undefined') return;
  window.addEventListener('scroll', updateVisualPhase, { passive: true });
  window.addEventListener('resize', updateVisualPhase, { passive: true });
  updateVisualPhase();
}

function unbindScrollSwap() {
  if (typeof window === 'undefined') return;
  window.removeEventListener('scroll', updateVisualPhase);
  window.removeEventListener('resize', updateVisualPhase);
}

onMounted(() => {
  nextTick(bindScrollSwap);
});

watch([apiSectionEl, legacySectionEl, stickyStageEl], () => {
  nextTick(updateVisualPhase);
});

onBeforeUnmount(() => {
  unbindScrollSwap();
});
</script>

<template>
  <div :class="styles.downloadStickyStack">
    <div
      ref="apiSectionEl"
      :class="[styles.downloadStickyStackBlock, styles.downloadStickyStackBlockApi]"
    >
      <div :class="styles.sectionIntro" data-reveal>
        <p v-if="apiSection.eyebrow" :class="styles.eyebrow">{{ apiSection.eyebrow }}</p>
        <h2 :class="styles.sectionTitle">{{ apiSection.title }}</h2>
        <p v-if="apiSection.body" :class="styles.sectionBody">{{ apiSection.body }}</p>
        <RouterLink
          v-if="apiSection.cta && !isHashLink(apiSection.cta.to)"
          :to="apiSection.cta.to"
          :class="styles.textLink"
        >
          {{ apiSection.cta.label }}
          <span :class="styles.textLinkIcon" aria-hidden="true" />
        </RouterLink>
        <a
          v-else-if="apiSection.cta"
          :href="apiSection.cta.to"
          :class="styles.textLink"
        >
          {{ apiSection.cta.label }}
          <span :class="styles.textLinkIcon" aria-hidden="true" />
        </a>
      </div>
    </div>

    <aside :class="styles.downloadStickyVisual" aria-hidden="true">
      <div ref="stickyStageEl" :class="styles.downloadStickyVisualStage" data-reveal>
        <div
          :class="[
            styles.downloadStickyVisualPane,
            visualPhase !== 'api' && styles.downloadStickyVisualPaneHidden,
          ]"
        >
          <div :class="styles.downloadApiScene">
            <div :class="styles.downloadApiPanel">
              <div :class="styles.downloadApiPanelHeader">
                <span :class="styles.downloadApiPanelDots" aria-hidden="true">
                  <i /><i /><i />
                </span>
                <span :class="styles.downloadApiPanelTitle">REST API</span>
                <span :class="styles.downloadApiPanelBadge">
                  <span :class="styles.downloadApiPanelBadgeDot" />
                  Live
                </span>
              </div>

              <div :class="styles.downloadApiFlow">
                <div :class="styles.downloadApiFlowNode">
                  <div
                    :class="[
                      'eds-corner-smoothed',
                      styles.downloadApiFlowTile,
                      styles.downloadApiFlowTileClient,
                    ]"
                  >
                    <span :class="styles.downloadApiFlowCode" aria-hidden="true">{ }</span>
                  </div>
                </div>
                <div :class="styles.downloadApiFlowTrack" aria-hidden="true">
                  <span :class="styles.downloadApiFlowTrackLine" />
                  <span :class="styles.downloadApiFlowTrackPulse" />
                  <span :class="styles.downloadApiFlowTrackPulseReturn" />
                </div>
                <div :class="styles.downloadApiFlowNode">
                  <div
                    :class="[
                      'eds-corner-smoothed',
                      styles.downloadApiFlowTile,
                      styles.downloadApiFlowTileWallet,
                    ]"
                  >
                    <img :src="faviconSrc" alt="" width="32" height="32" decoding="async" />
                  </div>
                </div>
              </div>

              <ol :class="styles.downloadApiLog">
                <li :class="['eds-corner-smoothed', styles.downloadApiLogItem]">
                  <span :class="styles.downloadApiLogMethod">POST</span>
                  <span :class="styles.downloadApiLogPath">/v1/withdraw</span>
                  <span :class="styles.downloadApiLogStatus">200</span>
                </li>
                <li
                  :class="[
                    'eds-corner-smoothed',
                    styles.downloadApiLogItem,
                    styles.downloadApiLogItemAlt,
                  ]"
                >
                  <span :class="styles.downloadApiLogMethod">POST</span>
                  <span :class="styles.downloadApiLogPath">/v1/transaction/callback</span>
                  <span :class="[styles.downloadApiLogStatus, styles.downloadApiLogStatusMuted]">202</span>
                </li>
                <li :class="['eds-corner-smoothed', styles.downloadApiLogItem]">
                  <span :class="styles.downloadApiLogMethod">POST</span>
                  <span :class="styles.downloadApiLogPath">/v1/address/create</span>
                  <span :class="styles.downloadApiLogStatus">201</span>
                </li>
              </ol>
            </div>
          </div>
        </div>

        <div
          :class="[
            styles.downloadStickyVisualPane,
            visualPhase !== 'legacy' && styles.downloadStickyVisualPaneHidden,
          ]"
        >
          <div :class="[styles.downloadApiScene, styles.downloadLegacyScene]">
            <div :class="styles.downloadApiPanel">
              <div :class="styles.downloadApiPanelHeader">
                <span :class="styles.downloadApiPanelDots" aria-hidden="true">
                  <i /><i /><i />
                </span>
                <span :class="styles.downloadApiPanelTitle">{{
                  STICKY_VISUAL_COPY.legacyHeader
                }}</span>
                <span :class="styles.downloadLegacyPanelBadge">2.0</span>
              </div>

              <div :class="styles.downloadLegacyFlow">
                <div :class="styles.downloadApiFlowNode">
                  <div
                    :class="[
                      'eds-corner-smoothed',
                      styles.downloadApiFlowTile,
                      styles.downloadLegacyFlowTileLegacy,
                    ]"
                  >
                    <span :class="styles.downloadLegacyFlowVersion">2.0</span>
                  </div>
                </div>
                <div :class="styles.downloadLegacyFlowArrow" aria-hidden="true" />
                <div :class="styles.downloadApiFlowNode">
                  <div
                    :class="[
                      'eds-corner-smoothed',
                      styles.downloadApiFlowTile,
                      styles.downloadApiFlowTileWallet,
                    ]"
                  >
                    <img :src="faviconSrc" alt="" width="32" height="32" decoding="async" />
                  </div>
                </div>
              </div>

              <div :class="styles.downloadLegacyChipRow">
                <span :class="['eds-corner-smoothed', styles.downloadLegacyChip]">{{
                  STICKY_VISUAL_COPY.legacyChipMpc
                }}</span>
                <span :class="['eds-corner-smoothed', styles.downloadLegacyChip]">{{
                  STICKY_VISUAL_COPY.legacyChipUnified
                }}</span>
                <span
                  :class="[
                    'eds-corner-smoothed',
                    styles.downloadLegacyChip,
                    styles.downloadLegacyChipAccent,
                  ]"
                >
                  3.0
                </span>
              </div>

              <ol :class="[styles.downloadApiLog, styles.downloadLegacyStatusLog]">
                <li :class="['eds-corner-smoothed', styles.downloadApiLogItem]">
                  <span :class="styles.downloadApiLogMethod">{{
                    STICKY_VISUAL_COPY.legacyStatusSupportLabel
                  }}</span>
                  <span :class="styles.downloadApiLogPath">{{
                    STICKY_VISUAL_COPY.legacyStatusSupportPath
                  }}</span>
                  <span :class="styles.downloadApiLogStatus">{{
                    STICKY_VISUAL_COPY.legacyStatusSupportCode
                  }}</span>
                </li>
                <li
                  :class="[
                    'eds-corner-smoothed',
                    styles.downloadApiLogItem,
                    styles.downloadApiLogItemAlt,
                  ]"
                >
                  <span :class="styles.downloadApiLogMethod">{{
                    STICKY_VISUAL_COPY.legacyStatusUpgradeLabel
                  }}</span>
                  <span :class="styles.downloadApiLogPath">{{
                    STICKY_VISUAL_COPY.legacyStatusUpgradePath
                  }}</span>
                  <span :class="[styles.downloadApiLogStatus, styles.downloadApiLogStatusMuted]">{{
                    STICKY_VISUAL_COPY.legacyStatusUpgradeCode
                  }}</span>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </aside>

    <div ref="legacySectionEl" :class="styles.downloadStickyStackBlock">
      <div :class="styles.sectionIntro" data-reveal>
        <p v-if="legacySection.eyebrow" :class="styles.eyebrow">{{ legacySection.eyebrow }}</p>
        <h2 :class="styles.sectionTitle">{{ legacySection.title }}</h2>
        <p v-if="legacySection.body" :class="styles.sectionBody">{{ legacySection.body }}</p>
        <RouterLink
          v-if="legacySection.cta && !isHashLink(legacySection.cta.to)"
          :to="legacySection.cta.to"
          :class="styles.textLink"
        >
          {{ legacySection.cta.label }}
          <span :class="styles.textLinkIcon" aria-hidden="true" />
        </RouterLink>
        <a
          v-else-if="legacySection.cta"
          :href="legacySection.cta.to"
          :class="styles.textLink"
        >
          {{ legacySection.cta.label }}
          <span :class="styles.textLinkIcon" aria-hidden="true" />
        </a>
      </div>
    </div>
  </div>
</template>
