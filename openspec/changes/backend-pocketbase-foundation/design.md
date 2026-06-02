# Design: Backend PocketBase Foundation

## Technical Approach

Wire the three stores (productos, clientes, usuarios) to PocketBase collections, replacing hardcoded seed data with live API calls. Auth moves from password check to `pb.collection('users').authWithPassword()`. A central `AuthProvider` wraps `_app.js` to hydrate session from localStorage on refresh. Views keep their own hardcoded data — rewiring views is explicit **out of scope** per proposal.

## Architecture Decisions

### Decision: AuthStore as separate Zustand store

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Zustand auth store (new) | Decoupled, clear concern; store already in deps | **Chosen** — matches existing store pattern |
| React Context only | No extra dep but loses persist/selector ergonomics | Rejected — Zustand already available |
| Inline in _app.js state | Simpler but no reusability across pages | Rejected — `Header.js` needs role/user on every page |

### Decision: AuthProvider wraps _app.js inline

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Wrap in `_app.js` directly | No new HOC file; simpler | **Chosen** — keep diff small, one function |
| New `components/AuthProvider.js` | Cleaner separation | Rejected — only 6 lines of wrapping logic |

### Decision: Store field mapping (store → PB)

| Store field | PB collection field | Notes |
|-------------|-------------------|-------|
| `productos.min` | *missing in spec* | **Open question** — store tracks reorder threshold but REQ-COL-001 omits it |
| `productos.estado` | derived from `stock` + `activo` | Computed in view, not stored; spec uses `activo` bool |
| `clientes.contacto` | *missing in spec* | Store has contact name, spec has only nombre + email + telefono |
| `clientes.tel` → `clientes.telefono` | `telefono` | Simple rename |
| `usuarios.estado` | *missing in spec* | Store tracks active/inactive; spec doesn't include this |
| `usuarios.rol` → PB `users.rol` | match | PB built-in users extended with `rol` select |

**Resolution**: Stores keep their current shape (no field rename). Each `fetchAll()` maps PB response fields to store shape via a `mapRecord()` helper. Missing fields get a default (e.g. `estado: 'Activo'`, `min: 0`). This avoids rewriting all views that expect `productos.min` and `clientes.tel`.

## Data Flow

```
                    ┌──────────────────────┐
                    │    _app.js            │
                    │  <AuthProvider>       │
                    │    └─ on mount:       │
                    │       pb.authStore    │
                    │       restore token   │
                    └──────┬───────────────┘
                           │ user/role
        ┌──────────────────┼──────────────────┐
        ▼                  ▼                   ▼
  pages/index.js    pages/dashboard.js    pages/tienda.js
  (login form)      (auth guard +         (auth guard +
   authWithPass()    fetchAll() per         local data)
   → auth store      collection)
                              │
                    ┌─────────▼──────────┐
                    │   Zustand Store     │
                    │  items[] (cache)    │
                    │  + fetchAll()       │
                    │  + addItem() → PB   │
                    │  + updateItem() → PB│
                    │  + removeItem() → PB│
                    └─────────┬──────────┘
                              │ pb.*()
                    ┌─────────▼──────────┐
                    │  lib/pocketbase.js  │
                    │  singleton instance │
                    │  → localhost:8090   │
                    └─────────────────────┘
```

### Auth Flow Detail

```
Login Submit
  → pb.collection('users').authWithPassword(email, pass)
  → Success: pb.authStore saves JWT to localStorage automatically
             authStore.set({ token, user: { ...record, rol } })
             router.push(routeMap[rol])
  → Error 400: show "Credenciales inválidas"
  → Network: show "Error de conexión con el servidor"

App Mount (AuthProvider)
  → Check pb.authStore.isValid
  → If valid: authStore.set({ token, user })  (hydrate Zustand)
  → If expired: pb.authStore.clear()
                 authStore.reset()
                 no redirect (individual pages guard)

401 Interceptor (global)
  → pb.authStore.clear()
  → authStore.reset()
  → window.location = '/'  (hard redirect, full state flush)
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `lib/pocketbase.js` | Create | SDK singleton, exports `pb` instance connected to `http://127.0.0.1:8090` |
| `stores/auth.store.js` | Create | Zustand store: `{ token, user, rol, isAuthenticated, set(), reset(), logout() }` |
| `pages/_app.js` | Modify | Wrap Component with auth hydration logic (check `pb.authStore.isValid` on mount, sync to auth store) |
| `stores/productos.store.js` | Modify | Replace `items: [...seedData]` with `items: []` + `fetchAll()` action; wrap CRUD with PB calls |
| `stores/clientes.store.js` | Modify | Same pattern as productos, targeting `pb.collection('clientes')` |
| `stores/usuarios.store.js` | Modify | Same pattern, targeting `pb.collection('users')` (note: PB built-in, not `usuarios`) |
| `pages/index.js` | Modify | Replace `setTimeout` + password check with `authWithPassword()`; add loading/error states |
| `pages/dashboard.js` | Modify | Replace localStorage auth guard with `useAuthStore` check; add real count fetches |
| `pages/tienda.js` | Modify | Replace localStorage auth guard with `useAuthStore` check |
| `pages/vendedor.js` | Modify | Replace localStorage auth guard with `useAuthStore` check |
| `pages/cliente.js` | Modify | Replace localStorage auth guard with `useAuthStore` check |
| `components/Header.js` | Modify | Replace `localStorage.getItem('ferrotech_user')` with `useAuthStore()` |
| `package.json` | Modify | Add `"pocketbase": "^0.21.0"` dependency |

## Interfaces / Contracts

```js
// lib/pocketbase.js
import PocketBase from 'pocketbase';
const pb = new PocketBase('http://127.0.0.1:8090');
export default pb;

// stores/auth.store.js
{
  token: null | string,
  user: null | object,      // PB user record (id, email, nombre, rol)
  rol: null | 'admin'|'cliente'|'vendedor',
  isAuthenticated: boolean,  // derived
  set: (authData) => void,  // pb.authWithPassword callback
  reset: () => void,        // clears everything
  logout: () => void,       // reset + pb.authStore.clear() + redirect
}

// Store pattern (applied to all 3 data stores)
{
  items: [],                // sync cache, same shape as current seed
  isLoading: false,
  error: null | string,
  fetchAll: () => Promise<void>,
  addItem: (data) => Promise<void>,
  updateItem: (id, data) => Promise<void>,
  removeItem: (id) => Promise<void>,
  getById: (id) => object | undefined,
  search: (query) => object[],
  // Internal helpers
  mapRecord: (pbRecord) => storeShape,  // pb → store field mapping
}
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | `lib/pocketbase.js` exports singleton | Import check, instanceof PocketBase |
| Unit | Auth store: set/reset/logout | State transitions, localStorage cleared |
| Unit | Store CRUD with mock PB | Jest mock `pb.collection().getList()`, verify state updates |
| Manual | Auth flow: login success/error, refresh persistence | Run app against PB binary |
| Manual | 401 auto-logout | Stop PB, wait for token expiry, verify redirect |

Testing is low-automation priority — existing test infrastructure is minimal (no runner detected, coverage threshold 0%). Manual verification against running PB binary is primary path.

## Migration / Rollout

1. Create PB collections (via Admin UI): `productos`, `clientes`, extend `users` with `nombre`+`rol`
2. Set access rules per REQ-COL-004/005/006
3. Create seed users in PB Admin (matching current 6 seed users + passwords)
4. `npm install pocketbase`
5. Deploy all code changes together in one PR
6. Rollback: revert all files, `npm uninstall pocketbase`

## Open Questions

- [ ] **`productos.min` field**: Store and views depend on it (reorder threshold, "Stock Bajo" computation). Should it be added to the PB collection spec?
- [ ] **`productos.estado` computed vs stored**: Currently stored in seed data. Post-PB it can be derived from `stock` + `min`, but the spec uses `activo` bool instead. Which takes precedence?
- [ ] **`clientes.contacto` vs `clientes.nombre`**: The spec has `nombre` as company/client name, but the store has both `nombre` (company) and `contacto` (person). Do we keep both?
- [ ] **Password for existing users**: PB users need real hashed passwords. How do we bootstrap the 6 seed users with known passwords for dev?
- [ ] **`usuarios.estado`**: Store tracks active/inactive. The collection spec doesn't include this. Should it be added, or do we always return active?
