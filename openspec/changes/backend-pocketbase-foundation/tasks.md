# Tasks: Backend PocketBase Foundation

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~370 |
| 400-line budget risk | Medium |
| Chained PRs recommended | No |
| Suggested split | single PR |
| Delivery strategy | single-pr |
| Chain strategy | size-exception |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: size-exception
400-line budget risk: Medium

## Phase 1: Foundation — SDK + Auth Infrastructure

- [x] 1.1 `package.json` — add `"pocketbase": "^0.21.0"` dependency
- [x] 1.2 `lib/pocketbase.js` — create SDK singleton (`new PocketBase('http://127.0.0.1:8090')`)
- [x] 1.3 `stores/auth.store.js` — create Zustand store with `{ token, user, rol, isAuthenticated, set(), reset(), logout() }`
- [x] 1.4 `pages/_app.js` — add auth hydration on mount: check `pb.authStore.isValid`, sync to auth store

## Phase 2: Auth Wiring — Login + Guards

- [x] 2.1 `pages/index.js` — replace `setTimeout`+password check with `pb.collection('users').authWithPassword()`, route by `rol`
- [x] 2.2 `components/Header.js` — read user/role from `useAuthStore()` instead of `localStorage.getItem()`
- [x] 2.3 `pages/dashboard.js` — replace localStorage auth guard with `useAuthStore` check for `admin` role
- [x] 2.4 `pages/tienda.js` — replace localStorage auth guard with `useAuthStore` check for `cliente` role
- [x] 2.5 `pages/vendedor.js` — replace localStorage auth guard with `useAuthStore` check for `vendedor` role
- [x] 2.6 `pages/cliente.js` — replace localStorage auth guard with `useAuthStore` check for `cliente` role

## Phase 3: Data Stores — PocketBase Integration

- [x] 3.1 `stores/productos.store.js` — replace seed data with PB API (`pb.collection('productos')`), add `fetchAll()` on init, add `mapRecord()` for field mapping, expose `isLoading`+`error` state
- [x] 3.2 `stores/clientes.store.js` — same pattern targeting `pb.collection('clientes')`
- [x] 3.3 `stores/usuarios.store.js` — same pattern targeting `pb.collection('users')` (not `usuarios`)

## Phase 4: Dashboard Real Data

- [x] 4.1 `pages/dashboard.js` — fetch real record counts via `getList(1, 1).totalItems` for each collection on mount

## Phase 5: Documentation

- [x] 5.1 `docs/pocketbase-setup.md` — binary download URL, `backend/start.bat`, collection import via Admin UI, seed user creation
