# Design: Foundation — Stores & Testing

## Technical Approach

Extract all 11 hardcoded data arrays into Zustand stores with a consistent CRUD + search API. Add Jest + RTL for store and utility testing. Views still reference inline data temporarily — Phase 3 wires stores to views when the backend API replaces seed data.

**Data flow after Phase 1:**

```
Component (uses inline data for now)
    ↓ (Phase 3)
Store (useXxxStore) ← seed-data.json (extracted arrays)
    ↓
lib/price.js (parsePrice / formatPrice)
lib/validation.js (validate / validateStock)
```

## Architecture Decisions

### `stores/{entity}.store.js`

Follows spec requirement — `.store.js` suffix avoids collisions with `lib/` or future modules. Export `use{Entity}Store` mirrors the file name.

### Single `items` array pattern

All 10 stores follow identical shape:

```js
import { create } from 'zustand';

const useProductosStore = create((set, get) => ({
  items: [...seedData],
  addItem: (item) => set((s) => ({ items: [...s.items, { ...item, id: nextId(s.items) }] })),
  updateItem: (id, partial) => set((s) => ({
    items: s.items.map((i) => (i.id === id ? { ...i, ...partial } : i)),
  })),
  removeItem: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
  getById: (id) => get().items.find((i) => i.id === id),
  search: (query) => {
    const q = query.toLowerCase();
    return get().items.filter((i) =>
      searchableFields.some((field) => String(i[field]).toLowerCase().includes(q))
    );
  },
}));
```

**Rationale**: Uniform API across entities reduces cognitive load. Next available ID via `Math.max(...ids) + 1`.

### Price stored as string, utility for conversion

Seed prices are `'Bs1,250.00'` strings. Stores store them as-is. `lib/price.js`:

```js
export const parsePrice = (str) => (!str ? 0 : parseFloat(str.replace(/[Bs,]/g, '')) || 0);
export const formatPrice = (num) =>
  'Bs' + num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
```

### Tests use `getState()` directly (no React mounting)

Store tests call `getState()` / `setState()` directly — no React needed. RTL is installed for future component tests but not required in Phase 1.

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `stores/productos.store.js` | Create | Productos store with seed data from ProductosView.js |
| `stores/pedidos.store.js` | Create | Pedidos store with seed data from PedidosView.js |
| `stores/clientes.store.js` | Create | Clientes store with seed data from ClientesView.js |
| `stores/compras.store.js` | Create | Compras store with seed data from ComprasView.js |
| `stores/ventas.store.js` | Create | Ventas store with seed data from VentasView.js |
| `stores/proveedores.store.js` | Create | Proveedores store with seed data from ProveedoresView.js |
| `stores/envios.store.js` | Create | Envíos store with seed data from EnviosView.js |
| `stores/cotizaciones.store.js` | Create | Cotizaciones store with seed data from CotizacionesView.js |
| `stores/pagos-cobros.store.js` | Create | Pagos/Cobros store with seed data from PagosCobrosView.js |
| `stores/usuarios.store.js` | Create | Usuarios store with seed data from UsuariosView.js |
| `lib/price.js` | Create | parsePrice + formatPrice utilities |
| `lib/validation.js` | Create | validate (required fields) + validateStock (min check) |
| `__tests__/lib/price.test.js` | Create | Price parse/format tests |
| `__tests__/lib/validation.test.js` | Create | Validation tests |
| `__tests__/stores/productos.test.js` | Create | Full CRUD + search for productos (representative) |
| `package.json` | Modify | Add zustand dep + jest devDeps + test scripts |
| `jest.config.js` | Create | testEnvironment: jsdom, coverage config |
| `.babelrc` or `babel.config.js` | Create | Next-compatible Babel config for Jest |

## Seed Data Extraction

Each store's seed data = the `const data = [...]` array lifted from its matching view. Field names stay in Spanish.

| View → Store | Items |
|-------------|-------|
| `ProductosView` → `useProductosStore` | 8 |
| `PedidosView` → `usePedidosStore` | 7 |
| `ClientesView` → `useClientesStore` | 6 |
| `ComprasView` → `useComprasStore` | 6 |
| `VentasView` → `useVentasStore` | 7 |
| `ProveedoresView` → `useProveedoresStore` | 7 |
| `EnviosView` → `useEnviosStore` | 6 |
| `CotizacionesView` → `useCotizacionesStore` | 6 |
| `PagosCobrosView` → `usePagosCobrosStore` | 8 |
| `UsuariosView` → `useUsuariosStore` | 6 |

## Testing Strategy

| Layer | What | Approach |
|-------|------|----------|
| Unit — price | `parsePrice` all formats, `formatPrice` all formats, edge cases | Pure function — no mocking |
| Unit — validation | required fields, stock min warning | Pure function |
| Unit — store CRUD | addItem, updateItem, removeItem, unknown ids | `getState()` direct calls |
| Unit — store search | by name (case-insensitive), no-match returns empty | `getState()` direct calls |

Coverage threshold: >60% lines on `stores/*.store.js` + `lib/*.js`. No component tests in Phase 1.

## Migration

None. Seed data embedded per store. When Phase 3 adds the API layer, seed becomes initial fetch fallback. Prices remain strings until views adopt `parsePrice`/`formatPrice`.
