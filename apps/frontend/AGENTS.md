# AGENTS.md — Worklyst Frontend

## Proyecto

- Worklyst es un sistema de Gestión de Proyectos y tareas potenciado con IA.
- Este paquete es la interfaz: TanStack Start + React 19 + Tailwind v4 + TypeScript + pnpm.

## Comandos

- Ejecutar: `pnpm dev` · Build: `pnpm build` · Rutas: `pnpm generate-routes`
- Lint/formato: `pnpm lint` / `pnpm check`
- Tests: aún no existen (meta de la constitución, se definirán con su spec)

## Estilo y convenciones

- El código debe estar escrito en Ingles; los comentarios en español.
- Todo nombre de función, variable, clase y archivo en inglés; español solo para
  comentarios, specs, docs y textos de UI.
- Componentes con kebab-case (archivo) y PascalCase (nombre). Funciones con camelCase.
- Tipado estricto y correcto con TypeScript. Imports internos siempre con `#/...`, nunca rutas relativas.

## Reglas

- Lee docs/constitution.md antes de tocar código. Código solo tras spec aprobada (docs/specs/).
- Consulta DESIGN.md antes de modificar la interfaz o estilos.
