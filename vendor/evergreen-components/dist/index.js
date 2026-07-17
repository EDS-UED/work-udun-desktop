import { defineComponent as i, computed as h, openBlock as l, createElementBlock as y, normalizeClass as d, unref as o, createElementVNode as b, createBlock as z, resolveDynamicComponent as x, withCtx as M, renderSlot as p, ref as k, onMounted as w } from "vue";
const j = "_sm_bzif7_1", T = "_md_bzif7_6", $ = "_lg_bzif7_11", E = "_icon_bzif7_16", u = {
  sm: j,
  md: T,
  lg: $,
  icon: E
}, f = {
  "arrow-right": "M5 12h14m0 0-4-4m4 4-4 4",
  check: "M5 13l4 4L19 7",
  close: "M6 6l12 12M18 6 6 18",
  menu: "M4 7h16M4 12h16M4 17h16",
  search: "M11 5a6 6 0 1 0 0 12 6 6 0 0 0 0-12zm10 14-4.3-4.3",
  sun: "M12 4V2m0 18v-2M4.93 4.93 3.52 3.52m16.96 16.96-1.41-1.41M4 12H2m20 0h-2M4.93 19.07 3.52 20.48m16.96-16.96-1.41 1.41M12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8z",
  moon: "M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
}, Z = Object.keys(f), B = ["aria-label", "aria-hidden"], C = ["d"], ee = /* @__PURE__ */ i({
  __name: "Icon",
  props: {
    name: {},
    size: { default: "md" },
    label: {}
  },
  setup(e) {
    const t = e, n = h(() => f[t.name]);
    return (s, v) => (l(), y("svg", {
      class: d([o(u).icon, o(u)[e.size]]),
      viewBox: "0 0 24 24",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      "aria-label": e.label || e.name,
      "aria-hidden": e.label ? void 0 : !0,
      role: "img"
    }, [
      b("path", {
        d: n.value,
        stroke: "currentColor",
        "stroke-width": "2",
        "stroke-linecap": "round",
        "stroke-linejoin": "round"
      }, null, 8, C)
    ], 10, B));
  }
}), A = "_typography_xevjz_1", I = "_muted_xevjz_7", P = "_display_xevjz_11", S = "_h1_xevjz_17", N = "_h2_xevjz_23", O = "_h3_xevjz_29", V = "_body_xevjz_34", D = "_caption_xevjz_44", G = "_code_xevjz_49", c = {
  typography: A,
  muted: I,
  display: P,
  h1: S,
  h2: N,
  h3: O,
  body: V,
  "body-sm": "_body-sm_xevjz_39",
  caption: D,
  code: G
}, te = /* @__PURE__ */ i({
  __name: "Typography",
  props: {
    variant: { default: "body" },
    as: { default: void 0 },
    muted: { type: Boolean, default: !1 }
  },
  setup(e) {
    const t = e, n = h(() => t.as ? t.as : {
      display: "h1",
      h1: "h1",
      h2: "h2",
      h3: "h3",
      body: "p",
      "body-sm": "p",
      caption: "span",
      code: "code"
    }[t.variant]);
    return (s, v) => (l(), z(x(n.value), {
      class: d([o(c).typography, o(c)[e.variant], e.muted && o(c).muted])
    }, {
      default: M(() => [
        p(s.$slots, "default")
      ]),
      _: 3
    }, 8, ["class"]));
  }
}), H = "_button_1oy32_1", K = "_primary_1oy32_24", L = "_secondary_1oy32_33", R = "_ghost_1oy32_43", Y = "_sm_1oy32_52", q = "_md_1oy32_57", F = "_lg_1oy32_62", r = {
  button: H,
  primary: K,
  secondary: L,
  ghost: R,
  sm: Y,
  md: q,
  lg: F
}, J = ["disabled", "type"], oe = /* @__PURE__ */ i({
  __name: "Button",
  props: {
    variant: { default: "primary" },
    size: { default: "md" },
    disabled: { type: Boolean, default: !1 },
    type: { default: "button" }
  },
  setup(e) {
    return (t, n) => (l(), y("button", {
      class: d([o(r).button, o(r)[e.variant], o(r)[e.size]]),
      disabled: e.disabled,
      type: e.type
    }, [
      p(t.$slots, "default")
    ], 10, J));
  }
}), g = "evergreen-theme";
function Q() {
  if (typeof window > "u") return "light";
  const e = localStorage.getItem(g);
  return e === "light" || e === "dark" ? e : window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}
function m(e, t = document.documentElement) {
  t.setAttribute("data-theme", e), localStorage.setItem(g, e);
}
function U(e) {
  const t = e === "light" ? "dark" : "light";
  return m(t), t;
}
const a = k("light");
let _ = !1;
function W(e) {
  if (_ || typeof window > "u")
    return;
  const t = document.documentElement.getAttribute("data-theme");
  t === "light" || t === "dark" ? a.value = t : (a.value = e ?? Q(), m(a.value)), _ = !0;
}
function ne() {
  w(() => {
    W();
  });
  function e(n) {
    a.value = n, m(n);
  }
  function t() {
    a.value = U(a.value);
  }
  return { theme: a, setTheme: e, toggleTheme: t };
}
export {
  oe as EgButton,
  ee as EgIcon,
  te as EgTypography,
  m as applyTheme,
  Q as getPreferredTheme,
  Z as iconNames,
  W as initThemeProvider,
  U as toggleTheme,
  ne as useThemeProvider
};
