// src/composables/useTypewriter.js
import { ref, computed, onUnmounted } from "vue";

/**
 * Composable untuk membuat efek typewriter/typing animation.
 * Mendukung array teks yang akan ditampilkan secara berurutan dengan efek mengetik.
 *
 * @param {string[]} texts - Array string yang akan ditampilkan dengan efek typewriter
 * @param {Object} [options={}] - Opsi konfigurasi
 * @param {number} [options.typeSpeed=100] - Kecepatan mengetik dalam ms per karakter
 * @param {number} [options.deleteSpeed=50] - Kecepatan menghapus dalam ms per karakter
 * @param {number} [options.delayBeforeDelete=2000] - Delay sebelum mulai menghapus (ms)
 * @param {number} [options.delayBeforeType=500] - Delay sebelum mengetik teks berikutnya (ms)
 * @param {boolean} [options.loop=true] - Loop terus menerus melalui array
 * @param {boolean} [options.autoStart=true] - Autostart animasi saat composable di-mount
 * @param {boolean} [options.showCursor=true] - Tampilkan cursor berkedip
 * @param {string} [options.cursorChar='|'] - Karakter cursor
 * @param {Function} [options.onTypeComplete] - Callback saat selesai mengetik satu teks
 * @param {Function} [options.onDeleteComplete] - Callback saat selesai menghapus satu teks
 * @param {Function} [options.onLoopComplete] - Callback saat loop selesai (jika loop: false)
 * @returns {Object} Object yang berisi properti dan method typewriter
 * @returns {import('vue').Ref<string>} returns.displayText - Teks yang sedang ditampilkan
 * @returns {import('vue').ComputedRef<string>} returns.displayTextWithCursor - Teks lengkap dengan cursor
 * @returns {import('vue').Ref<number>} returns.currentIndex - Index teks yang sedang aktif
 * @returns {import('vue').Ref<boolean>} returns.isTyping - Status apakah animasi sedang berjalan
 * @returns {import('vue').Ref<boolean>} returns.isDeleting - Status apakah sedang menghapus
 * @returns {import('vue').Ref<boolean>} returns.isPaused - Status apakah animasi sedang di-pause
 * @returns {Function} returns.start - Method untuk memulai atau restart animasi
 * @returns {Function} returns.pause - Method untuk pause animasi
 * @returns {Function} returns.resume - Method untuk resume animasi
 * @returns {Function} returns.stop - Method untuk stop animasi dan reset
 * @returns {Function} returns.next - Method untuk skip ke teks berikutnya
 * @returns {Function} returns.prev - Method untuk skip ke teks sebelumnya
 * @returns {Function} returns.updateTexts - Method untuk update array teks
 *
 * @example
 * // Basic usage
 * const { displayTextWithCursor } = useTypewriter([
 *   'Hello World',
 *   'Vue 3 is awesome',
 *   'TypeScript is great'
 * ]);
 *
 * @example
 * // Dengan options
 * const typewriter = useTypewriter(
 *   ['First text', 'Second text', 'Third text'],
 *   {
 *     typeSpeed: 80,
 *     deleteSpeed: 40,
 *     delayBeforeDelete: 3000,
 *     loop: true,
 *     showCursor: true,
 *     cursorChar: '_',
 *     onTypeComplete: (text, index) => {
 *       console.log(`Selesai mengetik: ${text} (index: ${index})`);
 *     }
 *   }
 * );
 *
 * @example
 * // Manual control
 * const typewriter = useTypewriter(
 *   ['Text 1', 'Text 2'],
 *   { autoStart: false }
 * );
 * typewriter.start(); // Mulai manual
 * typewriter.pause(); // Pause
 * typewriter.resume(); // Resume
 * typewriter.next(); // Skip ke teks berikutnya
 */
export function useTypewriter(texts, options = {}) {
    const {
        typeSpeed = 100,
        deleteSpeed = 50,
        delayBeforeDelete = 2000,
        delayBeforeType = 500,
        loop = true,
        autoStart = true,
        showCursor = true,
        cursorChar = "|",
        onTypeComplete = null,
        onDeleteComplete = null,
        onLoopComplete = null,
    } = options;

    // State
    const displayText = ref("");
    const currentIndex = ref(0);
    const isTyping = ref(false);
    const isDeleting = ref(false);
    const isPaused = ref(false);

    let textArray = [...texts];
    let currentCharIndex = 0;
    let timeoutId = null;
    let cursorIntervalId = null;
    const showCursorState = ref(true);

    // Computed property untuk teks dengan cursor
    const displayTextWithCursor = computed(() => {
        if (showCursor && showCursorState.value) {
            return displayText.value + cursorChar;
        }
        return displayText.value;
    });

    /**
     * Inisialisasi cursor blinking
     */
    function initCursorBlink() {
        if (showCursor && !cursorIntervalId) {
            cursorIntervalId = setInterval(() => {
                showCursorState.value = !showCursorState.value;
            }, 530); // Blink every 530ms
        }
    }

    /**
     * Stop cursor blinking
     */
    function stopCursorBlink() {
        if (cursorIntervalId) {
            clearInterval(cursorIntervalId);
            cursorIntervalId = null;
        }
    }

    /**
     * Fungsi utama untuk animasi typewriter
     */
    function type() {
        if (isPaused.value || textArray.length === 0) return;

        const currentText = textArray[currentIndex.value];

        if (!isDeleting.value) {
            // Mengetik
            if (currentCharIndex < currentText.length) {
                displayText.value = currentText.substring(0, currentCharIndex + 1);
                currentCharIndex++;
                timeoutId = setTimeout(type, typeSpeed);
            } else {
                // Selesai mengetik satu teks
                if (typeof onTypeComplete === "function") {
                    onTypeComplete(currentText, currentIndex.value);
                }

                // Tunggu sebelum mulai menghapus
                timeoutId = setTimeout(() => {
                    isDeleting.value = true;
                    type();
                }, delayBeforeDelete);
            }
        } else {
            // Menghapus
            if (currentCharIndex > 0) {
                currentCharIndex--;
                displayText.value = currentText.substring(0, currentCharIndex);
                timeoutId = setTimeout(type, deleteSpeed);
            } else {
                // Selesai menghapus
                isDeleting.value = false;

                if (typeof onDeleteComplete === "function") {
                    onDeleteComplete(currentIndex.value);
                }

                // Pindah ke teks berikutnya
                const nextIndex = currentIndex.value + 1;

                if (nextIndex >= textArray.length) {
                    // Sudah sampai akhir array
                    if (loop) {
                        // Loop kembali ke awal
                        currentIndex.value = 0;
                    } else {
                        // Stop jika tidak loop
                        isTyping.value = false;
                        if (typeof onLoopComplete === "function") {
                            onLoopComplete();
                        }
                        return;
                    }
                } else {
                    currentIndex.value = nextIndex;
                }

                // Tunggu sebelum mengetik teks berikutnya
                timeoutId = setTimeout(type, delayBeforeType);
            }
        }
    }

    /**
     * Mulai atau restart animasi
     */
    function start() {
        stop(); // Reset terlebih dahulu
        isTyping.value = true;
        isPaused.value = false;
        currentIndex.value = 0;
        currentCharIndex = 0;
        displayText.value = "";
        isDeleting.value = false;
        initCursorBlink();
        type();
    }

    /**
     * Pause animasi
     */
    function pause() {
        if (isTyping.value && !isPaused.value) {
            isPaused.value = true;
            if (timeoutId) {
                clearTimeout(timeoutId);
                timeoutId = null;
            }
        }
    }

    /**
     * Resume animasi yang di-pause
     */
    function resume() {
        if (isPaused.value) {
            isPaused.value = false;
            type();
        }
    }

    /**
     * Stop animasi dan reset
     */
    function stop() {
        isTyping.value = false;
        isPaused.value = false;
        isDeleting.value = false;
        currentCharIndex = 0;
        displayText.value = "";

        if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = null;
        }

        stopCursorBlink();
    }

    /**
     * Skip ke teks berikutnya
     */
    function next() {
        if (textArray.length === 0) return;

        const nextIndex = (currentIndex.value + 1) % textArray.length;
        currentIndex.value = nextIndex;
        currentCharIndex = 0;
        displayText.value = "";
        isDeleting.value = false;

        if (timeoutId) {
            clearTimeout(timeoutId);
        }

        if (isTyping.value && !isPaused.value) {
            type();
        }
    }

    /**
     * Skip ke teks sebelumnya
     */
    function prev() {
        if (textArray.length === 0) return;

        const prevIndex =
            currentIndex.value === 0
                ? textArray.length - 1
                : currentIndex.value - 1;
        currentIndex.value = prevIndex;
        currentCharIndex = 0;
        displayText.value = "";
        isDeleting.value = false;

        if (timeoutId) {
            clearTimeout(timeoutId);
        }

        if (isTyping.value && !isPaused.value) {
            type();
        }
    }

    /**
     * Update array teks
     */
    function updateTexts(newTexts) {
        const wasTyping = isTyping.value;
        stop();
        textArray = [...newTexts];
        currentIndex.value = 0;

        if (wasTyping) {
            start();
        }
    }

    // Auto start jika diaktifkan
    if (autoStart && textArray.length > 0) {
        start();
    } else if (showCursor) {
        initCursorBlink();
    }

    // Cleanup on unmount
    onUnmounted(() => {
        stop();
    });

    return {
        displayText,
        displayTextWithCursor,
        currentIndex,
        isTyping,
        isDeleting,
        isPaused,
        start,
        pause,
        resume,
        stop,
        next,
        prev,
        updateTexts,
    };
}
