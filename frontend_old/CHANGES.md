# Registro de Cambios - Landing Page

## Actualizaciones de Contenido (Features)

- **Agente IA Especializado**:
  - Descripción actualizada: Ahora indica que el agente organiza el trabajo según lo que el usuario pida explícitamente, en lugar de sugerencias automáticas basadas en preferencias o habilidades.
- **Colaboración en tiempo real**:
  - Modificación: Se eliminó la mención al "chat integrado" con compañeros, ya que no está disponible actualmente.
- **Tableros Kanban**:
  - Sin cambios significativos (ajuste visual en el grid).
- **Análisis de Proyectos**:
  - Descripción actualizada: Se especificó que los informes y análisis son proporcionados por el **agente**.
- **Gestión de Tiempo**:
  - Acción: Se eliminó esta característica de la landing page ya que no cuenta con sistema de notificaciones/seguimiento activo por ahora.

## Cambios de Interfaz (UI/UX)

- **Layout del Grid**:
  - Ajuste: Se cambió la estructura de 5 columnas a 4 columnas para mantener el equilibrio visual tras eliminar la tarjeta de "Gestión de Tiempo". El banner de CTA inferior ahora abarca todo el ancho de la rejilla.
- **Botones de Acción**:
  - Estatus: Se estandarizó el texto de los botones de "Comenzar ahora" / "Comenzar gratis" a **"Probar ahora"** en toda la página de inicio.
- **Footer (Pie de página)**:
  - Acción: Se conectaron los enlaces de "Proyectos" y "Integrantes" (ahora "Comunidad") a sus rutas correspondientes.
  - Acción: Se agregó la sección "Empresa" con enlaces a "Inicio" y "Contacto".
  - Acción: Se mantuvo el enlace a la Documentación (PDF) y la API por ser enlaces externos funcionales.
- **Dashboard**:
  - Acción: Se eliminó la mención del Dashboard tanto en el Footer como en los íconos de constantes, ya que no se encuentra implementado actualmente.
- **Paginación de Proyectos**:
  - Acción: Se implementó un sistema de paginación en la vista de proyectos.
  - Lógica: Máximo de 4 proyectos por página.
  - UI/UX: Se añadieron controles interactivos (Prev/Next/Páginas) con un diseño moderno.
  - Animaciones: Se integró **GSAP** para realizar transiciones fluidas de entrada (escala, opacidad y desenfoque) y salida al cambiar de página.
- **Finalización Automática de Proyectos**:
  - Acción: Se implementó un `useEffect` que monitorea el progreso del proyecto en tiempo real.
  - Lógica: Cuando el progreso alcanza el **100%** (todas las tareas completadas), se llama automáticamente al nuevo endpoint `/api/projects/{id}/finish` para marcar el proyecto como completado en la base de datos.
- **Identificación de Creadores**:
  - Acción: Los creadores de proyectos y comunidades ahora aparecen siempre en la **primera posición** de la lista de miembros.
  - UI: Se añadió una **insignia de estrella dorada** en el avatar del creador para una identificación visual rápida.
- **Optimización de Comunidad**:
  - Acción: Se aseguró que las tarjetas de comunidad solo se rendericen una vez que los datos de los miembros han sido cargados.
  - Modal: Se rediseñó el modal de edición de comunidad para ser **100% responsive** y destacar visualmente al **creador/administrador** del grupo.
- **Gestión de Tareas y Fechas**:
  - Selector: Se reemplazó el input nativo de fecha por **react-datepicker**, ofreciendo una experiencia mucho más fluida, localizada al español y estética.
  - Urgencia Visual: Las tareas ahora cambian de color dinámicamente según su fecha límite:
    - **Rojo/Pulso**: Tareas vencidas.
    - **Ámbar**: Tareas pronto a vencer (menos de 3 días).
    - **Verde**: Tareas completadas.
- **Optimización de Navegación**:
  - Acción: Se corrigió el error de **"Stale Data"** (datos antiguos) al navegar rápidamente entre proyectos.
  - Lógica: Ahora el sistema detecta si los datos en el contexto coinciden con el ID del proyecto en la URL. Si no coinciden, se muestra automáticamente el estado de carga (Skeleton) hasta que la nueva información sea recibida, eliminando el parpadeo de datos anteriores.
- **Sincronización Inteligente del Chat**:
  - Acción: Se optimizó la recarga de datos tras interactuar con el agente de IA.
  - Lógica: Ahora la interfaz solo refresca el contenido (proyectos, tareas) si detecta el bloque oculto `[ACTION_SUCCESS:{...}]` en la respuesta del agente. Además, dicho bloque se limpia automáticamente para que el usuario solo vea el mensaje de texto limpio, mejorando la estética de la conversación.
- **Limpieza de Código**:
  - Acción: Se eliminaron importaciones de íconos no utilizados (`Timer`, `LayoutDashboard`).
