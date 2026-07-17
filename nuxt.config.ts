import { resolve } from 'node:path';

const projectRoot = resolve(__dirname);
const tokensRoot = resolve(projectRoot, 'vendor/evergreen-tokens');
const isDevelopment = process.env.NODE_ENV !== 'production';
const baseURL = process.env.NUXT_APP_BASE_URL || '/';

export default defineNuxtConfig({
  srcDir: 'src/',
  devtools: { enabled: isDevelopment },
  css: ['~/styles/global.css'],
  compatibilityDate: '2026-07-17',
  app: {
    baseURL,
    head: {
      htmlAttrs: {
        lang: 'zh-CN',
        'data-platform': 'website',
        'data-theme': 'light',
      },
      titleTemplate: '%s — UDun',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ],
      link: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
      script: [
        {
          innerHTML:
            "try{const t=localStorage.getItem('udun-theme');if(t==='dark'||t==='light')document.documentElement.dataset.theme=t}catch{}",
          tagPosition: 'head',
        },
      ],
    },
  },
  devServer: {
    port: 5177,
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
              '@evergreen/tokens/liquid-glass': resolve(tokensRoot, 'src/liquid-glass.js'),
              '@evergreen/tokens/corner-smoothing': resolve(tokensRoot, 'src/corner-smoothing.js'),
            }
          : {}),
      },
    },
    optimizeDeps: {
      exclude: ['@evergreen/tokens'],
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
        allow: [projectRoot],
      },
      watch: {
        ignored: ['**/.git/**', '**/node_modules/**', '**/vendor/**/dist/**'],
      },
    },
  },
});
