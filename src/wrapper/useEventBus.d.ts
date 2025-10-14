import { Emitter } from '../core/emitter';

/**
 * Wrapper untuk mengakses instance event bus global
 * Memungkinkan komunikasi dan pertukaran event antar komponen
 *
 * @returns Instance event bus global
 */
export function useEventBus(): Emitter;