import * as am5 from '@amcharts/amcharts5';
import type * as am5map from '@amcharts/amcharts5/map';

export const GLOBE_CSS_VARS = {
  brandDeep: '--site-globe-brand-deep',
  brandPrimary: '--site-globe-brand-primary',
  producer: '--site-globe-producer',
  brandMid: '--site-globe-brand-mid',
  brandLight: '--site-globe-brand-light',
  brandPale: '--site-globe-brand-pale',
  brandStroke: '--site-globe-brand-stroke',
  graticuleOpacity: '--site-globe-graticule-opacity',
  landStrokeOpacity: '--site-globe-land-stroke-opacity',
  arcOpacity: '--site-globe-arc-opacity',
  nodeFillOpacity: '--site-globe-node-fill-opacity',
  bulletRadius: '--site-globe-bullet-radius',
} as const;

export type GlobePalette = {
  brandDeep: am5.Color;
  brandPrimary: am5.Color;
  producer: am5.Color;
  brandMid: am5.Color;
  brandLight: am5.Color;
  brandPale: am5.Color;
  brandStroke: am5.Color;
  graticuleOpacity: number;
  landStrokeOpacity: number;
  arcOpacity: number;
  nodeFillOpacity: number;
  bulletRadius: number;
};

export type GlobeSeriesRefs = {
  graticuleSeries: am5map.GraticuleSeries;
  polygonSeries: am5map.MapPolygonSeries;
  sankeySeries: am5map.MapSankeySeries;
  producerIds: string[];
  hubIds: string[];
  consumerIds: string[];
};

function readCssVar(name: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function readCssColor(name: string, fallback: string) {
  const value = readCssVar(name);
  return am5.color(value || fallback);
}

function readCssNumber(name: string, fallback: number) {
  const value = Number.parseFloat(readCssVar(name));
  return Number.isFinite(value) ? value : fallback;
}

export function readGlobePalette(): GlobePalette {
  return {
    brandDeep: readCssColor(GLOBE_CSS_VARS.brandDeep, '#003d99'),
    brandPrimary: readCssColor(GLOBE_CSS_VARS.brandPrimary, '#0066ff'),
    producer: readCssColor(GLOBE_CSS_VARS.producer, '#82a884'),
    brandMid: readCssColor(GLOBE_CSS_VARS.brandMid, '#4f8fe8'),
    brandLight: readCssColor(GLOBE_CSS_VARS.brandLight, '#9bc7ee'),
    brandPale: readCssColor(GLOBE_CSS_VARS.brandPale, '#edf3f9'),
    brandStroke: readCssColor(GLOBE_CSS_VARS.brandStroke, '#bfd3e8'),
    graticuleOpacity: readCssNumber(GLOBE_CSS_VARS.graticuleOpacity, 0.14),
    landStrokeOpacity: readCssNumber(GLOBE_CSS_VARS.landStrokeOpacity, 0.65),
    arcOpacity: readCssNumber(GLOBE_CSS_VARS.arcOpacity, 0.55),
    nodeFillOpacity: readCssNumber(GLOBE_CSS_VARS.nodeFillOpacity, 0.95),
    bulletRadius: readCssNumber(GLOBE_CSS_VARS.bulletRadius, 2.5),
  };
}

export function getGlobePaletteKey() {
  return Object.values(GLOBE_CSS_VARS)
    .map((name) => readCssVar(name))
    .join('\0');
}

export function applyGlobePalette(refs: GlobeSeriesRefs, palette: GlobePalette) {
  refs.graticuleSeries.mapLines.template.setAll({
    stroke: palette.brandPrimary,
    strokeOpacity: palette.graticuleOpacity,
    strokeWidth: 0.5,
  });
  am5.array.each(refs.graticuleSeries.dataItems, (dataItem) => {
    dataItem.get('mapLine')?.setAll({
      stroke: palette.brandPrimary,
      strokeOpacity: palette.graticuleOpacity,
      strokeWidth: 0.5,
    });
  });

  refs.polygonSeries.mapPolygons.template.setAll({
    fill: palette.brandPale,
    stroke: palette.brandStroke,
    strokeWidth: 0.5,
    strokeOpacity: palette.landStrokeOpacity,
  });

  am5.array.each(refs.polygonSeries.dataItems, (dataItem) => {
    const id = dataItem.get('id');
    if (!id) return;

    if (refs.producerIds.includes(id)) {
      dataItem.get('mapPolygon')?.setAll({ fill: palette.producer });
    } else if (refs.hubIds.includes(id)) {
      dataItem.get('mapPolygon')?.setAll({ fill: palette.brandMid });
    } else if (refs.consumerIds.includes(id)) {
      dataItem.get('mapPolygon')?.setAll({ fill: palette.brandLight });
    } else {
      dataItem.get('mapPolygon')?.setAll({ fill: palette.brandPale });
    }
  });

  refs.sankeySeries.mapPolygons.template.setAll({
    fill: palette.brandPrimary,
    fillOpacity: palette.arcOpacity,
    strokeOpacity: 0,
  });
  am5.array.each(refs.sankeySeries.dataItems, (dataItem) => {
    dataItem.get('mapPolygon')?.setAll({
      fill: palette.brandPrimary,
      fillOpacity: palette.arcOpacity,
      strokeOpacity: 0,
    });
  });

  refs.sankeySeries.nodes.mapPolygons.template.setAll({
    fill: palette.brandDeep,
    stroke: palette.brandLight,
    strokeWidth: 1.5,
    fillOpacity: palette.nodeFillOpacity,
    strokeOpacity: 1,
  });
  am5.array.each(refs.sankeySeries.nodes.dataItems, (dataItem) => {
    dataItem.get('mapPolygon')?.setAll({
      fill: palette.brandDeep,
      stroke: palette.brandLight,
      strokeWidth: 1.5,
      fillOpacity: palette.nodeFillOpacity,
      strokeOpacity: 1,
    });
  });

  am5.array.each(refs.sankeySeries.dataItems, (dataItem) => {
    am5.array.each(dataItem.bullets ?? [], (bullet) => {
      (bullet.get('sprite') as am5.Circle | undefined)?.setAll({
        fill: palette.brandPrimary,
        radius: palette.bulletRadius,
      });
    });
  });
}
