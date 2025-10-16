import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { useCountdown } from '../src/composables/useCountdown.js';

describe('useCountdown', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  it('should initialize with correct remaining time', () => {
    const futureTime = Math.floor(Date.now() / 1000) + 3661; // 1 hour, 1 minute, 1 second ahead
    const countdown = useCountdown(futureTime);

    expect(countdown.hours.value).toBe('01');
    expect(countdown.minutes.value).toBe('01');
    expect(countdown.seconds.value).toBe('01');
    expect(countdown.remaining.value).toBe(3661);
  });

  it('should countdown every second', () => {
    const futureTime = Math.floor(Date.now() / 1000) + 10;
    const countdown = useCountdown(futureTime);

    expect(countdown.remaining.value).toBe(10);

    // Advance 1 second
    jest.advanceTimersByTime(1000);
    expect(countdown.remaining.value).toBe(9);

    // Advance another 2 seconds
    jest.advanceTimersByTime(2000);
    expect(countdown.remaining.value).toBe(7);
  });

  it('should format hours, minutes, seconds with leading zeros', () => {
    const futureTime = Math.floor(Date.now() / 1000) + 3665; // 1:01:05
    const countdown = useCountdown(futureTime);

    expect(countdown.hours.value).toBe('01');
    expect(countdown.minutes.value).toBe('01');
    expect(countdown.seconds.value).toBe('05');
  });

  it('should handle expired time (set remaining to 0)', () => {
    const pastTime = Math.floor(Date.now() / 1000) - 100;
    const countdown = useCountdown(pastTime);

    expect(countdown.remaining.value).toBe(0);
    expect(countdown.hours.value).toBe('00');
    expect(countdown.minutes.value).toBe('00');
    expect(countdown.seconds.value).toBe('00');
  });

  it('should call onExpired callback when time reaches 0', () => {
    const onExpired = jest.fn();
    const futureTime = Math.floor(Date.now() / 1000) + 2;
    useCountdown(futureTime, { onExpired });

    expect(onExpired).not.toHaveBeenCalled();

    jest.advanceTimersByTime(2000);
    expect(onExpired).toHaveBeenCalledTimes(1);
  });

  it('should allow updating onExpired handler dynamically', () => {
    const futureTime = Math.floor(Date.now() / 1000) + 2;
    const countdown = useCountdown(futureTime);

    const newHandler = jest.fn();
    countdown.onExpired(newHandler);

    jest.advanceTimersByTime(2000);
    expect(newHandler).toHaveBeenCalledTimes(1);
  });

  it('should call onSuccess handler when triggerSuccess is called', () => {
    const onSuccess = jest.fn();
    const futureTime = Math.floor(Date.now() / 1000) + 100;
    const countdown = useCountdown(futureTime);

    countdown.onSuccess(onSuccess);
    countdown.triggerSuccess();

    expect(onSuccess).toHaveBeenCalledTimes(1);
  });

  it('should stop countdown when triggerSuccess is called', () => {
    const futureTime = Math.floor(Date.now() / 1000) + 100;
    const countdown = useCountdown(futureTime);
    const initialRemaining = countdown.remaining.value;

    countdown.triggerSuccess();

    jest.advanceTimersByTime(5000);
    // Remaining should not change after triggerSuccess
    expect(countdown.remaining.value).toBe(initialRemaining);
  });

  it('should stop countdown after expired', () => {
    const futureTime = Math.floor(Date.now() / 1000) + 1;
    const countdown = useCountdown(futureTime);

    jest.advanceTimersByTime(1000);
    expect(countdown.remaining.value).toBe(0);

    // Continue advancing time, remaining should stay 0
    jest.advanceTimersByTime(5000);
    expect(countdown.remaining.value).toBe(0);
  });

  it('should not call onExpired if it is not a function', () => {
    const futureTime = Math.floor(Date.now() / 1000) + 1;
    const countdown = useCountdown(futureTime);

    // Should not throw error
    expect(() => {
      jest.advanceTimersByTime(1000);
    }).not.toThrow();
  });

  it('should not call onSuccess if it is not a function', () => {
    const futureTime = Math.floor(Date.now() / 1000) + 100;
    const countdown = useCountdown(futureTime);

    // Should not throw error
    expect(() => {
      countdown.triggerSuccess();
    }).not.toThrow();
  });

  it('should handle very large countdown times', () => {
    const futureTime = Math.floor(Date.now() / 1000) + 360000; // 100 hours
    const countdown = useCountdown(futureTime);

    expect(countdown.remaining.value).toBe(360000);
    expect(countdown.hours.value).toBe('100');
  });
});
