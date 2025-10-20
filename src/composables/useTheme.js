// composables/useTheme.js
import { ref } from "vue";

/**
 * @typedef {Object} ThemeOptions
 * @property {string} [storageKey='theme'] - Key untuk menyimpan preferensi theme di localStorage
 * @property {string} [attribute='class'] - HTML attribute untuk apply theme ('class' atau 'data-theme')
 * @property {string} [darkValue='dark'] - Value untuk dark mode (default: 'dark')
 * @property {string} [lightValue='light'] - Value untuk light mode (default: 'light')
 */

/**
 * @typedef {Object} ThemeReturn
 * @property {import('vue').Ref<boolean>} isDark - Reactive state indicating apakah dark mode aktif
 * @property {Function} initTheme - Function untuk initialize theme dari localStorage atau system preference
 * @property {Function} toggleTheme - Function untuk toggle antara light dan dark mode
 * @property {Function} setTheme - Function untuk set theme secara manual ('light' atau 'dark')
 * @property {Function} watchSystemTheme - Function untuk watch perubahan system theme preference
 */

/**
 * Reactive composable untuk dark/light theme management dengan localStorage persistence
 *
 * @example
 * // Basic usage
 * import { useTheme } from 'vue3-utils';
 *
 * const { isDark, initTheme, toggleTheme, watchSystemTheme } = useTheme();
 *
 * // Initialize di onMounted
 * onMounted(() => {
 *   initTheme();
 *   watchSystemTheme();
 * });
 *
 * // Toggle theme
 * <button @click="toggleTheme">
 *   {{ isDark ? '☀️ Light' : '🌙 Dark' }}
 * </button>
 *
 * @example
 * // Dengan custom options
 * const { isDark, setTheme } = useTheme({
 *   storageKey: 'app-theme',
 *   attribute: 'data-theme',
 *   darkValue: 'dark',
 *   lightValue: 'light'
 * });
 *
 * // Set theme manually
 * setTheme('dark');
 *
 * @example
 * // Dengan Tailwind CSS (menggunakan class strategy)
 * // Di CSS tambahkan:
 * // @custom-variant dark (&:where(.dark, .dark *));
 *
 * const { isDark, initTheme, toggleTheme } = useTheme();
 *
 * onMounted(() => {
 *   initTheme(); // Otomatis detect system preference atau load dari localStorage
 *   watchSystemTheme(); // Watch perubahan system theme
 * });
 *
 * @param {ThemeOptions} [options={}] - Konfigurasi optional untuk theme
 * @returns {ThemeReturn} Object dengan reactive state dan theme functions
 */
export function useTheme(options = {}) {
  const {
    storageKey = "theme",
    attribute = "class",
    darkValue = "dark",
    lightValue = "light",
  } = options;

  // Check if Tailwind CSS is installed (optional check, just warning)
  const checkTailwindInstalled = () => {
    // Skip check in production or if document not ready
    if (typeof document === 'undefined') return true;

    try {
      // Check for Tailwind v4 with @tailwindcss/vite or any Tailwind installation
      const hasTailwindStyles =
        // Check for Tailwind v4 vite plugin
        document.querySelector('style[data-vite-dev-id*="style.css"]') ||
        // Check for any style tag with tailwind content
        (document.querySelectorAll &&
         Array.from(document.querySelectorAll('style') || []).some(el =>
          el.textContent?.includes('@tailwind') ||
          el.textContent?.includes('tailwindcss') ||
          el.textContent?.includes('@custom-variant')
        )) ||
        // Check for link to tailwind css
        document.querySelector('link[href*="tailwind"]');

      if (!hasTailwindStyles) {
        console.warn(
          '[useTheme] Tailwind CSS not detected. This composable works best with Tailwind CSS v4.\n' +
          'If you have Tailwind installed, you can ignore this warning.'
        );
        // Don't return false, just warn
      }
    } catch (error) {
      // Silently ignore errors in Tailwind detection
    }
    return true;
  };

  // Run check (but don't block execution)
  checkTailwindInstalled();

  // Always continue with theme logic
  const isDark = ref(false);

  /**
   * Apply theme ke document element
   * @private
   */
  const applyTheme = () => {
    const root = document.documentElement;
    const value = isDark.value ? darkValue : lightValue;

    if (attribute === "class") {
      if (isDark.value) {
        root.classList.add(darkValue);
        root.classList.remove(lightValue);
      } else {
        root.classList.add(lightValue);
        root.classList.remove(darkValue);
      }
    } else {
      root.setAttribute(attribute, value);
    }
  };

  /**
   * Initialize theme dari localStorage atau system preference
   */
  const initTheme = () => {
    // 1. Cek localStorage dulu (jika user pernah set manual)
    const savedTheme = localStorage.getItem(storageKey);

    if (savedTheme) {
      isDark.value = savedTheme === darkValue;
    } else {
      // 2. Ambil preferensi sistem user
      isDark.value = window.matchMedia("(prefers-color-scheme: dark)").matches;
    }

    // 3. Apply theme ke document
    applyTheme();
  };

  /**
   * Toggle antara light dan dark mode
   */
  const toggleTheme = () => {
    isDark.value = !isDark.value;

    // Simpan preferensi user
    localStorage.setItem(storageKey, isDark.value ? darkValue : lightValue);

    // Apply theme
    applyTheme();
  };

  /**
   * Set theme secara manual
   * @param {'light' | 'dark'} theme - Theme yang akan di-set
   */
  const setTheme = (theme) => {
    isDark.value = theme === darkValue;

    // Simpan preferensi user
    localStorage.setItem(storageKey, theme);

    // Apply theme
    applyTheme();
  };

  /**
   * Watch perubahan sistem theme (jika user ganti theme OS saat app berjalan)
   */
  const watchSystemTheme = () => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    mediaQuery.addEventListener("change", (e) => {
      // Hanya update jika user belum set manual preference
      if (!localStorage.getItem(storageKey)) {
        isDark.value = e.matches;
        applyTheme();
      }
    });
  };

  return {
    isDark,
    initTheme,
    toggleTheme,
    setTheme,
    watchSystemTheme,
  };
}
