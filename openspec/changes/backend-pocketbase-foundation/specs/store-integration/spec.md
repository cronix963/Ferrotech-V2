# Store-Integration Specification

## Purpose

Wire the 3 existing Zustand stores (`productos`, `clientes`, `usuarios`) to PocketBack collections, replacing in-memory seed data with live API calls. Keep a synchronous `items` cache for views while fetching fresh data on init and writing through on mutations.

## Requirements

### REQ-STORE-001: Productos store fetches from PocketBase

The `useProductosStore` MUST call `pb.collection('productos').getList()` on init to populate `items`. The `addItem`, `updateItem`, and `removeItem` actions MUST call the corresponding PB API (`create`, `update`, `delete`) and update the local cache with the server response.

| Store action  | PB API call                        | Local cache update |
|---------------|------------------------------------|--------------------|
| `fetchAll()`  | `getList(1, 200, { sort: '-created' })` | Replace `items` with response |
| `addItem(d)`  | `create(d)`                        | Append response to `items` |
| `updateItem(id, d)` | `update(id, d)`              | Replace item in `items` |
| `removeItem(id)` | `delete(id)`                    | Remove item from `items` |
| `getById(id)` | `getOne(id)` or cache lookup       | —                   |
| `search(q)`   | Cache filter (same as current)     | —                   |

#### Scenario: Store loads productos from PocketBase on init

- GIVEN the app starts and the user is authenticated
- WHEN `useProductosStore` initializes
- THEN `getList()` is called on the `productos` collection
- AND `items` is populated with the server response
- AND view components render the server data

#### Scenario: Adding a producto persists to PocketBase

- GIVEN the user is an admin
- WHEN they add a new producto via `addItem(data)`
- THEN `pb.collection('productos').create(data)` is called
- AND the returned record (with PB-generated `id`) is appended to `items`

#### Scenario: Store handles PocketBase error gracefully

- GIVEN PocketBase is unreachable
- WHEN the store tries to fetch productos
- THEN `items` remains as the last known state (or empty if first load)
- AND an `error` state is set for the UI to display

### REQ-STORE-002: Clientes store fetches from PocketBase

The `useClientesStore` MUST follow the same pattern as REQ-STORE-001 but targeting `pb.collection('clientes')`.

| Store action  | PB API call                     |
|---------------|---------------------------------|
| `fetchAll()`  | `getList(1, 200)`               |
| `addItem(d)`  | `create(d)`                     |
| `updateItem(id, d)` | `update(id, d)`           |
| `removeItem(id)` | `delete(id)`                 |

#### Scenario: Vendedor creates a cliente via store

- GIVEN the user is a vendedor
- WHEN they add a new cliente via `addItem(data)`
- THEN `pb.collection('clientes').create(data)` is called
- AND the operation succeeds (per REQ-COL-005 vendedor create rule)

### REQ-STORE-003: Usuarios store uses PB users collection

The `useUsuariosStore` MUST target PocketBase's built-in `users` collection (`pb.collection('users')`) — note the name difference from the store file (`usuarios.store.js` → `users`).

| Store action  | PB API call                     | Note                            |
|---------------|---------------------------------|----------------------------------|
| `fetchAll()`  | `getList(1, 200)`               | Only admin sees all (REQ-COL-006)|
| `addItem(d)`  | `create(d)`                     | Includes password field         |
| `updateItem(id, d)` | `update(id, d)`           | Cannot update password via this |
| `removeItem(id)` | `delete(id)`                 | Admin only                      |

#### Scenario: Usuarios store maps to PB users collection

- GIVEN the application is running
- WHEN `useUsuariosStore` calls fetchAll
- THEN the API call targets `http://localhost:8090/api/collections/users/records`
- AND the response items are mapped to the store's existing shape

### REQ-STORE-004: Loading state

Each store MUST expose an `isLoading` boolean that is `true` during API calls and `false` when idle. Views MAY use this to show a loading indicator.

#### Scenario: Loading state during fetch

- GIVEN the user navigates to a view that uses the store
- WHEN the store is fetching data from PocketBase
- THEN `isLoading` is `true`
- AND after the response arrives, `isLoading` returns to `false`

### REQ-STORE-005: Dashboard shows real counts

The dashboard page (`pages/dashboard.js`) MUST display real record counts from PocketBase instead of hardcoded numbers. It SHOULD call `getList(1, 1, { count: true })` or `getList(1, 200)` and use `totalItems` for each collection.

#### Scenario: Dashboard displays real record counts

- GIVEN an admin user is on the dashboard
- WHEN the dashboard components mount
- THEN they fetch record counts from PocketBase collections
- AND display the actual totals (not hardcoded seed data counts)

## Acceptance Criteria

- [ ] `useProductosStore` loads from `pb.collection('productos')` on init
- [ ] `useClientesStore` loads from `pb.collection('clientes')` on init
- [ ] `useUsuariosStore` loads from `pb.collection('users')` (not 'usuarios')
- [ ] All CRUD actions persist to PocketBase and update local cache
- [ ] Loading state is exposed and usable by views
- [ ] Error state is exposed and usable by views
- [ ] Dashboard shows real record counts from PB API

## Dependencies

- `lib/pocketbase.js` SDK singleton (REQ-AUTH-001)
- Collections spec (REQ-COL-001 through REQ-COL-006)
- Auth spec (REQ-AUTH-006 for 401 handling)
