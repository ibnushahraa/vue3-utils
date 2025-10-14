/**
 * Tipe untuk fungsi listener event
 */
type EventListener = (...args: any[]) => void;

/**
 * Kelas untuk mengelola event dan listener
 * Memungkinkan pendaftaran, pengiriman, dan pembatalan event
 */
export class Emitter {
    /**
     * Penyimpanan event internal
     * @private
     */
    private events: Record<string, EventListener[]>;

    /**
     * Mendaftarkan listener untuk event tertentu
     * @param event - Nama event yang akan didaftarkan
     * @param fn - Fungsi listener yang akan dipanggil
     */
    on(event: string, fn: EventListener): void;

    /**
     * Menjalankan semua listener untuk event tertentu
     * @param event - Nama event yang akan dijalankan
     * @param args - Argumen opsional untuk dikirim ke listener
     */
    emit(event: string, ...args: any[]): void;

    /**
     * Menghapus listener tertentu dari sebuah event
     * @param event - Nama event
     * @param fn - Fungsi listener yang akan dihapus
     */
    off(event: string, fn: EventListener): void;

    /**
     * Mendaftarkan listener yang hanya berjalan sekali
     * @param event - Nama event
     * @param fn - Fungsi listener
     */
    once(event: string, fn: EventListener): void;
}

/**
 * Instance global event bus untuk komunikasi antar komponen
 */
export const eventBus: Emitter;