# MEMORY.md — Worklyst Frontend

## Estado actual

- Fase de maquetación visual con datos mock (sin lógica de negocio ni backend conectado).
- Constitución regenerada desde cero (6 principios, 2026-10-01).
- Alcance y visión definidos en docs/scope.md (fases 0–6, features de Linear).
- Spec 001 — Auth aprobada (2026-10-01); plan.md y tasks.md generados.
- Spec 001 — Auth (iteración cerrada): T1–T10 completadas y **aprobadas por review** (128 tests); Cambio v1.1 aplicado (estructura mínima RNF-05/RNF-06); T7 eliminada (hook descartado, YAGNI); T11 (E2E) diferida fuera de esta iteración.
- Cambio v1.3 (2026-10-04) aprobado y completado (T12–T15): limpieza de referencias a la spec en comentarios (cero coincidencias `RF-/RNF-/CA-/CL-` en `src/` y `tests/`), validación mínima de envío compartida botón/envío, identidad real del sidebar desde la sesión, y mensajes amables para flujos imprevistos.
- Suite actual: **158 tests / 12 archivos en verde** con `VITE_API_MODE=mock`; `pnpm check` limpio.

## Decisiones (y por qué)

- Zustand aprobado para estado global (mínima boilerplate frente a React Context).
- Vitest aprobado para tests (TS nativo, resuelve alias `#`, stack Vite).
- Mocks por defecto con `VITE_API_MODE=mock|real` (contrato + adaptadores, docs/scope.md).
- Spec de Auth: solo validaciones en frontend por ahora (encargos backend documentados).
- Cambio v1.3: login sin reglas de fortaleza (solo contraseña no vacía) y registro con las 4 reglas; correo con `@` como mínimo visible; predicado único compartido entre botón y envío (`canSubmitRegister`/`canSubmitLogin`); identidad del sidebar desde la sesión con fallback «Invitado»; errores imprevistos con mensaje genérico y amable, nunca técnico ni vacío.

## Flujo SDD — iteración (decisión 2026-10-02)

- `implementer` escribe código + tests de la tarea o lote y hace UNA única
  ejecución de cortesía (`pnpm test`) al final para asegurar que compila y
  pasa; no valida RF ni re-ejecuta la suite en bucle.
- Al terminar cada tarea/lote, el coordinator ofrece al usuario: (1) seguir
  con la siguiente tarea, o (2) ejecutar review.
- El review (`reviewer`) es la única validación completa por lote: `pnpm test`
  (158 tests con `VITE_API_MODE=mock`), `pnpm check` y revisión RF por RF. El
  coordinator no re-ejecuta tests por su cuenta.
- Las tareas afines se agrupan en lotes (p. ej. T8+T9: formularios).
- El volumen de tests se mantiene (158); no se reducen.

## Aprendizajes y errores a evitar

- `pnpm test` sin override usa el `.env` local (gitignoreado), que define
  `VITE_API_MODE=real`, y hace fallar 8 tests preexistentes de
  `auth-store`/`auth-api`. Correr la suite con `VITE_API_MODE=mock`.
- Pendiente conocido: forzar el modo mock en el setup de Vitest
  (`vite.config` no tiene `setupFiles`); decisión pendiente del usuario.

## Próximos pasos

- E2E de auth (T11) retomado cuando la app esté terminada (excepción
  documentada al principio 4). Lo no aprobado ni instalado es
  `@playwright/test`; el MCP chrome-devtools sí se usa para verificación
  manual puntual.
- Pendiente conocido: forzar el modo mock en el setup de Vitest (ver
  Aprendizajes); decisión pendiente del usuario.
- Encargos pendientes al backend: fortaleza de contraseña, `/me`, refresh,
  OAuth, reset de contraseña (docs/specs/001-auth/spec.md).

Última actualización: 2026-10-04
