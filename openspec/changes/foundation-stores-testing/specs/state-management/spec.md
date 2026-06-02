# State Management Specification

## Purpose

Extract all hardcoded data from component arrays into Zustand stores with a consistent API for reading, CRUD, filtering, and price formatting. 10 entity stores covering Products, Orders, Customers, Purchases, Sales, Providers, Quotes, Payments, Users, and Shipments.

## Requirements

### Requirement: Store creation

The system MUST create one Zustand store per entity using `create()` from `zustand`. Each store MUST be a named export following the `useXxxStore` pattern (e.g., `useProductosStore`). Store files MUST live in `stores/{entity}.store.js`.

#### Scenario: All ten stores are created

- GIVEN the project has no existing stores
- WHEN each entity store file is created under `stores/`
- THEN every file exports a function named `use{Entity}Store`
- AND each store is a valid Zustand store callable as a React hook

### Requirement: State shape

Each store MUST hold an `items` array and MAY hold derived state (loading, error, searchQuery). Every entity item MUST contain at minimum the fields found in its view's hardcoded data.

| Store | Minimum fields |
|-------|---------------|
| `useProductosStore` | id, nombre, categoria, stock, min, precio, unidad, estado |
| `useClientesStore` | id, nombre, contacto, tel, email, tipo, estado |
| `usePedidosStore` | id, cliente, fecha, total, items, pago, envio |
| `useComprasStore` | id, producto, proveedor, cantidad, unidad, precio, fecha, estado |
| `useVentasStore` | id, cliente, fecha, items, subtotal, impuesto, total, metodo, estado |
| `useProveedoresStore` | id, nombre, contacto, tel, email, rubro, estado |
| `useCotizacionesStore` | id, cliente, fecha, items, subtotal, total, validez, estado |
| `usePagosStore` | id, tipo, cliente, concepto, monto, fecha, metodo, estado |
| `useUsuariosStore` | id, nombre, email, rol, estado |
| `useEnviosStore` | id, pedido, cliente, direccion, repartidor, fecha_env, estado |

#### Scenario: State matches existing hardcoded data

- GIVEN a store is initialized without arguments
- WHEN the store is created
- THEN `items` contains the same seed data from the corresponding component's `const data = [...]` array

### Requirement: CRUD operations

Each store MUST expose `addItem(item)`, `updateItem(id, partial)`, and `removeItem(id)` actions.

#### Scenario: Add a new item

- GIVEN a store with N items
- WHEN `addItem({ nombre: 'Nuevo', ... })` is called
- THEN `items` length increases by 1
- AND the new item has a unique `id`

#### Scenario: Update an existing item

- GIVEN a store with an item `{ id: 1, nombre: 'Old' }`
- WHEN `updateItem(1, { nombre: 'New' })` is called
- THEN the item with `id: 1` has `nombre` equal to `'New'`
- AND other fields remain unchanged

#### Scenario: Delete an item

- GIVEN a store with N items including `{ id: 1, ... }`
- WHEN `removeItem(1)` is called
- THEN `items` length decreases by 1
- AND no item has `id` equal to 1

### Requirement: Filtering and search

Each store MUST expose a `search(query)` action that filters `items` by matching the query against searchable fields (nombre, id, email, etc. — matching the existing view's search behavior).

#### Scenario: Search by name

- GIVEN a store with items `[{ id: 1, nombre: 'Cemento' }, { id: 2, nombre: 'Varilla' }]`
- WHEN `search('cemento')` is called
- THEN the result contains only the item with `nombre` matching 'Cemento' (case-insensitive)

#### Scenario: Search returns empty for no match

- GIVEN a store with items
- WHEN `search('ZZZZZ')` is called
- THEN the result is an empty array

### Requirement: Price parsing and formatting

The system MUST provide a shared utility at `lib/price.js` with `parsePrice(str)` returning a number and `formatPrice(num)` returning the `'BsX,XXX.XX'` string format.

#### Scenario: Parse price with Bs prefix and commas

- GIVEN a string `'Bs1,250.00'`
- WHEN `parsePrice(str)` is called
- THEN the result is the number `1250.00`

#### Scenario: Parse price without commas

- GIVEN a string `'Bs8.50'`
- WHEN `parsePrice(str)` is called
- THEN the result is the number `8.50`

#### Scenario: Parse price with thousands separator

- GIVEN a string `'Bs12,300.00'`
- WHEN `parsePrice(str)` is called
- THEN the result is `12300.00`

#### Scenario: Format number to price string

- GIVEN a number `12300`
- WHEN `formatPrice(12300)` is called
- THEN the result is `'Bs12,300.00'`

### Requirement: Initial data seeding

Each store MUST initialize `items` by importing the existing hardcoded array from a seed file `stores/seed-data.ts` (or inline, until backend provides data).

#### Scenario: Store seeds from existing data

- GIVEN the existing hardcoded array in the view (e.g., `ProductosView.js` has 8 items)
- WHEN the store is first accessed
- THEN `items` contains exactly those 8 items with identical structure
