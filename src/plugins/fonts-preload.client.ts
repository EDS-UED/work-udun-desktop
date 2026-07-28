import regular from '~/assets/fonts/EDSText-Regular.ttf?url';
import medium from '~/assets/fonts/EDSText-Medium.ttf?url';

/** Preload primary EDS Text weights (typography spec: 400 / 500). */
export default defineNuxtPlugin(() => {
  useHead({
    link: [
      {
        rel: 'preload',
        href: regular,
        as: 'font',
        type: 'font/ttf',
        crossorigin: 'anonymous',
      },
      {
        rel: 'preload',
        href: medium,
        as: 'font',
        type: 'font/ttf',
        crossorigin: 'anonymous',
      },
    ],
  });
});
