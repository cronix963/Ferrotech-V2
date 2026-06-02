# PocketBase Setup Guide

## 1. Download PocketBase

Download the Windows (win64) binary from the official releases:

- **URL**: https://github.com/pocketbase/pocketbase/releases
- **File**: `pocketbase_0.23.X_windows_amd64.zip` (latest 0.23+ version)

Extract the zip file to `backend/` inside this project:

```
ferrotech-frontend/
  backend/
    pocketbase.exe
    pb_data/        (created on first run)
```

## 2. First Run & Admin Setup

```bash
cd backend
.\pocketbase.exe serve
```

This starts the server on `http://127.0.0.1:8090`.

Open the Admin UI at `http://127.0.0.1:8090/_/` and create your admin account on first visit.

## 3. Create Collections

### Productos Collection

In the Admin UI, create a new collection called `productos` with these fields:

| Field          | Type   | Required | Default |
|----------------|--------|----------|---------|
| `nombre`       | text   | yes      | —       |
| `descripcion`  | text   | no       | —       |
| `precio`       | number | yes      | —       |
| `stock`        | number | yes      | `0`     |
| `imagen`       | file   | no       | —       |
| `categoria`    | text   | no       | —       |
| `activo`       | bool   | no       | `true`  |

### Clientes Collection

Create a collection called `clientes` with these fields:

| Field       | Type       | Required | Default      |
|-------------|------------|----------|--------------|
| `nombre`    | text       | yes      | —            |
| `email`     | text       | yes      | —            |
| `telefono`  | text       | no       | —            |
| `direccion` | text       | no       | —            |
| `tipo`      | select     | no       | `particular` |

`tipo` options: `particular`, `empresa`

### Users Collection (built-in)

Extend the built-in `users` collection by adding these fields:

| Field    | Type   | Required | Default   |
|----------|--------|----------|-----------|
| `nombre` | text   | no       | —         |
| `rol`    | select | no       | `cliente` |

`rol` options: `admin`, `cliente`, `vendedor`

## 4. Access Rules

### Productos

| Role      | List   | View   | Create | Update | Delete |
|-----------|--------|--------|--------|--------|--------|
| admin     | —      | —      | allowed| allowed| allowed|
| vendedor  | —      | —      | denied | denied | denied |
| cliente   | `activo = true` | `activo = true` | denied | denied | denied |

### Clientes

| Role      | List   | View   | Create | Update | Delete |
|-----------|--------|--------|--------|--------|--------|
| admin     | —      | —      | allowed| allowed| allowed|
| vendedor  | —      | —      | allowed| denied | denied |
| cliente   | denied | denied | denied | denied | denied |

### Users

| Role      | List   | View                   | Create | Update | Delete |
|-----------|--------|------------------------|--------|--------|--------|
| admin     | —      | —                      | allowed| allowed| allowed|
| any user  | —      | `id = @request.auth.id` | denied | partial| denied |

## 5. Seed Users

Create users via the Admin UI > Users collection with these credentials for local development:

| nombre          | email                       | password      | rol      |
|-----------------|-----------------------------|---------------|----------|
| Carlos Mendoza  | admin@ferrotech.com         | admin123      | admin    |
| María López     | mlopez@ferrotech.com        | vendedor123   | vendedor |
| Juan Pérez      | jperez@ferrotech.com        | vendedor123   | vendedor |
| Ana Rodríguez   | arodriguez@ferrotech.com    | almacen123    | cliente  |
| Pedro Sánchez   | psanchez@ferrotech.com      | reparto123    | cliente  |
| Lucía Fernández | lfernandez@ferrotech.com    | vendedor123   | vendedor |

**Note**: PocketBase hashes passwords automatically. Use the Admin UI "Create user" form.

## 6. Seed Product Data (optional)

Via Admin UI > Productos > "New record", add sample products manually or import via the PB API.

For bulk import, create a JSON file and use [PocketBase JS SDK](https://github.com/pocketbase/js-sdk) scripts, or add them through the Admin UI one by one.

## 7. Start Script

Create `backend/start.bat`:

```bat
@echo off
cd /d "%~dp0"
start /B pocketbase.exe serve
echo PocketBase started on http://127.0.0.1:8090
```

## 8. Verify

1. Start PocketBase: `backend\pocketbase.exe serve`
2. Start frontend: `npm run dev`
3. Open http://localhost:3000
4. Login with `admin@ferrotech.com` / `admin123`
5. You should be redirected to the dashboard

## Troubleshooting

- **"Failed to fetch" errors**: PocketBase must be running on `127.0.0.1:8090`. Start it first.
- **401 Unauthorized**: Token expired. Log out and log in again.
- **403 Forbidden**: Your user role doesn't have permission for that action. Check access rules.
- **Blank page on login**: Check browser console for errors and ensure PB is running.
