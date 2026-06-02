# Tasks: CSS Tailwind Migration

## Phase 1: Install + Configure

- [x] 1.1 Install tailwindcss@3, postcss, autoprefixer devDependencies
- [x] 1.2 Create `tailwind.config.js` with custom theme matching `:root` vars
- [x] 1.3 Create `postcss.config.js` with tailwindcss + autoprefixer
- [x] 1.4 Add @tailwind directives to TOP of `styles/globals.css`

## Phase 2: Shared Components

- [x] 2.1 Migrate `components/Header.js` — replace CSS classes with Tailwind
- [x] 2.2 Migrate `components/SidebarLeft.js` — replace CSS classes with Tailwind
- [x] 2.3 Migrate `components/SidebarRight.js` — replace CSS classes + inline styles
- [x] 2.4 Migrate `components/Footer.js` — replace CSS class with Tailwind
- [x] 2.5 Migrate `components/HeroBanner.js` — replace CSS classes with Tailwind
- [x] 2.6 Migrate `components/FeaturedGrid.js` — replace CSS classes + inline styles

## Phase 3: Pages

- [x] 3.1 Migrate `pages/dashboard.js` — replace layout CSS classes with Tailwind
- [x] 3.2 Migrate `pages/index.js` (login) — replace CSS classes + inline styles
- [x] 3.3 Migrate `pages/tienda.js` — replace ALL inline styles + CSS classes with Tailwind
- [x] 3.4 Migrate `pages/vendedor.js` — replace ALL inline styles + CSS classes with Tailwind

## Phase 4: Views (shared CSS classes → Tailwind)

- [x] 4.1 Migrate shared view patterns: badge, table, toolbar, search, header
- [x] 4.2 Apply to all 11 view files (UsuariosView, PedidosView, etc.)

## Phase 5: Cleanup + Verify

- [x] 5.1 Remove unused CSS classes from `globals.css`, keep @keyframes + media queries
- [x] 5.2 Run `npm run build` to verify build succeeds
- [x] 5.3 Run `npm test` to verify no test regression
