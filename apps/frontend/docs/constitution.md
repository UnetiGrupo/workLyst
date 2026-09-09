# CONSTITUCIÓN — Worklyst Frontend

1. Stack: TanStack Start + React 19 + Tailwind v4 + TypeScript + pnpm. Sin agregar dependencias sin aprobación.
2. Specs: Cada módulo tiene su spec en docs/specs/. Código solo se escribe después de que la spec esté aprobada.
3. Separación: Lógica de negocio en hooks/services, UI en componentes. Nunca mezclar fetch con render.
4. Tests: Mínimo 1 test por componente público. E2E para flujos críticos (auth, crear tarea).
5. Persistencia: Estado del servidor se maneja vía API REST. El frontend NO persiste datos en localStorage salvo tokens JWT.
6. Idioma: Código y variables en inglés. Comentarios, specs y mensajes de UI en español.
7. Módulos: Auth, Proyectos, Plantillas (Scrum/Kanban), Tareas, Grupos, Mensajes, IA.
8. Backend: Comunica vía REST + API Key (`x-api-key`) + JWT Bearer. No direct access a DB desde frontend.
9. IA: Integración vía endpoints del backend (n8n/Groq). El frontend solo consume, no maneja prompts directamente.
10. Convenciones: Componentes kebab-case/PascalCase, funciones camelCase, tipado estricto TypeScript.
