/**
 * @typedef {'seconds' | 'minutes' | 'hours' | 'days' | 'months' | 'years'} TimeUnit
 */

/**
 * @typedef {Object} DateTimeAPI
 * @property {(fmt?: string) => string} format - Format tanggal sesuai pattern. Default: 'DD MMMM YYYY HH:mm:ss'
 * @property {(value: number, unit: TimeUnit) => DateTimeAPI} add - Menambah waktu berdasarkan unit
 * @property {(value: number, unit: TimeUnit) => DateTimeAPI} subtract - Mengurangi waktu berdasarkan unit
 * @property {() => Date} toDate - Mengambil native Date object
 * @property {() => number} valueOf - Mengambil timestamp dalam milliseconds
 * @property {() => boolean} isValid - Validasi apakah date valid
 */

/**
 * Composable untuk manipulasi dan formatting tanggal/waktu dengan support Bahasa Indonesia
 *
 * @param {Date | string} [input=new Date()] - Input date (support format "YYYY-MM-DD HH:mm:ss" dari database)
 * @returns {DateTimeAPI} API object dengan method chaining untuk manipulasi tanggal
 *
 * @example
 * // Format tanggal
 * useDateTime('2024-01-15 10:30:00').format('DD MMMM YYYY') // "15 Januari 2024"
 *
 * @example
 * // Chaining operations
 * useDateTime().add(7, 'days').subtract(2, 'hours').format('DD/MM/YYYY HH:mm')
 *
 * @example
 * // Available format tokens:
 * // DD - tanggal dengan leading zero (01-31)
 * // D - tanggal tanpa leading zero (1-31)
 * // MM - bulan dengan leading zero (01-12)
 * // MMMM - nama bulan dalam Bahasa Indonesia
 * // YY - tahun 2 digit
 * // YYYY - tahun 4 digit
 * // HH - jam dengan leading zero (00-23)
 * // mm - menit dengan leading zero (00-59)
 * // ss - detik dengan leading zero (00-59)
 */
export function useDateTime(input = new Date()) {
    // parsing aman: support format DB "YYYY-MM-DD HH:mm:ss"
    const raw = String(input instanceof Date ? input : input || '').trim()
    const date = new Date(raw.replace(' ', 'T'))

    /**
     * Menambahkan leading zero untuk angka
     * @param {number} n - Angka yang akan diformat
     * @returns {string} String dengan leading zero
     */
    const pad = (n) => String(n).padStart(2, '0')

    const monthNames = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ]

    /**
     * Mapping Date object ke format tokens
     * @param {Date} d - Date object
     * @returns {Object} Object berisi mapping token format
     */
    const map = (d) => ({
        DD: pad(d.getDate()),
        D: d.getDate(),
        MM: pad(d.getMonth() + 1),
        MMMM: monthNames[d.getMonth()],
        YY: String(d.getFullYear()).slice(2),
        YYYY: d.getFullYear(),
        HH: pad(d.getHours()),
        mm: pad(d.getMinutes()),
        ss: pad(d.getSeconds()),
    })

    /**
     * Validasi apakah date valid
     * @returns {boolean} true jika date valid
     */
    const isValid = () => !isNaN(date.getTime())

    /**
     * Format tanggal sesuai pattern
     * @param {string} [fmt='DD MMMM YYYY HH:mm:ss'] - Pattern format
     * @returns {string} String tanggal yang sudah diformat
     */
    const format = (fmt = 'DD MMMM YYYY HH:mm:ss') => {
        if (!isValid()) return 'Invalid Date'
        let out = fmt
        const parts = map(date)
        for (const key in parts) out = out.replace(new RegExp(key, 'g'), parts[key])
        return out
    }

    /**
     * Menambah waktu berdasarkan unit
     * @param {number} value - Jumlah yang akan ditambahkan
     * @param {TimeUnit} unit - Unit waktu
     * @returns {DateTimeAPI} Instance DateTimeAPI baru untuk chaining
     * @throws {Error} Jika unit tidak valid
     */
    const add = (value, unit) => {
        if (!isValid()) return api
        const d = new Date(date)
        switch (unit) {
            case 'seconds': d.setSeconds(d.getSeconds() + value); break
            case 'minutes': d.setMinutes(d.getMinutes() + value); break
            case 'hours': d.setHours(d.getHours() + value); break
            case 'days': d.setDate(d.getDate() + value); break
            case 'months': d.setMonth(d.getMonth() + value); break
            case 'years': d.setFullYear(d.getFullYear() + value); break
            default: throw new Error('Invalid unit for add()')
        }
        return useDateTime(d)
    }

    /**
     * Mengurangi waktu berdasarkan unit
     * @param {number} value - Jumlah yang akan dikurangi
     * @param {TimeUnit} unit - Unit waktu
     * @returns {DateTimeAPI} Instance DateTimeAPI baru untuk chaining
     */
    const subtract = (value, unit) => add(-value, unit)

    /**
     * Mengambil native Date object
     * @returns {Date} Native Date object
     */
    const toDate = () => date

    /**
     * Mengambil timestamp dalam milliseconds
     * @returns {number} Timestamp
     */
    const valueOf = () => date.getTime()

    const api = { format, add, subtract, toDate, valueOf, isValid }
    return api
}
