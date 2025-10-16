// composables/useClipboard.js
import { ref } from "vue";

/**
 * @typedef {Object} ClipboardOptions
 * @property {number} [copiedDuration=2000] - Durasi status 'copied' dalam milliseconds sebelum reset
 * @property {boolean} [legacy=true] - Enable fallback ke execCommand untuk browser lama
 */

/**
 * @callback CopyFunction
 * @param {string} text - Text yang akan di-copy ke clipboard
 * @returns {Promise<boolean>} Promise yang resolve true jika berhasil, false jika gagal
 */

/**
 * @typedef {Object} ClipboardReturn
 * @property {import('vue').Ref<boolean>} copied - Reactive state indicating apakah baru saja copy (auto-reset setelah duration)
 * @property {import('vue').Ref<string>} copiedText - Reactive text yang terakhir berhasil di-copy
 * @property {import('vue').Ref<boolean>} isSupported - Apakah browser support Clipboard API
 * @property {CopyFunction} copy - Function untuk copy text ke clipboard
 */

/**
 * Reactive composable untuk copy text ke clipboard dengan fallback support
 *
 * @example
 * // Basic usage
 * const { copy, copied } = useClipboard();
 *
 * const handleCopy = async () => {
 *   const success = await copy('Hello World');
 *   if (success) {
 *     console.log('Copied!');
 *   }
 * };
 *
 * @example
 * // Dengan custom duration
 * const { copy, copied, copiedText } = useClipboard({ copiedDuration: 3000 });
 *
 * // Di template
 * // <button @click="copy('Text to copy')">
 * //   {{ copied ? 'Copied!' : 'Copy' }}
 * // </button>
 *
 * @example
 * // Tanpa fallback (hanya modern browsers)
 * const { copy, isSupported } = useClipboard({ legacy: false });
 *
 * if (!isSupported) {
 *   console.warn('Clipboard API not supported');
 * }
 *
 * @param {ClipboardOptions} [options={}] - Konfigurasi optional untuk clipboard
 * @returns {ClipboardReturn} Object dengan reactive state dan copy function
 */
export function useClipboard(options = {}) {
  const { copiedDuration = 2000, legacy = true } = options;

  const copied = ref(false);
  const copiedText = ref("");
  const isSupported = ref(Boolean(navigator?.clipboard));

  let timeoutId = null;

  /**
   * Copy text menggunakan modern Clipboard API
   * @private
   */
  const copyWithClipboardAPI = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.error("Clipboard API failed:", err);
      return false;
    }
  };

  /**
   * Copy text menggunakan legacy execCommand (fallback)
   * @private
   */
  const copyWithExecCommand = (text) => {
    try {
      // Create temporary textarea
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.top = "0";
      textarea.style.left = "0";
      textarea.style.opacity = "0";
      textarea.style.pointerEvents = "none";

      document.body.appendChild(textarea);

      // Select and copy
      textarea.focus();
      textarea.select();

      const successful = document.execCommand("copy");
      document.body.removeChild(textarea);

      return successful;
    } catch (err) {
      console.error("execCommand failed:", err);
      return false;
    }
  };

  /**
   * Copy text ke clipboard dengan auto fallback
   * @param {string} text - Text yang akan di-copy
   * @returns {Promise<boolean>} True jika berhasil, false jika gagal
   */
  const copy = async (text) => {
    if (!text || typeof text !== "string") {
      console.warn("useClipboard: text must be a non-empty string");
      return false;
    }

    let success = false;

    // Try modern Clipboard API first
    if (isSupported.value) {
      success = await copyWithClipboardAPI(text);
    }

    // Fallback to execCommand if API failed or not supported
    if (!success && legacy) {
      success = copyWithExecCommand(text);
    }

    // Update state if successful
    if (success) {
      copied.value = true;
      copiedText.value = text;

      // Clear existing timeout
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      // Auto-reset copied state after duration
      timeoutId = setTimeout(() => {
        copied.value = false;
        timeoutId = null;
      }, copiedDuration);
    }

    return success;
  };

  return {
    copied,
    copiedText,
    isSupported,
    copy,
  };
}
