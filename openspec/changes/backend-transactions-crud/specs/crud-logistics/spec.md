# crud-logistics — Delta Spec

## Purpose

Wire proveedores, envios, and pagos-cobros stores to PocketBase and connect their views to live data instead of seed arrays.

## MODIFIED Requirements

### Requirement: Stores fetch from PocketBase

The proveedores, envios, and pagos-cobros stores MUST be modified from sync seed-data to async PB-backed stores following the Phase 3.1 pattern. Each SHALL expose `fetchAll()`, `addItem()`, `updateItem()`, `removeItem()`, `getById()`, `search()`, plus `loading` and `error` state. (Previously: sync CRUD on seed arrays)

| Store | PB Collection | Searchable Fields |
|-------|--------------|-------------------|
| `useProveedoresStore` | `proveedores` | nombre, rubro |
| `useEnviosStore` | `envios` | pedido, cliente, repartidor |
| `usePagosCobrosStore` | `pagos_cobros` | cliente, concepto |

#### Scenario: Store fetches items on init — admin

- GIVEN the store has no items
- WHEN `fetchAll()` is called
- THEN `loading` SHALL be `true` during the request
- AND `items` SHALL contain mapped PB records on success
- AND `loading` SHALL be `false` after completion

#### Scenario: Store handles network error — admin

- WHEN `fetchAll()` fails (PB unreachable)
- THEN `error` SHALL contain the error message
- AND `loading` SHALL be `false`
- AND `items` SHALL remain empty

#### Scenario: Update persists to PB — admin

- WHEN `updateItem(id, partial)` is called with valid data
- THEN PB collection SHALL receive an `update()` call
- AND the item SHALL reflect new values in `items`

#### Scenario: Create with numeric price field — admin

- WHEN `addItem(data)` is called with a numeric `monto` or `precio`
- THEN PB SHALL store it as a number (not formatted string)
- AND the view SHALL format display via `formatPrice()` from `lib/price.js`

### Requirement: Views consume stores instead of hardcoded data

ProveedoresView, EnviosView, and PagosCobrosView MUST replace their `const data = [...]` arrays with store hooks. Each SHALL display `<Spinner>` while `loading` is true, show an error banner with retry when `error` is set, and render "No hay {items}" when `items` is empty. (Previously: static render of seed array)

#### Scenario: View renders store data — admin

- GIVEN the store has items and `loading` is `false`
- WHEN the view renders
- THEN the table SHALL display all rows from the store

#### Scenario: Loading state shows spinner — all roles

- GIVEN the store is fetching (`loading` is `true`)
- WHEN the view renders
- THEN a loading indicator SHALL be visible
- AND the data table SHALL NOT render

#### Scenario: Error state shows retry — all roles

- GIVEN the store has an error message
- WHEN the view renders
- THEN the error message SHALL be displayed
- AND a retry button SHALL call `fetchAll()` on click

#### Scenario: Empty state — all roles

- GIVEN `items` is an empty array
- WHEN the view renders
- THEN a message SHALL appear (e.g., "No hay proveedores registrados")
- AND action buttons SHALL remain visible

#### Scenario: "Nuevo" button with validation — admin

- WHEN the user clicks "Nuevo Proveedor" (or Envío/Registro)
- THEN a form SHALL appear
- AND form validation SHALL use `validateRequired()` from `lib/validation.js`

#### Scenario: Form submit creates record — admin

- GIVEN the form is valid
- WHEN the user submits
- THEN `addItem(formData)` SHALL be called
- AND the form SHALL close on success

#### Scenario: Delete with confirmation — admin

- WHEN the user clicks delete
- THEN a confirmation dialog SHALL appear
- AND `removeItem(id)` SHALL execute only after confirmation
