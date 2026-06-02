# Testing Specification

## Purpose

Install Jest and React Testing Library to establish a test suite for store logic, price utilities, and data validation. Achieve >60% line coverage on `stores/` and `lib/` code.

## Requirements

### Requirement: Test runner installation

The system MUST install `jest`, `@testing-library/react`, `@testing-library/jest-dom`, and `babel-jest` as dev dependencies. A Jest config file (`jest.config.js` or in `package.json`) MUST exist with `testEnvironment: 'jsdom'`.

#### Scenario: Dependencies are installed

- GIVEN the project's `package.json` has no Jest dependencies
- WHEN `npm install --save-dev jest @testing-library/react @testing-library/jest-dom babel-jest` runs
- THEN `package.json` contains these devDependencies
- AND `npx jest --version` outputs a v29 version

#### Scenario: Jest can run a basic test

- GIVEN a file `__tests__/placeholder.test.js` with `test('works', () => expect(1+1).toBe(2))`
- WHEN `npx jest` is executed
- THEN the test passes with exit code 0

### Requirement: Test file organization

Tests MUST live in `__tests__/` at the project root, mirroring source structure. Price utility tests go in `__tests__/lib/price.test.js`. Store tests go in `__tests__/stores/{entity}.test.js`.

### Requirement: Store operation tests

Every store MUST have tests for add, update, delete, and search operations.

#### Scenario: Store CRUD tests pass

- GIVEN a fresh store instance with seed data
- WHEN add, update, delete, and search are tested in sequence
- THEN each operation produces the expected state change (see state-management spec scenarios)

#### Scenario: Update with unknown id

- GIVEN a store with items
- WHEN `updateItem(9999, { nombre: 'Ghost' })` is called
- THEN the store state does not change (no items modified)

#### Scenario: Delete with unknown id

- GIVEN a store with N items
- WHEN `removeItem(9999)` is called
- THEN items length remains N

### Requirement: Price utility tests

The `lib/price.js` module MUST have tests covering `parsePrice` and `formatPrice` for all supported formats.

#### Scenario: parsePrice handles all real-world formats

- GIVEN price strings `'Bs8.50'`, `'Bs1,250.00'`, `'Bs12,300.00'`, `'Bs0.80'`
- WHEN `parsePrice` is called for each
- THEN the results are `8.50`, `1250.00`, `12300.00`, `0.80` respectively

#### Scenario: parsePrice handles edge cases

- GIVEN an empty string and a `null` value
- WHEN `parsePrice('')` and `parsePrice(null)` are called
- THEN both return `0`

#### Scenario: formatPrice outputs correct format

- GIVEN numbers `1250`, `8.5`, and `0`
- WHEN `formatPrice` is called for each
- THEN results are `'Bs1,250.00'`, `'Bs8.50'`, `'Bs0.00'`

### Requirement: Data validation tests

A shared validation utility at `lib/validation.js` MUST be tested for required fields, numeric ranges, and stock limits.

#### Scenario: Required fields reject empty inputs

- GIVEN a validation schema requiring `nombre` and `precio`
- WHEN `validate({ nombre: '', precio: 0 })` is called
- THEN the result contains errors for `nombre`
- AND the result `isValid` is `false`

#### Scenario: Stock minimum validation

- GIVEN a product with `stock: 5` and `min: 10`
- WHEN `validateStock(stock, min)` is called
- THEN it returns a warning `'Stock por debajo del mínimo'`

### Requirement: Coverage threshold

The test suite MUST achieve >60% line coverage on `stores/` and `lib/` files combined. Coverage collection MUST be enabled in Jest config.

#### Scenario: Coverage report is generated

- GIVEN all store and utility tests pass
- WHEN `npx jest --coverage` runs
- THEN the coverage summary shows `stores/` and `lib/` lines covered >60%

### Requirement: npm scripts

The `package.json` MUST include scripts: `"test": "jest"`, `"test:watch": "jest --watch"`, and `"test:coverage": "jest --coverage"`.

#### Scenario: Test scripts exist and run

- GIVEN the project has Jest installed
- WHEN `npm test` runs
- THEN Jest executes all `__tests__/` files and reports results
