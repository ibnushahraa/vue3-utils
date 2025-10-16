import { ref, onUnmounted } from "vue";
import { ofetch } from 'ofetch'

// Global cache dengan size limit
const MAX_CACHE_SIZE = 100
const cache = new Map();
const cacheTimers = new Map();

// Helper: cleanup expired cache entries
function cleanupExpiredCache(url) {
  const timer = cacheTimers.get(url)
  if (timer) {
    clearTimeout(timer)
    cacheTimers.delete(url)
  }
  cache.delete(url)
}

// Helper: enforce cache size limit (LRU)
function enforceCacheLimit() {
  if (cache.size > MAX_CACHE_SIZE) {
    const firstKey = cache.keys().next().value
    cleanupExpiredCache(firstKey)
  }
}

/**
 * Composable untuk melakukan HTTP fetch dengan fitur caching otomatis.
 * Data akan di-cache berdasarkan URL dan waktu cache yang ditentukan.
 *
 * @param {string} url - URL endpoint yang akan di-fetch
 * @param {Object} [options={}] - Opsi fetch API (method, headers, body, dll)
 * @param {Object} [config={}] - Konfigurasi tambahan
 * @param {number} [config.cacheTime=0] - Waktu cache dalam milidetik (0 = tidak menggunakan cache)
 * @param {boolean} [config.immediate=true] - Jalankan fetch otomatis saat mounted
 * @returns {Object} Object yang berisi state dan method fetch
 * @returns {import('vue').Ref<any>} returns.data - Data hasil fetch (null jika belum ada data)
 * @returns {import('vue').Ref<Error|null>} returns.error - Error object jika terjadi error
 * @returns {import('vue').Ref<boolean>} returns.loading - Status loading (true saat sedang fetch)
 * @returns {Function} returns.refetch - Method untuk melakukan fetch ulang secara manual (bypass cache)
 * @returns {Function} returns.clearCache - Method untuk menghapus cache entry
 *
 * @example
 * // Fetch tanpa cache
 * const { data, error, loading } = useFetch('https://api.example.com/users');
 *
 * @example
 * // Fetch dengan cache 5 menit
 * const { data, error, loading, refetch, clearCache } = useFetch(
 *   'https://api.example.com/posts',
 *   { method: 'GET' },
 *   { cacheTime: 5 * 60 * 1000 }
 * );
 *
 * // Refetch manual (bypass cache)
 * await refetch();
 *
 * // Clear cache
 * clearCache();
 *
 * @example
 * // Fetch manual (tidak otomatis)
 * const { data, loading, refetch } = useFetch(
 *   'https://api.example.com/search',
 *   { method: 'POST' },
 *   { immediate: false }
 * );
 * // Trigger manual
 * await refetch();
 */
export function useFetch(url, options = {}, { cacheTime = 0, immediate = true } = {}) {
  const data = ref(null);
  const error = ref(null);
  const loading = ref(false);
  const abortController = ref(null);

  // Buat cache key berdasarkan URL dan method
  const cacheKey = `${options.method || 'GET'}:${url}`

  // Cleanup function
  const cleanup = () => {
    if (abortController.value) {
      abortController.value.abort()
      abortController.value = null
    }
  }

  // Clear cache untuk URL ini
  const clearCache = () => {
    cleanupExpiredCache(cacheKey)
  }

  // Fetch data function
  const fetchData = async (bypassCache = false) => {
    // Cancel previous request
    cleanup()

    loading.value = true;
    error.value = null;

    try {
      // Check cache
      if (!bypassCache && cacheTime > 0) {
        const cached = cache.get(cacheKey);
        const now = Date.now();

        if (cached && now - cached.timestamp < cacheTime) {
          // Use await to ensure async consistency
          await Promise.resolve()
          data.value = cached.data
          return cached.data
        }

        // Expired cache
        if (cached && now - cached.timestamp >= cacheTime) {
          cleanupExpiredCache(cacheKey)
        }
      }

      // Create abort controller untuk request ini
      abortController.value = new AbortController()

      const response = await ofetch(url, {
        ...options,
        signal: abortController.value.signal
      })

      data.value = response

      // Save to cache
      if (cacheTime > 0) {
        enforceCacheLimit()
        cache.set(cacheKey, { data: response, timestamp: Date.now() })

        // Auto cleanup setelah expire
        const timer = setTimeout(() => {
          cleanupExpiredCache(cacheKey)
        }, cacheTime)
        cacheTimers.set(cacheKey, timer)
      }

      error.value = null // Clear any previous errors on success
      return response
    } catch (err) {
      // Ignore abort errors
      if (err.name !== 'AbortError') {
        error.value = err
      }
      return null
    } finally {
      loading.value = false
      abortController.value = null
    }
  }

  // Refetch (bypass cache)
  const refetch = () => fetchData(true)

  // Auto fetch jika immediate = true
  if (immediate) {
    fetchData()
  }

  // Cleanup on unmount
  onUnmounted(() => {
    cleanup()
  })

  return {
    data,
    error,
    loading,
    refetch,
    clearCache
  };
}