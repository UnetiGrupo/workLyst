# MEMORY.md — Worklyst Frontend

## Estado actual

- Fase de maquetación visual con datos mock (sin lógica de negocio ni backend conectado).
- Constitución regenerada desde cero (6 principios, 2026-10-01).
- Alcance y visión definidos en docs/scope.md (fases 0–6, features de Linear).
- Spec 001 — Auth aprobada (2026-10-01); plan.md y tasks.md generados (10 tareas).

## Decisiones (y por qué)

- Zustand aprobado para estado global (mínima boilerplate frente a React Context).
- Vitest aprobado para tests (TS nativo, resuelve alias `#`, stack Vite).
- Mocks por defecto con `VITE_API_MODE=mock|real` (contrato + adaptadores, docs/scope.md).
- Spec de Auth: solo validaciones en frontend por ahora (encargos backend documentados).

## Aprendizajes y errores a evitar

- (Vacío por ahora)

## Próximos pasos

- Implementar T1 de la spec 001 — Auth → `/sdd-implement 001-auth T1`.
- Encargos pendientes al backend: fortaleza de contraseña, `/me`, refresh,
  OAuth, reset de contraseña (docs/specs/001-auth/spec.md).

Última actualización: 2026-10-01
