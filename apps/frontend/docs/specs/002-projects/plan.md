# PLAN — Spec 002 Proyectos

> Generado: 2026-10-07 · Deriva de la spec aprobada `docs/specs/002-projects/spec.md`
> (v2: UI completa + CRUD real sobre capa de servicios). Espeja el patrón del módulo de
> auth (`docs/specs/001-auth/`): capa de servicios en `src/lib/projects/` con adaptador
> mock por defecto, y tests con el stack ya aprobado (Vitest + jsdom + Testing Library,
> sin dependencias nuevas). El contrato REST (RF-14) queda como encargo al backend
> documentado en la propia spec; sin E2E en esta iteración (excepción documentada,
> §8.2).

## 1. Enfoque técnico

Mínimo viable bien hecho (criterio rector de la spec): la vista de proyectos se
construye con componentes mudos que solo renderizan, un único hook de orquestación
que concentra el estado y las mutaciones, y una capa de servicios con dos adaptadores
intercambiables (mock en memoria por defecto, axios contra el contrato). La cabecera
global se parametriza con una ranura condicional en lugar de duplicarse. Toda la
lógica de negocio es función pura en el módulo (fechas, filtrado, KPIs, avatares,
formulario), testeable sin React.

## 2. Archivos a crear y su responsabilidad

| Archivo | Responsabilidad | RF |
|---|---|---|
| `src/lib/projects/types.ts` | Tipos compartidos del módulo: modelo de UI (`Project`, `ProjectStatus` ya normalizado, `ProjectTemplate`), filtros (`ProjectChip`, `ProjectTypeFilter`, `ProjectStatusFilter`, `ProjectFilters`), KPIs (`WorkspaceStats`), formulario (`ProjectFormValues`), entradas de servicio (`CreateProjectInput`, `EditProjectInput`) y `ProjectsError` (código + mensaje en español + status) | RF-13, RF-14 |
| `src/lib/projects/project-filters.ts` | Lógica pura del espacio de trabajo: reglas de fecha a día local (`todayString`, `daysBetween`, `isNew`, `isDueSoon`), filtrado combinado (`filterProjects`) y conteos de KPIs (`countWorkspaceStats`) | RF-02, RF-04, RF-06, RF-07 |
| `src/lib/projects/project-display.ts` | Identidad visible pura de miembros: `avatarInitials` y `avatarColor` (determinista desde el nombre, paleta existente) | RF-09 |
| `src/lib/projects/project-form.ts` | Mínimo obligatorio y precarga del formulario: `canSubmitProjectForm` (predicado compartido botón/envío) e `initialProjectFormValues` (crear: vacío + Kanban; editar: precargado) | RF-15 |
| `src/lib/projects/projects-api.ts` | Contrato `ProjectsService` + tipos del cable (`BackendProject`, envolturas `{ projects }`/`{ project }`) + mapper contrato→UI (`toUiProject`, compartido con el mock) + adaptador real axios (6 operaciones del contrato REST, traducción de errores a `ProjectsError`) + fábrica `getProjectsService()`/`projectsService` con `VITE_API_MODE` (default mock) | RF-13, RF-14 |
| `src/lib/projects/projects-mock.ts` | Adaptador mock: lista sembrada en memoria en formato de contrato (panorama de RF-12), latencia artificial, errores 400/404 con los textos del contrato, memoria entre operaciones y `resetProjectsMock()` para aislar tests | RF-12, RF-13 |
| `src/hooks/use-projects.ts` | Único hook de orquestación de la vista (estado local a la ruta, sin store): carga/reintento de la lista, búsqueda/chip/refinamientos, apertura de drawer/modal/diálogo, mutaciones sin optimismo y errores por acción. Consume la interfaz del servicio, inyectable para tests (`useProjects(service = projectsService)`) | RF-13, RF-17, RF-18 |
| `src/components/projects/project-card.tsx` | Tarjeta de proyecto: etiqueta de tipo (Tag común), fase como chip, badge de estado con color semántico, nombre, descripción opcional, avatares apilados (3 + «+N»), progreso con umbral de color, estrella de favorito y menú ⋯ (Editar/Archivar/Eliminar). Muda: props y callbacks | RF-09, RF-10 |
| `src/components/projects/workspace-kpis.tsx` | Fila de 4 KPIs con valores + subtítulos fijados, o skeleton pulsante mientras carga. Patrón visual de las estadísticas existentes, componente propio | RF-07 |
| `src/components/projects/filters-drawer.tsx` | Panel lateral de refinamientos (tipo y estado, selección única por grupo, «Todos» por defecto) + «Limpiar filtros»; overlay que bloquea la vista, rol de diálogo etiquetado «Filtros», foco atrapado, cierre por botón/overlay/Esc | RF-05 |
| `src/components/projects/project-form-modal.tsx` | Modal único de crear/editar: nombre (Input común, obligatorio), descripción (área de texto), plantilla Kanban/Scrum; foco al primer campo, atrapado, cierre por Esc/«Cancelar»/overlay, error de servicio conservando lo escrito | RF-15 |
| `src/components/projects/confirm-dialog.tsx` | Diálogo único de archivar/eliminar: textos y botones según la acción (eliminar con estilo de peligro), foco al botón de confirmación, atrapado, cierre sin ejecutar por Esc/«Cancelar»/overlay | RF-16 |

La composición de la vista (guard de visitante, ranura de cabecera, título, sección
«Espacio de trabajo» con chips y botón de filtros, KPIs, grid con estados y cableado
del hook) vive en el archivo de la ruta (`src/routes/projects.tsx`), espejo de cómo
`index.tsx` aloja el dashboard: la vista es markup + llamadas al hook, sin lógica.

## 3. Archivos a modificar

| Archivo | Cambio | RF |
|---|---|---|
| `src/routes/projects.tsx` | Del placeholder a la vista completa: `Route` + `ProjectsView` (composición de §2, exported para tests) | RF-01, RF-02, RF-03, RF-08, RF-11 |
| `src/components/layout/header.tsx` | Parametrización con ranura condicional: contexto interno `HeaderActions` + `HeaderActionsProvider` + `HeaderSlot` (registro/desregistro) y la zona de acciones en el layout responsivo de RNF-03. El resto de la cabecera queda intacto | RF-01, RF-02, RF-03 |
| `src/routes/__root.tsx` | Envolver la shell en `HeaderActionsProvider` (barra lateral, navegación inferior y cabecera de las demás vistas intactas) | RF-01 |
| `src/lib/auth/token.ts` | Aloja la constante `SESSION_TOKEN_KEY` (fuente única del nombre de la clave; módulo puro sin ciclos) | RF-14 |
| `src/stores/auth-store.ts` | Importa la constante de `token.ts` y la reexporta: sus consumidores (tests incluidos) no cambian | RF-14 |
| `src/lib/api.ts` | Interceptor de petición que añade `Authorization: Bearer <token>` cuando hay token en la sesión (cabecera común del contrato, punto único para los módulos futuros) | RF-14 |

## 4. Funciones puras (con `now`/`today` como parámetro donde aplique)

```
todayString(now: Date) → "YYYY-MM-DD"          // día local, testeable con now fijo
daysBetween(from: string, to: string) → number // medianoche local de cada día; to − from
                                                // en días completos (hoy = 0; fechas
                                                // pasadas, negativo); Math.round del
                                                // delta de medianoches para sobrevivir DST
isNew(project, today) → boolean                // daysBetween(createdAt, today) ≤ 14
isDueSoon(project, today) → boolean             // no completado + dueDate + daysBetween(today, dueDate) ≤ 7 (vencidos incluidos)
filterProjects(projects, filters, today) → Project[]
                                                // búsqueda por nombre (case-insensitive,
                                                // trim; vacío/solo espacios = sin filtro)
                                                // + chip activo + refinamientos, acumulativo
countWorkspaceStats(projects, today) → WorkspaceStats
                                                // { total, activos, enRiesgo, vencenPronto, completados }
avatarInitials(name: string) → string          // iniciales de las dos primeras palabras
avatarColor(name: string) → string              // clase de color determinista de la paleta existente
canSubmitProjectForm(name: string) → boolean    // contenido tras recorte
initialProjectFormValues(project?) → ProjectFormValues
                                                // crear: { vacío, vacío, "kanban" }; editar: precargado
```

Cero IO y cero React: testeables con Vitest puro. `daysBetween` nunca usa
`new Date("YYYY-MM-DD")` (UTC): parsea año/mes/día a medianoche local.

## 5. Algoritmos (pseudocódigo)

**Carga de la lista (RF-17):**
```
al montar la vista (guard contra doble disparo):
  listStatus = "loading"
  try → projects = await service.list(); listStatus = "ready"
  catch (ProjectsError) → listStatus = "error"; listError = mensaje en español
«Reintentar» → misma función load; sin sondeos ni refetch automático;
las mutaciones actualizan la vista por su respuesta (RF-18)
```

**Derivados de filtros (RF-02/04/05/06/07):**
```
visibleProjects = filterProjects(projects, { search, chip, type, status }, today)
kpis = countWorkspaceStats(projects, today)          // siempre lista completa
activeRefinementCount = (type ≠ "todos") + (status ≠ "todos")   // 0–2
clearFilters() → search = "", chip = "todos", type = "todos", status = "todos"
empty: projects.length = 0 → «Aún no hay proyectos»; si no,
       visibleProjects.length = 0 → «No se encontraron proyectos»
```

**Mutaciones (RF-18, sin optimismo; estados de carga por acción):**
```
toggleFavorite(id):
  favoritePendingId = id (estrella deshabilitada)
  try → p = await service.setFavorite(id, !p.favorite); reemplaza en projects
  catch → actionError = mensaje amable (el favorito no cambia; banner en la vista)
  finally → favoritePendingId = null

submitForm(values):                     // modal: create o edit según su modo
  if !canSubmitProjectForm(values.name) → abort (botón ya deshabilitado)
  formPending = true
  try create → service.create({ ...values, memberName })   // memberName = nombre de
                                                           // la sesión o el correo
       edit  → service.update(modal.project.id, values)
     → añade/reemplaza en projects; cierra modal; formError = null
  catch → formError = mensaje; el modal permanece con lo escrito (reintentar/cancelar)
  finally → formPending = false

confirmAction():                        // diálogo: archivar o eliminar
  confirmPending = true
  try archive → service.archive(id) → quita de projects
       delete  → service.remove(id)   → quita de projects
     → cierra diálogo; confirmError = null
  catch → confirmError = mensaje; el diálogo permanece (reintentar/cancelar)
  finally → confirmPending = false
```

**Selección de adaptador (RF-13 CA-01, patrón auth):**
```
getProjectsService():
  mode = import.meta.env.VITE_API_MODE
  return mode === "api" || mode === "real" ? projectsApi : projectsMock
export const projectsService = getProjectsService()
```

**Ranura de la cabecera (RF-01, CA-02):**
```
HeaderActionsProvider: contexto { actions, register(node) → deregister }
HeaderSlot (usado solo por la vista de proyectos):
  al montar → register(children); al desmontar → deregister
  renders null (solo registra; los controles se pintan dentro de la cabecera)
Header: consume el contexto y pinta la zona de acciones si hay registradas
  < 768 px: segunda fila bajo la fila actual (búsqueda de ancho flexible + botón)
  ≥ 768 px: a continuación de los breadcrumbs
ninguna otra vista registra nada → cabecera idéntica a la actual
```

**Foco tras overlays y mutaciones (RF-10 CA-01, RF-15 CA-06/07, RF-16 CA-04/05, RF-18):**
```
overlay al abrirse: captura document.activeElement como disparador; foco inicial:
  drawer → panel (rol diálogo «Filtros»); modal → primer campo; confirmación → botón de acción
overlay al cerrarse (Esc/«Cancelar»/overlay/éxito): foco al disparador si sigue en el DOM;
  si no existe (tarjeta eliminada o desfiltrada) → contenedor del grid (tabIndex -1, ref de la vista)
estrella con chip «Favoritos» activo: tras resolver, si el proyecto ya no cumple los filtros
  → foco al contenedor del grid
trap de foco: manejo propio de Tab/Shift+Tab dentro del overlay mientras permanece abierto
```

## 6. Arquitectura de la solución

### 6.1 Capa de servicios (patrón auth, `src/lib/projects/`)

Replica la estructura del módulo de auth ya funcionando (Nota de arquitectura
de la spec): contrato + adaptador real + fábrica en `projects-api.ts`,
estado simulado en `projects-mock.ts`, tipos compartidos en `types.ts`. La
normalización contrato→UI vive en `toUiProject`, dentro del módulo y
compartido por ambos adaptadores: el mock siembra en formato de contrato y
normaliza al salir, ejercitando la misma traducción que el adaptador real
(la UI y las funciones puras nunca ven el formato del cable). Los errores se
traducen a `ProjectsError` (patrón `AuthError`) con los mensajes y códigos
de RF-14 CA-03.

### 6.2 Ranura de la cabecera

La búsqueda es estado local a la vista pero su input se pinta en la cabecera
de la shell, por encima de la ruta: la ranura por registro (§5) lo resuelve
sin duplicar cabecera ni acoplar el layout a proyectos (§9.1); las demás
vistas no cambian porque no registran nada.

### 6.3 Hook de orquestación único (`src/hooks/use-projects.ts`)

La spec fija la orquestación en un hook propio junto a la ruta, sin store
global (auth usa store porque la sesión sí es global; aquí nada fuera de la
vista consume el estado). El hook expone a la UI solo el modelo ya
normalizado (superficie completa en T5) e inyecta el servicio como parámetro
con default `projectsService` para sustituirlo por un doble en los tests
(RNF-06).

### 6.4 Foco y accesibilidad

Patrón único de foco (§5): captura del disparador al abrir, devolución al cerrar
con fallback al contenedor del grid. Drawer, modal y diálogo implementan cada uno
su rol de diálogo con etiqueta, foco inicial, trap de Tab y cierre por Esc/overlay;
la duplicación mínima del trap es el precio de la decisión de mínimo de archivos
(§9.6), mitigada con tests por componente.

## 7. Pintado en la interfaz

Solo lo visual no fijado por la spec (contenido, textos y estados viven en
los RF):

- **Cabecera**: `SearchBar` + `Button` primario tal cual en la zona de acciones
  (disposición responsiva en RNF-03).
- **Espacio de trabajo**: chips con desplazamiento horizontal en móvil; botón
  de filtros con el contador como badge, oculto en 0.
- **KPIs y grid**: `grid-cols-2 md:grid-cols-4` y `grid-cols-1 sm:grid-cols-2
  md:grid-cols-3` (patrón del dashboard); contenedor enfocable (`tabIndex
  -1`); skeletons `animate-pulse` con la forma del contenido real; valor de
  KPI en mono.
- **Tarjeta**: contenido y colores según RF-09/RF-10; fase como chip tiza
  (patrón sprint del dashboard); nombre `truncate` y descripción
  `line-clamp`; avatares apilados `size-6` con borde; barra `h-1.5` + % mono;
  estrella lucide; menú ⋯ con panel flotante.
- **Overlays**: drawer a ancho completo en móvil con radios estilizados por
  grupo; modal como tarjeta centrada con ancho máximo (casi completa en
  móvil), `Input` común y textarea con su look; «Eliminar» en rojo semántico;
  botones de acción con estado de carga.

## 8. Estrategia de tests

### 8.1 Cobertura por archivo (Vitest + jsdom + Testing Library)

| RF | Test | Qué cubre |
|---|---|---|
| RF-02, RF-04, RF-06, RF-07 + fechas | `tests/projects/project-filters.test.ts` | `daysBetween` a día local (hoy = 0, límites exactos 14/15 y 7/8, vencidos, cambio de mes/año, DST); `isNew`/`isDueSoon`; búsqueda case-insensitive y solo espacios; chips y refinamientos; combinación acumulativa; sin resultados; `countWorkspaceStats` (conteos, vence pronto, total) |
| RF-09 | `tests/projects/project-display.test.ts` | `avatarInitials` (una/dos/varias palabras); `avatarColor` determinista y dentro de la paleta |
| RF-15 | `tests/projects/project-form.test.ts` | `canSubmitProjectForm` (vacío, espacios, válido); `initialProjectFormValues` (crear vacío + kanban; editar precargado) |
| RF-13, RF-14 | `tests/projects/projects-api.test.ts` | Espía de axios: rutas y cuerpos por operación (miembro en create, `archived: true`, `favorite`); envolturas `{ projects }`/`{ project }` y 204 sin cuerpo; traducción 400/404/401/403/red → `ProjectsError` con mensajes en español; fábrica por `VITE_API_MODE` (default mock). Extensión de `tests/auth/api.test.ts`: interceptor Bearer con/sin token |
| RF-12, RF-13 | `tests/projects/projects-mock.test.ts` | Siembra del panorama (≥1 por estado y tipo, favorito, nuevo, vence pronto, >3 miembros, progreso 0 y 100, textos en español, fechas relativas; uno archivado que `list` excluye); latencia con temporizadores falsos; memoria entre operaciones; 400 nombre vacío; 404 id inexistente en editar/archivar/eliminar/favorito; `resetProjectsMock` re-siembra (determinista con reloj falsificado) |
| RF-13, RF-17, RF-18 | `tests/hooks/use-projects.test.tsx` | Con un doble del servicio: carga ok/loading/error + reintento; fallo de listado (401/403/red) no provocable por datos; mutaciones actualizan la lista con la respuesta (crear/editar/archivar/eliminar/favorito); favorito fallido → `actionError` sin cambio; filtros y derivados (visibles/KPIs/contador/vacíos); `clearFilters` |
| RF-09, RF-10 | `tests/projects/project-card.test.tsx` | Campos completos; descripción omitida si vacía; avatares 3 + «+N»; barra y umbral de color; estrella (alternar, `aria-label`, disabled en vuelo); menú (opciones, cierre por opción/Esc/fuera); click en el cuerpo sin acción |
| RF-07 | `tests/projects/workspace-kpis.test.tsx` | 4 valores y subtítulos (incl. «de N proyectos totales»); skeleton con `null` |
| RF-05 | `tests/projects/filters-drawer.test.tsx` | Selección única por grupo con «Todos»; «Limpiar filtros»; cierre por Esc/overlay/botón; rol de diálogo + etiqueta «Filtros»; foco inicial y trap; cambios en vivo vía callbacks |
| RF-15 | `tests/projects/project-form-modal.test.tsx` | Modos crear/editar (títulos, precarga, botones); validación del nombre (error + envío deshabilitado, solo espacios); envío con valores; cierre por Esc/«Cancelar»/overlay; foco al primer campo y trap; error de servicio conservando lo escrito; estado de carga sin doble envío |
| RF-16 | `tests/projects/confirm-dialog.test.tsx` | Textos y estilo por acción; confirmar ejecuta; cancelar/Esc/overlay sin ejecutar; foco al botón de acción y trap; error de servicio con reintento; carga sin doble envío |
| RF-01…RF-18 (integración) | `tests/projects/projects-view.test.tsx` | Con el mock real: visitante → redirección; carga (skeletons, sin tarjetas ni vacíos) → listo; búsqueda en vivo; chips excluyentes (pulsar el activo no lo desactiva); refinamientos + contador; combinación; «Limpiar filtros»; ambos vacíos según causa; crear/editar/archivar/eliminar aplican y recalculan KPIs; favorito refleja chip y desaparición con foco al grid; ranura de cabecera presente en la vista |
| RF-01 CA-02 (smoke de cabecera) | `tests/layout/header.test.tsx` | Sin registro no hay búsqueda ni «Nuevo proyecto»; con `HeaderSlot` aparecen; al desmontar el registro desaparecen (junto con la integración de la vista: solo en proyectos) |

Los 158 tests existentes no se tocan salvo la extensión de `tests/auth/api.test.ts`
(interceptor); la suite no se reduce.

### 8.2 Excepción documentada: sin E2E

Como en auth, no hay E2E en esta iteración (decisión de la spec, RNF-06): la app no
está terminada y los flujos quedan cubiertos por tests de componente e integración
con el servicio mock. Se retomarán al terminar la app; queda como deuda técnica
explícita, no como tarea ejecutable. La verification global (T10) incluye un smoke
de navegador por ruta como comprobación manual de cortesía, no como E2E.

## 9. Decisiones técnicas (justificadas, con alternativa descartada)

1. **Ranura de cabecera por contexto de registro** (`HeaderActionsProvider` +
   `HeaderSlot` co-localizados en `header.tsx`) — mantiene el estado de búsqueda
   local a la vista y una sola cabecera. *Descartado parámetro de búsqueda en la
   URL*: persistiría al recargar contra RF-13 CA-02 (re-siembra del mock) y
   el fuera de alcance de la persistencia de filtros. *Descartado que la cabecera decida
   por pathname y monte los controles*: acoplaría el layout a proyectos y el estado
   dejaría de ser local a la ruta. *Descartado portal al DOM de la cabecera*:
   rompe en SSR y añade plomería sin beneficio.
2. **Hook propio inyectable en `src/hooks/use-projects.ts`** — *descartado store
   Zustand* (la spec lo fija: estado local a la vista, sin store). *Descartado
   co-localizarlo en `src/routes/projects.tsx`*: mezclaría el cableado de la ruta
   con la orquestación en un archivo enorme y arriesga con el generador de árbol de
   rutas. *Descartado `src/lib/`*: lib queda sin React (patrón auth).
3. **Vista compuesta en el archivo de ruta** (`ProjectsView` exportada de
   `src/routes/projects.tsx`), espejo del dashboard — *descartado un componente
   `projects-view` adicional*: un archivo más sin responsabilidad que el route file
   no pueda alojar (YAGNI; mínimo de archivos de la spec).
4. **Normalización en el módulo con `toUiProject` compartido por api y mock** —
   *descartado que cada adaptador mapee por su cuenta*: duplicaría la traducción;
   *descartado exponer el contrato*: la UI nunca ve el formato del cable (spec).
5. **Mapeo de errores módulo-local `toProjectsError`** espejando la forma de
   `toAuthError` — *descartado reutilizar `toAuthError`*: sus códigos y
   desambiguaciones del 400 son de auth; proyectos tiene los suyos.
6. **Interceptor `Authorization: Bearer` en `lib/api.ts` con `SESSION_TOKEN_KEY`
   movida a `token.ts`** (reexportada por el store) — *descartado pasar el token
   por cada método del servicio*: contamina la interfaz con transporte;
   *descartado headers por petición en cada adaptador*: duplicaría la lectura;
   *descartado importar el store en `lib/api`*: ciclo (store → auth-api → api).
7. **Trap de foco implementado por componente (drawer, modal, diálogo)** — *descartado
   un helper común de foco*: la decisión de mínimo de archivos de la spec fija los
   componentes nuevos; el trap son ~15 líneas por componente y los tests fijan el
   contrato (riesgo de divergencia asumido y mitigado en §11).
8. **Formulario del modal con `useState` + predicado puro** — *descartado TanStack
   Form*: 3 campos y una regla; el boilerplate no aporta (el predicado compartido
   botón/envío queda igual garantizado).
9. **Grupos del drawer como radios nativos estilizados** — *descartado botones con
   `aria-pressed`*: la selección única por grupo es semántica de radio gratis.
10. **Skeletons propios con `animate-pulse`** — *descartada dependencia de
    skeletons*: la spec prohíbe dependencias nuevas y pide coherencia con el grid.
11. **Miembro inicial = nombre de la sesión o el correo** (fallback de la spec) —
    *descartado reutilizar `displayName` de auth*: su fallback deriva la parte
    local del correo y la spec pide el correo tal cual.
12. **Mock siembra en formato de contrato y normaliza con `toUiProject`** —
    *descartado sembrar ya en modelo de UI*: el mock ejercitaría una traducción
    distinta a la del adaptador real y dejaría de reproducir al backend esperado.

## 10. Mapeo de RF cubiertos

| RF | Archivos | Tests |
|---|---|---|
| RF-01 | header (ranura), `__root` (provider), routes/projects (estructura + guard) | header.test.tsx, projects-view.test.tsx |
| RF-02 | routes/projects (SearchBar en la ranura), project-filters | project-filters.test.ts, projects-view.test.tsx |
| RF-03 | routes/projects (Button «Nuevo proyecto»), hook (abre modal) | projects-view.test.tsx |
| RF-04 | project-filters, routes/projects (chips), hook (estado chip) | project-filters.test.ts, projects-view.test.tsx |
| RF-05 | filters-drawer, routes/projects (botón + contador), hook | filters-drawer.test.tsx, projects-view.test.tsx |
| RF-06 | project-filters, hook (derivados) | project-filters.test.ts, use-projects.test.tsx, projects-view.test.tsx |
| RF-07 | project-filters (conteos), workspace-kpis, hook | project-filters.test.ts, workspace-kpis.test.tsx, projects-view.test.tsx |
| RF-08 | routes/projects (grid responsivo, contenedor enfocable) | projects-view.test.tsx (+ smoke de navegador en T10) |
| RF-09 | project-display, project-card | project-display.test.ts, project-card.test.tsx |
| RF-10 | project-card (estrella + menú), hook (toggleFavorite) | project-card.test.tsx, use-projects.test.tsx, projects-view.test.tsx |
| RF-11 | routes/projects (estados vacíos), hook (derivados) | projects-view.test.tsx |
| RF-12 | projects-mock (siembra) | projects-mock.test.ts |
| RF-13 | types, projects-api (contrato + fábrica), projects-mock, use-projects (consumo) | projects-api.test.ts, projects-mock.test.ts, use-projects.test.tsx |
| RF-14 | projects-api (adaptador + errores), lib/api (Bearer), token/store (constante) | projects-api.test.ts, api.test.ts (extensión) |
| RF-15 | project-form, project-form-modal, hook (submitForm, memberName), projects-mock (defaults) | project-form.test.ts, project-form-modal.test.tsx, projects-mock.test.ts, projects-view.test.tsx |
| RF-16 | confirm-dialog, hook (confirmAction) | confirm-dialog.test.tsx, projects-view.test.tsx |
| RF-17 | use-projects (load/reintento), routes/projects (indicador + skeleton), workspace-kpis | use-projects.test.tsx, projects-view.test.tsx, workspace-kpis.test.tsx |
| RF-18 | use-projects (mutaciones sin optimismo), routes/projects (reflejo + foco) | use-projects.test.tsx, projects-view.test.tsx |

## 11. Riesgos y mitigaciones

| Riesgo | Mitigación |
|---|---|
| La ranura de cabecera (contexto + registro) es infraestructura nueva: parpadeo o acciones huérfanas si el desregistro falla | Registro y limpieza en el mismo efecto del `HeaderSlot`; la app ya pinta tras el arranque del cliente (pantalla de carga de `__root`), así que no hay flash visible; tests cubren registro, aparición y desregistro |
| Gestión de foco con disparadores que desaparecen (tarjeta eliminada/desfiltrada): fácil perder el foco en casos bordes | Un único patrón (captura de `activeElement` + fallback al contenedor del grid por ref); tests de foco por componente y aserciones de foco en la integración |
| Trap de foco triplicado (drawer/modal/diálogo) por la decisión de mínimo de archivos: riesgo de divergencia | Mismo patrón interno documentado en el plan + tests del contrato de accesibilidad por componente; si diverge, la extracción a un helper queda como deuda documentada, no silenciosa |
| Responsive y trap real no verificables en jsdom (RNF-03: 320 px sin scroll) | Clases responsivas espejo de patrones ya probados del dashboard; T10 ejecuta smoke de navegador en 320/768+ como comprobación manual de cortesía |

## 12. Supuestos

- `VITE_API_MODE` ausente o con valor desconocido en dev y tests → adaptador mock
  (como en auth); no hay backend real disponible para proyectos en esta fase.
- El interceptor Bearer es aditivo: sin token no añade cabecera y las rutas de auth
  no se ven afectadas (el backend ignora `Authorization` donde no aplica).
- Reexportar `SESSION_TOKEN_KEY` desde `auth-store` mantiene los 158 tests
  existentes sin cambios; `.env.example` ya documenta el flag (sin cambios).
- La vista se pinta tras el arranque del cliente (`isBooted` en `__root`), por lo que
  el registro de la ranura en efecto no produce parpadeo perceptible.
- `lucide-react` cubre los iconos necesarios (Search, Star, MoreHorizontal, X,
  Folder, CheckCircle2, Clock, AlertTriangle…), ya usados por las vistas actuales.
- Los datos sembrados viven solo en memoria (constitución, principio 5: nada de
  usuario en localStorage salvo el token de sesión).
