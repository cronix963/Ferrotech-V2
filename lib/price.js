/**
 * Parse a price string like 'Bs1,437.50' into a number (1437.50).
 * Handles 'Bs' prefix, commas as thousands separators, and edge cases (empty, null).
 *
 * @param {string|null|undefined} str
 * @returns {number}
 */
export function parsePrice(str) {
  if (!str) return 0;
  const cleaned = str.replace(/[Bs,]/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

/**
 * Format a number like 1437.50 into a price string 'Bs1,437.50'.
 * Handles decimals and thousands separator.
 *
 * @param {number} num
 * @returns {string}
 */
export function formatPrice(num) {
  const fixed = num.toFixed(2);
  const [intPart, decPart] = fixed.split('.');
  const withCommas = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `Bs${withCommas}.${decPart}`;
}
