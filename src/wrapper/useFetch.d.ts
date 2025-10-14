import { Ref } from "vue";
import type { FetchOptions } from 'ofetch'

/**
 * Opsi konfigurasi untuk useFetch
 */
export interface UseFetchConfig {
  /**
   * Waktu cache dalam milidetik (0 = tidak ada cache)
   * @default 0
   */
  cacheTime?: number;

  /**
   * Jalankan fetch otomatis saat composable dipanggil
   * @default true
   */
  immediate?: boolean;
}

/**
 * Nilai return dari useFetch
 */
export interface UseFetchReturn<T = any> {
  /**
   * Data hasil fetch
   */
  data: Ref<T | null>;

  /**
   * Error object jika terjadi kesalahan
   */
  error: Ref<Error | null>;

  /**
   * Status loading
   */
  loading: Ref<boolean>;

  /**
   * Fungsi untuk refetch data (bypass cache)
   * @returns Promise dengan data baru
   */
  refetch: () => Promise<T | undefined>;

  /**
   * Fungsi untuk menghapus cache entry untuk URL ini
   */
  clearCache: () => void;
}

/**
 * Composable untuk melakukan HTTP fetch dengan fitur caching otomatis
 *
 * Features:
 * - Auto caching dengan configurable TTL
 * - Request cancellation dengan AbortController
 * - Memory leak prevention dengan cleanup on unmount
 * - Cache size limit (LRU - max 100 entries)
 * - Manual refetch dengan bypass cache
 *
 * @param url - URL endpoint yang akan di-fetch
 * @param options - Opsi ofetch (method, headers, body, dll)
 * @param config - Konfigurasi tambahan (cacheTime, immediate)
 * @returns Object berisi data, error, loading, refetch, dan clearCache
 *
 * @example
 * ```ts
 * // Fetch tanpa cache (auto fetch)
 * const { data, error, loading } = useFetch<User[]>('https://api.example.com/users')
 *
 * // Fetch dengan cache 5 menit
 * const { data, loading, refetch, clearCache } = useFetch<Post[]>(
 *   'https://api.example.com/posts',
 *   { method: 'GET' },
 *   { cacheTime: 5 * 60 * 1000 }
 * )
 *
 * // Refetch manual (bypass cache)
 * await refetch()
 *
 * // Clear cache
 * clearCache()
 * ```
 *
 * @example
 * ```ts
 * // Fetch manual (tidak otomatis)
 * const { data, loading, refetch } = useFetch<SearchResult>(
 *   'https://api.example.com/search',
 *   { method: 'POST', body: { query: 'vue' } },
 *   { immediate: false }
 * )
 *
 * // Trigger fetch manual
 * await refetch()
 * ```
 */
export declare function useFetch<T = any>(
  url: string,
  options?: FetchOptions,
  config?: UseFetchConfig
): UseFetchReturn<T>;