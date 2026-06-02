# crud-admin — Delta Spec

## Purpose

Connect ClientesView and UsuariosView to their existing PB-backed stores (wired in Phase 3.1) and add loading/error/empty states.

## MODIFIED Requirements

### Requirement: ClientesView consumes useClientesStore

ClientesView MUST replace its hardcoded `const data = [...]` array with `useClientesStore()`. The view SHALL read `items`, `loading`, and `error` from the store and display appropriate states. (Previously: static render of seed array)

#### Scenario: View renders store items — admin

- GIVEN `useClientesStore` has 6 items
- WHEN the view renders
- THEN all 6 rows SHALL display in the table
- AND contact, tel, email, tipo, estado SHALL render per the store shape

#### Scenario: Loading spinner — admin

- GIVEN the store is fetching (`loading` is `true`)
- WHEN the view renders
- THEN a loading indicator SHALL be visible
- AND the data table SHALL NOT render

#### Scenario: Error banner with retry — admin

- GIVEN the store has an error
- WHEN the view renders
- THEN the error message SHALL be displayed
- AND a retry button SHALL call `fetchAll()` on click

#### Scenario: Empty state — admin

- GIVEN `items` is empty
- WHEN the view renders
- THEN a message SHALL appear: "No hay clientes registrados"
- AND "Nuevo Cliente" button SHALL remain visible

#### Scenario: CRUD forms call store actions — admin

- WHEN "Nuevo Cliente" is clicked, a form SHALL appear with validation
- WHEN the form submits, `addItem()` SHALL be called
- WHEN edit is clicked, `updateItem()` SHALL be called
- WHEN delete is clicked with confirmation, `removeItem()` SHALL be called

### Requirement: UsuariosView consumes useUsuariosStore

UsuariosView MUST replace its hardcoded `const data = [...]` array with `useUsuariosStore()`. The view SHALL read `items`, `loading`, and `error` from the store. (Previously: static render of seed array)

#### Scenario: View renders store items — admin

- GIVEN `useUsuariosStore` has 6 users
- WHEN the view renders
- THEN all 6 rows SHALL display in the table
- AND nombre, email, rol, estado SHALL render per store shape

#### Scenario: Loading spinner — admin

- GIVEN the store is fetching (`loading` is `true`)
- WHEN the view renders
- THEN a loading indicator SHALL be visible
- AND the data table SHALL NOT render

#### Scenario: Error banner with retry — admin

- GIVEN the store has an error
- WHEN the view renders
- THEN the error message SHALL be displayed
- AND a retry button SHALL call `fetchAll()` on click

#### Scenario: Empty state — admin

- GIVEN `items` is empty
- WHEN the view renders
- THEN a message SHALL appear: "No hay usuarios registrados"
- AND "Nuevo" button SHALL remain visible

#### Scenario: CRUD forms call store actions — admin

- WHEN "Nuevo" is clicked, a form SHALL appear with validation
- WHEN the form submits, `addItem()` SHALL be called
- WHEN edit is clicked, `updateItem()` SHALL be called
- WHEN delete is clicked with confirmation, `removeItem()` SHALL be called
