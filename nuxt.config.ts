import { resolve } from 'node:path';

const projectRoot = resolve(__dirname);
const websiteRepoRoot = resolve(projectRoot, '../eds-website');
const tokensRoot = resolve(websiteRepoRoot, 'packages/tokens');
const componentsRoot = resolve(websiteRepoRoot, 'packages/components');
const isDevelopment = process.env.NODE_ENV !== 'production';
const baseURL = process.env.NUXT_APP_BASE_URL || '/';

export default defineNuxtConfig({
  srcDir: 'src/',
  vue: {
    compilerOptions: {
      whitespace: 'condense',
    },
  },
  devtools: { enabled: isDevelopment },
  css: ['~/styles/global.css'],
  compatibilityDate: '2026-07-17',
  app: {
    baseURL,
    head: {
      htmlAttrs: {
        lang: 'en-US',
        'data-platform': 'website',
        'data-theme': 'light',
      },
      titleTemplate: '%s — UDun',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ],
      link: [
        {
          rel: 'icon',
          type: 'image/svg+xml',
          href: `${baseURL.endsWith('/') ? baseURL : `${baseURL}/`}favicon.svg`,
        },
      ],
      script: [
        {
          innerHTML:
            "try{document.documentElement.dataset.theme='light'}catch{}",
          tagPosition: 'head',
        },
      ],
    },
  },
  devServer: {
    port: 5178,
    host: '0.0.0.0',
  },
  nitro: {
    prerender: {
      routes: [
        '/',
        '/wallet',
        '/mpc',
        '/solutions',
        '/download',
        '/developers',
        '/help-center',
        '/invite',
      ],
    },
  },
  routeRules: {
    '/products': { redirect: { to: '/wallet', statusCode: 301 } },
    '/about': { redirect: { to: '/', statusCode: 301 } },
  },
  vite: {
    resolve: {
      alias: {
        '@': resolve(projectRoot, 'src'),
        /*
         * Always resolve DS components to prebuilt dist so CSS module hashes match
         * @eds/website-components/style.css (global.css). Re-bundling .vue from source
         * in dev produces new hashes (e.g. _field_i9mi1_*) while index.css stays on
         * _field_ar2ku_* → EgInput loses field/focus/clear layout on /invite.
         */
        '@eds/website-components/style.css': resolve(componentsRoot, 'dist/index.css'),
        '@eds/website-components': resolve(componentsRoot, 'dist/index.js'),
        ...(isDevelopment
          ? {
              '@eds/website-tokens/liquid-glass': resolve(tokensRoot, 'src/liquid-glass.js'),
              '@eds/website-tokens/corner-smoothing': resolve(tokensRoot, 'src/corner-smoothing.js'),
            }
          : {}),
      },
    },
    optimizeDeps: {
      exclude: ['@eds/website-tokens'],
      include: ['@eds/website-components'],
      // Rebuild eds-website components then delete node_modules/.vite if EgButton looks unstyled.
    },
    build: {
      target: 'es2022',
    },
    css: {
      devSourcemap: true,
      modules: {
        // Stable scoped names so SSR-inlined CSS matches prerendered HTML (avoids FOUC on GitHub Pages).
        generateScopedName: '[name]__[local]',
      },
    },
    server: {
      fs: {
        allow: [projectRoot, websiteRepoRoot],
      },
      watch: {
        ignored: ['**/.git/**', '**/node_modules/**', '**/eds-website/packages/tokens/dist/**'],
      },
    },
  },
});
