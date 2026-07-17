import { ref } from 'vue';
import { getPreferredTheme, toggleTheme, type ThemeMode } from './useTheme';

const theme = ref<ThemeMode>(getPreferredTheme());

export function useTheme() {
  function toggle() {
    theme.value = toggleTheme(theme.value);
  }

  return {
    theme,
    toggle,
  };
}
