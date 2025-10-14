/**
 * Kelas untuk mengelola event dan listener
 * Memungkinkan pendaftaran, pengiriman, dan pembatalan event
 *
 * @class Emitter
 * @description Sistem manajemen event sederhana yang mendukung multiple listener
 * @example
 * const emitter = new Emitter()
 * emitter.on('ping', console.log)
 * emitter.emit('ping', 'pong')
 */
export class Emitter {
    /**
     * Membuat instance Emitter baru
     * @constructor
     */
    constructor() {
        /**
         * Penyimpanan event internal
         * @private
         * @type {Object.<string, Function[]>}
         */
        this.events = Object.create(null)
    }

    /**
     * Mendaftarkan listener untuk event tertentu
     *
     * @param {string} event - Nama event yang akan didaftarkan
     * @param {Function} fn - Fungsi listener yang akan dipanggil
     * @returns {void}
     * @example
     * emitter.on('user:login', (data) => {
     *   console.log('User login:', data)
     * })
     */
    on(event, fn) {
        (this.events[event] ||= []).push(fn)
    }

    /**
     * Menjalankan semua listener untuk event tertentu
     *
     * @param {string} event - Nama event yang akan dijalankan
     * @param {...*} args - Argumen opsional untuk dikirim ke listener
     * @returns {void}
     * @example
     * emitter.emit('user:login', { id: 123, name: 'John' })
     */
    emit(event, ...args) {
        const fns = this.events[event]
        if (!fns) return
        for (const fn of [...fns]) fn(...args)
    }

    /**
     * Menghapus listener tertentu dari sebuah event
     *
     * @param {string} event - Nama event
     * @param {Function} fn - Fungsi listener yang akan dihapus
     * @returns {void}
     * @example
     * const listener = (data) => {}
     * emitter.off('user:login', listener)
     */
    off(event, fn) {
        const fns = this.events[event]
        if (!fns) return
        this.events[event] = fns.filter(cb => cb !== fn)
    }

    /**
     * Mendaftarkan listener yang hanya berjalan sekali
     *
     * @param {string} event - Nama event
     * @param {Function} fn - Fungsi listener
     * @returns {void}
     * @example
     * emitter.once('first:connection', () => {
     *   console.log('Hanya terjadi pada koneksi pertama')
     * })
     */
    once(event, fn) {
        const wrapper = (...args) => {
            this.off(event, wrapper)
            fn(...args)
        }
        this.on(event, wrapper)
    }
}

/**
 * Instance global event bus untuk komunikasi antar komponen
 *
 * @type {Emitter}
 * @example
 * // Mengirim event global
 * eventBus.emit('global:notification', 'Pesan pemberitahuan')
 *
 * // Mendaftarkan listener global
 * eventBus.on('global:notification', (message) => {
 *   console.log(message)
 * })
 */
export const eventBus = new Emitter()
