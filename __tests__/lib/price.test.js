import { parsePrice, formatPrice } from '../../lib/price';

describe('parsePrice', () => {
  test('parses "Bs1,250.00" to 1250', () => {
    expect(parsePrice('Bs1,250.00')).toBe(1250);
  });

  test('parses "Bs8.50" to 8.5', () => {
    expect(parsePrice('Bs8.50')).toBe(8.5);
  });

  test('parses "Bs12,300.00" to 12300', () => {
    expect(parsePrice('Bs12,300.00')).toBe(12300);
  });

  test('parses "Bs0.80" to 0.8', () => {
    expect(parsePrice('Bs0.80')).toBe(0.8);
  });

  test('returns 0 for empty string', () => {
    expect(parsePrice('')).toBe(0);
  });

  test('returns 0 for null', () => {
    expect(parsePrice(null)).toBe(0);
  });

  test('returns 0 for undefined', () => {
    expect(parsePrice(undefined)).toBe(0);
  });

  test('returns 0 for invalid string', () => {
    expect(parsePrice('not-a-price')).toBe(0);
  });
});

describe('formatPrice', () => {
  test('formats 1250 to "Bs1,250.00"', () => {
    expect(formatPrice(1250)).toBe('Bs1,250.00');
  });

  test('formats 8.5 to "Bs8.50"', () => {
    expect(formatPrice(8.5)).toBe('Bs8.50');
  });

  test('formats 0 to "Bs0.00"', () => {
    expect(formatPrice(0)).toBe('Bs0.00');
  });

  test('formats 12300 to "Bs12,300.00"', () => {
    expect(formatPrice(12300)).toBe('Bs12,300.00');
  });

  test('formats 0.8 to "Bs0.80"', () => {
    expect(formatPrice(0.8)).toBe('Bs0.80');
  });
});

describe('parsePrice / formatPrice identity', () => {
  test('formatPrice(parsePrice(x)) returns original format for valid inputs', () => {
    const inputs = ['Bs1,250.00', 'Bs8.50', 'Bs12,300.00', 'Bs0.80'];
    for (const input of inputs) {
      expect(formatPrice(parsePrice(input))).toBe(input);
    }
  });
});
