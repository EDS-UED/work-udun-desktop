export type ThemeMode = 'light' | 'dark';

const STORAGE_KEY = 'udun-theme';

export function getPreferredTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'light';

  const stored = localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
  if (stored === 'light' || stored === 'dark') return stored;

  return 'light';
}

export function applyTheme(theme: ThemeMode, target: HTMLElement = document.documentElement) {
  target.setAttribute('data-theme', theme);
  localStorage.setItem(STORAGE_KEY, theme);
}

/** 只改 `data-theme`，不写入 localStorage（用于邀请页等临时浅色画布） */
export function applyThemeAttribute(theme: ThemeMode, target: HTMLElement = document.documentElement) {
  target.setAttribute('data-theme', theme);
}

export function toggleTheme(current: ThemeMode): ThemeMode {
  const next = current === 'light' ? 'dark' : 'light';
  applyTheme(next);
  return next;
}
