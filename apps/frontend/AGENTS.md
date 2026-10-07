# AGENTS.md — Worklyst Frontend

## Proyecto

- Worklyst es un sistema de Gestión de Proyectos y tareas potenciado con IA.
- Este paquete es la interfaz: TanStack Start + React 19 + Tailwind v4 + TypeScript + pnpm.

## Comandos

- Ejecutar: `pnpm dev` · Build: `pnpm build` · Rutas: `pnpm generate-routes`
- Lint/formato: `pnpm lint` / `pnpm check`
- Tests: `pnpm test` (Vitest + jsdom + Testing Library)

## Estilo y convenciones

- El código debe estar escrito en Ingles; los comentarios en español.
- Todo nombre de función, variable, clase y archivo en inglés; español solo para
  comentarios, specs, docs y textos de UI.
- Componentes con kebab-case (archivo) y PascalCase (nombre). Funciones con camelCase.
- Tipado estricto y correcto con TypeScript. Imports internos siempre con `#/...`, nunca rutas relativas.
- Comentarios al mínimo, solo lo imprescindible: prohibidas la paráfrasis del
  código, las referencias a RF/RNF y el historial de cambios; antes de escribir
  un comentario, prefiere un mejor nombre.
- Crea el mínimo de archivos necesario: no separes contrato, fábrica o mock en
  archivos propios ni uses carpetas de un solo archivo salvo cuando el tamaño o
  la responsabilidad real lo exijan (YAGNI).

## Reglas

- Lee docs/constitution.md antes de tocar código. Código solo tras spec aprobada (docs/specs/).
- Consulta DESIGN.md antes de modificar la interfaz o estilos.

## Flujo SDD — iteración

- `implementer` escribe código + tests de la tarea o lote y hace UNA única
  ejecución de cortesía (`pnpm test`) al final para asegurar que compila y
  pasa; no valida RF ni re-ejecuta la suite en bucle.
- Al terminar cada tarea/lote, el coordinator ofrece al usuario: (1) seguir
  con la siguiente tarea, o (2) ejecutar review.
- El review (`reviewer`) es la única validación completa por lote: `pnpm test`,
  `pnpm check` y revisión RF por RF. El coordinator no re-ejecuta tests.
- Las tareas afines se agrupan en lotes (p. ej. T8+T9: formularios signin/signup).
- El volumen de tests se mantiene; no se reduce.
- `implementer` ejecuta lo planificado: lee solo los documentos y archivos
  listados en su tarea; no audita configuraciones (biome.json, vite.config,
  tsconfig, etc.) ni reabre decisiones ya tomadas. Si el plan no cubre algo,
  lo reporta al coordinator en vez de decidir por su cuenta.
