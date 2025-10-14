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
 * Wrapper untuk mengakses instance event bus global
 * @see {@link module:wrapper/useEventBus}
 */
export { useEventBus } from "./wrapper/useEventBus.js";

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
