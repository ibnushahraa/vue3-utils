import { Ref } from "vue";

export interface ThemeOptions {
  /**
   * Key untuk menyimpan preferensi theme di localStorage
   * @default 'theme'
   */
  storageKey?: string;

  /**
   * HTML attribute untuk apply theme
   * @default 'class'
   */
  attribute?: "class" | string;

  /**
   * Value untuk dark mode
   * @default 'dark'
   */
  darkValue?: string;

  /**
   * Value untuk light mode
   * @default 'light'
   */
  lightValue?: string;
}

export interface ThemeReturn {
  /**
   * Reactive state indicating apakah dark mode aktif
   */
  isDark: Ref<boolean>;

  /**
   * Initialize theme dari localStorage atau system preference
   */
  initTheme: () => void;

  /**
   * Toggle antara light dan dark mode
   */
  toggleTheme: () => void;

  /**
   * Set theme secara manual
   * @param theme - 'light' atau 'dark'
   */
  setTheme: (theme: "light" | "dark") => void;

  /**
   * Watch perubahan system theme preference
   */
  watchSystemTheme: () => void;
}

/**
 * Reactive composable untuk dark/light theme management dengan localStorage persistence
 *
 * @example
 * ```ts
 * import { useTheme } from 'vue3-utils';
 *
 * const { isDark, initTheme, toggleTheme, watchSystemTheme } = useTheme();
 *
 * onMounted(() => {
 *   initTheme();
 *   watchSystemTheme();
 * });
 * ```
 *
 * @param options - Konfigurasi optional untuk theme
 * @returns Object dengan reactive state dan theme functions
 */
export declare function useTheme(options?: ThemeOptions): ThemeReturn;
