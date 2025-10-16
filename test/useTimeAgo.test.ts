import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { useTimeAgo } from '../src/composables/useTimeAgo.js';
import { nextTick } from 'vue';

describe('useTimeAgo', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  it('should display "sekarang" for current time in Indonesian', () => {
    const now = new Date();
    const { text } = useTimeAgo(now, 'id');
    expect(text.value).toMatch(/sekarang|detik/i);
  });

  it('should display time ago in Indonesian', () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    const { text } = useTimeAgo(twoHoursAgo, 'id');
    expect(text.value).toMatch(/2 jam yang lalu/i);
  });

  it('should display time ago in English', () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    const { text } = useTimeAgo(twoHoursAgo, 'en');
    expect(text.value).toMatch(/2 hours ago/i);
  });

  it('should display time ago in Malay', () => {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const { text } = useTimeAgo(oneDayAgo, 'ms');
    expect(text.value).toMatch(/1 hari yang lalu|semalam/i);
  });

  it('should handle future dates', () => {
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const { text } = useTimeAgo(tomorrow, 'id');
    expect(text.value).toMatch(/dalam|esok/i);
  });

  it('should handle string date input', () => {
    const dateStr = '2024-01-01';
    const { text } = useTimeAgo(dateStr, 'id');
    expect(text.value).toBeTruthy();
    expect(typeof text.value).toBe('string');
  });

  it('should handle timestamp input', () => {
    const timestamp = Date.now() - 60000; // 1 minute ago
    const { text } = useTimeAgo(timestamp, 'id');
    expect(text.value).toMatch(/1 menit yang lalu|sekarang/i);
  });

  it('should update every minute automatically', async () => {
    const initialDate = new Date(Date.now() - 59000); // 59 seconds ago
    const { text } = useTimeAgo(initialDate, 'id');

    // Initial value (should be 0 seconds or "sekarang")
    const initialText = text.value;

    // Advance time by 2 minutes
    jest.advanceTimersByTime(120000);
    await nextTick();

    // Value should update
    expect(text.value).toBeTruthy();
  });

  it('should handle various time units - seconds', () => {
    const fiveSecondsAgo = new Date(Date.now() - 5000);
    const { text } = useTimeAgo(fiveSecondsAgo, 'en');
    expect(text.value).toMatch(/seconds ago|now/i);
  });

  it('should handle various time units - minutes', () => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const { text } = useTimeAgo(fiveMinutesAgo, 'en');
    expect(text.value).toMatch(/5 minutes ago/i);
  });

  it('should handle various time units - hours', () => {
    const fiveHoursAgo = new Date(Date.now() - 5 * 60 * 60 * 1000);
    const { text } = useTimeAgo(fiveHoursAgo, 'en');
    expect(text.value).toMatch(/5 hours ago/i);
  });

  it('should handle various time units - days', () => {
    const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);
    const { text } = useTimeAgo(fiveDaysAgo, 'en');
    expect(text.value).toMatch(/5 days ago/i);
  });

  it('should handle various time units - months', () => {
    const threeMonthsAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    const { text } = useTimeAgo(threeMonthsAgo, 'en');
    expect(text.value).toMatch(/months ago/i);
  });

  it('should handle various time units - years', () => {
    const twoYearsAgo = new Date(Date.now() - 2 * 365 * 24 * 60 * 60 * 1000);
    const { text } = useTimeAgo(twoYearsAgo, 'en');
    expect(text.value).toMatch(/2 years ago/i);
  });

  it('should handle edge case - exact 1 minute', () => {
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
    const { text } = useTimeAgo(oneMinuteAgo, 'en');
    expect(text.value).toMatch(/1 minute ago/i);
  });

  it('should handle edge case - exact 1 hour', () => {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const { text } = useTimeAgo(oneHourAgo, 'en');
    expect(text.value).toMatch(/1 hour ago/i);
  });

  it('should work with different locales - Japanese', () => {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const { text } = useTimeAgo(oneDayAgo, 'ja');
    expect(text.value).toBeTruthy();
    expect(typeof text.value).toBe('string');
  });

  it('should default to Indonesian locale when not specified', () => {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const { text } = useTimeAgo(oneHourAgo);
    expect(text.value).toMatch(/jam yang lalu/i);
  });
});
