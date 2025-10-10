// composables/useFetch.js
import { ref, watchEffect } from "vue";

const cache = new Map();

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
