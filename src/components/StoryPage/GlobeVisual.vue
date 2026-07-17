<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import * as am5 from '@amcharts/amcharts5';
import * as am5map from '@amcharts/amcharts5/map';
import am5geodata_worldLow from '@amcharts/amcharts5-geodata/worldLow';
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated';
import {
  applyGlobePalette,
  getGlobePaletteKey,
  readGlobePalette,
  type GlobeSeriesRefs,
} from './globeTheme';
import styles from './GlobeVisual.module.css';

type RootWithLogo = am5.Root & {
  _logo?: am5.Container;
};

const GLOBE_ZOOM_LEVEL = 0.9;
const GLOBE_ROTATION_STEP = 0.04;

const rootRef = ref<HTMLDivElement>();
let chartRoot: RootWithLogo | null = null;
let seriesRefs: GlobeSeriesRefs | null = null;
let autoRotateEnabled = false;
let autoRotateDisposer: am5.IDisposer | null = null;
let pointerDisposer: am5.IDisposer | null = null;
let domStopHandler: ((event: PointerEvent) => void) | null = null;
let domResumeHandler: ((event: PointerEvent) => void) | null = null;
let logoDisposer: am5.IDisposer | null = null;
let themePollId = 0;
let lastPaletteKey = '';
const bulletTimeouts: number[] = [];

const producerIds = ['BR', 'VN', 'CO', 'ET', 'ID', 'HN'];
const hubIds = ['DE', 'BE', 'IT', 'US'];
const consumerIds = ['FR', 'PL', 'SE', 'RU', 'GB', 'NL', 'GR', 'AT', 'CA', 'JP'];

const sankeyLinks = [
  { sourceId: 'BR', targetId: 'DE', value: 350 },
  { sourceId: 'BR', targetId: 'US', value: 450 },
  { sourceId: 'BR', targetId: 'IT', value: 200 },
  { sourceId: 'VN', targetId: 'DE', value: 200 },
  { sourceId: 'VN', targetId: 'BE', value: 150 },
  { sourceId: 'CO', targetId: 'US', value: 250 },
  { sourceId: 'CO', targetId: 'DE', value: 80 },
  { sourceId: 'ET', targetId: 'DE', value: 60 },
  { sourceId: 'ET', targetId: 'BE', value: 40 },
  { sourceId: 'ID', targetId: 'US', value: 80 },
  { sourceId: 'HN', targetId: 'DE', value: 60 },
  { sourceId: 'HN', targetId: 'BE', value: 40 },
  { sourceId: 'DE', targetId: 'FR', value: 150 },
  { sourceId: 'DE', targetId: 'PL', value: 100 },
  { sourceId: 'DE', targetId: 'SE', value: 80 },
  { sourceId: 'DE', targetId: 'RU', value: 120 },
  { sourceId: 'BE', targetId: 'GB', value: 100 },
  { sourceId: 'BE', targetId: 'NL', value: 80 },
  { sourceId: 'IT', targetId: 'GR', value: 50 },
  { sourceId: 'IT', targetId: 'AT', value: 40 },
  { sourceId: 'US', targetId: 'CA', value: 120 },
  { sourceId: 'US', targetId: 'JP', value: 80 },
];

function hideAmchartsLogo(root: RootWithLogo) {
  if (!root._logo) return false;
  root._logo.set('forceHidden', true);
  return true;
}

function refreshGlobePalette(force = false) {
  if (!seriesRefs) return;

  const paletteKey = getGlobePaletteKey();
  if (!force && paletteKey === lastPaletteKey) return;

  lastPaletteKey = paletteKey;
  applyGlobePalette(seriesRefs, readGlobePalette());
}

function refreshGlobePaletteFromHmr() {
  refreshGlobePalette(true);
}

function startThemePolling() {
  if (!import.meta.env.DEV) return;

  themePollId = window.setInterval(refreshGlobePalette, 200);
}

function stopAutoRotate() {
  autoRotateEnabled = false;
}

function resumeAutoRotate() {
  autoRotateEnabled = true;
}

function startAutoRotate(chart: am5map.MapChart, root: RootWithLogo, host: HTMLElement) {
  autoRotateEnabled = true;
  autoRotateDisposer = root.events.on('frameended', () => {
    if (!autoRotateEnabled) return;
    chart.set('rotationX', chart.get('rotationX', -15) + GLOBE_ROTATION_STEP);
  });

  pointerDisposer = chart.chartContainer.events.on('pointerdown', stopAutoRotate);
  domStopHandler = () => stopAutoRotate();
  domResumeHandler = () => resumeAutoRotate();
  host.addEventListener('pointerdown', domStopHandler);
  window.addEventListener('pointerup', domResumeHandler);
  window.addEventListener('pointercancel', domResumeHandler);
}

onMounted(() => {
  if (!rootRef.value) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const initialPalette = readGlobePalette();

  chartRoot = am5.Root.new(rootRef.value) as RootWithLogo;
  chartRoot.setThemes([am5themes_Animated.new(chartRoot)]);

  logoDisposer = chartRoot.events.on('frameended', () => {
    if (hideAmchartsLogo(chartRoot!)) {
      logoDisposer?.dispose();
      logoDisposer = null;
    }
  });

  const chart = chartRoot.container.children.push(
    am5map.MapChart.new(chartRoot, {
      panX: 'rotateX',
      panY: 'rotateY',
      projection: am5map.geoOrthographic(),
      rotationX: -15,
      rotationY: -20,
      minZoomLevel: GLOBE_ZOOM_LEVEL,
      maxZoomLevel: GLOBE_ZOOM_LEVEL,
      zoomLevel: GLOBE_ZOOM_LEVEL,
      wheelX: 'none',
      wheelY: 'none',
      pinchZoom: false,
      paddingTop: 0,
      paddingBottom: 0,
      paddingLeft: 0,
      paddingRight: 0,
    }),
  );

  chart.set('wheelable', false);

  const graticuleSeries = chart.series.push(am5map.GraticuleSeries.new(chartRoot, {}));
  const polygonSeries = chart.series.push(
    am5map.MapPolygonSeries.new(chartRoot, {
      geoJSON: am5geodata_worldLow,
    }),
  );

  const sankeySeries = chart.series.push(
    am5map.MapSankeySeries.new(chartRoot, {
      polygonSeries,
      maxWidth: 2,
      controlPointDistance: 0.4,
      resolution: 60,
      nodePadding: 0.3,
    }),
  );

  seriesRefs = {
    graticuleSeries,
    polygonSeries,
    sankeySeries,
    producerIds,
    hubIds,
    consumerIds,
  };

  sankeySeries.bullets.push(() =>
    am5.Bullet.new(chartRoot!, {
      locationX: 0,
      autoRotate: true,
      sprite: am5.Circle.new(chartRoot!, {
        radius: initialPalette.bulletRadius,
        fill: initialPalette.brandPrimary,
        centerX: am5.p50,
        centerY: am5.p50,
        visible: false,
      }),
    }),
  );

  sankeySeries.data.setAll(sankeyLinks);

  polygonSeries.events.on('datavalidated', () => refreshGlobePalette(true));

  sankeySeries.events.on('datavalidated', () => {
    refreshGlobePalette(true);

    if (prefersReducedMotion) return;

    am5.array.each(sankeySeries.dataItems, (dataItem) => {
      const bullets = dataItem.bullets;
      if (!bullets) return;

      am5.array.each(bullets, (bullet) => {
        const randomDur = 3000 + Math.random() * 3000;
        const delay = Math.random() * randomDur;

        bulletTimeouts.push(
          window.setTimeout(() => {
            bullet.get('sprite')?.set('visible', true);
            bullet.animate({
              key: 'locationX',
              from: 0,
              to: 1,
              duration: randomDur,
              easing: am5.ease.linear,
              loops: Infinity,
            });
          }, delay),
        );
      });
    });
  });

  lastPaletteKey = getGlobePaletteKey();
  applyGlobePalette(seriesRefs, initialPalette);
  startThemePolling();

  import.meta.hot?.on('vite:afterUpdate', refreshGlobePaletteFromHmr);

  chart.appear(1000, 100);

  if (!prefersReducedMotion) {
    startAutoRotate(chart, chartRoot, rootRef.value);
  }
});

onBeforeUnmount(() => {
  import.meta.hot?.off('vite:afterUpdate', refreshGlobePaletteFromHmr);
  window.clearInterval(themePollId);
  bulletTimeouts.forEach((timeoutId) => window.clearTimeout(timeoutId));
  logoDisposer?.dispose();
  autoRotateDisposer?.dispose();
  pointerDisposer?.dispose();
  if (rootRef.value && domStopHandler) {
    rootRef.value.removeEventListener('pointerdown', domStopHandler);
  }
  if (domResumeHandler) {
    window.removeEventListener('pointerup', domResumeHandler);
    window.removeEventListener('pointercancel', domResumeHandler);
  }
  domStopHandler = null;
  domResumeHandler = null;
  autoRotateEnabled = false;
  seriesRefs = null;
  chartRoot?.dispose();
  chartRoot = null;
});
</script>

<template>
  <div ref="rootRef" :class="styles.root" aria-hidden="true" />
</template>
