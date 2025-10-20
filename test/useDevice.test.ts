import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { defineComponent } from 'vue';
import { mount } from '@vue/test-utils';
import { useDevice } from '../src/composables/useDevice.js';

describe('useDevice', () => {
  let resizeListeners: ((event: Event) => void)[] = [];

  // Helper to create a component that uses useDevice
  const createUseDeviceComponent = (options?: any) => {
    return defineComponent({
      setup() {
        const device = useDevice(options);
        return { ...device };
      },
      template: '<div></div>',
    });
  };

  beforeEach(() => {
    resizeListeners = [];

    // Mock window dimensions
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });

    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 768,
    });

    // Mock addEventListener
    jest.spyOn(window, 'addEventListener').mockImplementation((event: string, handler: any) => {
      if (event === 'resize') {
        resizeListeners.push(handler);
      }
    });

    // Mock removeEventListener
    jest.spyOn(window, 'removeEventListener').mockImplementation((event: string, handler: any) => {
      if (event === 'resize') {
        resizeListeners = resizeListeners.filter((listener) => listener !== handler);
      }
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // Helper function to trigger resize event
  const triggerResize = (width: number, height: number) => {
    (window as any).innerWidth = width;
    (window as any).innerHeight = height;
    resizeListeners.forEach((listener) => listener(new Event('resize')));
  };

  describe('initialization', () => {
    it('should initialize with current window dimensions', () => {
      const wrapper = mount(createUseDeviceComponent());

      expect(wrapper.vm.width).toBe(1024);
      expect(wrapper.vm.height).toBe(768);

      wrapper.unmount();
    });

    it('should detect desktop on initialization (width >= 1024)', () => {
      (window as any).innerWidth = 1920;
      const wrapper = mount(createUseDeviceComponent());

      expect(wrapper.vm.isMobile).toBe(false);
      expect(wrapper.vm.isTablet).toBe(false);
      expect(wrapper.vm.isDesktop).toBe(true);

      wrapper.unmount();
    });

    it('should detect tablet on initialization (768 <= width < 1024)', () => {
      (window as any).innerWidth = 800;
      const wrapper = mount(createUseDeviceComponent());

      expect(wrapper.vm.isMobile).toBe(false);
      expect(wrapper.vm.isTablet).toBe(true);
      expect(wrapper.vm.isDesktop).toBe(false);

      wrapper.unmount();
    });

    it('should detect mobile on initialization (width < 768)', () => {
      (window as any).innerWidth = 375;
      const wrapper = mount(createUseDeviceComponent());

      expect(wrapper.vm.isMobile).toBe(true);
      expect(wrapper.vm.isTablet).toBe(false);
      expect(wrapper.vm.isDesktop).toBe(false);

      wrapper.unmount();
    });
  });

  describe('resize handling', () => {
    it('should add resize event listener on mount', () => {
      const wrapper = mount(createUseDeviceComponent());

      expect(window.addEventListener).toHaveBeenCalledWith('resize', expect.any(Function));
      expect(resizeListeners.length).toBe(1);

      wrapper.unmount();
    });

    it('should update device type when resizing from desktop to mobile', async () => {
      (window as any).innerWidth = 1920;
      const wrapper = mount(createUseDeviceComponent());

      expect(wrapper.vm.isDesktop).toBe(true);
      expect(wrapper.vm.isMobile).toBe(false);

      // Simulate resize to mobile
      await new Promise<void>((resolve) => {
        triggerResize(375, 667);
        setTimeout(() => {
          expect(wrapper.vm.width).toBe(375);
          expect(wrapper.vm.isMobile).toBe(true);
          expect(wrapper.vm.isDesktop).toBe(false);
          wrapper.unmount();
          resolve();
        }, 150);
      });
    });

    it('should update device type when resizing from mobile to tablet', async () => {
      (window as any).innerWidth = 375;
      const wrapper = mount(createUseDeviceComponent());

      expect(wrapper.vm.isMobile).toBe(true);

      // Simulate resize to tablet
      await new Promise<void>((resolve) => {
        triggerResize(800, 600);
        setTimeout(() => {
          expect(wrapper.vm.width).toBe(800);
          expect(wrapper.vm.isMobile).toBe(false);
          expect(wrapper.vm.isTablet).toBe(true);
          wrapper.unmount();
          resolve();
        }, 150);
      });
    });

    it('should update device type when resizing from tablet to desktop', async () => {
      (window as any).innerWidth = 800;
      const wrapper = mount(createUseDeviceComponent());

      expect(wrapper.vm.isTablet).toBe(true);

      // Simulate resize to desktop
      await new Promise<void>((resolve) => {
        triggerResize(1920, 1080);
        setTimeout(() => {
          expect(wrapper.vm.width).toBe(1920);
          expect(wrapper.vm.isTablet).toBe(false);
          expect(wrapper.vm.isDesktop).toBe(true);
          wrapper.unmount();
          resolve();
        }, 150);
      });
    });

    it('should update height when resizing', async () => {
      const wrapper = mount(createUseDeviceComponent());

      expect(wrapper.vm.height).toBe(768);

      // Simulate resize
      await new Promise<void>((resolve) => {
        triggerResize(1024, 1200);
        setTimeout(() => {
          expect(wrapper.vm.height).toBe(1200);
          wrapper.unmount();
          resolve();
        }, 150);
      });
    });
  });

  describe('custom breakpoints', () => {
    it('should use custom mobileBreakpoint', () => {
      (window as any).innerWidth = 700;
      const wrapper = mount(createUseDeviceComponent({ mobileBreakpoint: 640 }));

      // 700 >= 640 and < 1024 (default tablet), so it's tablet
      expect(wrapper.vm.isMobile).toBe(false);
      expect(wrapper.vm.isTablet).toBe(true);

      wrapper.unmount();
    });

    it('should use custom tabletBreakpoint', () => {
      (window as any).innerWidth = 1100;
      const wrapper = mount(createUseDeviceComponent({ tabletBreakpoint: 1280 }));

      // 1100 >= 768 and < 1280, so it's tablet
      expect(wrapper.vm.isTablet).toBe(true);
      expect(wrapper.vm.isDesktop).toBe(false);

      wrapper.unmount();
    });

    it('should use both custom breakpoints', () => {
      (window as any).innerWidth = 900;
      const wrapper = mount(
        createUseDeviceComponent({
          mobileBreakpoint: 640,
          tabletBreakpoint: 1280,
        })
      );

      // 900 >= 640 and < 1280, so it's tablet
      expect(wrapper.vm.isMobile).toBe(false);
      expect(wrapper.vm.isTablet).toBe(true);
      expect(wrapper.vm.isDesktop).toBe(false);

      wrapper.unmount();
    });
  });

  describe('edge cases', () => {
    it('should handle exact mobileBreakpoint value (should be tablet)', () => {
      (window as any).innerWidth = 768;
      const wrapper = mount(createUseDeviceComponent());

      expect(wrapper.vm.isMobile).toBe(false);
      expect(wrapper.vm.isTablet).toBe(true);

      wrapper.unmount();
    });

    it('should handle exact tabletBreakpoint value (should be desktop)', () => {
      (window as any).innerWidth = 1024;
      const wrapper = mount(createUseDeviceComponent());

      expect(wrapper.vm.isTablet).toBe(false);
      expect(wrapper.vm.isDesktop).toBe(true);

      wrapper.unmount();
    });

    it('should handle very small screen (320px)', () => {
      (window as any).innerWidth = 320;
      const wrapper = mount(createUseDeviceComponent());

      expect(wrapper.vm.isMobile).toBe(true);
      expect(wrapper.vm.width).toBe(320);

      wrapper.unmount();
    });

    it('should handle very large screen (4K)', () => {
      (window as any).innerWidth = 3840;
      const wrapper = mount(createUseDeviceComponent());

      expect(wrapper.vm.isDesktop).toBe(true);
      expect(wrapper.vm.width).toBe(3840);

      wrapper.unmount();
    });

    it('should ensure only one device type is true at a time', () => {
      const checkExclusivity = (width: number) => {
        (window as any).innerWidth = width;
        const wrapper = mount(createUseDeviceComponent());

        const trueCount = [wrapper.vm.isMobile, wrapper.vm.isTablet, wrapper.vm.isDesktop].filter(
          Boolean
        ).length;
        expect(trueCount).toBe(1);

        wrapper.unmount();
      };

      checkExclusivity(320); // mobile
      checkExclusivity(375); // mobile
      checkExclusivity(768); // tablet
      checkExclusivity(800); // tablet
      checkExclusivity(1024); // desktop
      checkExclusivity(1920); // desktop
    });
  });

  describe('throttling', () => {
    it('should throttle resize events', async () => {
      const wrapper = mount(createUseDeviceComponent());

      // Trigger multiple resize events rapidly
      triggerResize(800, 600);
      triggerResize(900, 600);
      triggerResize(1000, 600);

      // Width should not update immediately for all events
      // due to throttling (100ms)
      expect(wrapper.vm.width).toBe(1024); // original value

      // Wait for throttle to complete
      await new Promise<void>((resolve) => {
        setTimeout(() => {
          // Should have the last value after throttle
          expect(wrapper.vm.width).toBe(1000);
          wrapper.unmount();
          resolve();
        }, 150);
      });
    });
  });

  describe('cleanup', () => {
    it('should remove resize listener on unmount', () => {
      const wrapper = mount(createUseDeviceComponent());

      // Component is using the composable
      expect(resizeListeners.length).toBe(1);

      // Unmount should remove listener
      wrapper.unmount();

      // Verify cleanup
      expect(window.removeEventListener).toHaveBeenCalledWith('resize', expect.any(Function));
    });
  });
});
