# Auth Integration Specification

## Purpose

Replace localStorage-based hardcoded-password auth with PocketBase email/password authentication using JWT tokens. Manage session state in a Zustand auth store, persist tokens across refresh, and guard protected routes by role.

## Requirements

### REQ-AUTH-001: PocketBase SDK singleton

The system MUST create a shared PocketBase client instance at `lib/pocketbase.js`. All stores and pages MUST import this singleton rather than creating their own instance.

#### Scenario: SDK singleton is available

- GIVEN the application starts
- WHEN any module imports from `lib/pocketbase.js`
- THEN a single PocketBase client instance connected to `http://localhost:8090` is returned

### REQ-AUTH-002: Login authenticates via PocketBase

The login page (`pages/index.js`) MUST call `pb.collection('users').authWithPassword(email, password)`. On success it MUST store the returned JWT + user record in both a Zustand auth store AND `localStorage`. On failure it MUST show an error message without redirecting.

| Storage      | Key / Field                   | Content          |
|-------------|-------------------------------|------------------|
| Zustand     | `token`, `user`, `role`       | JWT string, user object, `rol` field |
| localStorage| `ferrotech_auth_token`        | JWT string       |
| localStorage| `ferrotech_user`              | `user.email`     |
| localStorage| `ferrotech_role`              | `user.rol`       |

#### Scenario: Login with valid credentials redirects by role (admin)

- GIVEN the user is on the login page
- WHEN they enter valid admin credentials and submit
- THEN `authWithPassword()` succeeds
- AND the JWT token and user data are stored in Zustand and localStorage
- AND the user is redirected to `/dashboard`

#### Scenario: Login with valid credentials redirects by role (vendedor)

- GIVEN the user is on the login page
- WHEN they enter valid vendedor credentials and submit
- THEN the user is redirected to `/vendedor`

#### Scenario: Login with valid credentials redirects by role (cliente)

- GIVEN the user is on the login page
- WHEN they enter valid cliente credentials and submit
- THEN the user is redirected to `/cliente`

#### Scenario: Login with wrong credentials shows error

- GIVEN the user is on the login page
- WHEN they enter invalid credentials and submit
- THEN `authWithPassword()` throws an error
- AND an error message is displayed on the form
- AND no redirect occurs
- AND no token is stored in localStorage

### REQ-AUTH-003: Auto-authenticate from stored token on app load

On application startup (`_app.js` or `auth.store.js` init), the system MUST check `localStorage` for an existing JWT token. If found, it SHOULD call `pb.authStore.save(token)` to restore the session. If the token is expired, it MUST clear localStorage and treat the user as unauthenticated.

#### Scenario: Page refresh with valid token stays logged in

- GIVEN the user has a valid JWT token in localStorage
- WHEN the page is refreshed
- THEN the auth store restores the session from the token
- AND the user remains on their current page with no login flash

#### Scenario: Page refresh with expired token redirects to login

- GIVEN the user has an expired JWT token in localStorage
- WHEN the page is refreshed and any API call returns 401
- THEN the auth store clears all stored tokens
- AND the user is redirected to `/`

### REQ-AUTH-004: Auth guard on protected pages

Pages `/dashboard`, `/tienda`, `/vendedor`, and `/cliente` MUST check the auth store on mount. If no valid token or wrong role is found, they MUST redirect to `/`.

| Page        | Required role |
|-------------|---------------|
| `/dashboard`| `admin`       |
| `/tienda`   | `cliente`     |
| `/vendedor` | `vendedor`    |
| `/cliente`  | `cliente`     |

#### Scenario: Unauthenticated user is redirected to login

- GIVEN no user is authenticated
- WHEN they navigate to `/dashboard`
- THEN they are immediately redirected to `/`

#### Scenario: Wrong-role user is redirected to login

- GIVEN a `vendedor` user is authenticated
- WHEN they navigate to `/dashboard`
- THEN they are immediately redirected to `/`

### REQ-AUTH-005: Logout clears session

The system MUST provide a logout action that calls `pb.authStore.clear()`, removes all `ferrotech_*` keys from localStorage, and redirects to `/`.

#### Scenario: Logout clears everything

- GIVEN the user is authenticated
- WHEN they click the logout button
- THEN `pb.authStore.clear()` is called
- AND all `ferrotech_*` keys are removed from localStorage
- AND the user is redirected to `/`

### REQ-AUTH-006: Session expiry auto-logout

If any PocketBase API call returns a 401 response, the system MUST auto-logout: clear tokens, redirect to `/`, and show a session-expired message.

#### Scenario: Expired token triggers auto-logout

- GIVEN the user has an expired token
- WHEN any store makes a PB API call that returns 401
- THEN the auth store clears all tokens
- AND the user is redirected to `/`

### REQ-AUTH-007: Permission denied handled gracefully

If any PocketBase API call returns a 403 error, the system MUST NOT crash. It SHOULD log a warning and show a user-friendly "no permission" message in the UI where appropriate.

#### Scenario: Forbidden action shows error not crash

- GIVEN a `vendedor` user is authenticated
- WHEN they attempt to delete a producto (which returns 403)
- THEN the UI shows a "no tienes permisos" message
- AND the application does not crash

## Acceptance Criteria

- [ ] Login form calls `pb.collection('users').authWithPassword()` instead of checking hardcoded password
- [ ] JWT token stored in Zustand auth store + localStorage
- [ ] On page refresh with valid token, session is restored without login flash
- [ ] On page refresh with expired token, user is redirected to login
- [ ] Auth guard on dashboard, tienda, vendedor, and cliente pages checks role
- [ ] Logout clears Zustand, PB auth store, and localStorage
- [ ] Wrong credentials show error message, no redirect
- [ ] 401 from any API call triggers auto-logout
- [ ] 403 from any API call shows friendly error without crashing

## Dependencies

- `lib/pocketbase.js` SDK singleton (REQ-AUTH-001)
- `stores/auth.store.js` Zustand auth store
- Collections spec (REQ-COL-003 for users access rules)
