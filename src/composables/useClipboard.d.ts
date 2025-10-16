import { Ref } from 'vue';

/**
 * Konfigurasi options untuk useClipboard composable
 */
export interface ClipboardOptions {
  /**
   * Durasi status 'copied' dalam milliseconds sebelum reset
   * @default 2000
   */
  copiedDuration?: number;

  /**
   * Enable fallback ke execCommand untuk browser lama
   * @default true
   */
  legacy?: boolean;
}

/**
 * Return type dari useClipboard composable
 */
export interface ClipboardReturn {
  /**
   * Reactive state indicating apakah baru saja copy (auto-reset setelah duration)
   */
  copied: Ref<boolean>;

  /**
   * Reactive text yang terakhir berhasil di-copy
   */
  copiedText: Ref<string>;

  /**
   * Apakah browser support Clipboard API
   */
  isSupported: Ref<boolean>;

  /**
   * Function untuk copy text ke clipboard
   * @param text - Text yang akan di-copy ke clipboard
   * @returns Promise yang resolve true jika berhasil, false jika gagal
   */
  copy: (text: string) => Promise<boolean>;
}

/**
 * Reactive composable untuk copy text ke clipboard dengan fallback support
 *
 * @example
 * ```typescript
 * // Basic usage
 * const { copy, copied } = useClipboard();
 *
 * const handleCopy = async () => {
 *   const success = await copy('Hello World');
 *   if (success) {
 *     console.log('Copied!');
 *   }
 * };
 * ```
 *
 * @example
 * ```typescript
 * // Dengan custom duration
 * const { copy, copied, copiedText } = useClipboard({ copiedDuration: 3000 });
 *
 * // Di template
 * // <button @click="copy('Text to copy')">
 * //   {{ copied ? 'Copied!' : 'Copy' }}
 * // </button>
 * ```
 *
 * @example
 * ```typescript
 * // Tanpa fallback (hanya modern browsers)
 * const { copy, isSupported } = useClipboard({ legacy: false });
 *
 * if (!isSupported) {
 *   console.warn('Clipboard API not supported');
 * }
 * ```
 *
 * @param options - Konfigurasi optional untuk clipboard
 * @returns Object dengan reactive state dan copy function
 */
export declare function useClipboard(options?: ClipboardOptions): ClipboardReturn;
