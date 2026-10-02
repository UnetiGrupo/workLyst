# Backend API - WorkLyst

API REST para la gestión de proyectos, tareas y grupos, con autenticación por **JWT** y **API Key** global.

## 📋 Descripción

Backend desarrollado con **TypeScript**, **Express** y **PostgreSQL (Supabase)**. Expone endpoints de autenticación, usuarios, roles, proyectos, tareas y grupos, y genera documentación interactiva con **Swagger**.

## ✨ Características

- ✅ Autenticación con JWT (`sessionToken`)
- ✅ API Key global (`x-api-key`) para todas las rutas `/api`
- ✅ Registro y login de usuarios con contraseñas hasheadas (bcrypt)
- ✅ Logout con invalidación de token (blocklist en base de datos)
- ✅ Rate limiting global y específico para autenticación
- ✅ Gestión de usuarios, roles, proyectos, tareas y grupos
- ✅ PostgreSQL (Supabase) con creación automática de tablas al iniciar
- ✅ Documentación Swagger en `/api-docs`
- ✅ Código completamente en español

> ⚠️ Aunque existe una clase `SQLiteConnection`, los scripts de inicialización (`src/config/database/init.ts`) usan SQL específico de PostgreSQL (`SERIAL`, `ON CONFLICT`, `ALTER TABLE ... IF NOT EXISTS`, placeholders `$1`). En la práctica **se requiere PostgreSQL**.

## 🛠️ Tecnologías

- **Node.js** + **TypeScript**
- **Express 5**
- **PostgreSQL** vía `pg` (compatible con Supabase)
- **jsonwebtoken** — sesiones
- **bcryptjs** — hash de contraseñas
- **express-rate-limit** — rate limiting
- **swagger-jsdoc** + **swagger-ui-express** — documentación
- **js-yaml** — carga de `bootstrap.yml`

## 📁 Estructura del Proyecto

```
backend/
├── src/
│   ├── config/
│   │   ├── configLoader.ts        # Carga bootstrap.yml + variables de entorno
│   │   ├── db.ts                  # Selección y conexión de la base de datos
│   │   ├── swagger.ts             # Definición de Swagger
│   │   └── database/
│   │       ├── init.ts            # Creación de tablas y seeds
│   │       ├── PostgreSQLConnection.ts
│   │       └── SQLiteConnection.ts
│   ├── controllers/               # Lógica de negocio
│   ├── middleware/
│   │   ├── authMiddleware.ts      # Verificación de JWT / token de sistema
│   │   ├── apiKeyMiddleware.ts    # Verificación de x-api-key
│   │   └── rateLimiter.ts
│   ├── models/                    # Acceso a datos
│   ├── routes/                    # Definición de endpoints
│   └── index.ts                   # Punto de entrada
├── bootstrap.yml                  # Configuración/secretos (ignorado por git)
├── .env                           # Variables de entorno (ignorado por git)
├── package.json
└── tsconfig.json
```

## ⚙️ Configuración

La configuración se resuelve con esta prioridad (lo de arriba gana):

1. Variables de entorno del sistema
2. Archivo `.env` (`apps/backend/.env`)
3. Archivo `bootstrap.yml` (`apps/backend/bootstrap.yml`)
4. Valores por defecto del código

El archivo `.env` se carga automáticamente mediante `process.loadEnvFile` (nativo en Node ≥ 20.12), por lo que **no se necesita dotenv**.

### `bootstrap.yml` — conexión y secretos

```yaml
server:
  port: 3000

database:
  type: postgres
  connectionString: "postgresql://postgres:TU_PASSWORD@db.TU_REF.supabase.co:5432/postgres"

jwt:
  accessTokenSecret: "un_secreto_largo_y_aleatorio"
  refreshTokenSecret: "otro_secreto_distinto"
  accessTokenExpiry: "15m"
  refreshTokenExpiry: "7d"

cors:
  enabled: true
  origin: "*"
```

### `.env` — variables de entorno

| Variable | Descripción | Por defecto |
|---|---|---|
| `PORT` | Puerto del servidor | `3000` |
| `DB_TYPE` | `postgres` o `sqlite` | `postgres` |
| `DATABASE_URL` | Connection string (alternativa a `bootstrap.yml`) | — |
| `DB_HOST` / `DB_PORT` / `DB_NAME` / `DB_USER` / `DB_PASSWORD` | Parámetros individuales (alternativa a `DATABASE_URL`) | — |
| `DB_FILENAME` | Archivo SQLite (solo si `DB_TYPE=sqlite`) | `database.sqlite` |
| `DB_SSL` | `true` para Supabase. **Obligatorio para Supabase** | — |
| `JWT_ACCESS_SECRET` | Secreto del access token | — |
| `JWT_REFRESH_SECRET` | Secreto del refresh token (reservado) | — |
| `JWT_ACCESS_EXPIRY` | Duración del access token | — |
| `JWT_REFRESH_EXPIRY` | Duración del refresh token (reservado) | — |
| `CORS_ENABLED` | Activar CORS | `true` |
| `CORS_ORIGIN` | Origen permitido | `*` |
| `RATE_LIMIT_WINDOW_MS` | Ventana de rate limiting (ms) | `900000` |
| `RATE_LIMIT_MAX` | Máximo de peticiones por ventana | `100` |
| `RATE_LIMIT_AUTH_MAX` | Máximo en rutas de auth | `5` |
| `SYSTEM_API_TOKEN` | Token que autentica como el bot del sistema | — |
| `RENDER_EXTERNAL_URL` | URL externa para Swagger en producción | — |

> `DB_SSL` **no** puede definirse en `bootstrap.yml`: el código solo lo lee de `process.env`, por eso va en `.env`.

## 📦 Instalación y ejecución

Este repositorio es un monorepo gestionado con **pnpm**.

```bash
# 1. Instalar dependencias (desde la raíz)
pnpm install

# 2. Crear la configuración local
#    - apps/backend/bootstrap.yml  (conexión y secretos)
#    - apps/backend/.env           (variables de entorno, DB_SSL=true)

# 3. Arrancar solo el backend en modo desarrollo
pnpm dev:api
```

### Scripts

**Raíz del monorepo:**

| Script | Acción |
|---|---|
| `pnpm dev:api` | Arranca el backend en desarrollo (hot-reload) |
| `pnpm dev:ui` | Arranca el frontend en desarrollo |
| `pnpm build:api` | Compila el backend |
| `pnpm build:ui` | Compila el frontend |

**Dentro de `apps/backend`:** `dev` (nodemon + ts-node), `build` (tsc), `start` (node dist).

## 🗄️ Base de Datos

Las tablas se crean y se siembran automáticamente al iniciar el servidor (`src/config/database/init.ts`):

| Tabla | Descripción |
|---|---|
| `users` | Usuarios (`id`, `name`, `email`, `password`) |
| `roles` | Roles (`owner`, `member`) |
| `projects` | Proyectos |
| `project_members` | Miembros y rol dentro de un proyecto |
| `tasks` | Tareas de un proyecto |
| `task_statuses` | Estatus de tareas (`pending`, `in_progress`, `completed`, `overdue`) |
| `groups` | Grupos |
| `group_members` | Miembros de un grupo |
| `group_statuses` | Estatus de grupos (`activo`, `eliminado`) |
| `api_keys` | API Keys válidas |
| `token_blocklist` | Tokens invalidados en el logout |

También se crea un usuario de sistema: `ia_bot@system.local`.

## 🔐 Autenticación

Todas las rutas bajo `/api` requieren el header:

```
x-api-key: <API_KEY>
```

Al inicializar la base de datos se siembran dos API Keys:

| Nombre | Valor |
|---|---|
| `WEB_APP` | `2f3051da7622f58f4ba191e2e9dacea002042ab1c7394f8bee67949081bf3436` |
| `IA_BOT` | `925053021afeec58aac3c36d1a7b8a2a00dfbc57de7ada2e30b7cb7b7fcc9d03` |

Las rutas protegidas requieren además:

```
Authorization: Bearer <sessionToken>
```

Si `SYSTEM_API_TOKEN` está definido y se envía como Bearer, se autentica como el usuario bot del sistema.

## 🔌 API Endpoints

**Base URL:** `http://localhost:3000`

### Autenticación (`/api/auth`)

Solo requieren `x-api-key`. `register` y `login` tienen rate limiting adicional.

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/auth/register` | Registrar usuario |
| POST | `/api/auth/login` | Iniciar sesión |
| POST | `/api/auth/logout` | Cerrar sesión (invalida el `sessionToken`) |

**Registrar** — `POST /api/auth/register`

```json
{ "usuario": "Juan Pérez", "email": "juan@example.com", "password": "miPassword123" }
```

Respuesta `201`:

```json
{
  "mensaje": "Usuario registrado exitosamente",
  "usuario": { "id": "uuid", "nombre": "Juan Pérez", "email": "juan@example.com" }
}
```

**Login** — `POST /api/auth/login`

```json
{ "email": "juan@example.com", "password": "miPassword123" }
```

Respuesta `200`:

```json
{
  "mensaje": "Login exitoso",
  "sessionToken": "eyJhbGciOiJIUzI1NiIs...",
  "usuario": { "id": "uuid", "nombre": "Juan Pérez", "email": "juan@example.com" }
}
```

**Logout** — `POST /api/auth/logout`

```json
{ "sessionToken": "eyJhbGciOiJIUzI1NiIs..." }
```

### Resto de recursos

Requieren `x-api-key` y, salvo `/api/roles`, `Authorization: Bearer <sessionToken>`.

| Recurso | Rutas |
|---|---|
| `/api/users` | `GET /`, `GET /:id`, `PUT /:id` |
| `/api/roles` | `GET /` |
| `/api/projects` | `POST /`, `GET /`, `GET /:id`, `PUT /:id`, `PATCH /:id/finish`, `DELETE /:id` |
| `/api/projects` (miembros y tareas) | `POST /:id/members`, `DELETE /:id/members/:userId`, `POST /:projectId/tasks`, `GET /:projectId/tasks` |
| `/api/tasks` | `GET /:id`, `PUT /:id`, `DELETE /:id`, `PATCH /:id/assign` |
| `/api/groups` | `POST /`, `GET /`, `GET /:id`, `PUT /:id`, `DELETE /:id`, `POST /:id/members`, `DELETE /:id/members/:userId` |
| `/api/task-statuses` | `GET /`, `POST /`, `PUT /:id`, `DELETE /:id` |

### Endpoint de prueba

`GET /prueba` → `¡Hola Mundo! Backend con TypeScript y SQLite funcionando`

## 📚 Documentación Swagger

Disponible en `http://localhost:3000/api-docs`. Los esquemas se generan a partir de los comentarios `@swagger` en `src/routes/*.ts`.

## 🚀 Despliegue (Render)

Variables de entorno mínimas:

```
DB_TYPE=postgres
DATABASE_URL=postgresql://...
DB_SSL=true
JWT_ACCESS_SECRET=...
JWT_REFRESH_SECRET=...
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
```

Si defines `RENDER_EXTERNAL_URL`, esa URL se agrega como servidor en Swagger. En producción, define también `JWT_ACCESS_SECRET` y `JWT_REFRESH_SECRET` con valores seguros.

## 🔒 Seguridad

- **Contraseñas:** hasheadas con bcrypt (10 rounds), nunca se devuelven en las respuestas.
- **Sesión:** el `sessionToken` (JWT) dura 15 minutos.
- **Logout:** el token se agrega a `token_blocklist` y deja de ser válido.
- **API Keys:** obligatorias en `/api`; se validan contra la tabla `api_keys`.

## 📝 Notas conocidas

- **No hay refresh tokens**: existe `JWT_REFRESH_SECRET` en la configuración, pero el flujo de renovación no está implementado.
- **CORS:** `src/index.ts` usa `app.use(cors())` abierto a cualquier origen; las variables `CORS_ENABLED` / `CORS_ORIGIN` aún no se aplican.
- **SQLite:** se puede seleccionar con `DB_TYPE=sqlite`, pero la inicialización de tablas usa SQL de PostgreSQL y fallará.
