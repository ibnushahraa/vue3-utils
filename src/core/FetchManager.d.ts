import type { FetchOptions } from 'ofetch'

/**
 * Opsi konfigurasi untuk FetchManager
 */
export interface FetchManagerOptions extends Omit<FetchOptions, 'onRequest' | 'onResponse' | 'onResponseError'> {
  /**
   * URL endpoint untuk refresh token
   * @default '/api/refresh-token'
   */
  refreshTokenUrl?: string

  /**
   * Custom function untuk mendapatkan access token
   * @default Ambil dari localStorage.getItem('accessToken')
   */
  getToken?: () => Promise<string | null> | string | null

  /**
   * Custom function untuk menyimpan access token baru
   * @default Simpan ke localStorage.setItem('accessToken', token)
   */
  saveToken?: (token: string) => Promise<void> | void

  /**
   * Custom function untuk mendapatkan refresh token
   * @default Ambil dari localStorage.getItem('refreshToken')
   */
  getRefreshToken?: () => Promise<string | null> | string | null

  /**
   * Custom function untuk mendapatkan refresh token expiration
   * @default Ambil dari localStorage.getItem('refreshTokenExpiration')
   */
  getRefreshTokenExpiration?: () => Promise<string | null> | string | null

  /**
   * Custom function untuk clear semua tokens
   * Dipanggil saat logout atau token refresh gagal
   */
  clearTokens?: () => void

  /**
   * Callback yang dipanggil saat refresh token gagal
   * Biasanya digunakan untuk redirect ke halaman login
   */
  onRefreshFailCallback?: () => void

  /**
   * Array URL yang akan di-skip dari auto token refresh
   * Berguna untuk public endpoints seperti login, register, dll
   * @default []
   *
   * @example
   * ```js
   * skipRefreshUrls: ['/auth/login', '/auth/register', '/public']
   * ```
   */
  skipRefreshUrls?: string[]
}

/**
 * Class untuk mengelola HTTP requests dengan automatic token refresh
 *
 * @example
 * ```js
 * const fetchManager = new FetchManager('https://api.example.com', {
 *   refreshTokenUrl: '/auth/refresh',
 *   getToken: () => sessionStorage.getItem('token'),
 *   saveToken: (token) => sessionStorage.setItem('token', token),
 *   onRefreshFailCallback: () => router.push('/login')
 * })
 *
 * const data = await fetchManager.fetch('/users')
 * ```
 */
export class FetchManager {
  /**
   * Base URL untuk semua requests
   */
  baseUrl?: string

  /**
   * URL endpoint untuk refresh token
   */
  refreshTokenUrl: string

  /**
   * Function untuk mendapatkan token
   */
  getTokenFn: () => Promise<string | null> | string | null

  /**
   * Function untuk menyimpan token
   */
  saveTokenFn: (token: string) => Promise<void> | void

  /**
   * Function untuk mendapatkan refresh token
   */
  getRefreshTokenFn: () => Promise<string | null> | string | null

  /**
   * Function untuk mendapatkan refresh token expiration
   */
  getRefreshTokenExpirationFn: () => Promise<string | null> | string | null

  /**
   * Callback saat refresh token gagal
   */
  onRefreshFailCallback?: () => void

  /**
   * Array URL yang di-skip dari auto token refresh
   */
  skipRefreshUrls: string[]

  /**
   * Flag untuk track refresh token process
   */
  isRefreshing: boolean

  /**
   * Promise untuk queue refresh token
   */
  refreshPromise: Promise<string> | null

  /**
   * Instance ofetch untuk raw requests (tanpa auth interceptor)
   */
  $fetchRaw: typeof fetch

  /**
   * Instance ofetch dengan auth interceptor
   */
  $fetch: typeof fetch

  /**
   * @param baseUrl - Base URL untuk semua HTTP requests
   * @param options - Opsi konfigurasi FetchManager
   */
  constructor(baseUrl?: string, options?: FetchManagerOptions)

  /**
   * Default method untuk mendapatkan access token dari localStorage
   * @returns Access token atau null
   */
  defaultGetToken(): Promise<string | null>

  /**
   * Default method untuk menyimpan access token ke localStorage
   * @param token - Access token yang akan disimpan
   */
  defaultSaveToken(token: string): Promise<void>

  /**
   * Default method untuk mendapatkan refresh token dari localStorage
   * @returns Refresh token atau null
   */
  defaultGetRefreshToken(): Promise<string | null>

  /**
   * Default method untuk mendapatkan refresh token expiration dari localStorage
   * @returns Refresh token expiration atau null
   */
  defaultGetRefreshTokenExpiration(): Promise<string | null>

  /**
   * Cek apakah refresh token tersedia di storage
   * @returns true jika refresh token ada dan tidak kosong
   */
  hasRefreshToken(): Promise<boolean>

  /**
   * Queue refresh token untuk mencegah multiple refresh bersamaan
   * @returns Promise dengan access token baru
   */
  queuedRefreshToken(): Promise<string>

  /**
   * Refresh access token menggunakan refresh token
   * @returns Promise dengan access token baru
   * @throws Error jika refresh token tidak ada atau expired
   */
  refreshToken(): Promise<string>

  /**
   * Handle kegagalan refresh token
   * Memanggil onRefreshFailCallback jika ada
   */
  handleTokenRefreshFailure(): void

  /**
   * Main method untuk melakukan HTTP request dengan auth
   * Otomatis retry dengan token baru jika dapat 401
   *
   * @param url - URL endpoint (relative atau absolute)
   * @param options - Opsi fetch request
   * @returns Promise dengan response data
   *
   * @example
   * ```js
   * const users = await fetchManager.fetch('/users')
   * const user = await fetchManager.fetch('/users/1', { method: 'GET' })
   * await fetchManager.fetch('/users', {
   *   method: 'POST',
   *   body: { name: 'John' }
   * })
   * ```
   */
  fetch<T = any>(url: string, options?: FetchOptions): Promise<T>
}
