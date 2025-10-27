import { ref } from 'vue'

// Global SDK state
let sdkLoaded = false
let sdkLoading = false
let loadPromise = null

/**
 * Load Google SDK (singleton)
 */
function loadSDK() {
  if (sdkLoaded) return Promise.resolve()
  if (sdkLoading) return loadPromise

  sdkLoading = true
  loadPromise = new Promise((resolve, reject) => {
    if (window.google) {
      sdkLoaded = true
      sdkLoading = false
      resolve()
      return
    }

    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = () => {
      sdkLoaded = true
      sdkLoading = false
      resolve()
    }
    script.onerror = () => {
      sdkLoading = false
      reject(new Error('Failed to load Google SDK'))
    }
    document.head.appendChild(script)
  })

  return loadPromise
}

/**
 * Wrapper untuk Google Sign-In dengan auto SDK injection
 *
 * @param {Object} config - Konfigurasi
 * @param {string} config.clientId - Google Client ID
 * @param {Function} config.onSuccess - Callback sukses
 * @param {Function} [config.onError] - Callback error
 * @returns {Object} { login, isLoading, error }
 *
 * @example
 * const { login } = useGoogleLogin({
 *   clientId: 'YOUR_CLIENT_ID',
 *   onSuccess: ({ credential, user }) => console.log('Success!', user)
 * })
 */
export function useGoogleLogin({ clientId, onSuccess, onError } = {}) {
  const isLoading = ref(false)
  const error = ref(null)

  // Auto-load SDK if clientId provided
  if (clientId) {
    loadSDK().catch(err => {
      error.value = err
      if (onError) onError(err)
    })
  }

  const login = async () => {
    if (!clientId) {
      const err = new Error('clientId is required')
      error.value = err
      if (onError) onError(err)
      return
    }

    try {
      await loadSDK()
      isLoading.value = true
      error.value = null

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (response) => {
          isLoading.value = false

          // Decode credential untuk dapat user info
          const payload = JSON.parse(atob(response.credential.split('.')[1]))

          onSuccess({
            credential: response.credential,
            user: {
              id: payload.sub,
              email: payload.email,
              name: payload.name,
              picture: payload.picture,
              email_verified: payload.email_verified
            }
          })
        }
      })

      window.google.accounts.id.prompt()
    } catch (err) {
      error.value = err
      isLoading.value = false
      if (onError) onError(err)
    }
  }

  return { login, isLoading, error }
}
