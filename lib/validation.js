/**
 * Validate that required fields are present and non-empty.
 *
 * @param {Object} obj - The object to validate
 * @param {string[]} fields - Array of required field names
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateRequired(obj, fields) {
  const errors = [];
  for (const field of fields) {
    const val = obj[field];
    if (val === undefined || val === null || val === '') {
      errors.push(`El campo ${field} es requerido`);
    }
  }
  return { valid: errors.length === 0, errors };
}

/**
 * Validate that stock is not below the minimum threshold.
 *
 * @param {number} stock - Current stock level
 * @param {number} min - Minimum allowed stock
 * @returns {{ valid: boolean, message: string }}
 */
export function validateStock(stock, min) {
  if (stock < min) {
    return { valid: false, message: 'Stock por debajo del mínimo' };
  }
  return { valid: true, message: '' };
}

/**
 * Validate an email address format.
 *
 * @param {string} email
 * @returns {boolean}
 */
export function validateEmail(email) {
  if (!email) return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}
