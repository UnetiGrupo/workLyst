# Spec 002 — Proyectos (vista y CRUD)

Estado: aprobada · v2.1 simplificación editorial

> Fase 1 del alcance (docs/scope.md). Cubre la vista de proyectos para miembros
> autenticados con su CRUD completo: la UI de la vista y las operaciones de
> crear, editar, archivar, eliminar y favoritos funcionando de verdad sobre una
> capa de servicios con dos adaptadores (mock por defecto, api contra el
> contrato REST esperado), replicando el patrón del módulo de auth. La vista de
> detalle, los tableros Kanban/Scrum y las tareas quedan para specs futuras de
> la misma fase.

## Contexto y objetivo

La ruta de proyectos hoy es un placeholder. Esta spec define la vista del
listado de proyectos para miembros autenticados: una cabecera con búsqueda y
acción principal, la sección «Espacio de trabajo» con filtros rápidos y un
panel lateral de refinamiento, KPIs básicos y un grid responsivo de tarjetas
de proyecto. Sobre esa UI, define el CRUD completo: creación y edición en un
modal con formulario real, archivado y eliminado con diálogo de confirmación
propio, y favoritos persistidos vía servicio, con estados de carga y error.

Criterio rector (decisión del usuario): mínimo viable bien hecho — el mínimo
estricto de archivos y componentes reutilizando los existentes, con calidad y
responsive de móvil a escritorio.

**Cambio de requisito (v2)**: el usuario pidió CRUD real sobre servicios (como
auth), no UI con botones inertes; «UI primero» queda para las specs de tareas.

### Nota de arquitectura (decisión del usuario)

La capa de servicios de proyectos vive en `src/lib/projects/`, replicando la
estructura del módulo de auth ya funcionando: interfaz del servicio con su
adaptador real (axios), adaptador mock y tipos compartidos. Esto difiere de la
arquitectura `src/services/` prevista por docs/scope.md («Estrategia: backend
externo»); discrepancia conocida y aceptada por el usuario, a reconciliar con
scope.md fuera de esta spec.

La orquestación de la vista —cargar la lista, mantener búsqueda, chip y
refinamientos, estados de carga/error y ejecutar las mutaciones— vive en un
hook propio de la vista, junto a su ruta, y no en un store global (decisión
fijada en esta spec): el estado es local a la ruta, nada fuera de la vista lo
consume y la constitución (principio 3) pide la lógica en hooks con la UI
solo renderizando; el store de auth se justifica porque la sesión sí es
global. El hook consume la interfaz del servicio y expone a la UI solo el
modelo de UI ya normalizado (Definiciones).

## Usuarios

| Rol       | Descripción                                            |
| :-------- | :----------------------------------------------------- |
| Visitante | Usuario sin sesión iniciada; no accede a la vista.    |
| Miembro   | Usuario autenticado con sesión activa; usa la vista.   |

## Historias de usuario

- HU-01. Como miembro, quiero ver todos mis proyectos de un vistazo —con
  tipo, estado, progreso y equipo— para saber en qué se está trabajando.
- HU-02. Como miembro, quiero buscar y filtrar mis proyectos con chips y un
  panel de refinamiento, para encontrar rápido lo que me interesa.
- HU-03. Como miembro, quiero ver KPIs del espacio de trabajo (activos, en
  riesgo, vencimientos próximos) para detectar urgencias sin revisar tarjeta
  por tarjeta.
- HU-04. Como miembro, quiero marcar proyectos como favoritos para acceder
  rápido a los que más me importan con el filtro de favoritos.
- HU-05. Como miembro, quiero crear, editar, archivar y eliminar proyectos
  con confirmaciones claras y avisos cuando algo falle, para mantener mi
  espacio de trabajo al día.

## Definiciones

- **Proyecto (dato de UI)**: unidad que muestra la tarjeta. Campos: nombre,
  descripción (opcional), tipo (`kanban` | `scrum`), fase (texto corto
  mostrado tal cual, p. ej. «Fase final», «Sprint 4»), estado (`activo` |
  `en riesgo` | `completado`), progreso (0–100), miembros (lista de nombres;
  iniciales y color de avatar se derivan en cliente), favorito (sí/no),
  fecha de creación y fecha límite opcional, ambas `YYYY-MM-DD` (simuladas
  en días relativos a hoy en los datos sembrados). Sin campo «archivado»:
  la lista del servicio ya trae solo proyectos no archivados (RF-14 CA-01)
  y archivar quita la tarjeta (RF-16); `archived` queda como dato interno
  del contrato y el servicio, sin uso en la UI. La capa de servicios expone
  este modelo ya normalizado: traduce `en_riesgo` → «en riesgo» y
  `members: [{id,name}]` → lista de nombres (RF-13), de modo que la UI y las
  funciones puras nunca ven el formato del contrato.
- **Espacio de trabajo (lista)**: los proyectos no archivados que devuelve el
  servicio; el grid, los chips, los refinamientos y los KPIs operan sobre
  ella.
- **Proyecto archivado**: quitado del espacio de trabajo: no aparece en el
  grid, los filtros ni los KPIs. Sin vista de archivados ni forma de
  desarchivar en esta versión.
- **Nuevo**: proyecto creado hace 14 días o menos.
- **Vence pronto**: proyecto no completado con fecha límite a 7 días o menos
  (incluye los ya vencidos); sin fecha límite no cuenta.
- **Días entre fechas**: las reglas «nuevo» y «vence pronto» comparan fechas
  `YYYY-MM-DD` a nivel de día en zona local, sin off-by-one: una función
  pura testeable parsea cada fecha a la medianoche local de su día y
  devuelve la diferencia en días completos (hoy = 0; fechas pasadas,
  negativo); «creado hace 14 días o menos» es diferencia(creación, hoy) ≤ 14
  y «vence a 7 días o menos» es diferencia(hoy, límite) ≤ 7, vencidos
  incluidos (resultado ≤ 0).
- **Filtro rápido (chip)**: filtro de la sección «Espacio de trabajo» con un
  único término activo a la vez: Todos, Favoritos, Nuevos, En riesgo.
- **Refinamiento**: criterio del panel lateral (tipo, estado). Cada grupo
  toma un único valor y «Todos» equivale a sin filtro; los grupos con valor
  distinto de «Todos» se acumulan entre sí y con la búsqueda y el chip
  activo.
- **Filtrado combinado**: un proyecto se muestra solo si cumple a la vez la
  búsqueda, el chip activo y todos los refinamientos.
- **Estado favorito**: marca alternada desde la tarjeta y persistida vía
  servicio; en modo mock vive en memoria (se pierde al recargar) y en modo
  real la persiste el backend.
- **KPIs del espacio de trabajo**: conteos derivados de la lista completa del
  espacio de trabajo, siempre independientes de los filtros activos.

## Requisitos funcionales

**RF-01: Estructura de la vista**
CUANDO un miembro visite la vista de proyectos, EL SISTEMA mostrará, de arriba
a abajo: la cabecera, que conserva sus elementos actuales (breadcrumbs,
campana de notificaciones y avatar) y añade, solo en esta vista, la barra de
búsqueda y el botón «Nuevo proyecto» a continuación de los breadcrumbs; el
título de página «Proyectos» (h1, como el resto de vistas maquetadas); la
sección «Espacio de trabajo» con los chips de filtro rápido y el botón de
filtros; los KPIs; y el grid de tarjetas de proyecto. La vista se integra en
la shell global sin reestructurarla: la barra lateral y la navegación
inferior permanecen intactas y la cabecera se parametriza con una ranura
condicional en lugar de duplicarse.

- CA-01: SI no hay sesión iniciada, ENTONCES la vista redirige a la página de
  inicio de sesión (mismo comportamiento que el dashboard actual).
- CA-02: SOLO la vista de proyectos muestra la búsqueda y el botón «Nuevo
  proyecto» en la cabecera; las demás vistas conservan su cabecera actual sin
  cambios.

**RF-02: Búsqueda**
CUANDO el miembro escriba en la barra de búsqueda (placeholder «Buscar
proyectos...»), EL SISTEMA filtrará en vivo el grid por coincidencia del
término con el nombre del proyecto, insensible a mayúsculas/minúsculas, sin
recargar ni navegar.

- CA-01: SI el término está vacío o solo contiene espacios, ENTONCES la
  búsqueda no filtra nada.
- CA-02: SI ningún proyecto coincide, ENTONCES el grid muestra el estado
  vacío (RF-11).

**RF-03: Botón «Nuevo proyecto»**
EL SISTEMA mostrará el botón «Nuevo proyecto» como acción principal de la
vista (estilo primario del sistema de diseño).

- CA-01: CUANDO el miembro pulse el botón, EL SISTEMA abrirá el modal de
  creación (RF-15) con el formulario vacío y la plantilla Kanban como opción
  por defecto.
- CA-02: el botón usa el componente Button común actual tal cual, sin
  modificarlo ni tocar DESIGN.md; su divergencia de tono (500 frente al 600
  de DESIGN.md) es conocida y queda fuera de alcance.

**RF-04: Filtros rápidos (chips)**
CUANDO el miembro pulse un chip de la sección «Espacio de trabajo», EL SISTEMA
lo marcará como activo (visualmente distinguible) y filtrará el grid según el
chip: «Todos», «Favoritos», «Nuevos», «En riesgo».

- CA-01: «Todos» es el estado inicial y muestra la lista sin filtrar por chip.
- CA-02: SI se pulsa «Favoritos», ENTONCES solo se muestran los proyectos
  marcados como favoritos.
- CA-03: SI se pulsa «Nuevos», ENTONCES solo se muestran los proyectos
  «nuevos» (creados hace ≤14 días).
- CA-04: SI se pulsa «En riesgo», ENTONCES solo se muestran los proyectos con
  estado «en riesgo».
- CA-05: los chips son excluyentes: solo uno activo a la vez; «Todos» es
  siempre el estado sin filtro y pulsar el chip ya activo no lo desactiva
  (solo «Todos» limpia el filtro de chip).

**RF-05: Panel lateral de filtros (drawer)**
CUANDO el miembro pulse el botón de filtros de la sección «Espacio de
trabajo», EL SISTEMA desplegará un panel desde el borde derecho, sobre un
overlay que bloquea la interacción con la vista, con los refinamientos: tipo
(Todos/Kanban/Scrum), estado (Todos/Activo/En riesgo/Completado) y la acción
«Limpiar filtros». Cada grupo de refinamiento es de selección única y
arranca en «Todos», que equivale a sin filtro; elegir una opción sustituye a
la anterior dentro de su grupo.

- CA-01: los refinamientos se aplican en vivo mientras se ajustan (sin botón
  «Aplicar»); cerrar el panel conserva los refinamientos aplicados.
- CA-02: el botón de filtros muestra un contador (0 a 2) con el número de
  grupos cuyo valor difiere de «Todos»; oculto cuando es cero y visible
  también en móvil.
- CA-03: «Limpiar filtros» restablece todos los filtros de la vista: la
  búsqueda, el chip (vuelve a «Todos») y los refinamientos.
- CA-04: el panel se cierra con su botón de cierre, pulsando el overlay o la
  tecla Esc.
- CA-05: al abrirse, el panel recibe el foco con rol de diálogo y etiqueta
  accesible («Filtros»), y lo atrapa mientras permanece abierto (Tab/Shift+Tab
  no salen de él); en móvil ocupa todo el ancho de pantalla, también si el
  ancho cambia a móvil con el panel ya abierto (el overlay sigue bloqueando).
- CA-06: MIENTRAS el panel está abierto, EL SISTEMA no permitirá interactuar
  con la vista subyacente; al cerrarse, el foco vuelve al botón de filtros.

**RF-06: Combinación de filtros**
EL SISTEMA combinará la búsqueda, el chip activo y los refinamientos de forma
acumulativa: un proyecto se muestra solo si cumple todos a la vez.

- CA-01: SI la combinación no deja ningún proyecto, ENTONCES se muestra el
  estado vacío (RF-11).
- CA-02: SI el miembro limpia la búsqueda, ENTONCES el grid conserva el chip y
  los refinamientos activos (cada filtro cambia de forma independiente).

**RF-07: KPIs del espacio de trabajo**
EL SISTEMA mostrará cuatro KPIs derivados de la lista completa del espacio de
trabajo (todos los proyectos no archivados cargados del servicio): «Activos»
(estado activo), «En riesgo» (estado en riesgo), «Vencen pronto» (≤7 días y
no completado) y «Completados» (estado completado), como componente propio de
la vista que sigue el patrón visual de las tarjetas de estadísticas
existentes (sin reutilizar ni modificar el de la vista de inicio).

- CA-01: los KPIs reflejan siempre la lista completa del espacio de trabajo;
  NO varían con la búsqueda ni con los filtros activos.
- CA-02: cada KPI muestra su valor y un subtítulo fijo en español: «Activos»
  → «de N proyectos totales» (N = tamaño de la lista completa), «En riesgo»
  → «requieren atención», «Vencen pronto» → «plazo de 7 días o menos» y
  «Completados» → «entregados con éxito».
- CA-03: los KPIs se recalculan sobre la lista resultante tras cada mutación
  (RF-18).

**RF-08: Grid responsivo**
EL SISTEMA mostrará las tarjetas en un grid que escala con el ancho, como el
grid de proyectos del dashboard: 1 columna en móvil, 2 columnas a partir de
sm (640 px) y 3 columnas a partir de md (768 px).

- CA-01: la vista no produce scroll horizontal en ningún ancho estándar
  (verificado desde 320 px).
- CA-02: SI la lista a mostrar está vacía, ENTONCES no se renderiza ninguna
  tarjeta y se muestra el estado vacío (RF-11).

**RF-09: Tarjeta de proyecto**
CADA tarjeta mostrará: la etiqueta de tipo («Kanban» o «Scrum», con la
etiqueta común existente), el dato de fase como chip al estilo del chip de
sprint del dashboard (texto corto, p. ej. «Fase final», «Sprint 4»), el badge
de estado, el nombre, la descripción, los miembros y el progreso.

- El badge de estado usa color semántico: activo → primario; en riesgo →
  rojo; completado → verde.
- Miembros: avatares apilados con iniciales, hasta 3 visibles; con más de 3,
  indicador «+N» (patrón existente del dashboard). Las iniciales y el color
  de cada avatar se derivan en cliente a partir del nombre (funciones puras).
- Progreso: número (%) y barra con el código de color por umbral ya usado en
  el dashboard (verde ≥80, azul ≥50, ámbar ≥25, gris <25).
- CA-01: SI el nombre o la descripción son largos, ENTONCES se truncan con
  elipsis (la descripción limitada a pocas líneas) sin romper la tarjeta.
- CA-02: SI se pulsa la tarjeta fuera de sus controles, ENTONCES no ocurre
  navegación ni acción (la vista de detalle/tablero queda fuera de alcance).
- CA-03: SI la descripción está vacía, ENTONCES la tarjeta no muestra el
  bloque de descripción, sin romper la maquetación.

**RF-10: Acciones de la tarjeta**
CADA tarjeta incluirá el toggle de favorito (estrella) y el menú de acciones
(⋯) con «Editar», «Archivar» y «Eliminar» operativos.

- CA-01: CUANDO se pulse la estrella, EL SISTEMA alternará el favorito vía
  servicio (RF-13); la estrella queda deshabilitada con estado de carga
  mientras resuelve. AL resolver, el cambio es visible en la tarjeta y el
  chip «Favoritos» lo refleja (un proyecto quitado de favoritos desaparece
  del grid si ese chip está activo; SI la tarjeta desaparece, ENTONCES el
  foco pasa al contenedor del grid para no perderse). SI el servicio falla,
  ENTONCES el favorito no cambia y se muestra un mensaje de error amable en
  español.
- CA-02: CUANDO se pulse «Editar», EL SISTEMA abrirá el modal (RF-15)
  precargado con el nombre, la descripción y el tipo del proyecto.
- CA-03: CUANDO se pulse «Archivar» o «Eliminar», EL SISTEMA abrirá el
  diálogo de confirmación propio (RF-16), nunca un `confirm()` nativo.
- CA-04: el menú se cierra al pulsar una opción, fuera de él o con Esc.

**RF-11: Estados vacíos**
EL SISTEMA distinguirá dos estados vacíos del grid según su causa.

- CA-01: SI los filtros activos dejan el grid sin proyectos, ENTONCES se
  muestra un mensaje en español («No se encontraron proyectos») con la
  acción «Limpiar filtros», que restablece la búsqueda, el chip y los
  refinamientos.
- CA-02: SI el espacio de trabajo se queda sin proyectos (lista vacía del
  servicio, sin filtros que excluyan), ENTONCES se muestra el mensaje «Aún
  no hay proyectos» con la acción «Nuevo proyecto», que abre el modal de
  creación (RF-15).

**RF-12: Datos del espacio de trabajo**
EL SISTEMA proveerá los proyectos de la vista a través de la capa de
servicios (RF-13), sin datos estáticos en los componentes; el adaptador mock
siembra una lista inicial en memoria que cumple:

- CA-01: la lista cubre el panorama: al menos un proyecto por estado, por
  tipo, al menos uno favorito, uno «nuevo», uno que «vence pronto», uno con
  más de 3 miembros, uno con progreso 0 y otro con progreso 100.
- CA-02: las fechas se simulan como días relativos a hoy (p. ej. creado hace
  3 días, vence en 5 días), de modo que las reglas «nuevo» y «vence pronto»
  sean estables y no caduquen con el paso del tiempo.
- CA-03: nombres, descripciones y fases en español, realistas para equipos de
  desarrollo y estudiantes.
- CA-04: el mock añade latencia artificial por operación y simula los
  errores del contrato (RF-14) para ejercitar los estados de carga y error
  desde ya.

**RF-13: Capa de servicios de proyectos**
EL SISTEMA proveerá las operaciones de proyectos a través de una capa de
servicios con dos adaptadores intercambiables, replicando el patrón del
módulo de auth (ver Nota de arquitectura): una interfaz única con las
operaciones listar, crear, editar, archivar, eliminar y marcar favorito; un
adaptador mock con los datos en memoria (lista sembrada según RF-12, latencia
y errores simulados) y función de reset para aislar tests; y un adaptador api
(axios) que asume el contrato del RF-14. Los componentes de la vista no
conocen el origen de los datos (constitución, principio 3). La capa expone
siempre el modelo de UI de las Definiciones ya normalizado (`en_riesgo` →
«en riesgo», `members: [{id,name}]` → lista de nombres, sin `archived`): la
normalización vive en el propio módulo y la UI nunca ve el formato del
contrato. La operación crear recibe, además de los campos del formulario, el
miembro inicial (nombre visible de la sesión, RF-15 CA-03) como dato de
entrada: el mock no lee el estado de autenticación.

- CA-01: el adaptador se elige por `VITE_API_MODE`: `api`/`real` → adaptador
  api; cualquier otro valor o ausente → mock (default mock).
- CA-02: el mock mantiene la lista en memoria: las mutaciones (crear, editar,
  archivar, eliminar, favorito) se reflejan en los listados posteriores
  dentro de la misma sesión de página; al recargar, vuelve a la lista
  sembrada.
- CA-03: el mock valida como el backend esperado: rechaza nombre vacío (400)
  y las operaciones sobre ids inexistentes (404), con los mensajes en español
  del contrato (RF-14).
- CA-04: el adaptador api se escribe ya pero queda inactivo por defecto; se
  activa con el flag al confirmar el contrato con el backend, sin tocar los
  componentes.

**RF-14: Contrato REST esperado (encargo al backend)**
EL SISTEMA asumirá, en su adaptador api, el siguiente contrato REST para
proyectos, que se entrega al backend como encargo (registro en Linear bajo el
proyecto Worklyst V2 con label `Proyectos`, constitución principio 7).
Cabeceras comunes: `x-api-key` (global) y `Authorization: Bearer <token de
sesión>`. Entidad `Project` (JSON):

```
{
  "id": string,
  "name": string,
  "description": string,            // puede ser vacía
  "template": "kanban" | "scrum",
  "phase": string,                  // texto corto, p. ej. "Sprint 4"
  "status": "activo" | "en_riesgo" | "completado",
  "progress": number,               // 0–100
  "favorite": boolean,
  "archived": boolean,
  "createdAt": "YYYY-MM-DD",
  "dueDate": "YYYY-MM-DD" | null,
  "members": [{ "id": string, "name": string }]
}
```

| Operación | Método y ruta          | Cuerpo (request)                                  | Éxito                  | Errores                |
| :-------- | :--------------------- | :------------------------------------------------- | :--------------------- | :--------------------- |
| Listar    | `GET /api/projects`    | —                                                 | `200 { projects }`     | 401, 403, red          |
| Crear     | `POST /api/projects`   | `{ name, description, template, member: { name } }` | `201 { project }`    | 400, 401, 403, red     |
| Editar    | `PUT /api/projects/:id`| `{ name, description, template }`                 | `200 { project }`      | 400, 404, 401, 403, red|
| Archivar  | `PATCH /api/projects/:id` | `{ archived: true }`                           | `200 { project }`      | 404, 401, 403, red     |
| Eliminar  | `DELETE /api/projects/:id` | —                                             | `204` (sin cuerpo)     | 404, 401, 403, red     |
| Favorito  | `PATCH /api/projects/:id` | `{ favorite: boolean }`                       | `200 { project }`      | 404, 401, 403, red     |

- CA-01: el listado devuelve solo los proyectos no archivados del miembro.
- CA-02: al crear, el cuerpo lleva el miembro inicial (`member: { name }`:
  nombre visible de la sesión, con el correo como fallback si no hay nombre,
  RF-15 CA-03); el servidor asigna su id y el resto de campos con los
  valores por defecto de creación, y responde con la entidad completa.
- CA-03: los errores llegan como `{ "mensaje": string }` en español; el
  adaptador los traduce a un error normalizado del módulo (código + mensaje
  amable, patrón auth) y el mock reproduce sus textos: 400 «El nombre del
  proyecto es obligatorio», 404 «Proyecto no encontrado»; 401 sesión no
  válida, 403 API key (nunca se expone su detalle), sin respuesta → error de
  red.
- CA-04: SI el backend confirma o ajusta el contrato, ENTONCES solo cambia el
  adaptador api (y esta spec), nunca los componentes.

**RF-15: Modal único de crear/editar**
CUANDO el miembro pulse «Nuevo proyecto» (RF-03) o «Editar» (RF-10), EL
SISTEMA abrirá un modal con el formulario del proyecto: un único componente
que sirve para crear (vacío) y para editar (precargado con el nombre, la
descripción y el tipo del proyecto).

- CA-01: campos del formulario: «Nombre» (obligatorio), «Descripción»
  (opcional, área de texto) y «Plantilla» (Kanban/Scrum, selección única,
  Kanban por defecto). Sin más campos.
- CA-02: SI el nombre está vacío o solo contiene espacios tras interactuar
  con el campo, ENTONCES el formulario muestra «El nombre es obligatorio» y
  el envío está deshabilitado; el envío se habilita solo con un nombre válido
  (predicado compartido entre botón y envío, patrón auth).
- CA-03: AL crear, el proyecto nace con: estado «activo», progreso 0,
  favorito no, fase «Sprint 1» (Scrum) o «Planeación» (Kanban), fecha de
  creación hoy, sin fecha límite y el usuario de la sesión como único
  miembro: la vista pasa al servicio su nombre visible (nombre de la sesión
  o, si la sesión restaurada no trae nombre, el correo, que sirve de
  fallback para las iniciales del avatar); el resto de campos no se
  solicitan (estado, progreso, fase, fechas y la gestión de miembros más
  allá del inicial quedan para specs futuras de tareas y tableros).
- CA-04: MIENTRAS se envía, EL SISTEMA deshabilitará el botón de envío y
  mostrará estado de carga (sin doble envío). Botones: «Crear proyecto» /
  «Guardar cambios» y «Cancelar»; título del modal: «Nuevo proyecto» /
  «Editar proyecto».
- CA-05: SI el servicio falla, ENTONCES el modal permanece abierto con los
  datos escritos y muestra el mensaje de error traducido en español; el
  miembro puede reintentar el envío o cancelar sin perder lo escrito.
- CA-06: SI la creación o edición tiene éxito, ENTONCES el modal se cierra,
  la vista refleja el cambio (RF-18) y el foco vuelve al elemento disparador.
- CA-07: el modal se expone con rol de diálogo y etiqueta accesible, recibe
  el foco en el primer campo al abrirse, lo atrapa mientras permanece
  abierto, se cierra con Esc, «Cancelar» o el overlay devolviendo el foco al
  disparador; el overlay bloquea la interacción con la vista. Cancelar no
  pide confirmación de abandono.

**RF-16: Diálogo de confirmación de archivar/eliminar**
CUANDO el miembro pulse «Archivar» o «Eliminar» en el menú de una tarjeta,
EL SISTEMA abrirá un diálogo de confirmación propio (nunca `confirm()`
nativo): un único componente para ambas acciones, con textos según la
operación y el nombre del proyecto.

- CA-01: Archivar: título «Archivar proyecto», texto «"{nombre}" se quitará
  de tu espacio de trabajo.», botones «Archivar» (primario) y «Cancelar».
- CA-02: Eliminar: título «Eliminar proyecto», texto «"{nombre}" se
  eliminará permanentemente. Esta acción no se puede deshacer.», botones
  «Eliminar» (estilo de peligro, rojo semántico) y «Cancelar».
- CA-03: MIENTRAS se confirma, EL SISTEMA deshabilitará el botón de acción y
  mostrará estado de carga (sin doble envío). SI el servicio falla, ENTONCES
  el diálogo permanece abierto con el mensaje de error en español y permite
  reintentar o cancelar.
- CA-04: SI la operación tiene éxito, ENTONCES el diálogo se cierra, la
  tarjeta desaparece de la vista (RF-18) y el foco pasa al contenedor del
  grid.
- CA-05: el diálogo se expone con rol de diálogo y etiqueta accesible según
  la operación, recibe el foco en el botón de confirmación al abrirse, lo
  atrapa mientras permanece abierto y se cierra con Esc, «Cancelar» o el
  overlay sin ejecutar nada, devolviendo el foco al disparador.

**RF-17: Carga y error de la lista**
AL entrar a la vista, EL SISTEMA solicitará la lista del espacio de trabajo
al servicio (RF-13).

- CA-01: MIENTRAS la lista carga, la vista muestra un indicador de carga en
  la zona del grid (sin tarjetas ni estados vacíos) y la fila de KPIs muestra
  un skeleton (marcadores pulsantes con la forma de los KPIs, coherente con
  el del grid) en lugar de valores; los KPIs reflejan la lista una vez
  cargada.
- CA-02: SI la carga falla, ENTONCES la vista muestra un mensaje de error
  amable en español con la acción «Reintentar», que vuelve a solicitar la
  lista.
- CA-03: la carga ocurre al entrar y al reintentar; sin sondeos ni
  actualizaciones automáticas; las mutaciones actualizan la vista por su
  resultado (RF-18).

**RF-18: Reflejo de las mutaciones en la vista**
EL SISTEMA actualizará la vista con la respuesta del servicio tras cada
mutación, sin recargar la página y sin actualizaciones optimistas (cada
acción espera su respuesta mostrando estado de carga).

- CA-01: crear → el proyecto nuevo aparece en el grid si cumple los filtros
  activos.
- CA-02: editar → la tarjeta refleja el nombre, la descripción y el tipo
  nuevos; SI tras el cambio deja de cumplir los filtros activos (p. ej.
  cambia el tipo con el refinamiento de tipo activo), ENTONCES desaparece
  del grid y el foco pasa al contenedor del grid.
- CA-03: archivar/eliminar → la tarjeta desaparece y el foco pasa al
  contenedor del grid.
- CA-04: favorito → la tarjeta y el chip «Favoritos» lo reflejan (RF-10
  CA-01).
- CA-05: en todos los casos los KPIs se recalculan sobre la lista resultante.
- CA-06: SI la lista queda vacía sin filtros activos, ENTONCES se muestra el
  estado vacío de cero proyectos (RF-11 CA-02).

## Requisitos no funcionales

| ID     | Requisito                                                                                                                                 |
| :----- | :---------------------------------------------------------------------------------------------------------------------------------------- |
| RNF-01 | Textos de UI en español; código e identificadores en inglés (constitución, principio 6).                                                    |
| RNF-02 | Reutilización y mínimo de archivos (YAGNI): la barra de búsqueda, el botón y la etiqueta de tipo reutilizan los componentes comunes existentes; la cabecera global se parametriza para admitir los controles de la vista en lugar de duplicarse; un único modal sirve para crear y editar y un único diálogo de confirmación para archivar y eliminar; solo se crean componentes nuevos cuando la responsabilidad lo exija (tarjeta de proyecto, panel de filtros, KPIs como componente propio de la vista, modal, diálogo de confirmación) y la orquestación de la vista se concentra en un único hook propio, sin store global. |
| RNF-03 | Responsive de móvil a escritorio: por debajo de 768 px la cabecera apila sus controles nuevos en una segunda fila bajo la actual (búsqueda con ancho flexible y botón «Nuevo proyecto»), sin ocultar nada; a partir de 768 px van a continuación de los breadcrumbs; los chips se desplazan horizontalmente; los KPIs en 2 columnas en móvil y 4 en escritorio; el drawer, el modal y el diálogo a ancho (casi) completo en móvil con ancho máximo centrado en escritorio; cero scroll horizontal. |
| RNF-04 | Consistencia con DESIGN.md: paleta primary/worklyst, tipografías y superficies definidas; sin colores fuera de la paleta, salvo los roles semánticos de Tailwind ya usados por las vistas existentes (rojo/verde en el badge de estado y el botón de eliminar, verde/azul/ámbar/gris en la barra de progreso).                  |
| RNF-05 | Separación estricta (constitución, principio 3): el acceso a datos vive en la capa de servicios; el filtrado combinado, los conteos de KPIs, las reglas «nuevo»/«vence pronto» y la derivación de iniciales/colores de avatar son funciones puras; la orquestación de la vista (carga de la lista, filtros, estados de carga/error y mutaciones) vive en un único hook propio de la vista, no en un store global ni en los componentes (Nota de arquitectura); la UI solo renderiza y no conoce el origen de los datos. |
| RNF-06 | Tests mínimos obligatorios (constitución, principio 4): al menos 1 test por componente público nuevo (incluidos modal y diálogo de confirmación), por función pura y por operación del servicio mock (feliz path y error ejercitable por datos: crear/editar con nombre vacío → 400; editar, archivar, eliminar y favorito sobre id inexistente → 404), más la integración de la vista con carga, error y reintento; el fallo del listado y los errores no provocables por datos (401/403/red) se cubren en esa integración sustituyendo el servicio por un doble de test en el hook de orquestación, nunca con datos del mock; con el stack ya aprobado (Vitest + jsdom + Testing Library, `VITE_API_MODE=mock`), sin dependencias nuevas; incluye un smoke test de cabecera (búsqueda y «Nuevo proyecto» solo presentes en la vista de proyectos); la suite existente no se reduce; sin E2E en esta spec (excepción documentada como en auth: se retoman al terminar la app). |
| RNF-07 | Accesibilidad mínima: botones de icono con aria-label, foco visible, Esc cierra drawer, menú, modal y diálogo; overlay bloquea la vista mientras un panel esté abierto; drawer, modal y diálogo se exponen con rol de diálogo y etiqueta accesible, atrapan el foco mientras permanecen abiertos y lo devuelven a su disparador al cerrarse. |
| RNF-08 | Política de comentarios vigente: mínimos y sin referencias a identificadores de la spec (RF/RNF/CA/CL).                                     |
| RNF-09 | Errores siempre con mensaje en español, amable y no técnico, nunca vacío ni con detalle del backend (patrón auth); cada acción con estado de carga perceptible y sin doble envío. |

## Fuera de alcance (esta versión)

- Vista de detalle del proyecto, tableros Kanban/Scrum y tareas (specs
  futuras de la fase 1).
- Desarchivar, vista de archivados, edición de estado, progreso, fase, fechas
  o miembros, y selector de miembros al crear (se gestionan con tareas y
  tableros en specs futuras).
- Activar el modo real: el adaptador api se escribe pero queda inactivo
  (mock por defecto) hasta confirmar el contrato REST con el backend.
- Persistencia de búsqueda, chip y refinamientos entre sesiones (vuelven al
  estado inicial).
- Ordenación, vistas guardadas, paginación o scroll infinito.
- Filtrado por miembros, etiquetas o fechas arbitrarias.
- Animaciones elaboradas; solo transiciones discretas coherentes con las
  vistas existentes.

## Criterios de finalización

La cobertura funcional se valida RF por RF: sus CA son el checklist. Globales
de cierre: suite completa en verde con los 158 tests existentes sin reducción
(`VITE_API_MODE=mock`), `pnpm check` limpio, cero coincidencias
`RF-/RNF-/CA-/CL-` en `src/` y `tests/`, y smoke de cabecera por rutas.

## Dudas abiertas y decisiones delegadas

Ninguna duda bloqueante. Las decisiones de diseño delegadas por el usuario ya
están fijadas en esta spec y son verificables en los RF citados: chips
excluyentes (RF-04), refinamientos del drawer (RF-05), KPIs (RF-07), campos
del formulario y valores por defecto al crear (RF-15 CA-01/CA-03), archivar
quita y eliminar permanente (RF-16), sin actualización optimista (RF-18),
favoritos vía servicio (RF-10/RF-13), contrato REST como encargo (RF-14),
iniciales y color de avatar en cliente (RF-09), vista protegida y búsqueda
solo por nombre (RF-01 CA-01, RF-02), sin E2E (RNF-06), hook propio sin store
(Nota de arquitectura, RNF-05), normalización al modelo de UI (RF-13),
comparación de fechas a día local (Definiciones) y sin campo «archivado» en
el modelo de UI (Definiciones). Pendientes gestionados fuera de esta spec:
confirmar el contrato REST (RF-14) con el backend —hasta entonces el
adaptador api queda inactivo y el encargo se registra en Linear con label
`Proyectos`— y reconciliar la ubicación de la capa (`src/lib/projects/`,
estilo auth) con la arquitectura `src/services/` de docs/scope.md.
