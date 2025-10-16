export type TimeUnit = 'seconds' | 'minutes' | 'hours' | 'days' | 'months' | 'years';

export interface DateTimeAPI {
  /**
   * Format tanggal sesuai pattern
   * @param fmt - Pattern format (default: 'DD MMMM YYYY HH:mm:ss')
   * @returns String tanggal yang sudah diformat
   */
  format(fmt?: string): string;

  /**
   * Menambah waktu berdasarkan unit
   * @param value - Jumlah yang akan ditambahkan
   * @param unit - Unit waktu
   * @returns Instance DateTimeAPI baru untuk chaining
   */
  add(value: number, unit: TimeUnit): DateTimeAPI;

  /**
   * Mengurangi waktu berdasarkan unit
   * @param value - Jumlah yang akan dikurangi
   * @param unit - Unit waktu
   * @returns Instance DateTimeAPI baru untuk chaining
   */
  subtract(value: number, unit: TimeUnit): DateTimeAPI;

  /**
   * Mengambil native Date object
   * @returns Native Date object
   */
  toDate(): Date;

  /**
   * Mengambil timestamp dalam milliseconds
   * @returns Timestamp
   */
  valueOf(): number;

  /**
   * Validasi apakah date valid
   * @returns true jika date valid
   */
  isValid(): boolean;
}

/**
 * Composable untuk manipulasi dan formatting tanggal/waktu dengan support Bahasa Indonesia
 * @param input - Input date (support format "YYYY-MM-DD HH:mm:ss" dari database)
 * @returns API object dengan method chaining untuk manipulasi tanggal
 */
export function useDateTime(input?: Date | string): DateTimeAPI;
