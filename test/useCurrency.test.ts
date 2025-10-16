import { describe, it, expect } from '@jest/globals';
import { useCurrency } from '../src/wrapper/useCurrency.js';

describe('useCurrency', () => {
  it('should format number with default value', () => {
    const currency = useCurrency(150000);
    expect(currency.format()).toBe('Rp 150.000');
  });

  it('should format with dynamic value', () => {
    const currency = useCurrency(0);
    expect(currency.format(250000)).toBe('Rp 250.000');
  });

  it('should format zero correctly', () => {
    const currency = useCurrency(0);
    expect(currency.format()).toBe('Rp 0');
  });

  it('should format negative numbers', () => {
    const currency = useCurrency(-50000);
    expect(currency.format()).toBe('-Rp 50.000');
  });

  it('should format large numbers with thousand separators', () => {
    const currency = useCurrency(1500000);
    expect(currency.format()).toBe('Rp 1.500.000');
  });

  it('should format very large numbers', () => {
    const currency = useCurrency(1000000000);
    expect(currency.format()).toBe('Rp 1.000.000.000');
  });

  it('should format million (juta)', () => {
    const currency = useCurrency(5000000);
    expect(currency.format()).toBe('Rp 5.000.000');
  });

  it('should format billion (milyar)', () => {
    const currency = useCurrency(2500000000);
    expect(currency.format()).toBe('Rp 2.500.000.000');
  });

  it('should format trillion (triliun)', () => {
    const currency = useCurrency(1000000000000);
    expect(currency.format()).toBe('Rp 1.000.000.000.000');
  });

  it('should not display decimal places', () => {
    const currency = useCurrency(150500);
    expect(currency.format()).toBe('Rp 150.500');
    expect(currency.format()).not.toContain(',');
  });

  it('should handle decimal numbers by rounding', () => {
    const currency = useCurrency(150500.75);
    // Intl.NumberFormat with minimumFractionDigits: 0 will round
    expect(currency.format()).toBe('Rp 150.501');
  });

  it('should round up decimal numbers >= 0.5', () => {
    const currency = useCurrency(1000.5);
    expect(currency.format()).toBe('Rp 1.001');
  });

  it('should round down decimal numbers < 0.5', () => {
    const currency = useCurrency(1000.4);
    expect(currency.format()).toBe('Rp 1.000');
  });

  it('should return "Invalid Number" for NaN', () => {
    const currency = useCurrency(NaN);
    expect(currency.format()).toBe('Invalid Number');
  });

  it('should return "Invalid Number" for undefined', () => {
    const currency = useCurrency(undefined as any);
    expect(currency.format()).toBe('Invalid Number');
  });

  it('should return "Invalid Number" for non-numeric string', () => {
    const currency = useCurrency('abc' as any);
    expect(currency.format()).toBe('Invalid Number');
  });

  it('should handle numeric string correctly when passed to format', () => {
    const currency = useCurrency(0);
    const result = currency.format('100000' as any);
    // String '100000' will be converted to number by Intl.NumberFormat
    expect(result).toBe('Rp 100.000');
  });

  it('should format 1', () => {
    const currency = useCurrency(1);
    expect(currency.format()).toBe('Rp 1');
  });

  it('should format 10', () => {
    const currency = useCurrency(10);
    expect(currency.format()).toBe('Rp 10');
  });

  it('should format 100', () => {
    const currency = useCurrency(100);
    expect(currency.format()).toBe('Rp 100');
  });

  it('should format 1000 with separator', () => {
    const currency = useCurrency(1000);
    expect(currency.format()).toBe('Rp 1.000');
  });

  it('should format 10000 with separator', () => {
    const currency = useCurrency(10000);
    expect(currency.format()).toBe('Rp 10.000');
  });

  it('should format 100000 with separator', () => {
    const currency = useCurrency(100000);
    expect(currency.format()).toBe('Rp 100.000');
  });

  it('should handle very small numbers', () => {
    const currency = useCurrency(0.01);
    expect(currency.format()).toBe('Rp 0');
  });

  it('should handle negative zero', () => {
    const currency = useCurrency(-0);
    expect(currency.format()).toBe('Rp 0');
  });

  it('should format with different initial value but override with format param', () => {
    const currency = useCurrency(1000000);
    expect(currency.format(500000)).toBe('Rp 500.000');
    expect(currency.format(2000000)).toBe('Rp 2.000.000');
  });

  it('should handle edge case: Infinity', () => {
    const currency = useCurrency(Infinity);
    expect(currency.format()).toBe('Invalid Number');
  });

  it('should handle edge case: -Infinity', () => {
    const currency = useCurrency(-Infinity);
    expect(currency.format()).toBe('Invalid Number');
  });

  it('should use Indonesian locale formatting', () => {
    const currency = useCurrency(1234567);
    const result = currency.format();
    // Indonesian uses period (.) as thousand separator
    expect(result).toContain('.');
    expect(result).toBe('Rp 1.234.567');
  });

  it('should have Rp prefix', () => {
    const currency = useCurrency(100);
    expect(currency.format()).toMatch(/^Rp /);
  });

  it('should handle multiple calls with same instance', () => {
    const currency = useCurrency(0);
    expect(currency.format(100000)).toBe('Rp 100.000');
    expect(currency.format(200000)).toBe('Rp 200.000');
    expect(currency.format(300000)).toBe('Rp 300.000');
  });

  it('should maintain initial value when calling format without params', () => {
    const currency = useCurrency(500000);
    expect(currency.format()).toBe('Rp 500.000');
    expect(currency.format()).toBe('Rp 500.000');
  });
});
