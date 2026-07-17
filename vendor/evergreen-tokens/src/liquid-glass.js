/**
 * Liquid Glass — SVG displacement backdrop filter.
 * Adapted from https://github.com/shuding/liquid-glass (MIT © Shu Ding, 2025).
 *
 * Usage:
 *   import {
 *     initLiquidGlass,
 *     attachLiquidGlass,
 *     detachLiquidGlass,
 *     refreshLiquidGlass,
 *   } from '@evergreen/tokens/liquid-glass';
 *   initLiquidGlass(); // auto-bind .effect-flotation-box__glass, .effect-popup-box__glass
 *   const surface = attachLiquidGlass(element, { varPrefix: '--effect-glass-bg' });
 *   surface.refresh();
 *   detachLiquidGlass(element);
 */

const GLASS_BOX_SELECTOR = '.effect-flotation-box__glass, .effect-popup-box__glass';
const DEFAULT_GLASS_BG_PREFIX = '--effect-glass-bg';
const GLASS_BOX_LIQUID_PREFIX = '--effect-glass-box-liquid';

export function supportsLiquidGlassBackdrop() {
  if (
    typeof navigator === 'undefined' ||
    typeof CSS === 'undefined' ||
    typeof document === 'undefined'
  ) {
    return false;
  }

  const isChromium = /Chrome\/|Chromium\/|Edg\//.test(navigator.userAgent);
  return isChromium && CSS.supports('backdrop-filter', 'url("#eds-liquid-glass-test")');
}

function smoothStep(edge0, edge1, value) {
  const t = Math.max(0, Math.min(1, (value - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

function vectorLength(x, y) {
  return Math.sqrt(x * x + y * y);
}

function roundedRectSdf(x, y, halfWidth, halfHeight, radius) {
  const qx = Math.abs(x) - halfWidth + radius;
  const qy = Math.abs(y) - halfHeight + radius;
  return Math.min(Math.max(qx, qy), 0) + vectorLength(Math.max(qx, 0), Math.max(qy, 0)) - radius;
}

function texture(x, y) {
  return { type: 't', x, y };
}

function createFragment(options, width = 1, height = 1) {
  const {
    edgeStart = 0.8,
    edgeEnd = 0,
    edgeOffset = 0.15,
    rectInsetX = 0.2,
    rectInsetY = 0.15,
    cornerRadius = 0.6,
    interiorRefraction = 0,
    interiorFrequencyX = 1.2,
    interiorFrequencyY = 0.8,
  } = options;

  const halfWidth = 0.5 - rectInsetX;
  const halfHeight = 0.5 - rectInsetY;

  return (uv) => {
    const ix = uv.x - 0.5;
    const iy = uv.y - 0.5;
    const distanceToEdge = roundedRectSdf(ix, iy, halfWidth, halfHeight, cornerRadius);
    const displacement = smoothStep(edgeStart, edgeEnd, distanceToEdge - edgeOffset);
    const scaled = smoothStep(0, 1, displacement);
    const boundaryFade =
      smoothStep(0, 0.12, uv.x) *
      smoothStep(0, 0.12, 1 - uv.x) *
      smoothStep(0, 0.18, uv.y) *
      smoothStep(0, 0.18, 1 - uv.y);
    const waveX =
      Math.sin((uv.y * interiorFrequencyY + uv.x * 0.35) * Math.PI * 2 + 0.45) *
      (interiorRefraction / width) *
      boundaryFade;
    const waveY =
      Math.cos((uv.x * interiorFrequencyX - uv.y * 0.25) * Math.PI * 2 + 0.2) *
      (interiorRefraction / height) *
      boundaryFade;
    return texture(ix * scaled + 0.5 + waveX, iy * scaled + 0.5 + waveY);
  };
}

function readCssVar(name, fallback) {
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || fallback;
}

function readCssNumber(name, fallback) {
  const parsed = Number.parseFloat(readCssVar(name, String(fallback)));
  return Number.isFinite(parsed) ? parsed : fallback;
}

function resolveVarPrefix(element, options = {}) {
  if (options.varPrefix) {
    return options.varPrefix;
  }

  if (element.matches?.(GLASS_BOX_SELECTOR)) {
    return GLASS_BOX_LIQUID_PREFIX;
  }

  return DEFAULT_GLASS_BG_PREFIX;
}

function readShaderOptions(varPrefix) {
  return {
    edgeStart: readCssNumber(`${varPrefix}-shader-edge-start`, 0.8),
    edgeEnd: readCssNumber(`${varPrefix}-shader-edge-end`, 0),
    edgeOffset: readCssNumber(`${varPrefix}-shader-edge-offset`, 0.15),
    rectInsetX: readCssNumber(`${varPrefix}-shader-rect-inset-x`, 0.2),
    rectInsetY: readCssNumber(`${varPrefix}-shader-rect-inset-y`, 0.15),
    cornerRadius: readCssNumber(`${varPrefix}-shader-corner-radius`, 0.6),
    interiorRefraction: readCssNumber(`${varPrefix}-shader-interior-refraction`, 0),
    interiorFrequencyX: readCssNumber(`${varPrefix}-shader-interior-frequency-x`, 1.2),
    interiorFrequencyY: readCssNumber(`${varPrefix}-shader-interior-frequency-y`, 0.8),
  };
}

function buildBackdropFilter(filterId, varPrefix) {
  const blur = readCssVar(`${varPrefix}-blur`, '0.25px');
  const contrast = readCssVar(`${varPrefix}-contrast`, '1.2');
  const brightness = readCssVar(`${varPrefix}-brightness`, '1.05');
  const saturate = readCssVar(`${varPrefix}-saturate`, '1.1');
  return `url(#${filterId}) blur(${blur}) contrast(${contrast}) brightness(${brightness}) saturate(${saturate})`;
}

function buildFallbackFilter(varPrefix) {
  return readCssVar(`${varPrefix}-fallback`, 'blur(12px) saturate(180%)');
}

class LiquidGlassSurface {
  constructor(element, options = {}) {
    this.element = element;
    this.options = options;
    this.varPrefix = resolveVarPrefix(element, options);
    this.canvasDpi = 1;
    this.id = `${options.filterPrefix ?? 'eds-liquid-glass'}-${Math.random().toString(36).slice(2, 9)}`;
    this.filterId = `${this.id}-filter`;
    this.fragment = createFragment(readShaderOptions(this.varPrefix));
    this.svg = null;
    this.feImage = null;
    this.feDisplacementMap = null;
    this.canvas = null;
    this.context = null;
    this.resizeObserver = null;
    this.supported = !options.forceFallback && supportsLiquidGlassBackdrop();
    this.originalStyles = {
      backdropFilter: this.element.style.getPropertyValue('backdrop-filter'),
      webkitBackdropFilter: this.element.style.getPropertyValue('-webkit-backdrop-filter'),
      background: this.element.style.getPropertyValue('background'),
    };

    if (this.supported) {
      this.createFilter();
    }
    this.applyStyles();
    if (this.supported) {
      this.updateMap();
      this.observeSize();
    }
  }

  createFilter() {
    this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this.svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    this.svg.setAttribute('width', '0');
    this.svg.setAttribute('height', '0');
    this.svg.setAttribute('aria-hidden', 'true');
    this.svg.style.cssText = 'position:fixed;top:0;left:0;pointer-events:none;overflow:hidden;';

    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
    filter.setAttribute('id', this.filterId);
    filter.setAttribute('filterUnits', 'userSpaceOnUse');
    filter.setAttribute('color-interpolation-filters', 'sRGB');

    this.feImage = document.createElementNS('http://www.w3.org/2000/svg', 'feImage');
    this.feImage.setAttribute('id', `${this.id}-map`);

    this.feDisplacementMap = document.createElementNS('http://www.w3.org/2000/svg', 'feDisplacementMap');
    this.feDisplacementMap.setAttribute('in', 'SourceGraphic');
    this.feDisplacementMap.setAttribute('in2', `${this.id}-map`);
    this.feDisplacementMap.setAttribute('xChannelSelector', 'R');
    this.feDisplacementMap.setAttribute('yChannelSelector', 'G');

    filter.appendChild(this.feImage);
    filter.appendChild(this.feDisplacementMap);
    defs.appendChild(filter);
    this.svg.appendChild(defs);

    this.canvas = document.createElement('canvas');
    this.canvas.style.display = 'none';
    this.context = this.canvas.getContext('2d');

    document.body.appendChild(this.svg);
    document.body.appendChild(this.canvas);
  }

  applyStyles() {
    this.element.dataset.liquidGlassReady = 'true';
    this.element.dataset.liquidGlassFallback = String(!this.supported);
    const backdropFilter = this.supported
      ? buildBackdropFilter(this.filterId, this.varPrefix)
      : buildFallbackFilter(this.varPrefix);
    this.element.style.backdropFilter = backdropFilter;
    this.element.style.webkitBackdropFilter = backdropFilter;

    const computedBackground = getComputedStyle(this.element).backgroundImage;
    const hasBackground =
      Boolean(this.element.style.background) ||
      (computedBackground && computedBackground !== 'none');
    const managesBackground = this.element.dataset.liquidGlassManagesBackground === 'true';

    if (!hasBackground || managesBackground) {
      this.element.style.background = readCssVar(
        this.supported
          ? `${this.varPrefix}-surface`
          : `${this.varPrefix}-fallback-surface`,
        this.supported
          ? 'color-mix(in display-p3, var(--eds-face) 72%, transparent)'
          : 'color-mix(in display-p3, var(--eds-face) 85%, transparent)',
      );
      this.element.dataset.liquidGlassManagesBackground = 'true';
    }
  }

  getSize() {
    const rect = this.element.getBoundingClientRect();
    return {
      width: Math.max(1, Math.round(rect.width)),
      height: Math.max(1, Math.round(rect.height)),
    };
  }

  updateMap() {
    if (!this.supported || !this.context || !this.feImage || !this.feDisplacementMap) {
      return;
    }

    const { width, height } = this.getSize();
    this.fragment = createFragment(readShaderOptions(this.varPrefix), width, height);
    const w = width * this.canvasDpi;
    const h = height * this.canvasDpi;
    const data = new Uint8ClampedArray(w * h * 4);
    const rawValues = [];
    let maxScale = 0;

    for (let i = 0; i < data.length; i += 4) {
      const x = (i / 4) % w;
      const y = Math.floor(i / 4 / w);
      const pos = this.fragment({ x: x / w, y: y / h });
      const dx = pos.x * w - x;
      const dy = pos.y * h - y;
      maxScale = Math.max(maxScale, Math.abs(dx), Math.abs(dy));
      rawValues.push(dx, dy);
    }

    maxScale = Math.max(maxScale * 0.5, 1);

    let index = 0;
    for (let i = 0; i < data.length; i += 4) {
      data[i] = (rawValues[index++] / maxScale + 0.5) * 255;
      data[i + 1] = (rawValues[index++] / maxScale + 0.5) * 255;
      data[i + 2] = 0;
      data[i + 3] = 255;
    }

    this.canvas.width = w;
    this.canvas.height = h;
    this.context.putImageData(new ImageData(data, w, h), 0, 0);

    this.feImage.setAttribute('width', String(width));
    this.feImage.setAttribute('height', String(height));
    this.feImage.setAttributeNS('http://www.w3.org/1999/xlink', 'href', this.canvas.toDataURL());

    const filterNode = this.svg.querySelector('filter');
    filterNode.setAttribute('x', '0');
    filterNode.setAttribute('y', '0');
    filterNode.setAttribute('width', String(width));
    filterNode.setAttribute('height', String(height));

    const refractionScale = readCssNumber(`${this.varPrefix}-refraction-scale`, 0.5);
    this.feDisplacementMap.setAttribute(
      'scale',
      String((maxScale / this.canvasDpi) * refractionScale),
    );
  }

  observeSize() {
    this.resizeObserver = new ResizeObserver(() => {
      this.updateMap();
      this.applyStyles();
    });
    this.resizeObserver.observe(this.element);
  }

  refresh() {
    if (this.supported) {
      this.updateMap();
    }
    this.applyStyles();
  }

  restoreStyleProperty(name, value) {
    if (value) {
      this.element.style.setProperty(name, value);
    } else {
      this.element.style.removeProperty(name);
    }
  }

  destroy() {
    this.resizeObserver?.disconnect();
    this.svg?.remove();
    this.canvas?.remove();
    if (this.element.dataset.liquidGlassManagesBackground === 'true') {
      this.restoreStyleProperty('background', this.originalStyles.background);
      delete this.element.dataset.liquidGlassManagesBackground;
    }
    this.restoreStyleProperty('backdrop-filter', this.originalStyles.backdropFilter);
    this.restoreStyleProperty(
      '-webkit-backdrop-filter',
      this.originalStyles.webkitBackdropFilter,
    );
    delete this.element.dataset.liquidGlassFallback;
    delete this.element.dataset.liquidGlassReady;
    delete this.element.dataset.liquidGlassBound;
  }
}

const instances = new WeakMap();
const boundElements = new Set();
let bindingObserver = null;
let styleObserver = null;
let refreshFrame = 0;

export function attachLiquidGlass(element, options = {}) {
  if (!(element instanceof HTMLElement)) {
    throw new TypeError('attachLiquidGlass expects an HTMLElement');
  }

  if (instances.has(element)) {
    return instances.get(element);
  }

  const surface = new LiquidGlassSurface(element, options);
  element.dataset.liquidGlassBound = 'true';
  instances.set(element, surface);
  boundElements.add(element);
  return surface;
}

export function detachLiquidGlass(element) {
  const surface = instances.get(element);
  if (!surface) {
    return;
  }

  surface.destroy();
  instances.delete(element);
  boundElements.delete(element);
}

export function refreshLiquidGlass(element) {
  if (element !== undefined) {
    instances.get(element)?.refresh();
    return;
  }

  for (const boundElement of boundElements) {
    instances.get(boundElement)?.refresh();
  }
}

function scheduleLiquidGlassRefresh() {
  cancelAnimationFrame(refreshFrame);
  refreshFrame = requestAnimationFrame(() => refreshLiquidGlass());
}

function bindLiquidGlassElements(options = {}) {
  const selector = options.selector ?? GLASS_BOX_SELECTOR;
  const surfaces = [];

  for (const element of document.querySelectorAll(selector)) {
    if (element.dataset.liquidGlassBound === 'true') {
      continue;
    }
    surfaces.push(attachLiquidGlass(element, options));
  }

  return surfaces;
}

export function initLiquidGlass(options = {}) {
  const surfaces = bindLiquidGlassElements(options);

  if (!bindingObserver && typeof MutationObserver !== 'undefined') {
    bindingObserver = new MutationObserver(() => {
      bindLiquidGlassElements(options);
    });
    bindingObserver.observe(document.body, { childList: true, subtree: true });
  }

  if (!styleObserver && typeof MutationObserver !== 'undefined') {
    styleObserver = new MutationObserver(scheduleLiquidGlassRefresh);
    styleObserver.observe(document.head, {
      attributes: true,
      childList: true,
      characterData: true,
      subtree: true,
    });
    styleObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'data-theme', 'style'],
    });
  }

  return surfaces;
}

export default {
  attachLiquidGlass,
  detachLiquidGlass,
  refreshLiquidGlass,
  initLiquidGlass,
  supportsLiquidGlassBackdrop,
};
