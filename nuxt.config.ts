import { resolve } from 'node:path';

const projectRoot = resolve(__dirname);
const websiteRepoRoot = resolve(projectRoot, '../eds-website');
const tokensRoot = resolve(websiteRepoRoot, 'packages/tokens');
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
        generateScopedName: isDevelopment ? '[name]__[local]' : '[name]__[local]___[hash:base64:5]',
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
