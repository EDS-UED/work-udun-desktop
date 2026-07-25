<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';

const props = withDefaults(
  defineProps<{
    dotRadius?: number;
    dotSpacing?: number;
    bulgeStrength?: number;
    glowRadius?: number;
    sparkle?: boolean;
    waveAmplitude?: number;
    cursorRadius?: number;
    cursorForce?: number;
    bulgeOnly?: boolean;
    gradientFrom?: string;
    gradientTo?: string;
    glowColor?: string;
  }>(),
  {
    dotRadius: 1.5,
    dotSpacing: 14,
    bulgeStrength: 67,
    glowRadius: 160,
    sparkle: false,
    waveAmplitude: 0,
    cursorRadius: 500,
    cursorForce: 0.1,
    bulgeOnly: false,
    gradientFrom: '#7cff67',
    gradientTo: '#A0FFBC',
    glowColor: '#120F17',
  },
);

const rootRef = ref<HTMLElement | null>(null);
const canvasRef = ref<HTMLCanvasElement | null>(null);

type Rgb = { r: number; g: number; b: number };

function parseHex(hex: string): Rgb {
  const raw = hex.replace('#', '').trim();
  const full =
    raw.length === 3
      ? raw
          .split('')
          .map((c) => c + c)
          .join('')
      : raw.padEnd(6, '0').slice(0, 6);
  return {
    r: Number.parseInt(full.slice(0, 2), 16) || 0,
    g: Number.parseInt(full.slice(2, 4), 16) || 0,
    b: Number.parseInt(full.slice(4, 6), 16) || 0,
  };
}

function mixRgb(a: Rgb, b: Rgb, t: number): string {
  const k = Math.min(1, Math.max(0, t));
  const r = Math.round(a.r + (b.r - a.r) * k);
  const g = Math.round(a.g + (b.g - a.g) * k);
  const bl = Math.round(a.b + (b.b - a.b) * k);
  return `rgb(${r} ${g} ${bl})`;
}

let raf = 0;
let resizeObserver: ResizeObserver | undefined;
let reducedMotion = false;
let width = 0;
let height = 0;
let dpr = 1;

const pointer = { x: -9999, y: -9999, tx: -9999, ty: -9999, active: false };
const fromRgb = { r: 124, g: 255, b: 103 };
const toRgb = { r: 160, g: 255, b: 188 };
const glowRgb = { r: 18, g: 15, b: 23 };

function syncColors() {
  Object.assign(fromRgb, parseHex(props.gradientFrom));
  Object.assign(toRgb, parseHex(props.gradientTo));
  Object.assign(glowRgb, parseHex(props.glowColor));
}

function resize() {
  const root = rootRef.value;
  const canvas = canvasRef.value;
  if (!root || !canvas) return;

  const rect = root.getBoundingClientRect();
  width = Math.max(1, Math.floor(rect.width));
  height = Math.max(1, Math.floor(rect.height));
  dpr = Math.min(window.devicePixelRatio || 1, 2);

  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  const ctx = canvas.getContext('2d');
  if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function onPointerMove(event: PointerEvent) {
  const root = rootRef.value;
  if (!root) return;
  const rect = root.getBoundingClientRect();
  pointer.tx = event.clientX - rect.left;
  pointer.ty = event.clientY - rect.top;
  pointer.active = true;
}

function onPointerLeave() {
  pointer.active = false;
}

function draw(now: number) {
  const canvas = canvasRef.value;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const ease = reducedMotion ? 1 : props.cursorForce;
  pointer.x += (pointer.tx - pointer.x) * ease;
  pointer.y += (pointer.ty - pointer.y) * ease;

  ctx.clearRect(0, 0, width, height);

  const spacing = Math.max(4, props.dotSpacing);
  const cols = Math.ceil(width / spacing) + 1;
  const rows = Math.ceil(height / spacing) + 1;
  const offsetX = (width - (cols - 1) * spacing) / 2;
  const offsetY = (height - (rows - 1) * spacing) / 2;
  const cursorR = Math.max(1, props.cursorRadius);
  const glowR = Math.max(1, props.glowRadius);
  const useWave = !props.bulgeOnly && props.waveAmplitude > 0;
  const useSparkle = !props.bulgeOnly && props.sparkle;
  const t = now * 0.001;

  if (pointer.active || (pointer.x > -1000 && pointer.y > -1000)) {
    const glow = ctx.createRadialGradient(
      pointer.x,
      pointer.y,
      0,
      pointer.x,
      pointer.y,
      glowR,
    );
    glow.addColorStop(
      0,
      `rgba(${glowRgb.r}, ${glowRgb.g}, ${glowRgb.b}, 0.22)`,
    );
    glow.addColorStop(
      0.55,
      `rgba(${glowRgb.r}, ${glowRgb.g}, ${glowRgb.b}, 0.08)`,
    );
    glow.addColorStop(1, `rgba(${glowRgb.r}, ${glowRgb.g}, ${glowRgb.b}, 0)`);
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, width, height);
  }

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      let x = offsetX + col * spacing;
      let y = offsetY + row * spacing;

      if (useWave) {
        y += Math.sin(t * 1.4 + col * 0.35 + row * 0.2) * props.waveAmplitude;
      }

      const dx = x - pointer.x;
      const dy = y - pointer.y;
      const dist = Math.hypot(dx, dy);
      let radius = props.dotRadius;
      let colorT = (col + row) / Math.max(1, cols + rows - 2);

      if (!reducedMotion && dist < cursorR) {
        const falloff = 1 - dist / cursorR;
        const influence = falloff * falloff;
        const push = influence * props.bulgeStrength;
        if (dist > 0.001) {
          x += (dx / dist) * push;
          y += (dy / dist) * push;
        }
        radius = props.dotRadius * (1 + influence * 0.85);
        colorT = Math.min(1, colorT * 0.35 + influence);
      }

      let alpha = 0.55 + colorT * 0.35;
      if (useSparkle) {
        const n =
          Math.sin(t * 7 + col * 12.9898 + row * 78.233) * 0.5 + 0.5;
        alpha *= 0.65 + n * 0.35;
      }

      ctx.beginPath();
      ctx.fillStyle = mixRgb(fromRgb, toRgb, colorT);
      ctx.globalAlpha = alpha;
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.globalAlpha = 1;
}

function loop(now: number) {
  draw(now);
  raf = window.requestAnimationFrame(loop);
}

function start() {
  syncColors();
  resize();
  if (!reducedMotion) {
    pointer.tx = width * 0.5;
    pointer.ty = height * 0.42;
    pointer.x = pointer.tx;
    pointer.y = pointer.ty;
  }
  cancelAnimationFrame(raf);
  raf = window.requestAnimationFrame(loop);
}

onMounted(() => {
  reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  syncColors();
  resize();
  resizeObserver = new ResizeObserver(() => resize());
  if (rootRef.value) resizeObserver.observe(rootRef.value);

  window.addEventListener('pointermove', onPointerMove, { passive: true });
  window.addEventListener('pointerleave', onPointerLeave);
  window.addEventListener('blur', onPointerLeave);

  start();
});

onBeforeUnmount(() => {
  cancelAnimationFrame(raf);
  resizeObserver?.disconnect();
  window.removeEventListener('pointermove', onPointerMove);
  window.removeEventListener('pointerleave', onPointerLeave);
  window.removeEventListener('blur', onPointerLeave);
});

watch(
  () => [
    props.gradientFrom,
    props.gradientTo,
    props.glowColor,
    props.dotRadius,
    props.dotSpacing,
    props.bulgeStrength,
    props.glowRadius,
    props.sparkle,
    props.waveAmplitude,
    props.cursorRadius,
    props.cursorForce,
    props.bulgeOnly,
  ],
  () => {
    syncColors();
  },
);
</script>

<template>
  <div ref="rootRef" class="dotField" aria-hidden="true">
    <canvas ref="canvasRef" />
  </div>
</template>

<style scoped>
.dotField {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  pointer-events: none;
}

.dotField canvas {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
