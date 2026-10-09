> ESTE DOCUMENTO NO SE TENDRA EN CUENTA A LA HORA DE CREAR SPECS

# ALCANCE — Worklyst v2 (Frontend)

> Documento de alcance y visión de producto. Actualizado: 2026-10-01.

## Contexto

- Worklyst empezó como proyecto universitario y ahora pasa a versión 2.
- Se rehace el **frontend** completo (TanStack Start + React 19 + Tailwind v4 + TypeScript + pnpm) conectando al backend Express existente en `apps/backend`.
- **El frontend NO puede modificar el backend** y su actualización llevará tiempo: se avanza con contratos + mocks.

## Visión y diferenciadores

- Gestor de proyectos y tareas potenciado con IA, **en español**, para equipos de desarrolladores y estudiantes.
- Linear es la referencia de UX pero está en inglés y es minimalista-técnico. Worklyst busca identidad propia:
  1. **⌘K + agente de IA como punto de entrada** (en Linear la IA es un añadido; aquí es el corazón del producto).
  2. **Inbox personalizado** en lugar de notificaciones sueltas.
  3. **Ciclos automáticos** (Scrum sin fricción administrativa).
  4. **UI en español con sistema de diseño propio** (DESIGN.md: Primary 600 azul, tiza, Plus Jakarta Sans).
- Los tableros Kanban/Scrum tradicionales son algo que Linear no tiene: otra diferencia natural.

## Estrategia: backend externo

- **La spec define el contrato REST esperado** (ej. `POST /api/projects` con `{name, description, template: 'kanban' | 'scrum'}`). El contrato se entrega al equipo backend como encargo.
- Capa de servicios con dos adaptadores:
  ```
  src/services/<modulo>-service.ts   ← lógica pura (la interfaz)
  src/services/mock/<modulo>-mock.ts ← implementación con datos en memoria
  src/services/api/<modulo>-api.ts   ← implementación con axios (real)
  ```
- Flag de entorno `VITE_API_MODE=mock|real` elige el adaptador. Los componentes no saben de dónde vienen los datos (Constitución, principio 3).
- Los mocks simulan **latencia y errores** para probar estados de carga/error desde ya.
- Cuando el backend se actualice: se cambia el flag, sin tocar componentes.

## Fases del proyecto (cada fase = specs independientes)

| Fase | Módulos | Notas |
|------|---------|-------|
| **0** | Auth (registro, login, logout) | Único módulo conectable HOY. Validaciones en frontend por ahora |
| **1** | Proyectos + Tableros (Kanban/Scrum) + Tareas (descripción, DnD, tags, todos) | Corazón del producto, con mocks |
| **2** | Dashboard con KPIs reales | Ya habrá datos de fase 1 |
| **3** | Grupos (públicos/privados, roles Admin/Member) | Desbloquea colaboración |
| **4** | Chat en vivo (directos + canales de grupo/proyecto) | Depende de grupos |
| **5** | Agente IA especializado (consultar, crear, resumir, sugerir) | Necesita datos reales de fases 1–4 |
| **6** | MCP del agente | Capa fina sobre el agente; probablemente fuera de v1 |

## Detalle por módulo

### Auth (Fase 0 — primera spec)
- Registro, login, logout. Contrato actual del backend: `POST /api/auth/register|login|logout`, header `x-api-key` global, rate limiting.
- **Decisiones pendientes**: botones sociales (backend sin OAuth), forgot-password (sin ruta ni endpoint), toggle "Recuérdame" (backend sin refresh token ni sesiones largas), endpoint `/me` para recuperar sesión, y si la fortaleza de contraseña se valida también en backend.

### Proyectos (Fase 1)
- CRUD + **elegir plantilla Kanban o Scrum al crear**.
- ⚠️ Requiere cambio en backend: no existe el concepto de board/sprint/plantilla.

### Tareas (Fase 1)
- Descripción detallada, checklists (todos), tags, drag & drop entre columnas.
- Columnas fijas: To Do, In Progress, Done (Kanban) + gestión de sprints (Scrum).

### Dashboard (Fase 2)
- KPIs: velocidad del equipo por ciclo, creadas vs. completadas, distribución por estado.

### Grupos (Fase 3)
- Públicos y privados, roles Admin/Member, invitaciones.

### Chat (Fase 4)
- Mensajes directos y canales de grupo/proyecto, tiempo real, offline → almacenar y mostrar al reconectar.

### Agente IA (Fase 5)
- Conversación, consulta de datos reales, creación de entidades (preguntando si es ambiguo), resúmenes con sugerencias, sugerencias de tareas por carga/roles/prioridad.

## Features inspiradas en Linear (a integrar)

### 🥇 Diferenciadores clave
1. **Command Palette (⌘K)** — buscar y ejecutar cualquier acción; acceso directo al agente IA (sello de Worklyst).
2. **Inbox** — bandeja de actividad personal (asignaciones, menciones, cambios en tareas seguidas) con marcar-leído y agrupación.
3. **Ciclos (Cycles)** — auto-inicio y auto-cierre; tareas incompletas se mueven o escalan al siguiente ciclo.
4. **Relaciones entre tareas** — sub-tareas y relaciones: bloquea a / bloqueada por / relacionada con.

### 🥈 Muy recomendables
5. Vistas guardadas con filtros combinables (estado, tag, asignado, prioridad).
6. Feed de actividad dentro de cada tarea (historial de cambios).
7. Plantillas de tarea (bug con pasos de repro, user story con criterios).
8. Insights/Analytics para el dashboard.

### 🥉 Más adelante
9. Triage (cola de tareas nuevas para el admin).
10. Integración Git (PRs mueven tareas de estado).
11. Roadmap/Timeline (Gantt ligero).
12. Asks (crear tareas desde chat/canales — lo cubre el agente).

## Fuera de alcance v1

- MCP server (revisar en v2, tras el agente).
- OAuth social (Google/GitHub) — decisión pendiente.
- Forgot password.
- Notificaciones push, modo offline, multimedia en mensajes, roles dinámicos.

## Estado del backend (revisión 2026-10-01)

- ✅ Auth completo (register/login/logout, rate limit, `x-api-key` global, JWT con bloqueo en logout).
- ❌ Sin OAuth, sin refresh token, sin `/me`, sin validación de fortaleza de contraseña.
- ✅ Grupos y roles existen (CRUD básico).
- ❌ Proyectos: CRUD plano, sin boards/sprints/tags/todos.
- ❌ Chat en tiempo real: no existe.
- ❌ IA/MCP: no existe.
