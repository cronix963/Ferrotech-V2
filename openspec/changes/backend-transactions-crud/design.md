# Design: Backend Transactions CRUD

## Technical Approach

Wire 7 seed-data stores to PocketBase (following Phase 3.1 pattern) and refactor all 11 views to consume store hooks with loading/error/empty states. Introduce 4 shared components (`LoadingSpinner`, `ErrorBanner`, `EmptyState`, `FormModal`) to eliminate repetition. Each view keeps its own table markup — column variation across entities makes a generic `<DataTable>` more costly than it saves.

## Architecture Decisions

### Decision: Store API naming — `fetchAll()` vs `init()`

| Option | Tradeoff | Decision |
|--------|----------|----------|
| `init()` (user template) | Consistent with template but diverges from 3 existing Phase 3.1 stores | **Rejected** |
| `fetchAll()` (Phase 3.1 pattern) | Keeps all 10 stores uniform; views call same method regardless of entity | **Chosen** |

**Rationale**: 3 stores already use `fetchAll()`. Changing them would break nothing (they work), but teaching `init()` for 7 new ones creates cognitive overhead. All stores → `fetchAll()`.

### Decision: PB API — `getList()` vs `getFullList()`

| Option | Tradeoff | Decision |
|--------|----------|----------|
| `getFullList()` (user template) | Simpler, no pagination params | **Rejected** |
| `getList(1, 200)` (Phase 3.1 pattern) | Consistent with existing stores, handles >200 edge case | **Chosen** |

### Decision: Loading state scope

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Loading on `fetchAll()` only | Faster UX on add/update (no spinner) but users might tap buttons twice | **Rejected** |
| Loading on **all** CRUD ops | Consistent with Phase 3.1, prevents double-submit | **Chosen** |

### Decision: Generic `<DataTable>` component

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Create shared DataTable | 11 views × 7 columns = 77 column configs; each view has unique styling (badges, colors, actions) | **Rejected** |
| Self-contained tables per view | Duplicate table markup (~20 lines each) but full flexibility for per-column badges, conditional formatting, action buttons | **Chosen** |

## Data Flow

```
View (mount) ──→ useXStore.fetchAll() ──→ pb.collection('x').getList()
                    │                            │
                    ▼                            ▼
              loading=true                 PB responds
                    │                            │
                    ▼                            ▼
              mapRecord() ◄────────────────┘ (records[])
                    │
                    ▼
              items[] ──→ View re-renders table

User clicks Nuevo/Editar ──→ show FormModal
        │
        ▼
  Form submit ──→ addItem(data) / updateItem(id, data)
                      │
                      ▼
                pb.collection('x').create() / .update()
                      │
                      ▼
                mapRecord() → items[] updated

User clicks Eliminar ──→ confirm("¿Eliminar?") → removeItem(id)
                                                    │
                                                    ▼
                                              pb.collection('x').delete(id)
                                                    │
                                                    ▼
                                              items[] filtered
```

## Collection Schemas

| Collection | PK Strategy | Key Fields | Notes |
|---|---|---|---|
| `pedidos` | PB auto ID | codigo (unique), cliente (text), items (json), total (number), estado (select), tipo (select) | `codigo` = `#P-{n}`, `items` = `[{producto_id, nombre, cantidad, precio}]` |
| `compras` | PB auto ID | codigo (unique), proveedor (text), items (json), total (number), estado (select) | `codigo` = `#C-{n}`, no relation — text for backward compat |
| `ventas` | PB auto ID | codigo (unique), cliente (text), items (json), total (number), metodoPago (select), estado (select) | `codigo` = `#V-{n}` |
| `proveedores` | PB auto ID | nombre (text, req), contacto (text), telefono (text), email (text), rubro (text) | No estado field in PB — defaulted in `mapRecord()` |
| `envios` | PB auto ID | codigo (unique), pedido (text), direccion (text), transportista (text), estado (select) | `pedido` is text (not relation) — simpler, matches seed shape |
| `cotizaciones` | PB auto ID | codigo (unique), cliente (text), items (json), total (number), vigencia (date), estado (select) | `codigo` = `#Q-{n}` |
| `pagos_cobros` | PB auto ID | codigo (unique), tipo (select: pago/cobro), monto (number), concepto (text), metodo (select), fecha (date) | `codigo` = `#PAY-{n}` |

All collections get `created`/`updated` auto-fields. No custom relations — use text references for simplicity.

## Access Rules

| Collection | Admin | Vendedor | Cliente |
|---|---|---|---|
| pedidos | full CRUD | CRUD | read own, create own |
| compras | full CRUD | read | none |
| ventas | full CRUD | CRUD | read own |
| proveedores | full CRUD | read | none |
| envios | full CRUD | CRUD linked to own pedidos | read own |
| cotizaciones | full CRUD | CRUD | create, read own |
| pagos_cobros | full CRUD | read | read own |
| productos | full CRUD | read | read |
| clientes | full CRUD | read | read own |

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `stores/pedidos.store.js` | Modify | Replace seed data with async PB pattern + `mapRecord()` |
| `stores/compras.store.js` | Modify | Same |
| `stores/ventas.store.js` | Modify | Same |
| `stores/proveedores.store.js` | Modify | Same, add `rubro` to `mapRecord()` |
| `stores/envios.store.js` | Modify | Same |
| `stores/cotizaciones.store.js` | Modify | Same |
| `stores/pagos-cobros.store.js` | Modify | Same |
| `components/LoadingSpinner.js` | Create | Centered spinner with Tailwind |
| `components/ErrorBanner.js` | Create | Error message + retry button + inline `onRetry` |
| `components/EmptyState.js` | Create | Icon + message + "Nuevo" button |
| `components/FormModal.js` | Create | Generic modal wrapper (overlay, title, children, save/cancel) |
| `components/views/ProductosView.js` | Modify | Replace `const data` with `useProductosStore()`, add loading/error/empty/CRUD |
| `components/views/ClientesView.js` | Modify | Same — `useClientesStore()` |
| `components/views/UsuariosView.js` | Modify | Same — `useUsuariosStore()` |
| `components/views/PedidosView.js` | Modify | Same — `usePedidosStore()` + `formatPrice()` for total |
| `components/views/ComprasView.js` | Modify | Same — `useComprasStore()` |
| `components/views/VentasView.js` | Modify | Same — `useVentasStore()` |
| `components/views/ProveedoresView.js` | Modify | Same — `useProveedoresStore()` |
| `components/views/EnviosView.js` | Modify | Same — `useEnviosStore()` |
| `components/views/CotizacionesView.js` | Modify | Same — `useCotizacionesStore()` |
| `components/views/PagosCobrosView.js` | Modify | Same — `usePagosCobrosStore()` |

**Total**: 7 modified stores, 4 created components, 11 modified views = 22 files.

## Interfaces / Contracts

### Store Shape (all 7 new stores)

```js
{
  items: [],           // mapped records
  loading: false,      // true during any async operation
  error: null,         // string | null
  fetchAll: async () => void,
  addItem: async (data) => void,
  updateItem: async (id, data) => void,
  removeItem: async (id) => void,
  getById: (id) => object | undefined,
  search: (query) => items[],
}
```

### mapRecord() pattern per entity

Each store defines its own `mapRecord(pbRecord)` that:
1. Reads PB fields (snake_case)
2. Falls back to defaults for fields not in PB schema
3. Returns camelCase shape matching what the existing view templates expect

### FormModal Props

```js
{
  title: string,
  children: ReactNode,     // form fields rendered by the view
  onSave: () => Promise<void>,
  onClose: () => void,
  saving: boolean,          // disables save button during async
}
```

## Testing Strategy

| Layer | What | Approach |
|-------|------|----------|
| Unit | Store `mapRecord()` transformations | Import store, call mapRecord with mock PB record, assert output shape |
| Unit | Store `fetchAll()` error handling | Mock `pb.collection().getList` to throw, assert `error` and `loading` states |
| Unit | View render with loading/error/empty states | Render each view with mocked store, assert spinner/banner/empty text |
| E2E | Full CRUD flow | Manual: open view, create record, verify in PB Admin, edit, delete |

## Migration / Rollout

No data migration required — 7 new collections start empty. Create collections via PB Admin UI before deploying. Each store-to-view connection is independently testable.

## Open Questions

- None — all decisions resolved from existing Phase 3.1 patterns and codebase analysis.
