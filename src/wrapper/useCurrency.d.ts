export interface CurrencyAPI {
  /**
   * Format angka ke format currency IDR
   * @param val - Nilai yang akan diformat (optional, default ke value awal)
   * @returns String currency dalam format IDR (contoh: "Rp 150.000")
   */
  format(val?: number): string;
}

/**
 * Composable untuk formatting angka ke format currency Rupiah Indonesia (IDR)
 * @param value - Nilai angka yang akan diformat
 * @returns API object dengan method format
 */
export function useCurrency(value: number): CurrencyAPI;
