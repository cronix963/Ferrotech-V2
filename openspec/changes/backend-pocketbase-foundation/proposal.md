# Proposal: Backend PocketBase Foundation

## Intent

Replace hardcoded localStorage auth and seed data with a real backend. Currently: login accepts any password = `ferrotech2026`, all CRUD operates on in-memory arrays, zero persistence.

## Scope

### In Scope
- PB v0.23+ binary (win64), boot on localhost:8090
- Collection schemas + access rules: productos, clientes, usuarios
- Auth: PB email/password + JWT, token in localStorage
- Rewrite `pages/index.js` — `authWithPassword()`, route by `rol`
- Wire 3 stores to PB: fetch on init, write-through on mutations
- `lib/pocketbase.js` — SDK singleton

### Out of Scope
- Remaining 7 stores, view CRUD forms, Tienda API, POS, Reports
- Custom PB hooks, user registration

## Capabilities

### New Capabilities
- `backend-pocketbase`: PB binary, schemas, access rules
- `user-auth`: email/password + JWT via PB SDK
- `crud-inventory`: productos via PB collections
- `crud-admin`: usuarios + clientes via PB collections

### Modified Capabilities
None — no existing specs.

## Approach

1. **Binary**: Download PB into `backend/`, add `start.bat`
2. **Collections**: Map store shapes via Admin UI — `usuarios` (nombre, email, rol, estado), `clientes` (nombre, contacto, tel, email, tipo, estado), `productos` (nombre, categoria, stock, min, precio, unidad, estado)
3. **Access**: admin = full CRUD, cliente = read productos, vendedor = read clientes
4. **SDK**: Install `pocketbase` npm, create `lib/pocketbase.js`
5. **Auth**: Replace hardcoded password with `pb.collection('usuarios').authWithPassword()`
6. **Stores**: Replace seed data with PB `list()/create()/update()/delete()`. Keep sync cached `items` array for views

## Affected Areas

| Area | Impact |
|------|--------|
| `lib/pocketbase.js` | New |
| `backend/` | New |
| `pages/index.js` | Modified |
| `stores/*.store.js` (3 files) | Modified |
| `package.json` | Modified |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| PB binary incompatible with Windows | Low | v0.23+ ships win64 builds |
| Stores become async — views need loading | Med | Keep sync cached array, fetch once |
| SDK version mismatch | Low | Pin SDK to match PB binary version |

## Rollback Plan

1. Revert `pages/index.js` to localStorage auth
2. Revert stores to seed data (`items: [...seedData]`)
3. Delete `lib/pocketbase.js` + `backend/`
4. Remove `pocketbase` from package.json
5. Each item independently revertable

## Dependencies

- PocketBase v0.23+ binary from official releases
- `npm install pocketbase`
- Phase 1 stores interface exists before wiring

## Success Criteria

- [ ] Login rejects wrong password, accepts valid PB credentials
- [ ] PB token in localStorage survives page refresh
- [ ] All 3 stores load data from PB on page load
- [ ] Views show persisted data, not seed arrays
- [ ] Unauthenticated requests rejected by PB access rules
- [ ] App boots with `backend/start.bat` + `npm run dev`
