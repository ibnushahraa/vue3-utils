import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { useClipboard } from '../src/composables/useClipboard.js';
import { nextTick } from 'vue';

describe('useClipboard', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  describe('with Clipboard API support', () => {
    beforeEach(() => {
      Object.defineProperty(navigator, 'clipboard', {
        value: {
          writeText: jest.fn().mockResolvedValue(undefined)
        },
        writable: true,
        configurable: true
      });
    });

    it('should initialize with default values', () => {
      const { copied, copiedText, isSupported } = useClipboard();

      expect(copied.value).toBe(false);
      expect(copiedText.value).toBe('');
      expect(isSupported.value).toBe(true);
    });

    it('should copy text using Clipboard API', async () => {
      const { copy, copied, copiedText } = useClipboard();

      const result = await copy('Hello World');

      expect(result).toBe(true);
      expect(copied.value).toBe(true);
      expect(copiedText.value).toBe('Hello World');
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('Hello World');
    });

    it('should auto-reset copied state after duration', async () => {
      const { copy, copied } = useClipboard({ copiedDuration: 2000 });

      await copy('Test');
      expect(copied.value).toBe(true);

      jest.advanceTimersByTime(2000);
      await nextTick();

      expect(copied.value).toBe(false);
    });

    it('should use custom copiedDuration', async () => {
      const { copy, copied } = useClipboard({ copiedDuration: 5000 });

      await copy('Test');
      expect(copied.value).toBe(true);

      jest.advanceTimersByTime(4000);
      await nextTick();
      expect(copied.value).toBe(true);

      jest.advanceTimersByTime(1000);
      await nextTick();
      expect(copied.value).toBe(false);
    });

    it('should clear existing timeout when copying again', async () => {
      const { copy, copied } = useClipboard({ copiedDuration: 2000 });

      await copy('First');
      expect(copied.value).toBe(true);

      jest.advanceTimersByTime(1000);
      await copy('Second');

      // Should still be true because timer was reset
      jest.advanceTimersByTime(1500);
      await nextTick();
      expect(copied.value).toBe(true);

      jest.advanceTimersByTime(500);
      await nextTick();
      expect(copied.value).toBe(false);
    });

    it('should return false for empty text', async () => {
      const consoleWarn = jest.spyOn(console, 'warn').mockImplementation(() => {});
      const { copy } = useClipboard();

      const result = await copy('');

      expect(result).toBe(false);
      expect(consoleWarn).toHaveBeenCalledWith('useClipboard: text must be a non-empty string');
      consoleWarn.mockRestore();
    });

    it('should return false for non-string text', async () => {
      const consoleWarn = jest.spyOn(console, 'warn').mockImplementation(() => {});
      const { copy } = useClipboard();

      const result = await copy(null as any);

      expect(result).toBe(false);
      expect(consoleWarn).toHaveBeenCalledWith('useClipboard: text must be a non-empty string');
      consoleWarn.mockRestore();
    });

    it('should handle Clipboard API errors', async () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
      const error = new Error('Permission denied');
      (navigator.clipboard.writeText as any).mockRejectedValueOnce(error);

      const { copy, copied } = useClipboard();

      const result = await copy('Test');

      expect(result).toBe(false);
      expect(copied.value).toBe(false);
      expect(consoleError).toHaveBeenCalledWith('Clipboard API failed:', error);
      consoleError.mockRestore();
    });

    it('should fallback to execCommand when Clipboard API fails and legacy is enabled', async () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
      (navigator.clipboard.writeText as any).mockRejectedValueOnce(new Error('Failed'));

      document.execCommand = jest.fn().mockReturnValue(true);

      const { copy, copied } = useClipboard({ legacy: true });

      const result = await copy('Test');

      expect(result).toBe(true);
      expect(copied.value).toBe(true);
      expect(document.execCommand).toHaveBeenCalledWith('copy');

      consoleError.mockRestore();
    });
  });

  describe('without Clipboard API support (legacy)', () => {
    beforeEach(() => {
      Object.defineProperty(navigator, 'clipboard', {
        value: undefined,
        writable: true,
        configurable: true
      });
      document.execCommand = jest.fn().mockReturnValue(true);

      // Store original methods
      const originalAppendChild = document.body.appendChild.bind(document.body);
      const originalRemoveChild = document.body.removeChild.bind(document.body);

      document.body.appendChild = jest.fn((node) => {
        return originalAppendChild(node);
      });
      document.body.removeChild = jest.fn((node) => {
        return originalRemoveChild(node);
      });
    });

    it('should detect no Clipboard API support', () => {
      const { isSupported } = useClipboard();
      expect(isSupported.value).toBe(false);
    });

    it('should use execCommand as fallback', async () => {
      const { copy, copied, copiedText } = useClipboard({ legacy: true });

      const result = await copy('Hello World');

      expect(result).toBe(true);
      expect(copied.value).toBe(true);
      expect(copiedText.value).toBe('Hello World');
      expect(document.execCommand).toHaveBeenCalledWith('copy');
    });

    it('should not use legacy fallback when disabled', async () => {
      const { copy, copied } = useClipboard({ legacy: false });

      const result = await copy('Test');

      expect(result).toBe(false);
      expect(copied.value).toBe(false);
      expect(document.execCommand).not.toHaveBeenCalled();
    });

    it('should handle execCommand errors', async () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
      document.execCommand = jest.fn(() => {
        throw new Error('execCommand failed');
      });

      const { copy, copied } = useClipboard({ legacy: true });

      const result = await copy('Test');

      expect(result).toBe(false);
      expect(copied.value).toBe(false);
      expect(consoleError).toHaveBeenCalled();
      consoleError.mockRestore();
    });

    it('should create and remove temporary textarea', async () => {
      const appendChild = jest.fn((node) => node);
      const removeChild = jest.fn((node) => node);

      document.body.appendChild = appendChild;
      document.body.removeChild = removeChild;
      document.execCommand = jest.fn().mockReturnValue(true);

      const { copy } = useClipboard({ legacy: true });

      await copy('Test');

      expect(appendChild).toHaveBeenCalled();
      expect(removeChild).toHaveBeenCalled();

      // Check that textarea was created with correct properties
      const textarea = appendChild.mock.calls[0][0] as HTMLTextAreaElement;
      expect(textarea.value).toBe('Test');
      expect(textarea.style.position).toBe('fixed');
      expect(textarea.style.opacity).toBe('0');
    });

    it('should return false when execCommand returns false', async () => {
      document.execCommand = jest.fn().mockReturnValue(false);

      const { copy, copied } = useClipboard({ legacy: true });

      const result = await copy('Test');

      expect(result).toBe(false);
      expect(copied.value).toBe(false);
    });
  });

  describe('edge cases', () => {
    beforeEach(() => {
      Object.defineProperty(navigator, 'clipboard', {
        value: {
          writeText: jest.fn().mockResolvedValue(undefined)
        },
        writable: true,
        configurable: true
      });
    });

    it('should handle multiple rapid copy calls', async () => {
      const { copy, copied } = useClipboard({ copiedDuration: 2000 });

      await copy('First');
      await copy('Second');
      await copy('Third');

      expect(copied.value).toBe(true);

      jest.advanceTimersByTime(2000);
      await nextTick();

      expect(copied.value).toBe(false);
    });

    it('should handle very long text', async () => {
      const longText = 'A'.repeat(10000);
      const { copy, copiedText } = useClipboard();

      const result = await copy(longText);

      expect(result).toBe(true);
      expect(copiedText.value).toBe(longText);
    });

    it('should handle special characters', async () => {
      const specialText = '!@#$%^&*()_+{}[]|\\:;"\'<>?,./\n\t\r';
      const { copy, copiedText } = useClipboard();

      const result = await copy(specialText);

      expect(result).toBe(true);
      expect(copiedText.value).toBe(specialText);
    });

    it('should handle unicode characters', async () => {
      const unicodeText = '你好世界 🌍 مرحبا';
      const { copy, copiedText } = useClipboard();

      const result = await copy(unicodeText);

      expect(result).toBe(true);
      expect(copiedText.value).toBe(unicodeText);
    });

    it('should not update state when copy fails', async () => {
      (navigator.clipboard.writeText as any).mockRejectedValueOnce(new Error('Failed'));
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

      const { copy, copied, copiedText } = useClipboard({ legacy: false });

      const result = await copy('Test');

      expect(result).toBe(false);
      expect(copied.value).toBe(false);
      expect(copiedText.value).toBe('');

      consoleError.mockRestore();
    });
  });
});
