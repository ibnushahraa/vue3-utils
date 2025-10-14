/**
 * Composable untuk memeriksa status expirasi token
 * Memungkinkan pengecekan waktu kedaluwarsa token dan menjalankan callback yang sesuai
 *
 * @returns {Object} Objek dengan fungsi checkTokenExpiration
 * @property {Function} checkTokenExpiration - Fungsi untuk memeriksa apakah token sudah kedaluwarsa
 *
 * @example
 * const { checkTokenExpiration } = useAuthGuard()
 *
 * // Contoh penggunaan dengan fungsi logout
 * const isTokenValid = checkTokenExpiration(tokenExpTime, () => {
 *   // Jalankan fungsi logout atau reset autentikasi
 *   router.push('/logout')
 * })
 */
export function useAuthGuard() {
  const isTokenExpired = (refreshTokenExpiration, onExpiredCallback) => {
    const currentTime = Math.floor(Date.now() / 1000)
    const isExpired = currentTime >= refreshTokenExpiration

    if (isExpired) {
      onExpiredCallback()
      return true
    }

    return false
  }

  return isTokenExpired
}