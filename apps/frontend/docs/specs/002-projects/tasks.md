# Tareas — Spec 002 Proyectos

> Fase A (T1–T3) módulo/lógica · Fase B (T4–T9) vista/hook/integración · Cierre
> (T10). Tests primero donde aplique (constitución, principio 4); el encargo al
> backend en Linear lo coordina el usuario fuera de estas tareas.

## Fase A — Módulo y lógica (T1–T3)

- [ ] **T1. Funciones puras del módulo de proyectos + tests.** RF-02, RF-04,
  RF-06, RF-07 · RF-09 (avatares), RF-15 (predicado/precarga)
  - Crear los módulos puros de §2/§4 del plan: `types.ts`,
    `project-filters.ts` (fechas a día local, filtrado combinado, conteos de
    KPIs), `project-display.ts` (avatares) y `project-form.ts`
    (predicado/precarga del formulario).
  - Tests primero: `tests/projects/project-filters.test.ts` (fechas con
    límites exactos 14/15 y 7/8, vencidos, DST; búsqueda/chips/refinamientos/
    combinación/KPIs, casos de §8.1), `tests/projects/project-display.test.ts`
    y `tests/projects/project-form.test.ts`.
  - Hecho cuando: los tres test files pasan en verde sin React ni IO, con
    `daysBetween` parseando a medianoche local (nunca `new Date("YYYY-MM-DD")`).

- [ ] **T2. Contrato de servicio + adaptador api + fábrica + Bearer + tests.**
  RF-13, RF-14 · depende de T1
  - Extender `src/lib/projects/types.ts` si hace falta y crear
    `src/lib/projects/projects-api.ts`: interfaz `ProjectsService` (list, create,
    update, archive, remove, setFavorite), tipos del cable (`BackendProject`,
    envolturas), mapper `toUiProject` (exportado, compartido con el mock),
    adaptador axios contra las 6 operaciones del contrato REST (cuerpos y
    envolturas exactos: miembro en create, `archived: true`, `favorite`), mapeo de
    errores a `ProjectsError` (400/404/401/403/red, mensajes en español, 403 sin
    detalle) y fábrica `getProjectsService()`/`projectsService` con
    `VITE_API_MODE` (default mock).
  - Modificar `src/lib/auth/token.ts` (constante `SESSION_TOKEN_KEY`),
    `src/stores/auth-store.ts` (importa y reexporta la constante) y `src/lib/api.ts`
    (interceptor que añade `Authorization: Bearer <token>` cuando exista token).
  - Tests primero: `tests/projects/projects-api.test.ts` espíando la instancia
    axios (rutas, cuerpos, envolturas, 204 sin cuerpo, traducción de errores,
    fábrica por modo) y extensión de `tests/auth/api.test.ts` con el interceptor
    (con y sin token).
  - Hecho cuando: ambos test files pasan en verde, la fábrica devuelve mock con
    modo ausente/desconocido y api con `api`/`real`, y los 158 tests de auth
    siguen en verde tras el movimiento de la constante y el interceptor.

- [ ] **T3. Adaptador mock + tests.** RF-12, RF-13 CA-02/03, RF-15 CA-03 ·
  depende de T2
  - Crear `src/lib/projects/projects-mock.ts`: lista sembrada en memoria en
    formato de contrato que cubre el panorama y las fechas relativas de RF-12
    (con un registro archivado que `list` excluye), valores por defecto al
    crear de RF-15 CA-03 (miembro inicial recibido por parámetro),
    validaciones del contrato (RF-14 CA-03), latencia artificial exportada,
    memoria entre operaciones y `resetProjectsMock()` que re-siembra.
  - Tests primero: `tests/projects/projects-mock.test.ts` con temporizadores
    falsos y `resetProjectsMock()` en cada caso (panorama verificado con un `today`
    fijado, latencia, memoria, 400/404 con los textos del contrato, reset).
  - Hecho cuando: el test file pasa en verde verificando que la siembra es
    determinista con reloj falsificado y que las mutaciones se reflejan en los
    listados posteriores.

## Fase B — Vista, hook e integración (T4–T9)

- [ ] **T4. Cabecera parametrizada con ranura condicional + tests.** RF-01,
  RF-02, RF-03 · RNF-03 (cabecera), independiente de T1–T3
  - Modificar `src/components/layout/header.tsx`: contexto interno `HeaderActions`
    con `HeaderActionsProvider` y `HeaderSlot` (registro al montar, desregistro al
    desmontar, render null) y la zona de acciones en la cabecera (segunda fila
    bajo los breadcrumbs por debajo de 768 px con búsqueda de ancho flexible; a
    continuación de los breadcrumbs a partir de 768 px). El resto de la cabecera
    (breadcrumbs, campana, avatar) queda intacto. Modificar
    `src/routes/__root.tsx` para envolver la shell en el provider.
  - Tests primero: `tests/layout/header.test.tsx` (sin registro no hay búsqueda ni
    «Nuevo proyecto»; con `HeaderSlot` aparecen; al desmontar el registro
    desaparecen).
  - Hecho cuando: el test file pasa en verde, ninguna otra vista registra
    controles y la cabecera de las demás rutas no cambia visualmente.

- [ ] **T5. Hook de orquestación `useProjects` + tests con doble.** RF-13
  (consumo), RF-17, RF-18 · depende de T1, T2
  - Crear `src/hooks/use-projects.ts`: `useProjects(service = projectsService)`
    con carga al montar (guard contra doble disparo) y reintento, estados
    `listStatus/listError`, búsqueda/chip/refinamientos con derivados
    (`visibleProjects`, `kpis`, `activeRefinementCount`, vacíos por causa),
    overlays (`drawerOpen`, `modal` create/edit, `confirm` archivar/eliminar),
    `clearFilters()`, y mutaciones sin optimismo con estados de carga y error por
    acción (`toggleFavorite` con `favoritePendingId` y `actionError`,
    `submitForm` con `formPending/formError` y `memberName` = nombre de la sesión
    o el correo, `confirmAction` con `confirmPending/confirmError`). La
    actualización de la lista siempre usa la respuesta del servicio.
  - Tests primero: `tests/hooks/use-projects.test.tsx` con `renderHook` y un
    doble del servicio (carga ok/loading/error y reintento; fallo de listado con
    401/403/red no provocable por datos; mutaciones felices actualizan la lista y
    recalculan KPIs; favorito fallido → `actionError` sin cambio de estado;
    filtros y derivados; `clearFilters`).
  - Hecho cuando: el test file pasa en verde cubriendo carga, error con
    reintento y las cinco mutaciones contra el doble, sin tocar el mock.

- [ ] **T6. Tarjeta de proyecto + KPIs + tests.** RF-07, RF-09, RF-10 · depende
  de T1
  - Crear `src/components/projects/project-card.tsx` y
    `src/components/projects/workspace-kpis.tsx` según los CA de RF-09/RF-10 y
    RF-07 y los patrones visuales de §7 del plan (tarjeta muda con estrella y
    menú ⋯; KPIs con valor, subtítulo fijo, «de N proyectos totales» con el
    total y skeleton, 2 columnas en móvil y 4 en escritorio).
  - Tests primero: `tests/projects/project-card.test.tsx` y
    `tests/projects/workspace-kpis.test.tsx` (campos, descripción omitida,
    avatares y «+N», umbrales, estrella y menú operativos por callbacks, KPIs y
    skeleton).
  - Hecho cuando: ambos test files pasan en verde con componentes mudos (solo
    props y callbacks, cero lógica de datos dentro).

- [ ] **T7. Drawer de filtros + tests.** RF-05 · RNF-07 · depende de T1
  - Crear `src/components/projects/filters-drawer.tsx`: panel desde el borde
    derecho sobre overlay (ancho completo en móvil), grupos tipo y estado como
    selección única con «Todos», «Limpiar filtros», botón de cierre con
    `aria-label`; rol de diálogo etiquetado «Filtros», foco inicial al panel,
    trap de Tab/Shift+Tab, cierre por botón/overlay/Esc, devolución del foco al
    disparador; refinamientos en vivo vía callbacks.
  - Tests primero: `tests/projects/filters-drawer.test.tsx` (grupos de selección
    única, «Limpiar filtros», cierres, rol/etiqueta, foco inicial y trap,
    callbacks en vivo).
  - Hecho cuando: el test file pasa en verde y el drawer no permite interactuar
    con la vista subyacente mientras permanece abierto (overlay).

- [ ] **T8. Modal único de crear/editar + diálogo de confirmación + tests.**
  RF-15, RF-16 · RNF-07 · depende de T1
  - Crear `src/components/projects/project-form-modal.tsx` y
    `src/components/projects/confirm-dialog.tsx` cubriendo los CA de RF-15 y
    RF-16: modal con modos crear/editar (títulos, botones, precarga y
    validación del nombre con el predicado compartido; plantilla Kanban/Scrum
    con Kanban por defecto) y diálogo con textos por acción y «Eliminar» en
    rojo semántico; ambos con foco inicial, trap, cierre por
    Esc/«Cancelar»/overlay devolviendo el foco al disparador, error de
    servicio conservando lo escrito y estado de carga sin doble envío.
  - Tests primero: `tests/projects/project-form-modal.test.tsx` y
    `tests/projects/confirm-dialog.test.tsx` (modos y textos, validación,
    envío/cancelación por las tres vías, foco y trap, error conservando datos,
    carga sin doble envío).
  - Hecho cuando: ambos test files pasan en verde y ningún flujo usa `confirm()`
    nativo.

- [ ] **T9. Vista de proyectos + integración + tests.** RF-01…RF-18
  (integración, con sus CA) · depende de T4–T8
  - Sustituir el placeholder de `src/routes/projects.tsx` por `Route` +
    `ProjectsView` (exportada): guard de visitante (redirección a
    `/auth/signin` como el dashboard), ranura de cabecera con `SearchBar`
    («Buscar proyectos...») y `Button` «Nuevo proyecto», título «Proyectos»
    (h1), sección «Espacio de trabajo» con chips y botón de filtros con
    contador, `WorkspaceKpis`, grid responsivo (RF-08) con contenedor
    enfocable (`tabIndex -1`), estados de carga/error y vacíos por causa,
    banner del error de favorito, y cableado del hook con drawer/modal/diálogo
    y la gestión de foco tras mutaciones (disparador si sigue en el DOM;
    contenedor del grid si la tarjeta desaparece o deja de cumplir filtros).
  - Tests primero: `tests/projects/projects-view.test.tsx` con el mock real
    (reset + temporizadores falsos), ejercitando a nivel de vista los CA de
    RF-01…RF-18: guard, carga, búsqueda y filtros combinados con sus vacíos,
    mutaciones aplicando y recalculando KPIs, y favorito con chip
    «Favoritos» activo (desaparición y foco al grid).
  - Hecho cuando: el test file pasa en verde contra el mock sin dobles, la vista
    no conoce el origen de los datos (solo el hook) y los textos de UI están en
    español.

## Cierre (T10)

- [ ] **T10. Verificación global.** Todos los RF · RNF-06, RNF-08
  - Suite completa en verde (`pnpm test`: los 158 tests existentes más los
    nuevos, sin reducciones), `pnpm check` limpio, y búsqueda de `RF-`, `RNF-`,
    `CA-` y `CL-` sobre `src/` y `tests/` sin resultados (comentarios mínimos y
    sin referencias a la spec).
  - Smoke de cabecera por rutas con `pnpm dev` (navegador, modo mock): con la
    sesión iniciada, `/projects` muestra búsqueda y «Nuevo proyecto» en la
    cabecera con la vista completa funcionando; `/`, `/groups`, `/messages` y
    `/settings` conservan su cabecera actual sin búsqueda ni botón; sin sesión,
    `/projects` redirige al inicio de sesión. Comprobación de cortesía del
    responsive (320 px y ≥768 px, sin scroll horizontal), no E2E.
  - Hecho cuando: todo lo anterior se cumple y los criterios de finalización de
    la spec quedan cubiertos (el encargo al backend de RF-14 se registra en
    Linear fuera de estas tareas).

---

## Lotes sugeridos

(T1+T2) lógica y servicios, (T3+T4) mock y cabecera, (T5) hook,
(T6+T7+T8) componentes, (T9) integración, (T10) verificación.
