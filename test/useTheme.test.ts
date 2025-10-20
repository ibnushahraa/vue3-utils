import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { useTheme } from '../src/composables/useTheme.js';

describe('useTheme', () => {
  let originalLocalStorage: Storage;
  let localStorageMock: { [key: string]: string };

  beforeEach(() => {
    // Mock localStorage
    localStorageMock = {};
    originalLocalStorage = global.localStorage;

    Object.defineProperty(global, 'localStorage', {
      value: {
        getItem: (key: string) => localStorageMock[key] || null,
        setItem: (key: string, value: string) => {
          localStorageMock[key] = value;
        },
        removeItem: (key: string) => {
          delete localStorageMock[key];
        },
        clear: () => {
          localStorageMock = {};
        },
      },
      writable: true,
      configurable: true,
    });

    // Mock matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation((query: string) => ({
        matches: query === '(prefers-color-scheme: dark)',
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });

    // Mock document.documentElement
    Object.defineProperty(document, 'documentElement', {
      value: {
        classList: {
          add: jest.fn(),
          remove: jest.fn(),
        },
        setAttribute: jest.fn(),
      },
      writable: true,
      configurable: true,
    });

    // Mock document.querySelector for Tailwind check
    const mockStyle = document.createElement('style');
    mockStyle.textContent = '@tailwind base;';
    jest.spyOn(document, 'querySelector').mockReturnValue(mockStyle);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    global.localStorage = originalLocalStorage;
  });

  describe('initialization', () => {
    it('should initialize with default options', () => {
      const { isDark } = useTheme();
      expect(isDark.value).toBeDefined();
    });

    it('should work even if Tailwind CSS is not detected', () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
      jest.spyOn(document, 'querySelector').mockReturnValue(null);

      const theme = useTheme();

      // Should still work and return valid functions
      expect(theme.isDark.value).toBe(false);
      expect(typeof theme.initTheme).toBe('function');
      expect(typeof theme.toggleTheme).toBe('function');

      consoleWarnSpy.mockRestore();
    });

    it('should not throw errors if Tailwind not detected', () => {
      jest.spyOn(document, 'querySelector').mockReturnValue(null);
      jest.spyOn(console, 'warn').mockImplementation();

      const { initTheme, toggleTheme, setTheme, watchSystemTheme } = useTheme();

      // Should not throw errors, functions should work normally
      expect(() => initTheme()).not.toThrow();
      expect(() => toggleTheme()).not.toThrow();
      expect(() => setTheme('dark')).not.toThrow();
      expect(() => watchSystemTheme()).not.toThrow();
    });
  });

  describe('initTheme', () => {
    it('should detect dark mode from system preference if no localStorage', () => {
      const { isDark, initTheme } = useTheme();

      initTheme();

      expect(isDark.value).toBe(true); // matchMedia mocked to return dark
    });

    it('should load theme from localStorage if available', () => {
      localStorageMock['theme'] = 'dark';

      const { isDark, initTheme } = useTheme();
      initTheme();

      expect(isDark.value).toBe(true);
    });

    it('should apply dark class to documentElement', () => {
      const { initTheme } = useTheme();
      localStorageMock['theme'] = 'dark';

      initTheme();

      expect(document.documentElement.classList.add).toHaveBeenCalledWith('dark');
      expect(document.documentElement.classList.remove).toHaveBeenCalledWith('light');
    });

    it('should apply light class to documentElement', () => {
      const { initTheme } = useTheme();
      localStorageMock['theme'] = 'light';

      // Mock matchMedia to return light mode
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(() => ({
          matches: false,
          media: '(prefers-color-scheme: dark)',
          addEventListener: jest.fn(),
        })),
      });

      initTheme();

      expect(document.documentElement.classList.add).toHaveBeenCalledWith('light');
      expect(document.documentElement.classList.remove).toHaveBeenCalledWith('dark');
    });
  });

  describe('toggleTheme', () => {
    it('should toggle from light to dark', () => {
      const { isDark, toggleTheme } = useTheme();
      isDark.value = false;

      toggleTheme();

      expect(isDark.value).toBe(true);
      expect(localStorageMock['theme']).toBe('dark');
    });

    it('should toggle from dark to light', () => {
      const { isDark, toggleTheme } = useTheme();
      isDark.value = true;

      toggleTheme();

      expect(isDark.value).toBe(false);
      expect(localStorageMock['theme']).toBe('light');
    });

    it('should save preference to localStorage', () => {
      const { toggleTheme } = useTheme();

      toggleTheme();

      expect(localStorageMock['theme']).toBeDefined();
    });
  });

  describe('setTheme', () => {
    it('should set theme to dark', () => {
      const { isDark, setTheme } = useTheme();

      setTheme('dark');

      expect(isDark.value).toBe(true);
      expect(localStorageMock['theme']).toBe('dark');
    });

    it('should set theme to light', () => {
      const { isDark, setTheme } = useTheme();

      setTheme('light');

      expect(isDark.value).toBe(false);
      expect(localStorageMock['theme']).toBe('light');
    });
  });

  describe('watchSystemTheme', () => {
    it('should set up event listener for system theme changes', () => {
      const addEventListenerSpy = jest.fn();

      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(() => ({
          matches: false,
          media: '(prefers-color-scheme: dark)',
          addEventListener: addEventListenerSpy,
        })),
      });

      const { watchSystemTheme } = useTheme();
      watchSystemTheme();

      expect(addEventListenerSpy).toHaveBeenCalledWith('change', expect.any(Function));
    });
  });

  describe('custom options', () => {
    it('should use custom storageKey', () => {
      const { toggleTheme } = useTheme({ storageKey: 'my-theme' });

      toggleTheme();

      expect(localStorageMock['my-theme']).toBeDefined();
      expect(localStorageMock['theme']).toBeUndefined();
    });

    it('should use custom darkValue and lightValue', () => {
      const { setTheme } = useTheme({
        darkValue: 'night',
        lightValue: 'day',
      });

      setTheme('night');
      expect(localStorageMock['theme']).toBe('night');

      setTheme('day');
      expect(localStorageMock['theme']).toBe('day');
    });

    it('should use data-theme attribute instead of class', () => {
      const { initTheme } = useTheme({ attribute: 'data-theme' });
      localStorageMock['theme'] = 'dark';

      initTheme();

      expect(document.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', 'dark');
    });
  });
});
