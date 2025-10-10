// composables/useFetch.js
import { ref, watchEffect } from "vue";

const cache = new Map();

/**
 * Composable untuk melakukan HTTP fetch dengan fitur caching otomatis.
 * Data akan di-cache berdasarkan URL dan waktu cache yang ditentukan.
 *
 * @param {string} url - URL endpoint yang akan di-fetch
 * @param {Object} [options={}] - Opsi fetch API (method, headers, body, dll)
 * @param {Object} [config={}] - Konfigurasi tambahan
 * @param {number} [config.cacheTime=0] - Waktu cache dalam milidetik (0 = tidak menggunakan cache)
 * @returns {Object} Object yang berisi state dan method fetch
 * @returns {import('vue').Ref<any>} returns.data - Data hasil fetch (null jika belum ada data)
 * @returns {import('vue').Ref<Error|null>} returns.error - Error object jika terjadi error
 * @returns {import('vue').Ref<boolean>} returns.loading - Status loading (true saat sedang fetch)
 * @returns {Function} returns.refetch - Method untuk melakukan fetch ulang secara manual
 *
 * @example
 * // Fetch tanpa cache
 * const { data, error, loading } = useFetch('https://api.example.com/users');
 *
 * @example
 * // Fetch dengan cache 5 menit
 * const { data, error, loading, refetch } = useFetch(
 *   'https://api.example.com/posts',
 *   { method: 'GET' },
 *   { cacheTime: 5 * 60 * 1000 }
 * );
 *
 * // Refetch manual
 * refetch();
 */
export function useFetch(url, options = {}, { cacheTime = 0 } = {}) {
  const data = ref(null);
  const error = ref(null);
  const loading = ref(false);

  const fetchData = async () => {
    const now = Date.now();
    const cached = cache.get(url);

    // jika cache diaktifkan & masih berlaku
    if (cacheTime > 0 && cached && now - cached.timestamp < cacheTime) {
      data.value = cached.data;
      return;
    }

    // jika cache diaktifkan & sudah expired → hapus
    if (cacheTime > 0 && cached && now - cached.timestamp >= cacheTime) {
      cache.delete(url);
    }

    loading.value = true;
    error.value = null;

    try {
      const res = await fetch(url, options);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();

      data.value = json;

      // simpan ke cache hanya jika cacheTime > 0
      if (cacheTime > 0) {
        cache.set(url, { data: json, timestamp: now });

        // hapus otomatis setelah cacheTime
        setTimeout(() => {
          cache.delete(url);
        }, cacheTime);
      }
    } catch (err) {
      error.value = err;
    } finally {
      loading.value = false;
    }
  };

  watchEffect(fetchData);

  return { data, error, loading, refetch: fetchData };
}
