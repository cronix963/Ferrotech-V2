# Proposal: Backend Transactions CRUD

## Intent

Wire 7 stores to PocketBase, connect all 11 views to real data. Phase 3.1 left views hardcoded — this eliminates the last seed data, making reads/writes real API calls with loading/error feedback.

## Scope

### In Scope
- 7 stores → PB: pedidos, compras, ventas, proveedores, envios, cotizaciones, pagos-cobros
- 11 views → stores: replace `const data = [...]` with store hooks
- CRUD forms: wire Nuevo/edit/delete to store actions
- Loading spinners + error banners in all views

### Out of Scope
- Tienda catalog, POS flow, Reports, Dashboard real-time (Phase 3.3)

## Capabilities

### New Capabilities
- `crud-transactions`: pedidos, compras, ventas, cotizaciones CRUD via PB
- `crud-logistics`: proveedores, envios, pagos-cobros CRUD via PB

### Modified Capabilities
- `crud-inventory`: productos view now consumes store (loading/error states)
- `crud-admin`: clientes + usuarios views now consume stores (loading/error states)

## Approach

1. **Stores**: Copy Phase 3.1 pattern — `fetchAll()`, `loading`, `error`, async CRUD, `mapRecord()`. Each targets a PB collection.
2. **Views**: Replace hardcoded arrays with `useXStore(s => s.items)`. Add `<Spinner>` on `loading`, error banner on `error`.
3. **CRUD actions**: Import store actions, attach to button onClick. Inline confirm for deletes.
4. **PB collections**: Create 7 collections matching store shapes. Admin = full, vendedor = read orders, almacén = read inventory-adjacent.
5. **Note**: The 3 already-wired stores (productos, clientes, usuarios) also need view refactoring — Phase 3.1 explicitly left views untouched.

## Affected Areas

| Area | Impact |
|------|--------|
| `stores/*.store.js` (7 files) | Modified |
| `components/views/*.js` (11 files) | Modified |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Price format mismatch (store numeric, views formatted) | Med | `formatCurrency()` helper in view |
| PB schema misalignment with store shapes | Med | `mapRecord()` at boundary (Phase 3.1 pattern) |
| Views break if stores not loaded | Low | Guard with `loading` check, show spinner |

## Rollback Plan

Revert stores to seed-data, views to hardcoded arrays, delete 7 PB collections. Each file independently revertable.

## Dependencies

- PocketBase running on localhost:8090
- Phase 3.1 (PB SDK, auth, 3 wired stores) complete
- 7 new PB collections via Admin UI

## Success Criteria

- [ ] All 7 stores fetch live PB data on page load
- [ ] All 11 views render store data, not hardcoded arrays
- [ ] Nuevo/create persists to PB and appears in list
- [ ] Delete removes from PB and UI
- [ ] Loading spinner visible during fetch
- [ ] Error banner shown on network failure
