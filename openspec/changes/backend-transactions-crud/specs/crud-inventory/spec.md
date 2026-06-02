# crud-inventory — Delta Spec

## Purpose

Connect ProductosView to the existing `useProductosStore` (wired to PB in Phase 3.1) and add loading/error/empty states.

## MODIFIED Requirements

### Requirement: ProductosView consumes useProductosStore

ProductosView MUST replace its hardcoded `const data = [...]` array with `useProductosStore()`. The view SHALL read `items`, `loading`, and `error` from the store and display appropriate states. (Previously: static render of seed array)

#### Scenario: View reads items from store — admin

- GIVEN `useProductosStore` has 8 items
- WHEN the view renders
- THEN all 8 items SHALL appear in the table
- AND items SHALL be mapped through `mapRecord()` (price as number, stock computed)

#### Scenario: Loading spinner — admin

- GIVEN the store is fetching (`loading` is `true`)
- WHEN the view renders
- THEN a `<Spinner>` SHALL replace the data table
- AND the search bar SHALL be disabled or hidden during loading

#### Scenario: Error banner with retry — admin

- GIVEN the store has an `error` set (e.g., "Failed to fetch")
- WHEN the view renders
- THEN the error message SHALL be displayed in a banner
- AND a "Reintentar" button SHALL call `fetchAll()` on click

#### Scenario: Empty state — admin

- GIVEN `items` is an empty array and `loading` is `false`
- WHEN the view renders
- THEN a message SHALL appear: "No hay productos registrados"
- AND the "Nuevo Producto" button SHALL remain visible

#### Scenario: "Agregar Producto" opens form — admin

- WHEN the user clicks "Nuevo Producto"
- THEN a modal/inline form SHALL appear
- AND validation SHALL use `validateRequired()` from `lib/validation.js`

#### Scenario: Form submit calls addItem — admin

- GIVEN the form is valid
- WHEN the user submits
- THEN `addItem(formData)` SHALL be called on the store
- AND the new product SHALL appear in the table on success

#### Scenario: Edit button calls updateItem — admin

- WHEN the user clicks edit on a product row
- THEN a pre-filled form SHALL open
- AND `updateItem(id, partial)` SHALL be called on submit

#### Scenario: Delete with confirmation — admin

- WHEN the user clicks delete
- THEN a confirmation dialog SHALL appear: "¿Eliminar producto?"
- AND `removeItem(id)` SHALL execute only after confirmation

#### Scenario: Search calls store search action — all roles

- WHEN the user types in the search input
- THEN the view SHALL call `get().search(query)` on `useProductosStore`
- AND display only matching results

#### Scenario: Price format changes from string to number — all roles

- GIVEN the store returns `precio` as a number (e.g., `8.50`)
- THEN the view SHALL use `formatPrice()` from `lib/price.js`
- AND display `Bs8.50` instead of the hardcoded `Bs8.50` string format
