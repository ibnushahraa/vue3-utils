import { Ref } from "vue";

export interface DeviceOptions {
  /**
   * Breakpoint untuk mobile dalam pixels
   * @default 768
   */
  mobileBreakpoint?: number;

  /**
   * Breakpoint untuk tablet dalam pixels
   * @default 1024
   */
  tabletBreakpoint?: number;
}

export interface DeviceReturn {
  /**
   * Reactive state indicating apakah device mobile (width < mobileBreakpoint)
   */
  isMobile: Ref<boolean>;

  /**
   * Reactive state indicating apakah device tablet (mobileBreakpoint <= width < tabletBreakpoint)
   */
  isTablet: Ref<boolean>;

  /**
   * Reactive state indicating apakah device desktop (width >= tabletBreakpoint)
   */
  isDesktop: Ref<boolean>;

  /**
   * Reactive window width dalam pixels
   */
  width: Ref<number>;

  /**
   * Reactive window height dalam pixels
   */
  height: Ref<number>;
}

/**
 * Reactive composable untuk deteksi device type (mobile/tablet/desktop) berdasarkan window size
 *
 * @example
 * ```ts
 * import { useDevice } from 'vue3-utils';
 *
 * const { isMobile, isTablet, isDesktop } = useDevice();
 *
 * // Conditional rendering
 * if (isMobile.value) {
 *   console.log('Mobile device detected');
 * }
 * ```
 *
 * @param options - Konfigurasi optional untuk breakpoints
 * @returns Object dengan reactive device states dan window dimensions
 */
export declare function useDevice(options?: DeviceOptions): DeviceReturn;
