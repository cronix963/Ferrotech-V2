import { validateRequired, validateStock, validateEmail } from '../../lib/validation';

describe('validateRequired', () => {
  test('returns valid:true when all fields present and non-empty', () => {
    const result = validateRequired({ nombre: 'Cemento', precio: 100 }, ['nombre', 'precio']);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('returns errors for missing fields', () => {
    const result = validateRequired({ nombre: '' }, ['nombre', 'precio']);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('El campo nombre es requerido');
    expect(result.errors).toContain('El campo precio es requerido');
  });

  test('returns error for null value', () => {
    const result = validateRequired({ nombre: null }, ['nombre']);
    expect(result.valid).toBe(false);
    expect(result.errors).toHaveLength(1);
  });

  test('returns error for undefined value', () => {
    const result = validateRequired({}, ['nombre']);
    expect(result.valid).toBe(false);
    expect(result.errors).toHaveLength(1);
  });
});

describe('validateStock', () => {
  test('returns valid when stock > min', () => {
    const result = validateStock(10, 5);
    expect(result.valid).toBe(true);
    expect(result.message).toBe('');
  });

  test('returns valid when stock equals min', () => {
    const result = validateStock(5, 5);
    expect(result.valid).toBe(true);
    expect(result.message).toBe('');
  });

  test('returns warning when stock < min', () => {
    const result = validateStock(3, 10);
    expect(result.valid).toBe(false);
    expect(result.message).toBe('Stock por debajo del mínimo');
  });

  test('returns warning when stock is 0', () => {
    const result = validateStock(0, 10);
    expect(result.valid).toBe(false);
    expect(result.message).toBe('Stock por debajo del mínimo');
  });
});

describe('validateEmail', () => {
  test('returns true for valid email format', () => {
    expect(validateEmail('user@example.com')).toBe(true);
  });

  test('returns true for email with subdomain', () => {
    expect(validateEmail('user@sub.example.com')).toBe(true);
  });

  test('returns false for string without @', () => {
    expect(validateEmail('invalid')).toBe(false);
  });

  test('returns false for string without domain', () => {
    expect(validateEmail('user@')).toBe(false);
  });

  test('returns false for empty string', () => {
    expect(validateEmail('')).toBe(false);
  });

  test('returns false for null', () => {
    expect(validateEmail(null)).toBe(false);
  });
});
