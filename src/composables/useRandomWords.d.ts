import { Ref } from "vue";

export interface WordItem {
  /**
   * Teks yang akan ditampilkan
   */
  text: string;
  /**
   * Kategori untuk pengelompokan/filtering
   */
  category?: string;
  /**
   * Metadata tambahan (optional)
   */
  [key: string]: any;
}

export interface UseRandomWordsOptions {
  /**
   * Filter berdasarkan kategori tertentu
   */
  category?: string;
}

export interface UseRandomWordsReturn {
  /**
   * Kata/kalimat yang terpilih secara random
   * Bisa langsung digunakan di template: {{ randomWord }}
   */
  randomWord: Ref<string>;
  /**
   * Data lengkap dari item yang terpilih (jika menggunakan WordItem)
   */
  randomItem: Ref<WordItem | string | null>;
  /**
   * Fungsi untuk refresh/pilih kata random yang baru
   */
  refresh: () => void;
  /**
   * Array kata yang sedang digunakan (setelah filtering)
   */
  filteredWords: Ref<Array<WordItem | string>>;
}

/**
 * Composable untuk menampilkan kata/kalimat secara random dari array.
 * Mendukung filtering berdasarkan kategori.
 *
 * @param words - Array kata/kalimat (bisa string atau object dengan property text dan category)
 * @param options - Opsi konfigurasi (optional)
 * @returns Object yang berisi kata random dan fungsi untuk refresh
 *
 * @example
 * // Penggunaan sederhana dengan array string
 * const { randomWord } = useRandomWords(['Hello', 'Hi', 'Hey']);
 * // Di template: {{ randomWord }}
 *
 * @example
 * // Dengan object dan kategori
 * const words = [
 *   { text: 'Halo, selamat pagi!', category: 'morning' },
 *   { text: 'Selamat siang!', category: 'afternoon' },
 *   { text: 'Halo, selamat malam!', category: 'evening' }
 * ];
 * const { randomWord } = useRandomWords(words, { category: 'morning' });
 *
 * @example
 * // Refresh manual
 * const { randomWord, refresh } = useRandomWords(['Kata 1', 'Kata 2', 'Kata 3']);
 * // Panggil refresh() untuk ganti kata random
 *
 * @example
 * // Akses data lengkap
 * const { randomWord, randomItem } = useRandomWords([
 *   { text: 'Pagi', category: 'morning', emoji: '🌅' },
 *   { text: 'Siang', category: 'afternoon', emoji: '☀️' }
 * ]);
 * // randomWord.value -> teks saja
 * // randomItem.value -> object lengkap dengan emoji, dll
 */
export declare function useRandomWords(
  words: Array<string | WordItem>,
  options?: UseRandomWordsOptions
): UseRandomWordsReturn;
