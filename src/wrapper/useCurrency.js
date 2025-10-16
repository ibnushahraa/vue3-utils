/**
 * @typedef {Object} CurrencyAPI
 * @property {(val?: number) => string} format - Format angka ke format currency IDR
 */

/**
 * Composable untuk formatting angka ke format currency Rupiah Indonesia (IDR)
 *
 * @param {number} value - Nilai angka yang akan diformat
 * @returns {CurrencyAPI} API object dengan method format
 *
 * @example
 * // Format currency dengan nilai awal
 * useCurrency(150000).format() // "Rp 150.000"
 *
 * @example
 * // Format dengan nilai dinamis
 * const currency = useCurrency(0)
 * currency.format(250000) // "Rp 250.000"
 * currency.format(1500000) // "Rp 1.500.000"
 */
export function useCurrency(value) {
    /**
     * Format angka ke format currency IDR
     * @param {number} [val=value] - Nilai yang akan diformat (optional, default ke value awal)
     * @returns {string} String currency dalam format IDR (contoh: "Rp 150.000")
     */
    const format = (val = value) => {
        // Handle invalid numbers
        if (isNaN(val) || !isFinite(val)) return 'Invalid Number'

        // Round the number to nearest integer and handle negative zero
        const rounded = Math.round(val)
        const normalized = Object.is(rounded, -0) ? 0 : rounded

        const formatted = new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(normalized)

        // Replace non-breaking space with regular space for easier testing/comparison
        return formatted.replace(/\u00A0/g, ' ')
    }

    return { format }
}
