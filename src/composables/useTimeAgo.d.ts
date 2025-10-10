import { ComputedRef } from "vue";

/**
 * Opsi konfigurasi untuk useTimeAgo.
 */
export interface UseTimeAgoOptions {
  /**
   * Locale bahasa, misalnya 'id', 'en', 'ms', dll.
   * Default: 'id'
   */
  locale?: string;
}

/**
 * Nilai yang dikembalikan oleh useTimeAgo.
 */
export interface UseTimeAgoReturn {
  /**
   * Teks reaktif berisi hasil format waktu relatif, contoh: "3 jam lalu"
   */
  text: ComputedRef<string>;
}

/**
 * Composable reaktif untuk menampilkan teks "time ago" multi-bahasa.
 * @param date - Waktu target (Date, string, atau timestamp)
 * @param locale - Kode bahasa, default 'id'
 */
export function useTimeAgo(
  date: Date | string | number,
  locale?: string
): UseTimeAgoReturn;
