import { ofetch } from 'ofetch'

export class FetchManager {
  constructor(baseUrl, options = {}) {
    this.baseUrl = baseUrl
    this.refreshTokenUrl = options.refreshTokenUrl || '/api/refresh-token'
    this.getTokenFn = options.getToken || this.defaultGetToken
    this.saveTokenFn = options.saveToken || this.defaultSaveToken
    this.getRefreshTokenFn = options.getRefreshToken || this.defaultGetRefreshToken
    this.getRefreshTokenExpirationFn = options.getRefreshTokenExpiration || this.defaultGetRefreshTokenExpiration
    this.onRefreshFailCallback = options.onRefreshFailCallback
    this.skipRefreshUrls = options.skipRefreshUrls || []

    // State untuk manage refresh token process
    this.isRefreshing = false
    this.refreshPromise = null

    // Buat instance ofetch tanpa interceptor untuk raw requests
    this.$fetchRaw = ofetch.create({
      baseURL: baseUrl,
      ...options
    })

    // Buat instance ofetch dengan interceptor untuk authenticated requests
    this.$fetch = ofetch.create({
      baseURL: baseUrl,
      onRequest: async ({ options }) => {
        const token = await this.getTokenFn()
        if (token) {
          options.headers = {
            ...options.headers,
            Authorization: `Bearer ${token}`
          }
        }
      },
      onResponseError: async ({ request, options, response }) => {
        // Handle 401 dengan token refresh
        if (response.status === 401 && !options._isRetry) {
          // Cek apakah URL ini perlu di-skip dari auto refresh
          const requestUrl = typeof request === 'string' ? request : request.url
          const shouldSkipRefresh = this.skipRefreshUrls.some(skipUrl => {
            return requestUrl.includes(skipUrl)
          })

          // Skip refresh untuk public endpoints (login, register, dll)
          if (shouldSkipRefresh) {
            throw response
          }

          // Cek apakah ada refresh token sebelum mencoba refresh
          const hasRefreshToken = await this.hasRefreshToken()
          if (!hasRefreshToken) {
            // Tidak ada refresh token, langsung propagate error
            throw response
          }

          try {
            // Gunakan refresh queue untuk prevent multiple refresh
            const newToken = await this.queuedRefreshToken()

            // Simpan token baru
            await this.saveTokenFn(newToken)

            // Retry request dengan token baru
            options._isRetry = true
            options.headers = {
              ...options.headers,
              Authorization: `Bearer ${newToken}`
            }

            return this.$fetch(request, options)
          } catch (refreshError) {
            this.handleTokenRefreshFailure()
            throw refreshError
          }
        }

        // Propagate error untuk non-401 atau retry yang gagal
        throw response
      },
      ...options
    })
  }

  // Default: ambil token dari localStorage
  async defaultGetToken() {
    return localStorage.getItem('accessToken')
  }

  // Default: simpan token ke localStorage
  async defaultSaveToken(token) {
    localStorage.setItem('accessToken', token)
  }

  // Default: ambil refresh token dari localStorage
  async defaultGetRefreshToken() {
    return localStorage.getItem('refreshToken')
  }

  // Default: ambil refresh token expiration dari localStorage
  async defaultGetRefreshTokenExpiration() {
    return localStorage.getItem('refreshTokenExpiration')
  }

  // Cek apakah refresh token tersedia
  async hasRefreshToken() {
    const refreshToken = await this.getRefreshTokenFn()
    return refreshToken !== null && refreshToken !== undefined && refreshToken !== ''
  }

  // Queue refresh token untuk prevent race condition
  async queuedRefreshToken() {
    // Atomic check-and-set: jika sudah ada promise, return yang sama
    if (this.refreshPromise) {
      return this.refreshPromise
    }

    // Atomic: set promise dan flag sekaligus
    this.isRefreshing = true
    this.refreshPromise = this.refreshToken()
      .then(token => {
        this.isRefreshing = false
        this.refreshPromise = null
        return token
      })
      .catch(error => {
        this.isRefreshing = false
        this.refreshPromise = null
        throw error
      })

    return this.refreshPromise
  }

  // Refresh token logic
  async refreshToken() {
    const refreshToken = await this.getRefreshTokenFn()
    if (!refreshToken) {
      throw new Error('No refresh token available')
    }

    const refreshTokenExpiration = await this.getRefreshTokenExpirationFn()

    // Validasi expiration jika ada
    if (refreshTokenExpiration) {
      const currentTime = Math.floor(Date.now() / 1000)
      if (currentTime >= Number(refreshTokenExpiration)) {
        throw new Error('Refresh token expired')
      }
    }

    // Gunakan $fetchRaw untuk avoid infinite loop
    const response = await this.$fetchRaw(this.refreshTokenUrl, {
      method: 'POST',
      body: { refreshToken }
    })

    // Return new access token (ambil dari response dengan key apapun)
    return response.accessToken || response.newAccessToken || response.access_token || response.token
  }

  // Handle refresh failure
  handleTokenRefreshFailure() {
    if (this.onRefreshFailCallback) {
      this.onRefreshFailCallback()
    }
  }

  // Main fetch method
  async fetch(url, options = {}) {
    return this.$fetch(url, options)
  }
}