import { ref } from 'vue'

// Global SDK state
let sdkLoaded = false
let sdkLoading = false
let loadPromise = null

/**
 * Load Facebook SDK (singleton)
 */
function loadSDK(appId) {
  if (sdkLoaded) return Promise.resolve()
  if (sdkLoading) return loadPromise

  sdkLoading = true
  loadPromise = new Promise((resolve, reject) => {
    if (window.FB) {
      sdkLoaded = true
      sdkLoading = false
      resolve()
      return
    }

    window.fbAsyncInit = function() {
      window.FB.init({
        appId: appId,
        cookie: true,
        xfbml: true,
        version: 'v18.0'
      })
      sdkLoaded = true
      sdkLoading = false
      resolve()
    }

    const script = document.createElement('script')
    script.id = 'facebook-jssdk'
    script.src = 'https://connect.facebook.net/en_US/sdk.js'
    script.async = true
    script.defer = true
    script.onerror = () => {
      sdkLoading = false
      reject(new Error('Failed to load Facebook SDK'))
    }

    const firstScript = document.getElementsByTagName('script')[0]
    firstScript.parentNode.insertBefore(script, firstScript)
  })

  return loadPromise
}

/**
 * Wrapper untuk Facebook Login dengan auto SDK injection
 *
 * @param {Object} config - Konfigurasi
 * @param {string} config.appId - Facebook App ID
 * @param {Function} config.onSuccess - Callback sukses
 * @param {Function} [config.onError] - Callback error
 * @param {string} [config.scope] - Permissions scope
 * @returns {Object} { login, isLoading, error }
 *
 * @example
 * const { login } = useFacebookLogin({
 *   appId: 'YOUR_APP_ID',
 *   onSuccess: ({ accessToken, user }) => console.log('Success!', user)
 * })
 */
export function useFacebookLogin({ appId, onSuccess, onError, scope = 'public_profile,email' } = {}) {
  const isLoading = ref(false)
  const error = ref(null)

  // Auto-load SDK if appId provided
  if (appId) {
    loadSDK(appId).catch(err => {
      error.value = err
      if (onError) onError(err)
    })
  }

  const login = async () => {
    if (!appId) {
      const err = new Error('appId is required')
      error.value = err
      if (onError) onError(err)
      return
    }

    try {
      await loadSDK(appId)
      isLoading.value = true
      error.value = null

      window.FB.login((response) => {
        if (response.authResponse) {
          // Get user info
          window.FB.api('/me', { fields: 'id,name,email,picture' }, (userInfo) => {
            isLoading.value = false

            onSuccess({
              accessToken: response.authResponse.accessToken,
              user: {
                id: userInfo.id,
                email: userInfo.email,
                name: userInfo.name,
                picture: userInfo.picture?.data?.url || null
              }
            })
          })
        } else {
          isLoading.value = false
          const err = new Error('Login cancelled')
          error.value = err
          if (onError) onError(err)
        }
      }, { scope })
    } catch (err) {
      error.value = err
      isLoading.value = false
      if (onError) onError(err)
    }
  }

  return { login, isLoading, error }
}
