# Tasks: Foundation — Stores & Testing

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~1,300 (28 new files + package.json mods) |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1: Infra + libs + stores; PR 2: tests |
| Delivery strategy | ask-on-risk |
| Chain strategy | stacked-to-main |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: stacked-to-main
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Infra setup + lib utilities + all 10 stores | PR 1 | base = main; no deps |
| 2 | Tests for all stores + lib + verify coverage | PR 2 | base = main; depends on PR 1 being merged |

## Phase 1: Infrastructure

- [x] 1.1 `npm install zustand` (dep) + `npm install --save-dev jest @testing-library/react @testing-library/jest-dom babel-jest` (devDeps)
- [x] 1.2 Create `jest.config.js` with `testEnvironment: 'jsdom'`, `collectCoverageFrom` targeting `stores/` + `lib/`
- [x] 1.3 Create `babel.config.js` with `next/babel` preset for Jest transform
- [x] 1.4 Add `"test": "jest"`, `"test:watch": "jest --watch"`, `"test:coverage": "jest --coverage"` to `package.json` scripts

## Phase 2: Lib Utilities + Tests

- [x] 2.1 Create `lib/price.js` — export `parsePrice(str)` and `formatPrice(num)`
- [x] 2.2 Create `lib/validation.js` — export `validateRequired(obj, fields)`, `validateStock(stock, min)`, `validateEmail(email)`
- [x] 2.3 Write `__tests__/lib/price.test.js` — all formats (`Bs1,250.00`, `Bs8.50`, `Bs12,300.00`) + edge cases (empty, null)
- [x] 2.4 Write `__tests__/lib/validation.test.js` — required fields rejection + stock min warning

## Phase 3: Zustand Entity Stores

- [x] 3.1 Create `stores/productos.store.js` — 12 items seed (8 from ProductosView + 4 from tienda.js), search by nombre + categoria
- [x] 3.2 Create `stores/pedidos.store.js` — 7 items seed from PedidosView, search by id + cliente
- [x] 3.3 Create `stores/clientes.store.js` — 14 items seed (6 from ClientesView + 8 from vendedor.js), search by nombre + contacto + tipo
- [x] 3.4 Create `stores/compras.store.js` — 6 items seed from ComprasView, search by producto + proveedor
- [x] 3.5 Create `stores/ventas.store.js` — 7 items seed from VentasView, search by cliente + id
- [x] 3.6 Create `stores/proveedores.store.js` — 7 items seed from ProveedoresView, search by nombre + rubro
- [x] 3.7 Create `stores/envios.store.js` — 6 items seed from EnviosView, search by pedido + cliente + repartidor
- [x] 3.8 Create `stores/cotizaciones.store.js` — 6 items seed from CotizacionesView, search by cliente
- [x] 3.9 Create `stores/pagos-cobros.store.js` — 8 items seed from PagosCobrosView, search by cliente + concepto
- [x] 3.10 Create `stores/usuarios.store.js` — 6 items seed from UsuariosView, search by nombre + email + rol

## Phase 4: Store Tests

- [x] 4.1 Write `__tests__/stores/productos.test.js` — full CRUD + search + unknown-id edge cases
- [x] 4.2 Write `__tests__/stores/pedidos.test.js` — CRUD + search
- [x] 4.3 Write `__tests__/stores/clientes.test.js` — CRUD + search
- [x] 4.4 Write `__tests__/stores/compras.test.js` — CRUD + search
- [x] 4.5 Write `__tests__/stores/ventas.test.js` — CRUD + search
- [x] 4.6 Write `__tests__/stores/proveedores.test.js` — CRUD + search
- [x] 4.7 Write `__tests__/stores/envios.test.js` — CRUD + search
- [x] 4.8 Write `__tests__/stores/cotizaciones.test.js` — CRUD + search
- [x] 4.9 Write `__tests__/stores/pagos-cobros.test.js` — CRUD + search
- [x] 4.10 Write `__tests__/stores/usuarios.test.js` — CRUD + search

## Phase 5: Verification

- [x] 5.1 Run `npm test` — all 137 tests pass across 12 suites
- [x] 5.2 Run `npm run test:coverage` — **100%** line coverage on `stores/` + `lib/`
- [x] 5.3 Run `npm run build` — Next.js build succeeds with no errors
