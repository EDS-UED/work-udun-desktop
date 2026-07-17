import { joinURL } from 'ufo';

/** Prefix a `public/` asset path with the app baseURL (required on GitHub Pages). */
export function publicAsset(path: string): string {
  const base = useRuntimeConfig().app.baseURL || '/';
  return joinURL(base, path);
}
