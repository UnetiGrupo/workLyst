# Product Requirements Document (PRD)

## Backend API - Worklist

---

## Resumen Ejecutivo

**Nombre del Producto:** Worklist Backend API  
**Versión:** 1.1.0  
**Fecha:** Enero 2026  
**Estado:** En Producción / Evolución  

### Descripción General

API REST backend desarrollada con TypeScript y Express que proporciona servicios de gestión de trabajo colaborativo para la aplicación Worklist. Implementa un sistema de seguridad avanzado que combina validación de aplicaciones mediante **API Key** y autenticación de usuarios mediante **JWT**. Los datos se almacenan en una base de datos **PostgreSQL (Neon)** de alto rendimiento.

### Objetivos del Producto

1. **Seguridad Multi-capa**: Protección de infraestructura con API Key y protección de identidad con JWT.
2. **Colaboración Eficiente**: Gestión completa de Grupos, Proyectos y Tareas con asignaciones y roles.
3. **Escalabilidad en la Nube**: Transición a PostgreSQL para soportar mayores cargas de trabajo y persistencia robusta.
4. **Experiencia de Desarrollador (DX)**: Documentación integrada con Swagger y carga de configuración flexible.
5. **Mantenibilidad**: Código y documentación 100% en español.

---

## Objetivos de Negocio

### Problemas que Resuelve

- **Control de Acceso de Aplicaciones**: Previene que aplicaciones no autorizadas consuman recursos de la API mediante `x-api-key`.
- **Gestión Colaborativa**: Estructura el trabajo en niveles (Grupos -> Proyectos -> Tareas).
- **Seguridad de Sesión**: Minimiza riesgos con acceso basado en tokens de corta duración y revocación inmediata.
- **Persistencia Confiable**: Uso de base de datos relacional robusta en la nube.

---

## Usuarios y Stakeholders

### Usuarios Primarios

1. **Desarrolladores Frontend (Web/Mobile)**: Consumen la API utilizando el API Key global y tokens de usuario.
2. **Usuarios Finales**: Gestionan sus propios proyectos y colaboran en grupos.
3. **Integraciones Externas (Bots/IA)**: Utilizan tokens de sistema para automatización de tareas.

---

## Arquitectura Técnica

### Stack Tecnológico

| Componente | Tecnología | Versión | Propósito |
|------------|------------|---------|-----------|
| Runtime | Node.js | Latest | Entorno de ejecución JavaScript |
| Lenguaje | TypeScript | 5.x | Tipado estático y mejor DX |
| Framework Web | Express | 5.x | Servidor HTTP y routing |
| Base de Datos | PostgreSQL (Neon) | Latest | Almacenamiento persistente escalable |
| Autenticación | jsonwebtoken | 9.x | Generación y validación JWT |
| Seguridad | API Key Middleware | Custom | Validación de aplicaciones autorizadas |
| Documentación | Swagger UI | Latest | Documentación interactiva de la API |

### Arquitectura de Capas de Seguridad

```mermaid
graph TD
    A[Cliente / App] -->|Request + x-api-key| B[Middleware API Key]
    B -->|Permitido| C[Middleware JWT (verificarToken)]
    C -->|Identificado| D[Router /api/...]
    D --> E[Controladores]
    E --> F[Modelos]
    F --> G[PostgreSQL Neon]
```

---

## Especificación de Seguridad

### Capa 1: API Key (Validación de App)

Todas las peticiones a `/api/*` requieren el header `x-api-key`. Esto asegura que solo las aplicaciones autorizadas (Frontend oficial, Mobile app) puedan "hablar" con el backend.

### Capa 2: JWT (Autenticación de Usuario)

Una vez validada la aplicación, se requiere un token Bearer para identificar al usuario. Esto es vital porque:

- Identifica **quién** realiza la acción (`req.user.id`).
- Permite aplicar **reglas de negocio** (ej: "Solo el creador de este grupo puede eliminarlo").
- Mantiene la **privacidad** de los datos entre diferentes usuarios.

---

## Modelo de Datos Principal

### Estructura de Entidades

- **Usuarios**: Entidad base de identidad.
- **Grupos**: Contenedores de usuarios para colaboración.
- **Proyectos**: Unidades de trabajo asociadas a un dueño y miembros.
- **Tareas**: Acciones específicas dentro de un proyecto, asignables a miembros.
- **Roles**: Definen niveles de acceso (Owner, Member).

---

## Especificación de API (Resumen)

| Módulo | Endpoint Base | Descripción |
| :--- | :--- | :--- |
| **Auth** | `/api/auth` | Registro, Login (JWT), Logout (Blocklist). |
| **Grupos** | `/api/groups` | CRUD de grupos y gestión de miembros. |
| **Proyectos** | `/api/projects` | CRUD de proyectos y membresías. |
| **Tareas** | `/api/tasks` | Gestión de tareas dentro de proyectos. |
| **Usuarios** | `/api/users` | Búsqueda y gestión de perfiles. |
| **Roles** | `/api/roles` | Listado de roles disponibles. |

---

## 🚀 Roadmap y Evolución

### Completado ✅ (v1.1.0)

- Migración a **PostgreSQL**.
- Implementación de **API Key Global**.
- Módulos de **Grupos, Proyectos y Tareas**.
- Documentación **Swagger** básica.

### Próximos Pasos (v1.2.0)

- **Logging avanzado** con Winston.
- **Validación de esquemas** con Joi/Zod.
- **Refactorización de Roles** dinámicos.
- **Pruebas unitarias** con Jest.

---

**Última actualización:** 2026-01-30  
**Estado:** Documentación sincronizada con el estado actual del código.
