# crud-transactions — Delta Spec

## Purpose

Wire pedidos, compras, ventas, and cotizaciones stores to PocketBase and connect their views to live data instead of seed arrays.

## MODIFIED Requirements

### Requirement: Stores fetch from PocketBase

The pedidos, compras, ventas, and cotizaciones stores MUST be modified from sync seed-data to async PB-backed stores following the Phase 3.1 pattern (productos.store.js). Each SHALL expose `fetchAll()`, `addItem()`, `updateItem()`, `removeItem()`, `getById()`, `search()`, plus `loading` and `error` state. (Previously: sync CRUD on seed arrays)

| Store | PB Collection | Searchable Fields |
|-------|--------------|-------------------|
| `usePedidosStore` | `pedidos` | id, cliente |
| `useComprasStore` | `compras` | producto, proveedor |
| `useVentasStore` | `ventas` | id, cliente |
| `useCotizacionesStore` | `cotizaciones` | cliente |

#### Scenario: Store fetches items on init — admin

- GIVEN the store has no items
- WHEN `fetchAll()` is called
- THEN `loading` SHALL be `true` during the request
- AND `items` SHALL contain the mapped PB records on success
- AND `loading` SHALL be `false` after completion

#### Scenario: Store handles network error — admin

- WHEN `fetchAll()` fails (PB unreachable)
- THEN `error` SHALL contain the error message
- AND `loading` SHALL be `false`
- AND `items` SHALL remain empty

#### Scenario: Create persists to PB — admin

- WHEN `addItem(data)` is called with valid data
- THEN PB collection SHALL receive a `create()` call
- AND the new record SHALL appear in `items` after success

#### Scenario: Delete removes from PB and UI — admin

- WHEN `removeItem(id)` is called
- THEN PB collection SHALL receive a `delete()` call
- AND the item SHALL be removed from `items`

### Requirement: Views consume stores instead of hardcoded data

PedidosView, ComprasView, VentasView, and CotizacionesView MUST replace their `const data = [...]` arrays with store hooks. Each SHALL display `<Spinner>` while `loading` is true, show an error banner with retry when `error` is set, and render "No hay {items}" when `items` is empty. (Previously: static render of seed array)

#### Scenario: View renders store data — admin

- GIVEN the store has 5 items and `loading` is `false`
- WHEN the view renders
- THEN the table SHALL display all 5 rows

#### Scenario: Loading state shows spinner — all roles

- GIVEN the store is fetching data (`loading` is `true`)
- WHEN the view renders
- THEN `<Spinner>` or a loading indicator SHALL be visible
- AND the data table SHALL NOT render

#### Scenario: Error state shows retry — all roles

- GIVEN the store has an error message
- WHEN the view renders
- THEN the error message SHALL be displayed
- AND a retry button SHALL call `fetchAll()` on click

#### Scenario: Empty state guides user — all roles

- GIVEN `items` is an empty array
- WHEN the view renders
- THEN a message SHALL appear (e.g., "No hay pedidos registrados")
- AND the "Nuevo" button SHALL remain visible

#### Scenario: "Nuevo" button opens form — admin

- WHEN the user clicks "Nuevo Pedido" (or Compra/Venta/Cotización)
- THEN a modal or inline form SHALL appear with required fields
- AND form validation SHALL use `validateRequired()` from `lib/validation.js`

#### Scenario: Form submit calls store addItem — admin

- GIVEN the form is valid
- WHEN the user submits
- THEN `addItem(formData)` SHALL be called on the store
- AND the form SHALL close on success

#### Scenario: Price display uses formatPrice — all roles

- WHEN a store returns numeric `total` (e.g., `1250.00`)
- THEN the view SHALL format it via `formatPrice()` from `lib/price.js`
- AND display `Bs1,250.00`

#### Scenario: Delete shows confirmation — admin

- WHEN the user clicks the delete/remove action
- THEN a confirmation dialog SHALL appear
- AND `removeItem(id)` SHALL execute only after confirmation
