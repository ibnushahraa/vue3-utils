// composables/useDevice.js
import { ref, onMounted, onUnmounted } from "vue";

/**
 * @typedef {Object} DeviceOptions
 * @property {number} [mobileBreakpoint=768] - Breakpoint untuk mobile dalam pixels (default: 768px)
 * @property {number} [tabletBreakpoint=1024] - Breakpoint untuk tablet dalam pixels (default: 1024px)
 */

/**
 * @typedef {Object} DeviceReturn
 * @property {import('vue').Ref<boolean>} isMobile - Reactive state indicating apakah device mobile
 * @property {import('vue').Ref<boolean>} isTablet - Reactive state indicating apakah device tablet
 * @property {import('vue').Ref<boolean>} isDesktop - Reactive state indicating apakah device desktop
 * @property {import('vue').Ref<number>} width - Reactive window width dalam pixels
 * @property {import('vue').Ref<number>} height - Reactive window height dalam pixels
 */

/**
 * Reactive composable untuk deteksi device type (mobile/tablet/desktop) berdasarkan window size
 *
 * @example
 * // Basic usage
 * import { useDevice } from 'vue3-utils';
 *
 * const { isMobile, isTablet, isDesktop } = useDevice();
 *
 * // Conditional rendering
 * <div v-if="isMobile">Mobile View</div>
 * <div v-else-if="isTablet">Tablet View</div>
 * <div v-else>Desktop View</div>
 *
 * @example
 * // Custom breakpoints
 * const { isMobile, isDesktop, width } = useDevice({
 *   mobileBreakpoint: 640,  // mobile: < 640px
 *   tabletBreakpoint: 1280  // tablet: 640-1280px, desktop: >= 1280px
 * });
 *
 * console.log(`Window width: ${width.value}px`);
 *
 * @example
 * // Conditional logic berdasarkan device
 * const { isMobile } = useDevice();
 *
 * const welcomeWords = isMobile.value
 *   ? ['Halo!', 'Hi!', 'Hey!']
 *   : ['Halo! Ada yang bisa dibantu?', 'Hi! Bagaimana saya bisa membantu?'];
 *
 * @param {DeviceOptions} [options={}] - Konfigurasi optional untuk breakpoints
 * @returns {DeviceReturn} Object dengan reactive device states dan window dimensions
 */
export function useDevice(options = {}) {
  const { mobileBreakpoint = 768, tabletBreakpoint = 1024 } = options;

  const width = ref(0);
  const height = ref(0);
  const isMobile = ref(false);
  const isTablet = ref(false);
  const isDesktop = ref(false);

  /**
   * Update device type berdasarkan window width
   * @private
   */
  const updateDeviceType = () => {
    const currentWidth = window.innerWidth;
    width.value = currentWidth;
    height.value = window.innerHeight;

    if (currentWidth < mobileBreakpoint) {
      isMobile.value = true;
      isTablet.value = false;
      isDesktop.value = false;
    } else if (currentWidth >= mobileBreakpoint && currentWidth < tabletBreakpoint) {
      isMobile.value = false;
      isTablet.value = true;
      isDesktop.value = false;
    } else {
      isMobile.value = false;
      isTablet.value = false;
      isDesktop.value = true;
    }
  };

  /**
   * Throttle function untuk prevent excessive updates
   * @private
   */
  let timeoutId = null;
  const throttledUpdate = () => {
    if (timeoutId) return;

    timeoutId = setTimeout(() => {
      updateDeviceType();
      timeoutId = null;
    }, 100); // Update max every 100ms
  };

  // Initialize immediately if window is available (SSR safe)
  if (typeof window !== 'undefined') {
    updateDeviceType();
  }

  // Setup event listener on mount
  onMounted(() => {
    window.addEventListener("resize", throttledUpdate);
  });

  // Cleanup on unmount
  onUnmounted(() => {
    window.removeEventListener("resize", throttledUpdate);
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  });

  return {
    isMobile,
    isTablet,
    isDesktop,
    width,
    height,
  };
}
