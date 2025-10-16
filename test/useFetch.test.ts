import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { useFetch } from '../src/wrapper/useFetch.js';
import { nextTick } from 'vue';

// Mock ofetch
jest.mock('ofetch', () => ({
  ofetch: jest.fn()
}));

import { ofetch } from 'ofetch';

describe('useFetch', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    // Don't mock Date.now() to avoid cache timestamp issues
    jest.spyOn(global.Date, 'now').mockRestore();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  describe('basic functionality', () => {
    it('should initialize with null data and no error', () => {
      const { data, error, loading } = useFetch('/api/test', {}, { immediate: false });

      expect(data.value).toBeNull();
      expect(error.value).toBeNull();
      expect(loading.value).toBe(false);
    });

    it('should fetch data immediately when immediate is true', async () => {
      const mockData = { id: 1, name: 'Test' };
      (ofetch as any).mockResolvedValueOnce(mockData);

      const { data, loading } = useFetch('/api/test');

      expect(loading.value).toBe(true);

      await jest.runAllTimersAsync();
      await nextTick();

      expect(data.value).toEqual(mockData);
      expect(loading.value).toBe(false);
    });

    it('should not fetch immediately when immediate is false', () => {
      useFetch('/api/test', {}, { immediate: false });
      expect(ofetch).not.toHaveBeenCalled();
    });

    it('should fetch data when refetch is called', async () => {
      const mockData = { id: 1, name: 'Test' };
      (ofetch as any).mockResolvedValueOnce(mockData);

      const { data, refetch, loading } = useFetch('/api/test', {}, { immediate: false });

      expect(loading.value).toBe(false);

      refetch();

      expect(loading.value).toBe(true);

      await jest.runAllTimersAsync();
      await nextTick();

      expect(data.value).toEqual(mockData);
      expect(loading.value).toBe(false);
    });

    it('should handle fetch errors', async () => {
      const mockError = new Error('Fetch failed');
      (ofetch as any).mockRejectedValueOnce(mockError);

      const { error, loading } = useFetch('/api/test');

      await jest.runAllTimersAsync();
      await nextTick();

      expect(error.value).toBe(mockError);
      expect(loading.value).toBe(false);
    });

    it('should pass options to ofetch', async () => {
      const mockData = { success: true };
      (ofetch as any).mockResolvedValueOnce(mockData);

      const options = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test: 'data' })
      };

      useFetch('/api/test', options);

      await jest.runAllTimersAsync();
      await nextTick();

      expect(ofetch).toHaveBeenCalledWith(
        '/api/test',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ test: 'data' })
        })
      );
    });
  });

  describe('caching', () => {
    it.skip('should cache data when cacheTime is set', async () => {
      const mockData = { id: 1, cached: true };
      (ofetch as any).mockResolvedValueOnce(mockData);

      const { data } = useFetch('/api/cached', {}, { cacheTime: 5000 });

      await jest.runAllTimersAsync();
      await nextTick();

      expect(data.value).toEqual(mockData);
      expect(ofetch).toHaveBeenCalledTimes(1);

      // Second fetch should use cache
      jest.clearAllMocks();
      const { data: data2 } = useFetch('/api/cached', {}, { cacheTime: 5000 });

      // Allow microtasks to complete
      await nextTick();
      await nextTick();
      await jest.runAllTimersAsync();
      await nextTick();

      expect(data2.value).toEqual(mockData);
      expect(ofetch).not.toHaveBeenCalled();
    });

    it('should expire cache after cacheTime', async () => {
      const mockData1 = { id: 1, version: 1 };
      const mockData2 = { id: 1, version: 2 };

      (ofetch as any).mockResolvedValueOnce(mockData1);

      const { data } = useFetch('/api/expire', {}, { cacheTime: 1000 });

      await jest.runAllTimersAsync();
      await nextTick();

      expect(data.value).toEqual(mockData1);

      // Advance time beyond cache expiry
      jest.advanceTimersByTime(1001);
      await nextTick();

      // New fetch should call ofetch again
      (ofetch as any).mockResolvedValueOnce(mockData2);
      const { data: data2 } = useFetch('/api/expire', {}, { cacheTime: 1000 });

      await jest.runAllTimersAsync();
      await nextTick();

      expect(data2.value).toEqual(mockData2);
      expect(ofetch).toHaveBeenCalledTimes(2);
    });

    it('should bypass cache when refetch is called', async () => {
      const mockData1 = { id: 1, version: 1 };
      const mockData2 = { id: 1, version: 2 };

      (ofetch as any).mockResolvedValueOnce(mockData1);

      const { data, refetch } = useFetch('/api/refetch', {}, { cacheTime: 5000 });

      await jest.runAllTimersAsync();
      await nextTick();

      expect(data.value).toEqual(mockData1);

      // Refetch should bypass cache
      (ofetch as any).mockResolvedValueOnce(mockData2);
      await refetch();

      await jest.runAllTimersAsync();
      await nextTick();

      expect(data.value).toEqual(mockData2);
      expect(ofetch).toHaveBeenCalledTimes(2);
    });

    it('should clear cache when clearCache is called', async () => {
      const mockData1 = { id: 1, version: 1 };
      const mockData2 = { id: 1, version: 2 };

      (ofetch as any).mockResolvedValueOnce(mockData1);

      const { data, clearCache } = useFetch('/api/clear', {}, { cacheTime: 5000 });

      await jest.runAllTimersAsync();
      await nextTick();

      expect(data.value).toEqual(mockData1);

      clearCache();

      // Next fetch should not use cache
      (ofetch as any).mockResolvedValueOnce(mockData2);
      const { data: data2 } = useFetch('/api/clear', {}, { cacheTime: 5000 });

      await jest.runAllTimersAsync();
      await nextTick();

      expect(data2.value).toEqual(mockData2);
    });

    it('should create different cache keys for different methods', async () => {
      const getData = { type: 'GET' };
      const postData = { type: 'POST' };

      (ofetch as any).mockResolvedValueOnce(getData);
      const { data: getResult } = useFetch('/api/method', { method: 'GET' }, { cacheTime: 5000 });

      await jest.runAllTimersAsync();
      await nextTick();

      expect(getResult.value).toEqual(getData);

      // POST request should not use GET cache
      (ofetch as any).mockResolvedValueOnce(postData);
      const { data: postResult } = useFetch('/api/method', { method: 'POST' }, { cacheTime: 5000 });

      await jest.runAllTimersAsync();
      await nextTick();

      expect(postResult.value).toEqual(postData);
      expect(ofetch).toHaveBeenCalledTimes(2);
    });

    it('should enforce cache size limit', async () => {
      // Create 101 different cache entries (MAX_CACHE_SIZE is 100)
      for (let i = 0; i < 101; i++) {
        (ofetch as any).mockResolvedValueOnce({ id: i });
        useFetch(`/api/item${i}`, {}, { cacheTime: 10000 });
        await jest.runAllTimersAsync();
        await nextTick();
      }

      // First entry should be evicted
      jest.clearAllMocks();
      (ofetch as any).mockResolvedValueOnce({ id: 0, new: true });
      useFetch('/api/item0', {}, { cacheTime: 10000 });

      await jest.runAllTimersAsync();
      await nextTick();

      // Should fetch again since it was evicted
      expect(ofetch).toHaveBeenCalled();
    });
  });

  describe('abort controller', () => {
    it('should cancel previous request when new request is made', async () => {
      const mockData1 = { id: 1 };
      const mockData2 = { id: 2 };

      let abortCalled = false;
      (ofetch as any).mockImplementation((_url: string, options: any) => {
        options.signal.addEventListener('abort', () => {
          abortCalled = true;
        });
        return Promise.resolve(mockData1);
      });

      const { refetch } = useFetch('/api/abort', {}, { immediate: false });

      refetch();

      (ofetch as any).mockResolvedValueOnce(mockData2);
      refetch();

      await jest.runAllTimersAsync();
      await nextTick();

      expect(abortCalled).toBe(true);
    });

    it('should ignore AbortError', async () => {
      const abortError = new Error('Aborted');
      abortError.name = 'AbortError';

      (ofetch as any).mockRejectedValueOnce(abortError);

      const { error } = useFetch('/api/test');

      await jest.runAllTimersAsync();
      await nextTick();

      // AbortError should not set error state
      expect(error.value).toBeNull();
    });

    it('should set error for non-abort errors', async () => {
      const networkError = new Error('Network failed');
      networkError.name = 'NetworkError';

      (ofetch as any).mockRejectedValueOnce(networkError);

      const { error } = useFetch('/api/test');

      await jest.runAllTimersAsync();
      await nextTick();

      expect(error.value).toBe(networkError);
    });
  });

  describe('edge cases', () => {
    it('should handle empty response', async () => {
      (ofetch as any).mockResolvedValueOnce(null);

      const { data } = useFetch('/api/empty');

      await jest.runAllTimersAsync();
      await nextTick();

      expect(data.value).toBeNull();
    });

    it('should handle multiple concurrent fetches to same URL', async () => {
      const mockData = { id: 1, concurrent: true };
      (ofetch as any).mockResolvedValue(mockData);

      const fetch1 = useFetch('/api/concurrent');
      const fetch2 = useFetch('/api/concurrent');
      const fetch3 = useFetch('/api/concurrent');

      await jest.runAllTimersAsync();
      await nextTick();

      expect(fetch1.data.value).toEqual(mockData);
      expect(fetch2.data.value).toEqual(mockData);
      expect(fetch3.data.value).toEqual(mockData);
    });

    it('should reset error on successful refetch', async () => {
      const mockError = new Error('First error');
      (ofetch as any).mockRejectedValueOnce(mockError);

      const { error, refetch, data } = useFetch('/api/retry', {}, { immediate: false });

      await refetch();
      await jest.runAllTimersAsync();
      await nextTick();

      expect(error.value).toBe(mockError);

      // Successful retry
      const mockData = { success: true };
      (ofetch as any).mockResolvedValueOnce(mockData);

      await refetch();
      await jest.runAllTimersAsync();
      await nextTick();

      expect(error.value).toBeNull();
      expect(data.value).toEqual(mockData);
    });

    it('should handle URL with query parameters', async () => {
      const mockData = { results: [] };
      (ofetch as any).mockResolvedValueOnce(mockData);

      useFetch('/api/search?q=test&page=1');

      await jest.runAllTimersAsync();
      await nextTick();

      expect(ofetch).toHaveBeenCalledWith(
        '/api/search?q=test&page=1',
        expect.any(Object)
      );
    });

    it('should handle very large response data', async () => {
      const largeData = { items: new Array(10000).fill({ id: 1, data: 'test' }) };
      (ofetch as any).mockResolvedValueOnce(largeData);

      const { data } = useFetch('/api/large');

      await jest.runAllTimersAsync();
      await nextTick();

      expect(data.value).toEqual(largeData);
    });
  });
});
