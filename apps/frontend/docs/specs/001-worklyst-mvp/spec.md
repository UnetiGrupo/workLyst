# SPEC 001 — Worklyst MVP

## Contexto y Objetivo

Worklyst es un gestor de proyectos y tareas potenciado con IA para equipos de desarrolladores y estudiantes. El frontend se conecta a un backend vía REST con autenticación JWT + API Key.

El MVP debe permitir: autenticación, gestión de proyectos con plantillas Scrum/Kanban, tareas movibles entre columnas, grupos con roles, mensajes en tiempo real y un agente de IA que ayude con todo.

## Usuarios

| Rol        | Descripción                                                 |
| ---------- | ----------------------------------------------------------- |
| **Admin**  | Creador de grupo/proyecto. Control total sobre lo que crea. |
| **Member** | Puede crear contenido. Solo editar/eliminar lo propio.      |

## Historias de Usuario

| ID    | Historia                                                                                                                      |
| ----- | ----------------------------------------------------------------------------------------------------------------------------- |
| HU-01 | COMO usuario quiero registrarme e iniciar sesión PARA acceder a mis proyectos.                                                |
| HU-02 | COMO usuario quiero crear, editar y eliminar proyectos PARA organizar mi trabajo.                                             |
| HU-03 | COMO usuario quiero asociar plantillas Scrum o Kanban a mis proyectos PARA visualizar tareas de forma organizada.             |
| HU-04 | COMO usuario quiero crear, editar, eliminar y mover tareas dentro de un tablero PARA mantener mi flujo visible.               |
| HU-05 | COMO usuario quiero crear grupos e invitar miembros PARA colaborar en equipo.                                                 |
| HU-06 | COMO usuario quiero enviar mensajes en tiempo real a usuarios o canales de grupo/proyecto PARA comunicarme con mi equipo.     |
| HU-07 | COMO usuario quiero interactuar con un agente de IA PARA buscar info, crear entidades, resumir estados y recibir sugerencias. |

## Requisitos Funcionales

### Auth

**RF-01: Registro**
CUANDO el usuario complete nombre, email y contraseña
ENTONCES el sistema creará la cuenta y redirigirá al dashboard

- CA-01: SI el email ya existe → error, formulario conserva datos
- CA-02: SI la contraseña es débil → mostrar requisitos

**RF-02: Login**
CUANDO el usuario ingrese credenciales válidas
ENTONCES el sistema almacenará el JWT y redirigirá al dashboard

- CA-01: SI credenciales incorrectas → mensaje de error
- CA-02: SI token expira → re-login automático

**RF-03: Logout**
CUANDO el usuario cierre sesión
ENTONCES el sistema eliminará el token y redirigirá al login

### Proyectos

**RF-04: Crear proyecto**
CUANDO el usuario ingrese nombre y descripción
ENTONCES el sistema creará el proyecto vinculado al usuario

- CA-01: Puede ser individual (sin grupo) o asociado a un grupo
- CA-02: SI se asocia a grupo, será visible para todos sus miembros

**RF-05: Editar proyecto**
CUANDO el usuario edite un proyecto propio
ENTONCES el sistema actualizará los datos

- CA-01: SI no es creador → opción de editar no visible

**RF-06: Eliminar proyecto**
CUANDO el usuario confirme eliminación de un proyecto propio
ENTONCES el sistema eliminará el proyecto y tableros asociados

- CA-01: SI no es creador → opción de eliminar no visible
- CA-02: Se pedirá confirmación

### Plantillas

**RF-07: Crear tablero**
CUANDO el usuario seleccione crear tablero en un proyecto
ENTONCES podrá elegir Scrum o Kanban

- CA-01: Kanban → columnas fijas: To Do, In Progress, Done
- CA-02: Scrum → mismas columnas + gestión de sprints con fechas
- CA-03: Un proyecto puede tener múltiples tableros

**RF-08: Columnas**
CUANDO el usuario abra un tablero
ENTONCES verá las columnas definidas y podrá mover tareas entre ellas

- CA-01: Columnas son fijas (no se crean ni eliminan)

**RF-09: Sprints (Scrum)**
CUANDO el usuario active un tablero Scrum
ENTONCES podrá crear sprints con fecha inicio y fin

- CA-01: Solo un sprint activo a la vez
- CA-02: Si no hay sprint activo → se muestran todas las tareas
- CA-03: Si hay sprint activo → solo se muestran tareas de ese sprint

### Tareas

**RF-10: Crear tarea**
CUANDO el usuario presione "Nueva tarea" en un tablero
ENTONCES se creará en la primera columna con título, descripción y asignación opcional

- CA-01: Si se asigna → aparece en vista personal del asignado
- CA-02: Si no se asigna → queda como "Sin asignar"

**RF-11: Editar tarea**
CUANDO el usuario edite una tarea propia
ENTONCES el sistema actualizará los campos

- CA-01: SI no es creador → no puede editar

**RF-12: Eliminar tarea**
CUANDO el usuario confirme eliminación de una tarea propia
ENTONCES el sistema la eliminará

- CA-01: SI no es creador → no puede eliminar
- CA-02: Se pedirá confirmación

**RF-13: Mover tarea**
CUANDO el usuario arrastre una tarea a otra columna
ENTONCES cambiará de estado

- CA-01: EN Scrum, solo válido dentro del sprint activo

### Grupos

**RF-14: Crear grupo**
CUANDO el usuario ingrese nombre del grupo
ENTONCES será Admin automáticamente

- CA-01: Admin puede editar/eliminar grupo y gestionar miembros

**RF-15: Invitar miembros**
CUANDO un miembro del grupo seleccione un usuario
ENTONCES se enviará invitación

- CA-01: Tanto Admin como Member pueden invitar
- CA-02: Nuevo miembro entra como Member

**RF-16: Salir del grupo**
CUANDO un miembro presione salir
ENTONCES se eliminará su membresía

- CA-01: SI es el único Admin → debe designar otro antes de salir

### Mensajes

**RF-17: Mensaje directo**
CUANDO un usuario envíe mensaje a otro usuario
ENTONCES se entregará en tiempo real

- CA-01: SI destinatario offline → se almacena y muestra al reconectar

**RF-18: Canal de grupo/proyecto**
CUANDO un usuario envíe mensaje en canal de grupo/proyecto
ENTONCES todos los miembros lo recibirán en tiempo real

- CA-01: Solo miembros pueden enviar y ver mensajes en ese canal

### IA

**RF-19: Conversación**
CUANDO el usuario abra el chat de IA y envíe un mensaje
ENTONCES el agente responderá de forma conversacional

- CA-01: Historial se mantiene durante la sesión

**RF-20: Consulta de información**
CUANDO el usuario pregunte sobre proyectos o tareas
ENTONCES la IA consultará datos reales del backend y responderá

**RF-21: Crear entidades**
CUANDO el usuario solicite crear una entidad
ENTONCES la IA la creará y confirmará

- CA-01: SI solicitud ambigua → preguntará antes de crear

**RF-22: Resumen y consejos**
CUANDO el usuario pida resumen o consejo sobre un proyecto
ENTONCES la IA analizará y ofrecerá resumen ejecutivo con sugerencias

**RF-23: Sugerencia de tareas**
CUANDO el usuario pida sugerencias
ENTONCES la IA considerará carga, roles y prioridades para recomendar

## Requisitos No Funcionales

| ID     | Requisito                                     |
| ------ | --------------------------------------------- |
| RNF-01 | Carga inicial < 3 segundos                    |
| RNF-02 | Mensajes en tiempo real < 500ms               |
| RNF-03 | Responsive (escritorio, tablet y movil)       |
| RNF-04 | Sin localStorage excepto tokens JWT           |
| RNF-05 | Código en inglés, comentarios y UI en español |

## Casos Límite

- **CL-01:** Acceso a proyecto/grupo sin permiso → redirect al dashboard
- **CL-02:** Intentar editar contenido de otro → opción no visible
- **CL-03:** Conexión perdida → error amigable con reintento
- **CL-04:** Token expirado → re-login automático sin perder estado
- **CL-05:** IA responde incorrectamente → [NECESITA ACLARACIÓN]

## Fuera de Alcance (MVP)

- Archivos multimedia en mensajes
- Roles dinámicos personalizados
- Notificaciones push
- Modo offline
- Integración con herramientas externas
- Exportación de datos

## Criterios de Finalización

1. Registro, login y logout funcionan correctamente.
2. CRUD de proyectos individuales y de grupo.
3. Tableros Scrum y Kanban creados dentro de proyectos.
4. CRUD de tareas con movimiento entre columnas.
5. Creación de grupos e invitación de miembros.
6. Mensajes en tiempo real entre usuarios y en canales.
7. IA responde preguntas, crea entidades y sugiere tareas.
8. Al menos 1 test por componente público.

## Dudas Abiertas

- [NECESITA ACLARACIÓN] — ¿Cómo manejamos respuestas erróneas de la IA?
- [NECESITA ACLARACIÓN] — ¿Hay límite de miembros por grupo o proyectos por usuario?
- [NECESITA ACLARACIÓN] — ¿Los tableros se pueden eliminar o solo crean?
