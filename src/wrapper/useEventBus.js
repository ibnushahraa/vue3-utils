import { Emitter } from '../core/emitter.js'

// Create singleton instance
let eventBusInstance = null

/**
 * Wrapper untuk mengakses instance event bus global
 * Memungkinkan komunikasi dan pertukaran event antar komponen
 *
 * @returns {import('../core/emitter.js').Emitter} Instance event bus global
 * @example
 * // Mengirim event
 * const bus = useEventBus()
 * bus.emit('user:updated', { id: 123, name: 'John' })
 *
 * // Mendaftarkan listener
 * bus.on('user:updated', (userData) => {
 *   console.log('User diperbarui:', userData)
 * })
 */
export function useEventBus() {
    if (!eventBusInstance) {
        eventBusInstance = new Emitter()
    }
    return eventBusInstance
}
