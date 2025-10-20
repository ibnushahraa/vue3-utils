/**
 * @fileoverview Koleksi composable utilities untuk Vue 3
 * @module vue3-utils
 */

/**
 * Composable untuk countdown timer
 * @see {@link module:composables/useCountdown}
 */
export { useCountdown } from "./composables/useCountdown.js";

/**
 * Composable untuk menampilkan waktu relatif multi-bahasa
 * @see {@link module:composables/useTimeAgo}
 */
export { useTimeAgo } from "./composables/useTimeAgo.js";

/**
 * Composable untuk animasi count up
 * @see {@link module:composables/useCountUp}
 */
export { useCountUp } from "./composables/useCountUp.js";

/**
 * Composable untuk efek typewriter/typing animation
 * @see {@link module:composables/useTypewriter}
 */
export { useTypewriter } from "./composables/useTypewriter.js";

/**
 * Composable untuk Server-Sent Events (SSE) dengan auto-reconnection
 * @see {@link module:composables/useSSE}
 */
export { useSSE } from "./composables/useSSE.js";

/**
 * Composable untuk copy text ke clipboard
 * @see {@link module:composables/useClipboard}
 */
export { useClipboard } from "./composables/useClipboard.js";

/**
 * Composable untuk menampilkan kata/kalimat random dari array
 * @see {@link module:composables/useRandomWords}
 */
export { useRandomWords } from "./composables/useRandomWords.js";

/**
 * Wrapper untuk mengakses instance event bus global
 * @see {@link module:wrapper/useEventBus}
 */
export { useEventBus } from "./wrapper/useEventBus.js";

/**
 * Instance global event bus
 * @see {@link module:core/emitter}
 */
export { eventBus, Emitter } from "./core/emitter.js";

/**
 * Wrapper untuk HTTP fetch dengan caching otomatis
 * @see {@link module:wrapper/useFetch}
 */
export { useFetch } from "./wrapper/useFetch.js";

/**
 * Wrapper untuk memeriksa status expirasi token
 * @see {@link module:wrapper/useAuthGuard}
 */
export { useAuthGuard } from "./wrapper/useAuthGuard.js";

/**
 * Wrapper untuk fetch dengan manajemen token otomatis
 * @see {@link module:wrapper/useFetchServer}
 */
export { useFetchServer } from "./wrapper/useFetchServer.js";

/**
 * Wrapper untuk manipulasi dan formatting tanggal/waktu
 * @see {@link module:wrapper/useDateTime}
 */
export { useDateTime } from "./wrapper/useDateTime.js";

/**
 * Wrapper untuk formatting angka ke currency IDR
 * @see {@link module:wrapper/useCurrency}
 */
export { useCurrency } from "./wrapper/useCurrency.js";
