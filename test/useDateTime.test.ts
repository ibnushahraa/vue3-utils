import { describe, it, expect } from '@jest/globals';
import { useDateTime } from '../src/wrapper/useDateTime.js';

describe('useDateTime', () => {
  describe('format()', () => {
    it('should format date with default pattern', () => {
      const dt = useDateTime('2024-01-15 10:30:45');
      expect(dt.format()).toBe('15 Januari 2024 10:30:45');
    });

    it('should format date with custom pattern', () => {
      const dt = useDateTime('2024-03-25 14:20:30');
      expect(dt.format('DD/MM/YYYY')).toBe('25/03/2024');
    });

    it('should format with day only (D)', () => {
      const dt = useDateTime('2024-01-05 10:00:00');
      expect(dt.format('D')).toBe('5');
    });

    it('should format with day with leading zero (DD)', () => {
      const dt = useDateTime('2024-01-05 10:00:00');
      expect(dt.format('DD')).toBe('05');
    });

    it('should format with month number (MM)', () => {
      const dt = useDateTime('2024-03-15 10:00:00');
      expect(dt.format('MM')).toBe('03');
    });

    it('should format with month name (MMMM)', () => {
      const dt = useDateTime('2024-12-15 10:00:00');
      expect(dt.format('MMMM')).toBe('Desember');
    });

    it('should format all Indonesian month names correctly', () => {
      const months = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
      ];

      months.forEach((month, index) => {
        const monthNum = String(index + 1).padStart(2, '0');
        const dt = useDateTime(`2024-${monthNum}-15 10:00:00`);
        expect(dt.format('MMMM')).toBe(month);
      });
    });

    it('should format with 2-digit year (YY)', () => {
      const dt = useDateTime('2024-01-15 10:00:00');
      expect(dt.format('YY')).toBe('24');
    });

    it('should format with 4-digit year (YYYY)', () => {
      const dt = useDateTime('2024-01-15 10:00:00');
      expect(dt.format('YYYY')).toBe('2024');
    });

    it('should format with hours (HH)', () => {
      const dt = useDateTime('2024-01-15 09:30:00');
      expect(dt.format('HH')).toBe('09');
    });

    it('should format with minutes (mm)', () => {
      const dt = useDateTime('2024-01-15 10:05:00');
      expect(dt.format('mm')).toBe('05');
    });

    it('should format with seconds (ss)', () => {
      const dt = useDateTime('2024-01-15 10:30:08');
      expect(dt.format('ss')).toBe('08');
    });

    it('should format complex pattern', () => {
      const dt = useDateTime('2024-06-15 14:30:45');
      expect(dt.format('D MMMM YYYY, HH:mm:ss')).toBe('15 Juni 2024, 14:30:45');
    });

    it('should return "Invalid Date" for invalid date', () => {
      const dt = useDateTime('invalid-date');
      expect(dt.format()).toBe('Invalid Date');
    });

    it('should accept Date object as input', () => {
      const date = new Date('2024-01-15T10:30:45');
      const dt = useDateTime(date);
      expect(dt.format('DD/MM/YYYY')).toBe('15/01/2024');
    });

    it('should handle empty input (current date)', () => {
      const dt = useDateTime();
      const result = dt.format('YYYY');
      expect(result).toMatch(/^\d{4}$/);
    });
  });

  describe('add()', () => {
    it('should add seconds', () => {
      const dt = useDateTime('2024-01-15 10:30:00');
      const newDt = dt.add(30, 'seconds');
      expect(newDt.format('HH:mm:ss')).toBe('10:30:30');
    });

    it('should add minutes', () => {
      const dt = useDateTime('2024-01-15 10:30:00');
      const newDt = dt.add(15, 'minutes');
      expect(newDt.format('HH:mm')).toBe('10:45');
    });

    it('should add hours', () => {
      const dt = useDateTime('2024-01-15 10:30:00');
      const newDt = dt.add(3, 'hours');
      expect(newDt.format('HH:mm')).toBe('13:30');
    });

    it('should add days', () => {
      const dt = useDateTime('2024-01-15 10:00:00');
      const newDt = dt.add(5, 'days');
      expect(newDt.format('DD/MM/YYYY')).toBe('20/01/2024');
    });

    it('should add months', () => {
      const dt = useDateTime('2024-01-15 10:00:00');
      const newDt = dt.add(2, 'months');
      expect(newDt.format('MM/YYYY')).toBe('03/2024');
    });

    it('should add years', () => {
      const dt = useDateTime('2024-01-15 10:00:00');
      const newDt = dt.add(1, 'years');
      expect(newDt.format('YYYY')).toBe('2025');
    });

    it('should handle month overflow', () => {
      const dt = useDateTime('2024-01-31 10:00:00');
      const newDt = dt.add(1, 'months');
      // JavaScript Date handles this automatically (goes to next month)
      expect(newDt.format('DD/MM/YYYY')).toMatch(/^\d{2}\/03\/2024$/);
    });

    it('should handle year overflow in months', () => {
      const dt = useDateTime('2024-12-15 10:00:00');
      const newDt = dt.add(2, 'months');
      expect(newDt.format('MM/YYYY')).toBe('02/2025');
    });

    it('should throw error for invalid unit', () => {
      const dt = useDateTime('2024-01-15 10:00:00');
      expect(() => {
        dt.add(5, 'invalid' as any);
      }).toThrow('Invalid unit for add()');
    });

    it('should return same instance when adding to invalid date', () => {
      const dt = useDateTime('invalid');
      const newDt = dt.add(5, 'days');
      expect(newDt.isValid()).toBe(false);
    });

    it('should allow method chaining', () => {
      const dt = useDateTime('2024-01-15 10:00:00');
      const result = dt.add(1, 'days').add(2, 'hours').format('DD/MM/YYYY HH:mm');
      expect(result).toBe('16/01/2024 12:00');
    });
  });

  describe('subtract()', () => {
    it('should subtract seconds', () => {
      const dt = useDateTime('2024-01-15 10:30:30');
      const newDt = dt.subtract(15, 'seconds');
      expect(newDt.format('HH:mm:ss')).toBe('10:30:15');
    });

    it('should subtract minutes', () => {
      const dt = useDateTime('2024-01-15 10:30:00');
      const newDt = dt.subtract(15, 'minutes');
      expect(newDt.format('HH:mm')).toBe('10:15');
    });

    it('should subtract hours', () => {
      const dt = useDateTime('2024-01-15 10:30:00');
      const newDt = dt.subtract(3, 'hours');
      expect(newDt.format('HH:mm')).toBe('07:30');
    });

    it('should subtract days', () => {
      const dt = useDateTime('2024-01-15 10:00:00');
      const newDt = dt.subtract(5, 'days');
      expect(newDt.format('DD/MM/YYYY')).toBe('10/01/2024');
    });

    it('should subtract months', () => {
      const dt = useDateTime('2024-03-15 10:00:00');
      const newDt = dt.subtract(1, 'months');
      expect(newDt.format('MM/YYYY')).toBe('02/2024');
    });

    it('should subtract years', () => {
      const dt = useDateTime('2024-01-15 10:00:00');
      const newDt = dt.subtract(1, 'years');
      expect(newDt.format('YYYY')).toBe('2023');
    });

    it('should handle negative overflow', () => {
      const dt = useDateTime('2024-01-05 10:00:00');
      const newDt = dt.subtract(10, 'days');
      expect(newDt.format('DD/MM/YYYY')).toBe('26/12/2023');
    });

    it('should allow method chaining', () => {
      const dt = useDateTime('2024-01-15 10:00:00');
      const result = dt.subtract(1, 'days').subtract(2, 'hours').format('DD/MM/YYYY HH:mm');
      expect(result).toBe('14/01/2024 08:00');
    });
  });

  describe('toDate()', () => {
    it('should return native Date object', () => {
      const dt = useDateTime('2024-01-15 10:30:00');
      const date = dt.toDate();
      expect(date).toBeInstanceOf(Date);
      expect(date.getFullYear()).toBe(2024);
      expect(date.getMonth()).toBe(0); // January is 0
      expect(date.getDate()).toBe(15);
    });
  });

  describe('valueOf()', () => {
    it('should return timestamp in milliseconds', () => {
      const dt = useDateTime('2024-01-15 10:30:00');
      const timestamp = dt.valueOf();
      expect(typeof timestamp).toBe('number');
      expect(timestamp).toBeGreaterThan(0);
    });

    it('should return same timestamp as Date.getTime()', () => {
      const dateStr = '2024-01-15 10:30:00';
      const dt = useDateTime(dateStr);
      const nativeDate = new Date(dateStr.replace(' ', 'T'));
      expect(dt.valueOf()).toBe(nativeDate.getTime());
    });
  });

  describe('isValid()', () => {
    it('should return true for valid date', () => {
      const dt = useDateTime('2024-01-15 10:30:00');
      expect(dt.isValid()).toBe(true);
    });

    it('should return false for invalid date', () => {
      const dt = useDateTime('invalid-date');
      expect(dt.isValid()).toBe(false);
    });

    it('should return false for empty string', () => {
      const dt = useDateTime('');
      expect(dt.isValid()).toBe(false);
    });

    it('should return true for current date (no input)', () => {
      const dt = useDateTime();
      expect(dt.isValid()).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should handle leap year', () => {
      const dt = useDateTime('2024-02-29 10:00:00');
      expect(dt.isValid()).toBe(true);
      expect(dt.format('DD/MM/YYYY')).toBe('29/02/2024');
    });

    it('should handle non-leap year', () => {
      const dt = useDateTime('2023-02-29 10:00:00');
      // JavaScript Date auto-corrects invalid dates (2023-02-29 becomes 2023-03-01)
      expect(dt.isValid()).toBe(true);
      expect(dt.format('DD/MM/YYYY')).toBe('01/03/2023');
    });

    it('should handle timezone in date string', () => {
      const dt = useDateTime('2024-01-15T10:30:00Z');
      expect(dt.isValid()).toBe(true);
    });

    it('should handle midnight', () => {
      const dt = useDateTime('2024-01-15 00:00:00');
      expect(dt.format('HH:mm:ss')).toBe('00:00:00');
    });

    it('should handle end of day', () => {
      const dt = useDateTime('2024-01-15 23:59:59');
      expect(dt.format('HH:mm:ss')).toBe('23:59:59');
    });

    it('should handle century change', () => {
      const dt = useDateTime('1999-12-31 23:59:59');
      const newDt = dt.add(2, 'seconds');
      expect(newDt.format('YYYY-MM-DD HH:mm:ss')).toMatch(/2000-01-01 00:00:01/);
    });

    it('should chain multiple operations', () => {
      const dt = useDateTime('2024-01-15 10:00:00');
      const result = dt
        .add(1, 'years')
        .add(2, 'months')
        .subtract(5, 'days')
        .add(3, 'hours')
        .format('DD MMMM YYYY HH:mm');

      expect(result).toContain('2025');
      expect(result).toContain('13:00');
    });
  });
});
