# Tasks: Backend Transactions CRUD

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~1,500 (4 new + 7 rewritten + 10 modified = 21 files) |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1: Phase A + Phase B; PR 2: Phase C |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: pending
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Shared components + all 7 PB stores | PR 1 | base = main; ~975 lines, repetitive pattern — low review density |
| 2 | All 10 views refactored to stores | PR 2 | base = main after PR 1; ~525 lines, surgical per-view changes |

_Note: Each store rewrite follows the identical Phase 3.1 async PB pattern — once a reviewer has seen one, the other 6 are mechanical repeats. Similarly, all views follow the same loading/error/empty/CRUD template. The line count is inflated by repetition, not complexity._

## Phase 1: Shared Components (4 files)

- [x] 1.1 `components/LoadingSpinner.js` — centered Tailwind spinner, no dependencies
- [x] 1.2 `components/ErrorBanner.js` — error message display + "Reintentar" button via `onRetry` prop
- [x] 1.3 `components/EmptyState.js` — icon + message + action button, renders "Nuevo" button when provided
- [x] 1.4 `components/FormModal.js` — overlay wrapper with `title`, `children`, `onSave`, `onClose`, `saving` (disables save button)

## Phase 2: Stores → PocketBase (7 files)

_Each store: replace seed data with `pb.collection('X').getList(1, 200)`, add `loading`/`error` state, async CRUD, `mapRecord()`, `search()`, `getById()`. See `productos.store.js` for reference pattern._

- [x] 2.1 `stores/pedidos.store.js` — PB `pedidos`, search id/cliente, mapRecord items(json)/total(number)/codigo
- [x] 2.2 `stores/compras.store.js` — PB `compras`, search producto/proveedor, mapRecord items(json)/total(number)/codigo
- [x] 2.3 `stores/ventas.store.js` — PB `ventas`, search id/cliente, mapRecord items(json)/total(number)/metodoPago/codigo
- [x] 2.4 `stores/proveedores.store.js` — PB `proveedores`, search nombre/rubro, mapRecord default estado=Activo
- [x] 2.5 `stores/envios.store.js` — PB `envios`, search pedido/cliente/repartidor, mapRecord with text refs
- [x] 2.6 `stores/cotizaciones.store.js` — PB `cotizaciones`, search cliente, mapRecord items(json)/vigencia(date)/codigo
- [x] 2.7 `stores/pagos-cobros.store.js` — PB `pagos_cobros`, search cliente/concepto, mapRecord monto(number)/tipo(select)/codigo

## Phase 3: Views → Stores (10 files, ReportesView deferred)

_Each view: replace `const data = [...]` with store hook, render `<LoadingSpinner>` when loading, `<ErrorBanner>` on error with retry, `<EmptyState>` when items empty, wire Nuevo/Editar via `<FormModal>`, delete with `confirm()`. Use `formatPrice()` from `lib/price.js` for numeric price/total fields._

- [ ] 3.1 `ProductosView.js` — useProductosStore(), search via store.search(), formatPrice() for precio
- [ ] 3.2 `ClientesView.js` — useClientesStore(), CRUD forms via store actions
- [ ] 3.3 `UsuariosView.js` — useUsuariosStore(), CRUD forms via store actions
- [ ] 3.4 `PedidosView.js` — usePedidosStore(), formatPrice(total), CRUD with items(json) field
- [ ] 3.5 `ComprasView.js` — useComprasStore(), formatPrice(precio), CRUD form
- [ ] 3.6 `VentasView.js` — useVentasStore(), formatPrice(total/subtotal/impuesto), CRUD form
- [ ] 3.7 `ProveedoresView.js` — useProveedoresStore(), CRUD form with rubro/contacto fields
- [ ] 3.8 `EnviosView.js` — useEnviosStore(), CRUD form with direccion/transportista fields
- [ ] 3.9 `CotizacionesView.js` — useCotizacionesStore(), formatPrice(total/subtotal), CRUD with items(json)/vigencia
- [ ] 3.10 `PagosCobrosView.js` — usePagosCobrosStore(), formatPrice(monto), CRUD with tipo(select)/metodo
- [ ] 3.11 `ReportesView.js` — **Deferred to Phase 3.3** — add comment noting no changes in this change
