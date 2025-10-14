import { ref, onUnmounted } from 'vue'
import { FetchManager } from '../core/FetchManager'

/**
 * Composable untuk fetch dengan manajemen token otomatis
 * Mendukung refresh token secara otomatis dan penanganan token kedaluwarsa
 *
 * @param {string} [baseUrl] - Base URL yang akan digunakan untuk semua request
 * @param {import('../core/FetchManager').FetchManagerOptions} [options] - Opsi konfigurasi FetchManager
 * @returns {Object} Objek dengan state dan methods
 * @property {Function} fetchWithAuth - Fungsi fetch dengan auth & auto token refresh
 * @property {import('vue').Ref<boolean>} isRefreshing - Status refresh token (readonly)
 * @property {Function} clearTokens - Helper untuk clear semua tokens dari storage
 *
 * @example
 * // Basic usage
 * const { fetchWithAuth } = useFetchServer('https://api.example.com')
 * const users = await fetchWithAuth('/users')
 *
 * @example
 * // Advanced usage dengan custom token handlers
 * const { fetchWithAuth, isRefreshing, clearTokens } = useFetchServer('https://api.example.com', {
 *   refreshTokenUrl: '/auth/refresh-token',
 *   getToken: () => sessionStorage.getItem('accessToken'),
 *   saveToken: (token) => sessionStorage.setItem('accessToken', token),
 *   onRefreshFailCallback: () => {
 *     clearTokens()
 *     router.push('/login')
 *   }
 * })
 *
 * // Cek status refresh
 * if (isRefreshing.value) {
 *   console.log('Token sedang di-refresh...')
 * }
 */
export function useFetchServer(baseUrl, options = {}) {
  // Buat instance FetchManager
  const fetchManager = new FetchManager(baseUrl, options)

  // Reactive state
  const isRefreshing = ref(false)

  // Wrapper isRefreshing state
  const originalQueuedRefresh = fetchManager.queuedRefreshToken.bind(fetchManager)
  fetchManager.queuedRefreshToken = async function() {
    isRefreshing.value = true
    try {
      return await originalQueuedRefresh()
    } finally {
      isRefreshing.value = false
    }
  }

  // Main fetch function
  const fetchWithAuth = async (url, fetchOptions = {}) => {
    return fetchManager.fetch(url, fetchOptions)
  }

  // Clear tokens helper - gunakan custom clearTokens jika ada
  const clearTokens = options.clearTokens || (() => {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('refreshTokenExpiration')
    }
  })

  // Cleanup on unmount
  onUnmounted(() => {
    if (fetchManager.refreshPromise) {
      fetchManager.isRefreshing = false
      fetchManager.refreshPromise = null
    }
  })

  return {
    fetchWithAuth,
    isRefreshing,
    clearTokens
  }
}