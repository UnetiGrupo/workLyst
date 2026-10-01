# CONSTITUCIÓN — Worklyst

1. Stack simple: TanStack Start + React 19 + Tailwind v4 + TypeScript + pnpm.
   Ninguna dependencia nueva sin aprobación explícita.
2. La spec manda: cada módulo tiene spec en docs/specs/. Si algo no está en la
   spec, no se implementa. Un cambio de requisitos se aplica primero en la spec,
   luego en plan/tasks y por último en el código.
3. Separación estricta: lógica de negocio en hooks y servicios puros; la UI solo
   renderiza. Nunca mezclar fetch, estado o cálculo con el render.
4. Tests obligatorios: 1 test mínimo por componente público y por función pura de
   lógica; E2E para los flujos críticos. Sin tests no se da una tarea por hecha.
5. Protección de datos: la API solo habla REST con API Key + JWT. Cero datos de
   usuario en localStorage salvo el token de sesión. Estado del servidor vía
   cliente de datos, nunca en cachés locales persistentes.
6. Idioma: código, nombres y textos en inglés; comentarios, specs y UI en
   español. Convenciones de AGENTS.md siempre vigentes.
