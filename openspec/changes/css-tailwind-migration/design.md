# Design: CSS Tailwind Migration

## Technical Approach

Install Tailwind v3 + PostCSS, configure theme from existing `:root` CSS variables, then migrate per-component: shared → pages → views. Each component is one commit for clean rollback.

## Architecture Decisions

### Decision: Tailwind v3 vs v4

**Choice**: Tailwind v3 (stable, well-documented, all plugins work)
**Rationale**: v4 is still in alpha; v3 is production-ready.

### Decision: Theme config matches `:root` variables exactly

**Choice**: Map each CSS variable to a Tailwind color token
**Rationale**: Ensures visual parity — no color shifts during migration.

```
primary: { DEFAULT: '#1A365D', light: '#2B6CB0', 100: '#EBF8FF' }
accent:  { DEFAULT: '#DD6B20', light: '#ED8936' }
gray:    { 50: '#F7FAFC', 100: '#EDF2F7', ..., 800: '#1A202C' }
success: '#38A169', danger: '#E53E3E', warning: '#D69E2E', info: '#3182CE'
```

### Decision: Inline styles use Tailwind classes instead

**Choice**: Replace ALL `style={{...}}` blocks in tienda.js and vendedor.js with Tailwind utility classes
**Rationale**: Consistency, smaller bundle, easier maintenance. Edge cases (dynamic values) use className template literals.

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `package.json` | Modify | Add tailwindcss, postcss, autoprefixer devDeps |
| `tailwind.config.js` | Create | Custom theme from :root variables |
| `postcss.config.js` | Create | PostCSS + Tailwind + autoprefixer |
| `styles/globals.css` | Modify | Add @tailwind directives, remove migrated styles |
| `components/Header.js` | Modify | Replace CSS classes with Tailwind |
| `components/SidebarLeft.js` | Modify | Replace CSS classes with Tailwind |
| `components/SidebarRight.js` | Modify | Replace CSS classes with Tailwind |
| `components/Footer.js` | Modify | Replace CSS classes with Tailwind |
| `components/HeroBanner.js` | Modify | Replace CSS classes with Tailwind |
| `components/FeaturedGrid.js` | Modify | Replace CSS classes with Tailwind |
| `pages/dashboard.js` | Modify | Replace CSS classes with Tailwind |
| `pages/tienda.js` | Modify | Replace all inline styles + CSS classes |
| `pages/vendedor.js` | Modify | Replace all inline styles + CSS classes |
| `pages/index.js` | Modify | Replace login CSS classes with Tailwind |

## Migration Order

1. Install deps + configure (tailwind.config.js, postcss.config.js)
2. Add @tailwind directives to globals.css
3. Shared components: Header → Footer → SidebarLeft → SidebarRight → HeroBanner → FeaturedGrid
4. Pages: dashboard → index (login) → tienda → vendedor
5. Keep only custom keyframes + minimal overrides in globals.css

## Testing Strategy

| Layer | What | How |
|-------|------|-----|
| Build | Next.js compiles | `npm run build` |
| Visual | Side-by-side comparison | Manual check per component |
| Tests | No regression | `npm test` still passes |

## Migration / Rollout

No migration needed. Each component is one commit — revert that component's commit if layout breaks.
