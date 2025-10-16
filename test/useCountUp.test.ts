import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { useCountUp } from '../src/composables/useCountUp.js';

describe('useCountUp', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  it('should initialize with start value', () => {
    const { displayValue, currentValue } = useCountUp(100, { startValue: 0 });
    expect(displayValue.value).toBe('0');
    expect(currentValue.value).toBe(0);
  });

  it('should animate from start to end value', () => {
    const { displayValue, start } = useCountUp(100, { startValue: 0, duration: 1000 });
    start();

    jest.advanceTimersByTime(500);
    jest.runAllTicks();

    // After half duration, value should be somewhere between 0 and 100
    const halfway = parseFloat(displayValue.value);
    expect(halfway).toBeGreaterThan(0);
    expect(halfway).toBeLessThan(100);

    jest.advanceTimersByTime(500);
    jest.runAllTicks();

    expect(displayValue.value).toBe('100');
  });

  it.skip('should format with decimal places', () => {
    const { displayValue, start } = useCountUp(100.5, {
      startValue: 0,
      duration: 100,
      decimalPlaces: 2
    });
    start();

    jest.advanceTimersByTime(100);
    jest.runAllTicks();

    expect(displayValue.value).toBe('100.50');
  });

  it.skip('should format with thousand separator', () => {
    const { displayValue, start } = useCountUp(10000, {
      startValue: 0,
      duration: 100,
      separator: ','
    });
    start();

    jest.advanceTimersByTime(100);
    jest.runAllTicks();

    expect(displayValue.value).toBe('10,000');
  });

  it('should add prefix and suffix', () => {
    const { displayValue, start } = useCountUp(100, {
      startValue: 0,
      duration: 100,
      prefix: '$',
      suffix: ' USD'
    });
    start();

    jest.advanceTimersByTime(100);
    jest.runAllTicks();

    expect(displayValue.value).toBe('$100 USD');
  });

  it.skip('should use custom decimal separator', () => {
    const { displayValue, start } = useCountUp(100.5, {
      startValue: 0,
      duration: 100,
      decimalPlaces: 1,
      decimal: ','
    });
    start();

    jest.advanceTimersByTime(100);
    jest.runAllTicks();

    expect(displayValue.value).toBe('100,5');
  });

  it('should pause animation', () => {
    const { displayValue, start, pause } = useCountUp(100, {
      startValue: 0,
      duration: 1000
    });
    start();

    jest.advanceTimersByTime(300);
    jest.runAllTicks();

    const valueBeforePause = parseFloat(displayValue.value);
    pause();

    jest.advanceTimersByTime(500);
    jest.runAllTicks();

    // Value should not change after pause
    expect(parseFloat(displayValue.value)).toBe(valueBeforePause);
  });

  it('should resume animation', () => {
    const { displayValue, start, pause, resume } = useCountUp(100, {
      startValue: 0,
      duration: 1000
    });
    start();

    jest.advanceTimersByTime(300);
    jest.runAllTicks();
    pause();

    const valueAfterPause = parseFloat(displayValue.value);

    resume();
    jest.advanceTimersByTime(700);
    jest.runAllTicks();

    // Should reach 100 after resume
    expect(displayValue.value).toBe('100');
  });

  it('should reset to start value', () => {
    const { displayValue, start, reset } = useCountUp(100, {
      startValue: 0,
      duration: 1000
    });
    start();

    jest.advanceTimersByTime(500);
    jest.runAllTicks();

    expect(parseFloat(displayValue.value)).toBeGreaterThan(0);

    reset();
    expect(displayValue.value).toBe('0');
  });

  it('should update to new end value', () => {
    const { displayValue, start, update } = useCountUp(100, {
      startValue: 0,
      duration: 500
    });
    start();

    jest.advanceTimersByTime(500);
    jest.runAllTicks();

    expect(displayValue.value).toBe('100');

    // Update to new target
    update(500);
    jest.advanceTimersByTime(500);
    jest.runAllTicks();

    expect(displayValue.value).toBe('500');
  });

  it.skip('should call onComplete callback', () => {
    const onComplete = jest.fn();
    const { start } = useCountUp(100, {
      startValue: 0,
      duration: 100,
      onComplete
    });
    start();

    expect(onComplete).not.toHaveBeenCalled();

    jest.advanceTimersByTime(100);
    jest.runAllTicks();

    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it.skip('should use linear animation when useEasing is false', () => {
    const { displayValue, start, currentValue } = useCountUp(100, {
      startValue: 0,
      duration: 1000,
      useEasing: false
    });
    start();

    jest.advanceTimersByTime(500);
    jest.runAllTicks();

    // Linear should be exactly at 50 after half duration
    expect(Math.round(currentValue.value)).toBe(50);
  });

  it('should use custom easing function', () => {
    const customEasing = jest.fn((t, b, c, d) => {
      return b + c * (t / d); // linear
    });

    const { start } = useCountUp(100, {
      startValue: 0,
      duration: 100,
      easingFn: customEasing
    });
    start();

    jest.advanceTimersByTime(100);
    jest.runAllTicks();

    expect(customEasing).toHaveBeenCalled();
  });

  it('should handle negative values', () => {
    const { displayValue, start } = useCountUp(-100, {
      startValue: 0,
      duration: 100
    });
    start();

    jest.advanceTimersByTime(100);
    jest.runAllTicks();

    expect(displayValue.value).toBe('-100');
  });

  it('should handle counting down (end < start)', () => {
    const { displayValue, start } = useCountUp(0, {
      startValue: 100,
      duration: 100
    });
    start();

    jest.advanceTimersByTime(100);
    jest.runAllTicks();

    expect(displayValue.value).toBe('0');
  });

  it.skip('should format large numbers with separator', () => {
    const { displayValue, start } = useCountUp(1000000, {
      startValue: 0,
      duration: 100,
      separator: ','
    });
    start();

    jest.advanceTimersByTime(100);
    jest.runAllTicks();

    expect(displayValue.value).toBe('1,000,000');
  });

  it.skip('should handle decimal places with separator', () => {
    const { displayValue, start } = useCountUp(10000.99, {
      startValue: 0,
      duration: 100,
      decimalPlaces: 2,
      separator: ',',
      decimal: '.'
    });
    start();

    jest.advanceTimersByTime(100);
    jest.runAllTicks();

    expect(displayValue.value).toBe('10,000.99');
  });

  it('should not throw when pausing before starting', () => {
    const { pause } = useCountUp(100);
    expect(() => pause()).not.toThrow();
  });

  it('should not throw when resuming without pausing', () => {
    const { resume } = useCountUp(100);
    expect(() => resume()).not.toThrow();
  });

  it.skip('should handle zero duration gracefully', () => {
    const { displayValue, start } = useCountUp(100, {
      startValue: 0,
      duration: 0
    });
    start();

    jest.runAllTicks();

    // Should jump directly to end value
    expect(displayValue.value).toBe('100');
  });
});
