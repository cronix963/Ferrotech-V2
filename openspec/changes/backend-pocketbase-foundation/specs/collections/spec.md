# PocketBase Collections Specification

## Purpose

Define PocketBase collection schemas for `productos`, `clientes`, and built-in `users`, with role-based access rules that enforce authorization at the data layer.

## Requirements

### REQ-COL-001: Productos collection schema

The system MUST create a PocketBase collection named `productos` with the following schema:

| Field       | Type   | Required | Default  |
|-------------|--------|----------|----------|
| `nombre`    | text   | yes      | —        |
| `descripcion` | text | no       | —        |
| `precio`    | number | yes      | —        |
| `stock`     | number | yes      | `0`      |
| `imagen`    | file   | no       | —        |
| `categoria` | text   | no       | —        |
| `activo`    | bool   | no       | `true`   |

#### Scenario: Productos collection is created with correct fields

- GIVEN PocketBase is running
- WHEN the admin navigates to the Productos collection schema
- THEN it contains all 7 fields with the types and defaults above

### REQ-COL-002: Clientes collection schema

The system MUST create a PocketBase collection named `clientes` with the following schema:

| Field       | Type       | Required | Default     |
|-------------|------------|----------|-------------|
| `nombre`    | text       | yes      | —           |
| `email`     | text       | yes      | —           |
| `telefono`  | text       | no       | —           |
| `direccion` | text       | no       | —           |
| `tipo`      | select     | no       | `particular`|
| `creado`    | autodate   | —        | —           |

`tipo` options: `particular`, `empresa`.

#### Scenario: Clientes collection is created with correct fields

- GIVEN PocketBase is running
- WHEN the admin navigates to the Clientes collection schema
- THEN it contains all 6 fields with the types and defaults above

### REQ-COL-003: Users collection extended schema

The system MUST extend PocketBase's built-in `users` collection with the following fields:

| Field    | Type   | Required | Default   |
|----------|--------|----------|-----------|
| `nombre` | text   | no       | —         |
| `rol`    | select | no       | `cliente` |

`rol` options: `admin`, `cliente`, `vendedor`.

#### Scenario: Users collection has custom fields

- GIVEN PocketBase is running
- WHEN the admin navigates to the Users collection schema
- THEN it includes built-in fields (email, password, etc.) plus `nombre` and `rol`

### REQ-COL-004: Productos access rules

The collection MUST enforce these access rules:

| Role      | List rule                                        | View rule | Create | Update | Delete |
|-----------|--------------------------------------------------|-----------|--------|--------|--------|
| admin     | —                                                | —         | allowed| allowed| allowed|
| vendedor  | —                                                | —         | denied | denied | denied |
| cliente   | `activo = true`                                  | `activo = true` | denied | denied | denied |

`—` means no filter (all records).

#### Scenario: Cliente sees only active productos

- GIVEN a cliente user is authenticated
- WHEN they request the productos list
- THEN only records where `activo = true` are returned

#### Scenario: Admin sees all productos including inactive

- GIVEN an admin user is authenticated
- WHEN they request the productos list
- THEN all records are returned regardless of `activo`

#### Scenario: Vendedor reads productos but cannot modify

- GIVEN a vendedor user is authenticated
- WHEN they send a POST/PATCH/DELETE to the productos collection
- THEN PocketBase returns a 403 error

### REQ-COL-005: Clientes access rules

The collection MUST enforce these access rules:

| Role      | List rule | View rule                        | Create | Update | Delete |
|-----------|-----------|----------------------------------|--------|--------|--------|
| admin     | —         | —                                | allowed| allowed| allowed|
| vendedor  | —         | —                                | allowed| denied | denied |
| cliente   | —         | `id = @request.auth.id` (TBD via relation) | denied | denied | denied |

Note: Cliente view-own requires a relation field linking `clientes` to `users`. If no relation exists, cliente `list` and `view` default to `denied`.

#### Scenario: Admin creates and edits any cliente

- GIVEN an admin user is authenticated
- WHEN they create, update, or delete a cliente record
- THEN the operation succeeds

#### Scenario: Vendedor creates new clientes but cannot edit or delete

- GIVEN a vendedor user is authenticated
- WHEN they create a cliente record
- THEN the operation succeeds
- AND when they attempt to update or delete any cliente record

- THEN PocketBase returns a 403 error

### REQ-COL-006: Users access rules

The collection MUST enforce these access rules:

| Role      | List rule    | View rule                   | Create | Update | Delete |
|-----------|--------------|-----------------------------|--------|--------|--------|
| admin     | —            | —                           | allowed| allowed| allowed|
| any user  | —            | `id = @request.auth.id`     | denied | partial| denied |

#### Scenario: User sees only their own user record

- GIVEN a non-admin user is authenticated
- WHEN they request the users list
- THEN only their own record is returned in the result and view

#### Scenario: Admin manages all users

- GIVEN an admin user is authenticated
- WHEN they create, update, or delete any user
- THEN the operation succeeds

## Acceptance Criteria

- [ ] Productos collection has all 7 fields with correct types and defaults
- [ ] Clientes collection has all 6 fields with correct types and defaults
- [ ] Users collection has `nombre` and `rol` fields added
- [ ] Admin can CRUD all collections
- [ ] Vendedor can read productos, create clientes, but not modify productos
- [ ] Cliente only sees `activo = true` productos
- [ ] Cliente cannot access clientes or users collection
- [ ] Non-admin user sees only own user record

## Dependencies

- PocketBase v0.23+ binary running at `localhost:8090`
- Collections created via PocketBase Admin UI or imported via JSON
