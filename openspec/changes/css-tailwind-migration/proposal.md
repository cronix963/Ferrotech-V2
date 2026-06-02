# Proposal: CSS Tailwind Migration

## Intent

Reduce `styles/globals.css` from 1,367 lines to <250 by replacing hand-written CSS with Tailwind utility classes. Eliminate inline `style={{}}` objects in `tienda.js` and `vendedor.js`. This is Phase 2 of the mejora-integral-ferrotech program — pure CSS migration, zero behavior changes.

## Scope

### In Scope
- Install Tailwind CSS v3 + PostCSS + autoprefixer
- Configure `tailwind.config.js` with custom theme matching `:root` CSS variables (--primary, --accent, --gray-*, --success, --danger, --warning, --info)
- Create `postcss.config.js`
- Add `@tailwind` directives to `globals.css`
- Migrate shared components first: Header → SidebarLeft → SidebarRight → Footer
- Migrate pages: Dashboard layout → HeroBanner → FeaturedGrid
- Migrate module views: shared table/badge styles → all 11 views
- Replace all `style={{}}` in `tienda.js`
- Replace all `style={{}}` in `vendedor.js`

### Out of Scope
- Zustand store changes (Phase 1)
- Functional/behavioral changes to any view
- Component restructuring or renaming
- TypeScript conversion
- New UI components or layouts

## Capabilities

Pure migration — no spec-level behavior changes. All Capabilities sections are **None**.

### New Capabilities
None.

### Modified Capabilities
None.

## Approach

Sequential per-component migration, each verified and committed independently:

1. **Setup**: Install Tailwind + PostCSS deps, create configs, add directives to globals.css
2. **Shared components**: Header → SidebarLeft → SidebarRight → Footer (most reuse, highest impact)
3. **Pages**: Dashboard page layout → HeroBanner → FeaturedGrid
4. **Module views**: Shared patterns (tables, badges, forms) → 11 admin views
5. **Inline style cleanup**: tienda.js → vendedor.js (replace dozens of `style={{}}`)
6. **Final trim**: Remove unused CSS classes from globals.css, keep only custom keyframes + Tailwind directives

Each step: migrate → `npm run build` → commit. If broken, revert that commit.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `styles/globals.css` | Modified | 1,367→<250 lines; add Tailwind directives, remove manual classes |
| `tailwind.config.js` | New | Custom theme matching `:root` CSS variables |
| `postcss.config.js` | New | PostCSS with Tailwind + autoprefixer |
| `package.json` | Modified | Add tailwindcss, postcss, autoprefixer deps |
| `components/Header.js` | Modified | Replace CSS classes with Tailwind utilities |
| `components/SidebarLeft.js` | Modified | Same |
| `components/SidebarRight.js` | Modified | Same |
| `components/Footer.js` | Modified | Same |
| `components/HeroBanner.js` | Modified | Same |
| `components/FeaturedGrid.js` | Modified | Same |
| `components/views/*.js` | Modified | Shared table/badge patterns, 11 views |
| `pages/dashboard.js` | Modified | Layout migration |
| `pages/tienda.js` | Modified | All `style={{}}` → Tailwind classes |
| `pages/vendedor.js` | Modified | All `style={{}}` → Tailwind classes |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Tailwind breaks layout after migration | Med | Migrate per-component, verify build each step; 1 commit = 1 component |
| Missing custom color in Tailwind config | Low | Read all `:root` vars and component usage before writing config |
| globals.css reference not caught | Low | Visual diff after migration; if broken, revert component commit |

## Rollback Plan

Each component/page migration is its own commit. If Tailwind breaks layout, `git revert <that-commit>`. The setup commit (deps + configs) is kept — no need to uninstall unless abandoning Tailwind entirely.

## Dependencies

- Tailwind CSS v3, PostCSS, autoprefixer
- Phase 1 (foundation-stores-testing) must be complete for stores, but NOT a hard dep — this phase works on pure CSS

## Success Criteria

- [ ] `globals.css` reduced from 1,367 lines to <250
- [ ] `npm run build` succeeds with no errors
- [ ] Visual appearance matches before Tailwind (no layout regressions)
- [ ] All `style={{}}` in `tienda.js` replaced with Tailwind classes
- [ ] All `style={{}}` in `vendedor.js` replaced with Tailwind classes
