import { Ref } from "vue";

export interface UseTypewriterOptions {
  /**
   * Kecepatan mengetik dalam milidetik per karakter (default: 100)
   */
  typeSpeed?: number;
  /**
   * Kecepatan menghapus dalam milidetik per karakter (default: 50)
   */
  deleteSpeed?: number;
  /**
   * Delay sebelum mulai menghapus dalam milidetik (default: 2000)
   */
  delayBeforeDelete?: number;
  /**
   * Delay sebelum mengetik teks berikutnya dalam milidetik (default: 500)
   */
  delayBeforeType?: number;
  /**
   * Loop terus menerus melalui array (default: true)
   */
  loop?: boolean;
  /**
   * Autostart animasi saat composable di-mount (default: true)
   */
  autoStart?: boolean;
  /**
   * Tampilkan cursor berkedip (default: true)
   */
  showCursor?: boolean;
  /**
   * Karakter cursor (default: "|")
   */
  cursorChar?: string;
  /**
   * Callback saat selesai mengetik satu teks
   */
  onTypeComplete?: (text: string, index: number) => void;
  /**
   * Callback saat selesai menghapus satu teks
   */
  onDeleteComplete?: (index: number) => void;
  /**
   * Callback saat loop selesai (jika loop: false)
   */
  onLoopComplete?: () => void;
}

export interface UseTypewriterReturn {
  /**
   * Teks yang sedang ditampilkan
   */
  displayText: Ref<string>;
  /**
   * Teks lengkap dengan cursor (jika showCursor: true)
   */
  displayTextWithCursor: Ref<string>;
  /**
   * Index teks yang sedang aktif dari array
   */
  currentIndex: Ref<number>;
  /**
   * Status apakah animasi sedang berjalan
   */
  isTyping: Ref<boolean>;
  /**
   * Status apakah sedang menghapus
   */
  isDeleting: Ref<boolean>;
  /**
   * Status apakah animasi sedang di-pause
   */
  isPaused: Ref<boolean>;
  /**
   * Mulai atau restart animasi
   */
  start: () => void;
  /**
   * Pause animasi
   */
  pause: () => void;
  /**
   * Resume animasi yang di-pause
   */
  resume: () => void;
  /**
   * Stop animasi dan reset
   */
  stop: () => void;
  /**
   * Skip ke teks berikutnya
   */
  next: () => void;
  /**
   * Skip ke teks sebelumnya
   */
  prev: () => void;
  /**
   * Update array teks
   */
  updateTexts: (newTexts: string[]) => void;
}

/**
 * Composable untuk membuat efek typewriter/typing animation.
 * Mendukung array teks yang akan ditampilkan secara berurutan dengan efek mengetik.
 *
 * @param texts - Array string yang akan ditampilkan dengan efek typewriter
 * @param options - Opsi konfigurasi
 * @returns Object yang berisi properti dan method typewriter
 *
 * @example
 * // Basic usage
 * const { displayTextWithCursor } = useTypewriter([
 *   'Hello World',
 *   'Vue 3 is awesome',
 *   'TypeScript is great'
 * ]);
 *
 * @example
 * // Dengan options
 * const typewriter = useTypewriter(
 *   ['First text', 'Second text', 'Third text'],
 *   {
 *     typeSpeed: 80,
 *     deleteSpeed: 40,
 *     delayBeforeDelete: 3000,
 *     loop: true,
 *     showCursor: true,
 *     cursorChar: '_',
 *     onTypeComplete: (text, index) => {
 *       console.log(`Selesai mengetik: ${text} (index: ${index})`);
 *     }
 *   }
 * );
 *
 * @example
 * // Manual control
 * const typewriter = useTypewriter(
 *   ['Text 1', 'Text 2'],
 *   { autoStart: false }
 * );
 * typewriter.start(); // Mulai manual
 * typewriter.pause(); // Pause
 * typewriter.resume(); // Resume
 * typewriter.next(); // Skip ke teks berikutnya
 */
export declare function useTypewriter(
  texts: string[],
  options?: UseTypewriterOptions
): UseTypewriterReturn;
