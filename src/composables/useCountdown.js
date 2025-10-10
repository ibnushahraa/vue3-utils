// src/composables/useCountdown.js
import { ref, computed, onUnmounted } from "vue";

/**
 * Composable untuk countdown timer dengan waktu kadaluarsa dalam format Unix timestamp.
 * Timer akan otomatis berhitung mundur setiap detik dan memanggil callback saat waktu habis.
 *
 * @param {number} expiredUnix - Waktu kadaluarsa dalam format Unix timestamp (detik)
 * @param {Object} [options={}] - Opsi konfigurasi
 * @param {Function} [options.onExpired] - Callback yang dipanggil saat waktu habis
 * @returns {Object} Object yang berisi properti dan method countdown
 * @returns {import('vue').ComputedRef<string>} returns.hours - Jam dalam format 2 digit (00-99)
 * @returns {import('vue').ComputedRef<string>} returns.minutes - Menit dalam format 2 digit (00-59)
 * @returns {import('vue').ComputedRef<string>} returns.seconds - Detik dalam format 2 digit (00-59)
 * @returns {import('vue').Ref<number>} returns.remaining - Sisa waktu dalam detik
 * @returns {Function} returns.onExpired - Method untuk menambahkan/mengubah handler expired
 * @returns {Function} returns.onSuccess - Method untuk menambahkan handler success
 * @returns {Function} returns.triggerSuccess - Method untuk trigger success secara manual
 *
 * @example
 * const countdown = useCountdown(1672531200, {
 *   onExpired: () => console.log('Waktu habis!')
 * });
 *
 * // Menambahkan handler success
 * countdown.onSuccess(() => {
 *   console.log('Pembayaran berhasil!');
 * });
 *
 * // Trigger success secara manual
 * countdown.triggerSuccess();
 */
export function useCountdown(expiredUnix, { onExpired } = {}) {
    const remaining = ref(0);
    let timer = null;

    // listener yang bisa diubah dari luar
    let _onExpired = onExpired || null;
    let _onSuccess = null;

    const update = () => {
        const now = Math.floor(Date.now() / 1000);
        remaining.value = Math.max(0, expiredUnix - now);
        if (remaining.value <= 0) handleExpired();
    };

    const handleExpired = () => {
        clearInterval(timer);
        timer = null;
        if (typeof _onExpired === "function") _onExpired();
    };

    // dipanggil manual dari luar (misal saat pembayaran sukses)
    const handleSuccess = () => {
        clearInterval(timer);
        timer = null;
        if (typeof _onSuccess === "function") _onSuccess();
    };

    const onExpiredHandler = (fn) => (_onExpired = fn);
    const onSuccessHandler = (fn) => (_onSuccess = fn);

    const start = () => {
        clearInterval(timer);
        update();
        timer = setInterval(update, 1000);
    };

    start();

    onUnmounted(() => clearInterval(timer));

    const hours = computed(() =>
        String(Math.floor(remaining.value / 3600)).padStart(2, "0")
    );
    const minutes = computed(() =>
        String(Math.floor((remaining.value % 3600) / 60)).padStart(2, "0")
    );
    const seconds = computed(() =>
        String(remaining.value % 60).padStart(2, "0")
    );

    return {
        hours,
        minutes,
        seconds,
        remaining,
        onExpired: onExpiredHandler,
        onSuccess: onSuccessHandler,
        triggerSuccess: handleSuccess,
    };
}
