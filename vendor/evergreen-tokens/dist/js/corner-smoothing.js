// ../../node_modules/.pnpm/figma-squircle@1.1.0/node_modules/figma-squircle/dist/index.js
function distributeAndNormalize({
  topLeftCornerRadius,
  topRightCornerRadius,
  bottomRightCornerRadius,
  bottomLeftCornerRadius,
  width,
  height
}) {
  const roundingAndSmoothingBudgetMap = {
    topLeft: -1,
    topRight: -1,
    bottomLeft: -1,
    bottomRight: -1
  };
  const cornerRadiusMap = {
    topLeft: topLeftCornerRadius,
    topRight: topRightCornerRadius,
    bottomLeft: bottomLeftCornerRadius,
    bottomRight: bottomRightCornerRadius
  };
  Object.entries(cornerRadiusMap).sort(([, radius1], [, radius2]) => {
    return radius2 - radius1;
  }).forEach(([cornerName, radius]) => {
    const corner = cornerName;
    const adjacents = adjacentsByCorner[corner];
    const budget = Math.min(
      ...adjacents.map((adjacent) => {
        const adjacentCornerRadius = cornerRadiusMap[adjacent.corner];
        if (radius === 0 && adjacentCornerRadius === 0) {
          return 0;
        }
        const adjacentCornerBudget = roundingAndSmoothingBudgetMap[adjacent.corner];
        const sideLength = adjacent.side === "top" || adjacent.side === "bottom" ? width : height;
        if (adjacentCornerBudget >= 0) {
          return sideLength - roundingAndSmoothingBudgetMap[adjacent.corner];
        } else {
          return radius / (radius + adjacentCornerRadius) * sideLength;
        }
      })
    );
    roundingAndSmoothingBudgetMap[corner] = budget;
    cornerRadiusMap[corner] = Math.min(radius, budget);
  });
  return {
    topLeft: {
      radius: cornerRadiusMap.topLeft,
      roundingAndSmoothingBudget: roundingAndSmoothingBudgetMap.topLeft
    },
    topRight: {
      radius: cornerRadiusMap.topRight,
      roundingAndSmoothingBudget: roundingAndSmoothingBudgetMap.topRight
    },
    bottomLeft: {
      radius: cornerRadiusMap.bottomLeft,
      roundingAndSmoothingBudget: roundingAndSmoothingBudgetMap.bottomLeft
    },
    bottomRight: {
      radius: cornerRadiusMap.bottomRight,
      roundingAndSmoothingBudget: roundingAndSmoothingBudgetMap.bottomRight
    }
  };
}
var adjacentsByCorner = {
  topLeft: [
    {
      corner: "topRight",
      side: "top"
    },
    {
      corner: "bottomLeft",
      side: "left"
    }
  ],
  topRight: [
    {
      corner: "topLeft",
      side: "top"
    },
    {
      corner: "bottomRight",
      side: "right"
    }
  ],
  bottomLeft: [
    {
      corner: "bottomRight",
      side: "bottom"
    },
    {
      corner: "topLeft",
      side: "left"
    }
  ],
  bottomRight: [
    {
      corner: "bottomLeft",
      side: "bottom"
    },
    {
      corner: "topRight",
      side: "right"
    }
  ]
};
function getPathParamsForCorner({
  cornerRadius,
  cornerSmoothing,
  preserveSmoothing,
  roundingAndSmoothingBudget
}) {
  let p = (1 + cornerSmoothing) * cornerRadius;
  if (!preserveSmoothing) {
    const maxCornerSmoothing = roundingAndSmoothingBudget / cornerRadius - 1;
    cornerSmoothing = Math.min(cornerSmoothing, maxCornerSmoothing);
    p = Math.min(p, roundingAndSmoothingBudget);
  }
  const arcMeasure = 90 * (1 - cornerSmoothing);
  const arcSectionLength = Math.sin(toRadians(arcMeasure / 2)) * cornerRadius * Math.sqrt(2);
  const angleAlpha = (90 - arcMeasure) / 2;
  const p3ToP4Distance = cornerRadius * Math.tan(toRadians(angleAlpha / 2));
  const angleBeta = 45 * cornerSmoothing;
  const c = p3ToP4Distance * Math.cos(toRadians(angleBeta));
  const d = c * Math.tan(toRadians(angleBeta));
  let b = (p - arcSectionLength - c - d) / 3;
  let a = 2 * b;
  if (preserveSmoothing && p > roundingAndSmoothingBudget) {
    const p1ToP3MaxDistance = roundingAndSmoothingBudget - d - arcSectionLength - c;
    const minA = p1ToP3MaxDistance / 6;
    const maxB = p1ToP3MaxDistance - minA;
    b = Math.min(b, maxB);
    a = p1ToP3MaxDistance - b;
    p = Math.min(p, roundingAndSmoothingBudget);
  }
  return {
    a,
    b,
    c,
    d,
    p,
    arcSectionLength,
    cornerRadius
  };
}
function getSVGPathFromPathParams({
  width,
  height,
  topLeftPathParams,
  topRightPathParams,
  bottomLeftPathParams,
  bottomRightPathParams
}) {
  return `
    M ${width - topRightPathParams.p} 0
    ${drawTopRightPath(topRightPathParams)}
    L ${width} ${height - bottomRightPathParams.p}
    ${drawBottomRightPath(bottomRightPathParams)}
    L ${bottomLeftPathParams.p} ${height}
    ${drawBottomLeftPath(bottomLeftPathParams)}
    L 0 ${topLeftPathParams.p}
    ${drawTopLeftPath(topLeftPathParams)}
    Z
  `.replace(/[\t\s\n]+/g, " ").trim();
}
function drawTopRightPath({
  cornerRadius,
  a,
  b,
  c,
  d,
  p,
  arcSectionLength
}) {
  if (cornerRadius) {
    return rounded`
    c ${a} 0 ${a + b} 0 ${a + b + c} ${d}
    a ${cornerRadius} ${cornerRadius} 0 0 1 ${arcSectionLength} ${arcSectionLength}
    c ${d} ${c}
        ${d} ${b + c}
        ${d} ${a + b + c}`;
  } else {
    return rounded`l ${p} 0`;
  }
}
function drawBottomRightPath({
  cornerRadius,
  a,
  b,
  c,
  d,
  p,
  arcSectionLength
}) {
  if (cornerRadius) {
    return rounded`
    c 0 ${a}
      0 ${a + b}
      ${-d} ${a + b + c}
    a ${cornerRadius} ${cornerRadius} 0 0 1 -${arcSectionLength} ${arcSectionLength}
    c ${-c} ${d}
      ${-(b + c)} ${d}
      ${-(a + b + c)} ${d}`;
  } else {
    return rounded`l 0 ${p}`;
  }
}
function drawBottomLeftPath({
  cornerRadius,
  a,
  b,
  c,
  d,
  p,
  arcSectionLength
}) {
  if (cornerRadius) {
    return rounded`
    c ${-a} 0
      ${-(a + b)} 0
      ${-(a + b + c)} ${-d}
    a ${cornerRadius} ${cornerRadius} 0 0 1 -${arcSectionLength} -${arcSectionLength}
    c ${-d} ${-c}
      ${-d} ${-(b + c)}
      ${-d} ${-(a + b + c)}`;
  } else {
    return rounded`l ${-p} 0`;
  }
}
function drawTopLeftPath({
  cornerRadius,
  a,
  b,
  c,
  d,
  p,
  arcSectionLength
}) {
  if (cornerRadius) {
    return rounded`
    c 0 ${-a}
      0 ${-(a + b)}
      ${d} ${-(a + b + c)}
    a ${cornerRadius} ${cornerRadius} 0 0 1 ${arcSectionLength} -${arcSectionLength}
    c ${c} ${-d}
      ${b + c} ${-d}
      ${a + b + c} ${-d}`;
  } else {
    return rounded`l 0 ${-p}`;
  }
}
function toRadians(degrees) {
  return degrees * Math.PI / 180;
}
function rounded(strings, ...values) {
  return strings.reduce((acc, str, i) => {
    const value = values[i];
    if (typeof value === "number") {
      return acc + str + value.toFixed(4);
    } else {
      return acc + str + (value ?? "");
    }
  }, "");
}
function getSvgPath({
  cornerRadius = 0,
  topLeftCornerRadius,
  topRightCornerRadius,
  bottomRightCornerRadius,
  bottomLeftCornerRadius,
  cornerSmoothing,
  width,
  height,
  preserveSmoothing = false
}) {
  topLeftCornerRadius = topLeftCornerRadius ?? cornerRadius;
  topRightCornerRadius = topRightCornerRadius ?? cornerRadius;
  bottomLeftCornerRadius = bottomLeftCornerRadius ?? cornerRadius;
  bottomRightCornerRadius = bottomRightCornerRadius ?? cornerRadius;
  if (topLeftCornerRadius === topRightCornerRadius && topRightCornerRadius === bottomRightCornerRadius && bottomRightCornerRadius === bottomLeftCornerRadius && bottomLeftCornerRadius === topLeftCornerRadius) {
    const roundingAndSmoothingBudget = Math.min(width, height) / 2;
    const cornerRadius2 = Math.min(
      topLeftCornerRadius,
      roundingAndSmoothingBudget
    );
    const pathParams = getPathParamsForCorner({
      cornerRadius: cornerRadius2,
      cornerSmoothing,
      preserveSmoothing,
      roundingAndSmoothingBudget
    });
    return getSVGPathFromPathParams({
      width,
      height,
      topLeftPathParams: pathParams,
      topRightPathParams: pathParams,
      bottomLeftPathParams: pathParams,
      bottomRightPathParams: pathParams
    });
  }
  const { topLeft, topRight, bottomLeft, bottomRight } = distributeAndNormalize(
    {
      topLeftCornerRadius,
      topRightCornerRadius,
      bottomRightCornerRadius,
      bottomLeftCornerRadius,
      width,
      height
    }
  );
  return getSVGPathFromPathParams({
    width,
    height,
    topLeftPathParams: getPathParamsForCorner({
      cornerSmoothing,
      preserveSmoothing,
      cornerRadius: topLeft.radius,
      roundingAndSmoothingBudget: topLeft.roundingAndSmoothingBudget
    }),
    topRightPathParams: getPathParamsForCorner({
      cornerSmoothing,
      preserveSmoothing,
      cornerRadius: topRight.radius,
      roundingAndSmoothingBudget: topRight.roundingAndSmoothingBudget
    }),
    bottomRightPathParams: getPathParamsForCorner({
      cornerSmoothing,
      preserveSmoothing,
      cornerRadius: bottomRight.radius,
      roundingAndSmoothingBudget: bottomRight.roundingAndSmoothingBudget
    }),
    bottomLeftPathParams: getPathParamsForCorner({
      cornerSmoothing,
      preserveSmoothing,
      cornerRadius: bottomLeft.radius,
      roundingAndSmoothingBudget: bottomLeft.roundingAndSmoothingBudget
    })
  });
}

// src/corner-smoothing.js
var OPT_OUT_ATTR = "data-no-corner-smoothing";
var EFFECT_LAYER_PATTERN = /^effect-(flotation|popup)-box__/;
var SKIP_TAGS = /* @__PURE__ */ new Set([
  "SVG",
  "PATH",
  "CIRCLE",
  "RECT",
  "LINE",
  "POLYGON",
  "POLYLINE",
  "ELLIPSE",
  "G",
  "DEFS",
  "CLIPPATH",
  "MASK",
  "USE",
  "SYMBOL"
]);
function readCornerSmoothing() {
  const raw = getComputedStyle(document.documentElement).getPropertyValue("--corner-smoothing").trim();
  const parsed = Number.parseFloat(raw);
  return Number.isFinite(parsed) ? Math.min(1, Math.max(0, parsed)) : 0.6;
}
function parseLength(value) {
  if (!value || value === "0" || value === "0px") {
    return 0;
  }
  if (value.endsWith("%")) {
    return null;
  }
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : null;
}
function parseRadii(style) {
  const shorthand = style.borderTopLeftRadius;
  const usesIndividual = style.borderTopRightRadius !== shorthand || style.borderBottomRightRadius !== shorthand || style.borderBottomLeftRadius !== shorthand;
  if (usesIndividual) {
    const topLeft = parseLength(style.borderTopLeftRadius);
    const topRight = parseLength(style.borderTopRightRadius);
    const bottomRight = parseLength(style.borderBottomRightRadius);
    const bottomLeft = parseLength(style.borderBottomLeftRadius);
    if ([topLeft, topRight, bottomRight, bottomLeft].some((value) => value === null)) {
      return null;
    }
    if (topLeft + topRight + bottomRight + bottomLeft <= 0) {
      return null;
    }
    return { topLeft, topRight, bottomRight, bottomLeft };
  }
  const values = style.borderRadius.split(/\s+/).map(parseLength);
  if (values.some((value) => value === null)) {
    return null;
  }
  if (values.every((value) => value <= 0)) {
    return null;
  }
  const [first = 0, second = first, third = first, fourth = second] = values;
  return {
    topLeft: first,
    topRight: second,
    bottomRight: third,
    bottomLeft: fourth
  };
}
function isEffectInternalLayer(element) {
  for (const className of element.classList) {
    if (EFFECT_LAYER_PATTERN.test(className)) {
      return true;
    }
  }
  return false;
}
function isOptedOut(element) {
  return element.hasAttribute(OPT_OUT_ATTR) || Boolean(element.closest(`[${OPT_OUT_ATTR}]`));
}
function shouldSkipStatic(element) {
  if (!(element instanceof HTMLElement)) {
    return true;
  }
  if (isOptedOut(element)) {
    return true;
  }
  if (SKIP_TAGS.has(element.tagName)) {
    return true;
  }
  if (element.closest("svg")) {
    return true;
  }
  if (isEffectInternalLayer(element)) {
    return true;
  }
  const style = getComputedStyle(element);
  if (style.display === "none" || style.visibility === "hidden") {
    return true;
  }
  return parseRadii(style) === null;
}
function hasLayout(element) {
  return element.offsetWidth >= 1 && element.offsetHeight >= 1;
}
function isCandidate(element) {
  return !shouldSkipStatic(element);
}
function canBind(element) {
  return isCandidate(element) && hasLayout(element);
}
function buildSquirclePath(element, radii, cornerSmoothing) {
  const width = element.offsetWidth;
  const height = element.offsetHeight;
  const uniform = radii.topLeft === radii.topRight && radii.topRight === radii.bottomRight && radii.bottomRight === radii.bottomLeft;
  if (uniform) {
    return getSvgPath({
      width,
      height,
      cornerRadius: radii.topLeft,
      cornerSmoothing,
      preserveSmoothing: true
    });
  }
  return getSvgPath({
    width,
    height,
    topLeftCornerRadius: radii.topLeft,
    topRightCornerRadius: radii.topRight,
    bottomRightCornerRadius: radii.bottomRight,
    bottomLeftCornerRadius: radii.bottomLeft,
    cornerSmoothing,
    preserveSmoothing: true
  });
}
function applyCornerSmoothing(element) {
  const cornerSmoothing = readCornerSmoothing();
  if (cornerSmoothing <= 0) {
    clearCornerSmoothing(element);
    return;
  }
  const radii = parseRadii(getComputedStyle(element));
  if (!radii) {
    clearCornerSmoothing(element);
    return;
  }
  const path = buildSquirclePath(element, radii, cornerSmoothing);
  const clipPath = `path('${path}')`;
  element.style.clipPath = clipPath;
  element.style.webkitClipPath = clipPath;
  element.dataset.cornerSmoothingBound = "true";
}
function clearCornerSmoothing(element) {
  if (element.dataset.cornerSmoothingBound !== "true") {
    return;
  }
  element.style.clipPath = "";
  element.style.webkitClipPath = "";
  delete element.dataset.cornerSmoothingBound;
}
function renderCornerSmoothing(element) {
  if (!isCandidate(element)) {
    detachCornerSmoothing(element);
    return;
  }
  if (!hasLayout(element)) {
    watchUntilSized(element);
    return;
  }
  applyCornerSmoothing(element);
}
var CornerSmoothingSurface = class {
  constructor(element) {
    this.element = element;
    this.resizeObserver = new ResizeObserver(() => {
      renderCornerSmoothing(element);
    });
    this.resizeObserver.observe(element);
    renderCornerSmoothing(element);
  }
  destroy() {
    this.resizeObserver.disconnect();
    clearCornerSmoothing(this.element);
    delete this.element.dataset.cornerSmoothingBound;
  }
};
var instances = /* @__PURE__ */ new WeakMap();
var pendingSizeObservers = /* @__PURE__ */ new WeakMap();
var mutationObserver = null;
var initialized = false;
var scanScheduled = false;
var pendingScanRoots = /* @__PURE__ */ new Set();
function cancelPendingWatch(element) {
  const observer = pendingSizeObservers.get(element);
  if (!observer) {
    return;
  }
  observer.disconnect();
  pendingSizeObservers.delete(element);
}
function watchUntilSized(element) {
  if (instances.has(element) || pendingSizeObservers.has(element) || !isCandidate(element)) {
    return;
  }
  const observer = new ResizeObserver(() => {
    if (!isCandidate(element)) {
      cancelPendingWatch(element);
      return;
    }
    if (!hasLayout(element)) {
      return;
    }
    cancelPendingWatch(element);
    bindElement(element);
  });
  observer.observe(element);
  pendingSizeObservers.set(element, observer);
}
function bindElement(element) {
  cancelPendingWatch(element);
  if (instances.has(element)) {
    renderCornerSmoothing(element);
    return instances.get(element);
  }
  const surface = new CornerSmoothingSurface(element);
  instances.set(element, surface);
  return surface;
}
function attachCornerSmoothing(element) {
  if (!(element instanceof HTMLElement)) {
    throw new TypeError("attachCornerSmoothing expects an HTMLElement");
  }
  if (!isCandidate(element)) {
    return null;
  }
  if (!hasLayout(element)) {
    watchUntilSized(element);
    return null;
  }
  return bindElement(element);
}
function detachCornerSmoothing(element) {
  cancelPendingWatch(element);
  const surface = instances.get(element);
  if (!surface) {
    clearCornerSmoothing(element);
    return;
  }
  surface.destroy();
  instances.delete(element);
}
function collectCandidates(root) {
  const elements = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT);
  for (let node = walker.currentNode; node; node = walker.nextNode()) {
    if (node instanceof HTMLElement && isCandidate(node)) {
      elements.push(node);
    }
  }
  return elements;
}
function unbindSubtree(root) {
  if (!(root instanceof HTMLElement)) {
    return;
  }
  for (const element of collectCandidates(root)) {
    detachCornerSmoothing(element);
  }
}
function rescanCornerSmoothing(root = document.body) {
  return scanRoot(root);
}
function scanRoot(root) {
  if (!(root instanceof HTMLElement)) {
    return [];
  }
  const surfaces = [];
  for (const element of collectCandidates(root)) {
    if (canBind(element)) {
      surfaces.push(bindElement(element));
    } else {
      watchUntilSized(element);
    }
  }
  return surfaces;
}
function flushScheduledScans() {
  scanScheduled = false;
  const roots = [...pendingScanRoots];
  pendingScanRoots.clear();
  for (const root of roots) {
    scanRoot(root);
  }
}
function scheduleScan(root = document.body) {
  if (!root) {
    return;
  }
  pendingScanRoots.add(root);
  if (scanScheduled) {
    return;
  }
  scanScheduled = true;
  requestAnimationFrame(() => {
    requestAnimationFrame(flushScheduledScans);
  });
}
function handleMutations(mutations) {
  for (const mutation of mutations) {
    for (const node of mutation.removedNodes) {
      if (node instanceof HTMLElement) {
        unbindSubtree(node);
      }
    }
    for (const node of mutation.addedNodes) {
      if (node instanceof HTMLElement) {
        scheduleScan(node);
      }
    }
    if (mutation.type === "attributes" && mutation.target instanceof HTMLElement) {
      const target = mutation.target;
      if (instances.has(target)) {
        renderCornerSmoothing(target);
      } else if (isCandidate(target)) {
        if (canBind(target)) {
          bindElement(target);
        } else {
          watchUntilSized(target);
        }
      } else {
        detachCornerSmoothing(target);
      }
    }
  }
}
function initCornerSmoothing(options = {}) {
  if (typeof document === "undefined") {
    return [];
  }
  const root = options.root instanceof HTMLElement ? options.root : document.body;
  const surfaces = scanRoot(root);
  scheduleScan(root);
  if (initialized) {
    return surfaces;
  }
  initialized = true;
  if (typeof MutationObserver !== "undefined" && document.body) {
    mutationObserver = new MutationObserver(handleMutations);
    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class", "style"]
    });
  }
  return surfaces;
}
var corner_smoothing_default = {
  attachCornerSmoothing,
  detachCornerSmoothing,
  initCornerSmoothing,
  rescanCornerSmoothing
};
export {
  attachCornerSmoothing,
  corner_smoothing_default as default,
  detachCornerSmoothing,
  initCornerSmoothing,
  rescanCornerSmoothing
};
