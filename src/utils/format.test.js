import { describe, it, expect } from 'vitest';
import { fmt } from './format';

describe('format utility', () => {
    it('formats a number as BDT currency with 2 decimal places', () => {
        expect(fmt(1000)).toBe('৳1,000.00');
    });

    it('formats a string number as BDT currency', () => {
        expect(fmt('500.5')).toBe('৳500.50');
    });

    it('handles zero correctly', () => {
        expect(fmt(0)).toBe('৳0.00');
    });

    it('formats USD correctly', () => {
        expect(fmt(1234.56, 'USD')).toBe('$1,234.56');
    });

    it('formats EUR correctly with German formatting', () => {
        expect(fmt(1234.56, 'EUR')).toBe('€1.234,56');
    });

    it('formats GBP correctly', () => {
        expect(fmt(1234.56, 'GBP')).toBe('£1,234.56');
    });

    it('formats INR correctly with Indian numbering system', () => {
        expect(fmt(100000.5, 'INR')).toBe('₹1,00,000.50');
    });

    it('formats AED correctly', () => {
        // Just verify it uses ar-AE formatting (Eastern Arabic numerals or standard Arabic format)
        // ar-AE localized numbers in modern systems: "د.إ.‏ 123,456.78" or "د.إ.‏ ١٢٣٬٤٥٦٫٧٨"
        // Let's assert it starts with standard AED symbol "د.إ"
        expect(fmt(1234.56, 'AED')).toContain('د.إ');
    });

    it('handles case insensitivity for currency codes', () => {
        expect(fmt(1000, 'usd')).toBe('$1,000.00');
    });

    it('handles invalid numbers gracefully by defaulting to 0', () => {
        expect(fmt('invalid_number')).toBe('৳0.00');
        expect(fmt(undefined)).toBe('৳0.00');
        expect(fmt(null)).toBe('৳0.00');
    });
});

