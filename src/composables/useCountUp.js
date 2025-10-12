// src/composables/useCountUp.js
import { ref, onUnmounted } from "vue";

/**
 * Composable untuk animasi count up dari nilai awal ke nilai akhir.
 * Mirip dengan library countup.js, menganimasikan angka dengan easing function.
 *
 * @param {number} endValue - Nilai akhir yang ingin dicapai
 * @param {Object} [options={}] - Opsi konfigurasi
 * @param {number} [options.startValue=0] - Nilai awal (default: 0)
 * @param {number} [options.duration=2000] - Durasi animasi dalam milidetik (default: 2000ms)
 * @param {number} [options.decimalPlaces=0] - Jumlah desimal (default: 0)
 * @param {string} [options.separator=''] - Separator ribuan (default: '')
 * @param {string} [options.decimal='.'] - Separator desimal (default: '.')
 * @param {string} [options.prefix=''] - Prefix untuk ditampilkan sebelum angka
 * @param {string} [options.suffix=''] - Suffix untuk ditampilkan setelah angka
 * @param {boolean} [options.useEasing=true] - Gunakan easing function (default: true)
 * @param {Function} [options.easingFn] - Custom easing function
 * @param {Function} [options.onComplete] - Callback saat animasi selesai
 * @returns {Object} Object yang berisi properti dan method count up
 * @returns {import('vue').Ref<string>} returns.displayValue - Nilai yang ditampilkan (sudah diformat)
 * @returns {import('vue').Ref<number>} returns.currentValue - Nilai numerik saat ini
 * @returns {Function} returns.start - Method untuk memulai animasi
 * @returns {Function} returns.pause - Method untuk pause animasi
 * @returns {Function} returns.resume - Method untuk resume animasi
 * @returns {Function} returns.reset - Method untuk reset ke nilai awal
 * @returns {Function} returns.update - Method untuk update nilai akhir baru
 *
 * @example
 * // Basic usage
 * const { displayValue, start } = useCountUp(1000);
 * start(); // Animasi dari 0 ke 1000
 *
 * @example
 * // Dengan options lengkap
 * const counter = useCountUp(5000, {
 *   startValue: 0,
 *   duration: 3000,
 *   decimalPlaces: 2,
 *   separator: ',',
 *   prefix: '$',
 *   suffix: '',
 *   onComplete: () => console.log('Selesai!')
 * });
 * counter.start();
 *
 * @example
 * // Update nilai baru
 * const counter = useCountUp(100);
 * counter.start();
 * // Kemudian update ke nilai baru
 * setTimeout(() => counter.update(500), 2000);
 */
export function useCountUp(endValue, options = {}) {
    const {
        startValue = 0,
        duration = 2000,
        decimalPlaces = 0,
        separator = "",
        decimal = ".",
        prefix = "",
        suffix = "",
        useEasing = true,
        easingFn = null,
        onComplete = null,
    } = options;

    const currentValue = ref(startValue);
    const displayValue = ref(formatNumber(startValue));

    let animationFrame = null;
    let startTimestamp = null;
    let pauseTimestamp = null;
    let currentStartValue = startValue;
    let currentEndValue = endValue;
    let isPaused = false;

    // Default easing function (easeOutExpo)
    const defaultEasingFn = (t, b, c, d) => {
        return c * (-Math.pow(2, (-10 * t) / d) + 1) * 1024 / 1023 + b;
    };

    const easing = easingFn || defaultEasingFn;

    /**
     * Format angka dengan separator dan desimal
     */
    function formatNumber(num) {
        const fixedNum = Number(num).toFixed(decimalPlaces);
        const parts = fixedNum.split(".");

        // Tambahkan separator ribuan
        if (separator) {
            parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, separator);
        }

        // Gabungkan dengan decimal separator
        const formatted = parts.length > 1 ? parts.join(decimal) : parts[0];

        return `${prefix}${formatted}${suffix}`;
    }

    /**
     * Fungsi animasi frame
     */
    function animate(timestamp) {
        if (!startTimestamp) startTimestamp = timestamp;

        const progress = timestamp - startTimestamp;
        const timeElapsed = Math.min(progress, duration);

        let value;
        if (useEasing) {
            value = easing(
                timeElapsed,
                currentStartValue,
                currentEndValue - currentStartValue,
                duration
            );
        } else {
            // Linear
            value = currentStartValue +
                (currentEndValue - currentStartValue) * (timeElapsed / duration);
        }

        currentValue.value = value;
        displayValue.value = formatNumber(value);

        if (timeElapsed < duration) {
            animationFrame = requestAnimationFrame(animate);
        } else {
            // Pastikan nilai akhir tepat
            currentValue.value = currentEndValue;
            displayValue.value = formatNumber(currentEndValue);

            if (typeof onComplete === "function") {
                onComplete();
            }
        }
    }

    /**
     * Mulai animasi
     */
    function start() {
        if (animationFrame) {
            cancelAnimationFrame(animationFrame);
        }

        startTimestamp = null;
        isPaused = false;
        currentStartValue = startValue;
        currentValue.value = startValue;
        displayValue.value = formatNumber(startValue);

        animationFrame = requestAnimationFrame(animate);
    }

    /**
     * Pause animasi
     */
    function pause() {
        if (animationFrame && !isPaused) {
            cancelAnimationFrame(animationFrame);
            isPaused = true;
            pauseTimestamp = performance.now();
        }
    }

    /**
     * Resume animasi
     */
    function resume() {
        if (isPaused) {
            isPaused = false;
            const pauseDuration = performance.now() - pauseTimestamp;
            startTimestamp += pauseDuration;
            animationFrame = requestAnimationFrame(animate);
        }
    }

    /**
     * Reset ke nilai awal
     */
    function reset() {
        if (animationFrame) {
            cancelAnimationFrame(animationFrame);
        }

        startTimestamp = null;
        isPaused = false;
        currentValue.value = startValue;
        displayValue.value = formatNumber(startValue);
    }

    /**
     * Update ke nilai akhir baru
     */
    function update(newEndValue) {
        if (animationFrame) {
            cancelAnimationFrame(animationFrame);
        }

        currentStartValue = currentValue.value;
        currentEndValue = newEndValue;
        startTimestamp = null;
        isPaused = false;

        animationFrame = requestAnimationFrame(animate);
    }

    // Cleanup on unmount
    onUnmounted(() => {
        if (animationFrame) {
            cancelAnimationFrame(animationFrame);
        }
    });

    return {
        displayValue,
        currentValue,
        start,
        pause,
        resume,
        reset,
        update,
    };
}
