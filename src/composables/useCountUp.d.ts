import { Ref, ComputedRef } from "vue";

export interface UseCountUpOptions {
  /**
   * Nilai awal (default: 0)
   */
  startValue?: number;
  /**
   * Durasi animasi dalam milidetik (default: 2000)
   */
  duration?: number;
  /**
   * Jumlah angka desimal (default: 0)
   */
  decimalPlaces?: number;
  /**
   * Separator ribuan (default: "")
   * @example ","
   */
  separator?: string;
  /**
   * Separator desimal (default: ".")
   */
  decimal?: string;
  /**
   * Prefix untuk ditampilkan sebelum angka (default: "")
   * @example "$", "Rp "
   */
  prefix?: string;
  /**
   * Suffix untuk ditampilkan setelah angka (default: "")
   * @example " USD", "%"
   */
  suffix?: string;
  /**
   * Gunakan easing function (default: true)
   */
  useEasing?: boolean;
  /**
   * Custom easing function
   * @param t - Time elapsed
   * @param b - Start value
   * @param c - Change in value
   * @param d - Duration
   */
  easingFn?: (t: number, b: number, c: number, d: number) => number;
  /**
   * Callback saat animasi selesai
   */
  onComplete?: () => void;
}

export interface UseCountUpReturn {
  /**
   * Nilai yang sudah diformat sebagai string (untuk ditampilkan)
   */
  displayValue: Ref<string>;
  /**
   * Nilai numerik saat ini
   */
  currentValue: Ref<number>;
  /**
   * Mulai animasi dari awal
   */
  start: () => void;
  /**
   * Pause animasi
   */
  pause: () => void;
  /**
   * Lanjutkan animasi yang di-pause
   */
  resume: () => void;
  /**
   * Reset ke nilai awal
   */
  reset: () => void;
  /**
   * Update ke nilai akhir baru dengan animasi
   */
  update: (newEndValue: number) => void;
}

/**
 * Composable untuk animasi count up dari nilai awal ke nilai akhir.
 * Mirip dengan library countup.js, menganimasikan angka dengan easing function.
 *
 * @param endValue - Nilai akhir yang ingin dicapai
 * @param options - Opsi konfigurasi
 * @returns Object yang berisi properti dan method count up
 *
 * @example
 * // Basic usage
 * const { displayValue, start } = useCountUp(1000);
 * start();
 *
 * @example
 * // Dengan options lengkap
 * const counter = useCountUp(5000, {
 *   startValue: 0,
 *   duration: 3000,
 *   decimalPlaces: 2,
 *   separator: ',',
 *   prefix: '$',
 *   onComplete: () => console.log('Selesai!')
 * });
 * counter.start();
 */
export declare function useCountUp(
  endValue: number,
  options?: UseCountUpOptions
): UseCountUpReturn;
