# Proposal: Mejora Integral Ferrotech

## Intent

Transform hardcoded prototype to production-ready system. Currently: 1367-line globals.css, localStorage auth, zero tests, data in component arrays, 11 views non-functional. Phased program for independent rollback.

## Scope

### In Scope
- Zustand stores for all entities, Jest + RTL (>60% critical path coverage)
- Tailwind migration (globals.css reduced >80%), Supabase/Express backend
- JWT auth, all 11 admin views CRUD via API
- Tienda: images, detail modal, filters — POS: change calc, ticket — global search

### Out of Scope
- TypeScript, i18n, mobile apps, payment gateway, CI-CD

## Capabilities

### New Capabilities
- `state-management`, `testing`, `styling-tailwind`
- `backend-api`, `user-auth`
- `crud-inventory`, `crud-sales-crm`, `crud-admin`
- `tienda-ux`, `pos-ux`, `global-search`

### Modified Capabilities
None — no existing specs.

## Approach

4 sequential changes, each an independent revertable PR:

1. **Foundation** (stores + tests): Zustand for all data, Jest+RTL, test critical paths.
2. **CSS Migration** (Tailwind): Per-view migration: shared → pages → views.
3. **Backend + Auth + CRUD**: API layer, JWT, wire stores, enable all 11 views.
4. **UX Polish**: Tienda images/detail/filters, POS change/ticket, global search.

## Affected Areas

| Area | Impact |
|------|--------|
| `components/views/*` | Modified |
| `components/shared/*` | Modified |
| `pages/*` | Modified |
| `styles/globals.css` | Removed |
| `stores/` | New |
| `lib/` | New |
| `__tests__/` | New |
| `backend/` | New |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Tailwind breaks layout | Med | Migrate per-view, verify each |
| Store design wrong later | Med | Thin wrappers — swap impl, not interface |
| Phase scope creep | High | Clear gates per PR |
| Test mocking complexity | Low | Pure-function tests first |

## Rollback Plan

Each phase = separate branch + PR. Rollback = close/revert merged PR. No hard cross-deps: Phase 1 pure frontend, Phase 2 pure CSS, Phase 3 keeps old data until verified, Phase 4 builds on working features.

## Dependencies

Zustand v4, Jest v29 + RTL (Ph1), Tailwind v3 (Ph2), Supabase JS / Express (Ph3).

## Success Criteria

- [ ] All hardcoded data replaced by Zustand store selectors
- [ ] Test suite >60% coverage on `stores/` and `lib/`
- [ ] globals.css reduced from 1367 to <250 lines
- [ ] Auth rejects fake passwords, accepts real JWT
- [ ] All 11 admin views CRUD via API
- [ ] POS returns correct change for any payment
- [ ] Header search returns filtered cross-entity results
