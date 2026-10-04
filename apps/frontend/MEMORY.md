# MEMORY.md — Worklyst Frontend

## Estado actual

- Fase de maquetación visual con datos mock (sin lógica de negocio ni backend conectado).
- Constitución regenerada desde cero (6 principios, 2026-10-01).
- Alcance y visión definidos en docs/scope.md (fases 0–6, features de Linear).
- Spec 001 — Auth aprobada (2026-10-01); plan.md y tasks.md generados (10 tareas).
- Spec 001 — Auth: T1–T10 completadas con verde (128 tests); Cambio v1.1 aplicado (estructura mínima RNF-05/RNF-06); T7 eliminada (hook descartado, YAGNI); T11 (E2E con Playwright) diferida fuera de esta iteración.

## Decisiones (y por qué)

- Zustand aprobado para estado global (mínima boilerplate frente a React Context).
- Vitest aprobado para tests (TS nativo, resuelve alias `#`, stack Vite).
- Mocks por defecto con `VITE_API_MODE=mock|real` (contrato + adaptadores, docs/scope.md).
- Spec de Auth: solo validaciones en frontend por ahora (encargos backend documentados).

## Flujo SDD — iteración (decisión 2026-10-02)

- `implementer` escribe código + tests de la tarea o lote y hace UNA única
  ejecución de cortesía (`pnpm test`) al final para asegurar que compila y
  pasa; no valida RF ni re-ejecuta la suite en bucle.
- Al terminar cada tarea/lote, el coordinator ofrece al usuario: (1) seguir
  con la siguiente tarea, o (2) ejecutar review.
- El review (`reviewer`) es la única validación completa por lote: `pnpm test`
  (128 tests), `pnpm check` y revisión RF por RF. El coordinator no re-ejecuta
  tests por su cuenta.
- Las tareas afines se agrupan en lotes (p. ej. T8+T9: formularios).
- El volumen de tests se mantiene (128); no se reducen.

## Aprendizajes y errores a evitar

- (Vacío por ahora)

## Próximos pasos

- E2E de auth (T11) retomado cuando la app esté terminada (excepción documentada al principio 4; `@playwright/test` no aprobado aún).
- Encargos pendientes al backend: fortaleza de contraseña, `/me`, refresh,
  OAuth, reset de contraseña (docs/specs/001-auth/spec.md).

Última actualización: 2026-10-04
