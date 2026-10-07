# Tareas — Spec 002 Proyectos

> Ordenadas por dependencia; tests primero en cada tarea donde aplique
> (constitución, principio 4). Al final, T10 verifica la suite completa y el smoke
> por rutas. El registro del encargo al backend en Linear queda fuera de estas
> tareas (lo coordina el usuario después).

- [ ] **T1. Funciones puras del módulo de proyectos + tests.** RF-02, RF-04,
  RF-06, RF-07 · RF-09 (avatares), RF-15 (predicado/precarga)
  - Crear `src/lib/projects/types.ts` (modelo de UI normalizado, tipos de
    filtros/chips, `WorkspaceStats`, `ProjectFormValues`, entradas de servicio y
    `ProjectsError`), `src/lib/projects/project-filters.ts` (`todayString`,
    `daysBetween` a medianoche local sin off-by-one, `isNew`, `isDueSoon`,
    `filterProjects`, `countWorkspaceStats`), `src/lib/projects/project-display.ts`
    (`avatarInitials`, `avatarColor`) y `src/lib/projects/project-form.ts`
    (`canSubmitProjectForm`, `initialProjectFormValues`).
  - Tests primero: `tests/projects/project-filters.test.ts` (fechas: hoy = 0,
    límites exactos 14/15 y 7/8, vencidos incluidos, cambio de mes/año, DST;
    búsqueda case-insensitive y solo espacios; chips; refinamientos; combinación
    acumulativa; conteos de KPIs), `tests/projects/project-display.test.ts` y
    `tests/projects/project-form.test.ts` (crear vacío + Kanban; editar
    precargado).
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
    formato de contrato que cubre el panorama (al menos un proyecto por estado y
    por tipo, uno favorito, uno «nuevo», uno que «vence pronto», uno con más de 3
    miembros, progreso 0 y progreso 100; fechas relativas a hoy; textos en
    español realistas; un registro archivado que `list` excluye), latencia
    artificial exportada, validaciones del contrato (400 nombre vacío o con solo
    espacios, 404 id inexistente en editar/archivar/eliminar/favorito), valores
    por defecto al crear (estado activo, progreso 0, favorito no, fase «Sprint
    1»/«Planeación» por plantilla, creado hoy, sin fecha límite, miembro inicial
    recibido por parámetro), memoria entre operaciones y `resetProjectsMock()`
    que re-siembra.
  - Tests primero: `tests/projects/projects-mock.test.ts` con temporizadores
    falsos y `resetProjectsMock()` en cada caso (panorama verificado con un `today`
    fijado, latencia, memoria, 400/404 con los textos del contrato, reset).
  - Hecho cuando: el test file pasa en verde verificando que la siembra es
    determinista con reloj falsificado y que las mutaciones se reflejan en los
    listados posteriores.

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
  - Crear `src/components/projects/project-card.tsx` (Tag de tipo, fase como chip
    tiza, badge de estado con color semántico, nombre truncado, descripción
    opcional con `line-clamp`, avatares apilados 3 + «+N» con `avatarInitials`/
    `avatarColor`, barra de progreso con umbrales del dashboard + %, estrella con
    `aria-label` y disabled en vuelo, menú ⋯ con Editar/Archivar/Eliminar con
    cierre por opción/fuera/Esc; cuerpo sin acción) y
    `src/components/projects/workspace-kpis.tsx` (4 KPIs con valor y subtítulo
    fijo, «de N proyectos totales» con el total, skeleton `animate-pulse` con
    `null`; 2 columnas en móvil y 4 en escritorio).
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
  - Crear `src/components/projects/project-form-modal.tsx` (modos crear/editar:
    títulos y botones según modo, `Input` común para el nombre con «El nombre es
    obligatorio» tras interactuar y envío deshabilitado sin nombre válido con el
    predicado compartido, área de texto para descripción, plantilla Kanban/Scrum
    con Kanban por defecto; overlay + ancho máximo centrado, rol de diálogo,
    foco al primer campo, trap, cierre por Esc/«Cancelar»/overlay devolviendo el
    foco al disparador, error de servicio conservando lo escrito, estado de
    carga sin doble envío) y `src/components/projects/confirm-dialog.tsx` (textos
    y botones por acción con el nombre del proyecto, «Eliminar» en rojo
    semántico; foco al botón de confirmación, trap, cierre sin ejecutar por
    Esc/«Cancelar»/overlay, error de servicio con reintento, estado de carga sin
    doble envío).
  - Tests primero: `tests/projects/project-form-modal.test.tsx` y
    `tests/projects/confirm-dialog.test.tsx` (modos y textos, validación,
    envío/cancelación por las tres vías, foco y trap, error conservando datos,
    carga sin doble envío).
  - Hecho cuando: ambos test files pasan en verde y ningún flujo usa `confirm()`
    nativo.

- [ ] **T9. Vista de proyectos + integración + tests.** RF-01…RF-18 (integración)
  · CL-01…CL-16 · depende de T4–T8
  - Sustituir el placeholder de `src/routes/projects.tsx` por `Route` +
  `ProjectsView` (exportada): guard de visitante (redirección a
  `/auth/signin` como el dashboard), ranura de cabecera con `SearchBar`
  («Buscar proyectos...») y `Button` «Nuevo proyecto», `HeaderSlot`, título «Proyectos»
  (h1), sección «Espacio de trabajo» con chips desplazables y botón de filtros
  con contador 0–2, `WorkspaceKpis`, grid responsivo 1/2/3 columnas con contenedor
  enfocable (`tabIndex -1`), skeleton de tarjetas en carga, error con
  «Reintentar», ambos estados vacíos por causa con sus acciones, banner de error
  de favorito, cableado del hook con drawer/modal/diálogo y gestión de foco
  tras mutaciones (disparador si sigue en el DOM; contenedor del grid si la
  tarjeta desaparece o deja de cumplir filtros).
  - Tests primero: `tests/projects/projects-view.test.tsx` con el mock real
    (reset + temporizadores falsos): visitante redirige; carga muestra
    skeleton sin tarjetas ni vacíos; búsqueda en vivo; chips excluyentes
    (pulsar el activo no lo desactiva, solo «Todos» limpia); refinamientos del
    drawer + contador; combinación; «Limpiar filtros» restablece todo; vacíos
    por filtros y por cero proyectos; crear/editar/archivar/eliminar aplican,
    recalculan KPIs y gestionan el foco al grid; favorito se refleja en chip
    «Favoritos» y desaparece al quitarlo con ese chip activo.
  - Hecho cuando: el test file pasa en verde contra el mock sin dobles, la vista
    no conoce el origen de los datos (solo el hook) y los textos de UI están en
    español.

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

## Notas de dependencia

- T1 → T2 → T3 → T5 (módulo de servicios y hook); T6, T7 y T8 dependen solo de T1
  (tipos y funciones puras); T4 es independiente; T9 integra T4–T8; T10 cierra.
- Lotes sugeridos para implementación: (T1+T2) lógica y servicios, (T3+T4) mock
  y cabecera, (T5) hook, (T6+T7+T8) componentes, (T9) integración, (T10)
  verificación.
