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
        use_fedcm_for_prompt: false, // Disable FedCM to avoid browser compatibility issues
        callback: (response) => {
          isLoading.value = false

          // Cleanup button container
          const container = document.getElementById('google-signin-button-temp')
          if (container) container.remove()

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

      // Use renderButton instead of prompt to avoid FedCM issues
      // Create temporary container
      const buttonContainer = document.createElement('div')
      buttonContainer.id = 'google-signin-button-temp'
      buttonContainer.style.display = 'none'
      document.body.appendChild(buttonContainer)

      // Render Google button
      window.google.accounts.id.renderButton(buttonContainer, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        text: 'continue_with',
        shape: 'rectangular'
      })

      // Programmatically click the button
      setTimeout(() => {
        const googleButton = buttonContainer.querySelector('div[role="button"]')
        if (googleButton) {
          googleButton.click()
        } else {
          isLoading.value = false
          buttonContainer.remove()
          if (onError) onError(new Error('Failed to create Google sign-in button'))
        }
      }, 100)
    } catch (err) {
      error.value = err
      isLoading.value = false

      // Cleanup button container if exists
      const container = document.getElementById('google-signin-button-temp')
      if (container) container.remove()

      if (onError) onError(err)
    }
  }

  return { login, isLoading, error }
}
