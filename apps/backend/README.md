# Backend API - Worklist

## 📋 Descripción

API REST desarrollada con **TypeScript**, **Express** y **SQLite** que implementa un sistema completo de autenticación con **Refresh Tokens** para mayor seguridad y mejor experiencia de usuario.

## 🚀 Características

- ✅ Autenticación con JWT (Access Token + Refresh Token)
- ✅ Registro y login de usuarios
- ✅ Tokens de corta duración (15 minutos) para mayor seguridad
- ✅ Refresh tokens de larga duración (7 días) almacenados en base de datos
- ✅ Cierre de sesión con invalidación de tokens
- ✅ Configuración centralizada con `bootstrap.yml`
- ✅ Base de datos SQLite
- ✅ Código completamente en español

## 🛠️ Tecnologías

- **Node.js** - Entorno de ejecución
- **TypeScript** - Lenguaje de programación
- **Express** - Framework web
- **SQLite** (better-sqlite3) - Base de datos
- **JWT** (jsonwebtoken) - Autenticación
- **bcryptjs** - Encriptación de contraseñas
- **js-yaml** - Manejo de configuración YAML
- **CORS** - Habilitación de peticiones cross-origin

## 📁 Estructura del Proyecto

```
backend/
├── src/
│   ├── config/
│   │   ├── configLoader.ts    # Carga de configuración desde bootstrap.yml
│   │   └── db.ts               # Configuración de la base de datos
│   ├── controllers/
│   │   └── authController.ts   # Lógica de autenticación
│   ├── models/
│   │   └── userModel.ts        # Modelo de usuarios y tokens
│   ├── routes/
│   │   └── authRoutes.ts       # Rutas de autenticación
│   └── index.ts                # Punto de entrada de la aplicación
├── data/
│   └── database.sqlite         # Base de datos SQLite
├── bootstrap.yml               # Archivo de configuración
├── package.json
├── tsconfig.json
└── README.md
```

## ⚙️ Configuración

### bootstrap.yml

El archivo `bootstrap.yml` contiene toda la configuración de la aplicación

> ⚠️ **Importante**: Cambia los secrets en producción por valores seguros.

## 📦 Instalación

1. **Clonar el repositorio** (o navegar al directorio del backend)

2. **Instalar dependencias**:
```bash
npm install
```

3. **Configurar bootstrap.yml** (opcional):
   - Edita `bootstrap.yml` para personalizar puerto, rutas, secrets, etc.

4. **Iniciar en modo desarrollo**:
```bash
npm run dev
```

5. **Compilar para producción**:
```bash
npm run build
npm start
```

## 🗄️ Base de Datos

### Tabla: users

| Campo      | Tipo     | Descripción                    |
|------------|----------|--------------------------------|
| id         | TEXT     | UUID único del usuario         |
| name       | TEXT     | Nombre del usuario             |
| email      | TEXT     | Email único del usuario        |
| password   | TEXT     | Contraseña hasheada (bcrypt)   |
| created_at | DATETIME | Fecha de creación              |

### Tabla: refresh_tokens

| Campo      | Tipo     | Descripción                        |
|------------|----------|------------------------------------|
| id         | TEXT     | UUID único del token               |
| user_id    | TEXT     | ID del usuario (FK)                |
| token      | TEXT     | Refresh token JWT                  |
| expires_at | DATETIME | Fecha de expiración                |
| created_at | DATETIME | Fecha de creación                  |

## 🔌 API Endpoints

### Base URL
```
http://localhost:30200
```

### 1. Registrar Usuario

**Endpoint**: `POST /api/auth/register`

**Body**:
```json
{
  "nombre": "Juan Pérez",
  "email": "juan@example.com",
  "password": "miPassword123"
}
```

**Respuesta exitosa** (201):
```json
{
  "mensaje": "Usuario registrado exitosamente",
  "usuario": {
    "id": "uuid-generado",
    "nombre": "Juan Pérez",
    "email": "juan@example.com"
  }
}
```

**Errores**:
- `400`: Todos los campos son obligatorios
- `400`: El usuario ya existe

---

### 2. Iniciar Sesión

**Endpoint**: `POST /api/auth/login`

**Body**:
```json
{
  "email": "juan@example.com",
  "password": "miPassword123"
}
```

**Respuesta exitosa** (200):
```json
{
  "mensaje": "Login exitoso",
  "tokenAcceso": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tokenActualizacion": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "id": "uuid-del-usuario",
    "nombre": "Juan Pérez",
    "email": "juan@example.com"
  }
}
```

**Errores**:
- `400`: Email y contraseña son obligatorios
- `401`: Credenciales inválidas

---

### 3. Renovar Access Token

**Endpoint**: `POST /api/auth/refresh`

**Body**:
```json
{
  "tokenActualizacion": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Respuesta exitosa** (200):
```json
{
  "mensaje": "Token renovado exitosamente",
  "tokenAcceso": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Errores**:
- `400`: Refresh token es obligatorio
- `401`: Refresh token inválido o expirado

---

### 4. Cerrar Sesión

**Endpoint**: `POST /api/auth/logout`

**Body**:
```json
{
  "tokenActualizacion": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Respuesta exitosa** (200):
```json
{
  "mensaje": "Logout exitoso"
}
```

**Errores**:
- `400`: Refresh token es obligatorio

---

### 5. Endpoint de Prueba

**Endpoint**: `GET /prueba`

**Respuesta**:
```
¡Hola Mundo! Backend con TypeScript y SQLite funcionando
```

## 🔒 Seguridad

### Tokens

- **Access Token**: 
  - Duración: 15 minutos
  - Uso: Autenticación de peticiones
  - Almacenamiento: Cliente (memoria, no localStorage)

- **Refresh Token**:
  - Duración: 7 días
  - Uso: Renovar Access Token
  - Almacenamiento: Base de datos

### Contraseñas

- Hasheadas con **bcrypt** (10 rounds)
- Nunca se devuelven en las respuestas de la API

### Secrets

- Diferentes secrets para Access y Refresh tokens
- Configurables en `bootstrap.yml`
- Deben cambiarse en producción

## 📝 Scripts Disponibles

```bash
# Desarrollo con hot-reload
npm run dev

# Compilar TypeScript
npm run build

# Ejecutar versión compilada
npm start
```

## 🌐 CORS

CORS está habilitado para todas las origins (`*`) por defecto. Para restringir en producción, modifica `bootstrap.yml`:

```yaml
cors:
  enabled: true
  origin: "https://tu-dominio.com"
```

## 📚 Arquitectura del Código

### Capas

1. **Rutas** (`routes/`) - Definición de endpoints
2. **Controladores** (`controllers/`) - Lógica de negocio
3. **Modelos** (`models/`) - Interacción con la base de datos
4. **Configuración** (`config/`) - Configuración y utilidades

### Convenciones de Código

- ✅ Todo en español (variables, funciones, comentarios)
- ✅ Tipado estricto con TypeScript
- ✅ Funciones asíncronas con async/await
- ✅ Manejo de errores con try/catch
- ✅ Respuestas consistentes en JSON

## 🚧 Mejoras Futuras

- [ ] Logging con Winston
- [ ] Migración a PostgreSQL para producción
- [ ] Documentación con Swagger/OpenAPI
- [ ] Roles y permisos de usuario
