# Spec 001 — Auth

Estado: aprobada

> Fase 0 del alcance (docs/scope.md). Primera spec de la v2. La interfaz ya está
> maquetada; esta spec cubre la lógica de conexión con el backend y las
> validaciones en el cliente. Solo el frontend: los cambios necesarios en el
> backend quedan documentados como encargo externo.

## Contexto y objetivo

Permitir que un visitante se registre, inicie sesión y cierre sesión conectando
la maqueta existente con el backend (Express, `x-api-key` global + JWT).
Diferenciador de producto: sesión multiplataforma (web hoy, móvil con
Capacitor después) con el almacenamiento propio de cada plataforma.

## Usuarios

| Rol       | Descripción                              |
| :-------- | :--------------------------------------- |
| Visitante | Usuario sin sesión iniciada.             |
| Miembro   | Usuario autenticado con sesión activa.   |

## Historias de usuario

- HU-01. Como visitante, quiero registrarme con nombre, correo y contraseña
  para crear mi cuenta.
- HU-02. Como visitante, quiero iniciar sesión con correo y contraseña para
  acceder a mi espacio de trabajo.
- HU-03. Como miembro, quiero cerrar sesión para terminar de forma segura.

## Definiciones

- **Credenciales**: par de correo + contraseña.
- **Sesión iniciada**: existe un token de sesión válido y datos del usuario en memoria.
- **Almacenamiento de sesión**: mecanismo de persistencia propio de cada
  plataforma (navegador en web; almacenamiento nativo vía Capacitor en móvil).

## Requisitos funcionales

**RF-01: Registro**
CUANDO el visitante envíe el formulario de registro con nombre, correo y
contraseña válidos, EL SISTEMA creará la cuenta y redirigirá a `/` (dashboard).

- CA-01: SI algún campo está vacío o inválido, ENTONCES no se enviará ninguna
  petición y se mostrará el error junto al campo correspondiente.
- CA-02: SI el correo ya existe (respuesta 400 del backend), ENTONCES se
  mostrará el error junto al campo de correo y el formulario conservará los
  datos ingresados.
- CA-03: CUANDO el registro sea exitoso, EL SISTEMA iniciará sesión
  automáticamente con las mismas credenciales antes de redirigir (el backend
  no inicia sesión en el registro).

**RF-02: Validación de contraseña (solo cliente)**
CUANDO el visitante escriba una contraseña, EL SISTEMA mostrará en vivo los 4
requisitos (mín. 8 caracteres; mayúscula y minúscula; un número; un carácter
especial) y su nivel de seguridad.

- CA-01: SI no se cumplen los 4 requisitos, ENTONCES el botón de envío
  permanecerá deshabilitado y no se enviará ninguna petición.
- CA-02: la verificación de fortaleza vive solo en el cliente; el backend aún
  no la valida (encargo externo).

**RF-03: Login**
CUANDO el visitante envíe credenciales válidas, EL SISTEMA almacenará el token
de sesión y redirigirá a `/`.

- CA-01: SI las credenciales son incorrectas (401), ENTONCES se mostrará un
  mensaje de error genérico sobre el formulario, conservando los datos.
- CA-02: SI la petición falla por API Key (401/403), ENTONCES se mostrará el
  mismo mensaje de error genérico (el usuario no debe saber detalles internos).
- CA-03: MIENTRAS la petición está en curso, EL SISTEMA mostrará el estado de
  carga y deshabilitará el botón de envío.

**RF-04: Sesión multiplataforma**
EL SISTEMA guardará el token de sesión en el almacenamiento de sesión de la
plataforma y lo usará al iniciar la app para recuperar la sesión sin pedir
credenciales.

- CA-01: AL iniciar la app con un token guardado y vigente, EL SISTEMA
  restaurará la sesión y entrará directo a `/`.
- CA-02: SI el token guardado está expirado, ENTONCES se tratará como sesión
  inexistente (se limpia y se muestra el signin).
- CA-03: Los datos del usuario se mantienen en memoria; al recuperar sesión
  solo se dispone de id y correo (están dentro del token). Encargo externo:
  endpoint `/me` para el perfil completo.

**RF-05: Logout**
CUANDO el miembro cierre sesión, EL SISTEMA avisará al backend, eliminará el
token del almacenamiento de sesión y redirigirá a `/auth/signin`.

- CA-01: SI el aviso al backend falla (red, error), ENTONCES el logout local
  se aplicará igualmente: es el comportamiento autoritativo.

**RF-06: Botones sociales deshabilitados**
EL SISTEMA mostrará los botones de Google y GitHub deshabilitados con una
indicación de próxima disponibilidad (no hay OAuth en el backend).

## Requisitos no funcionales

| ID     | Requisito                                                                            |
| :----- | :----------------------------------------------------------------------------------- |
| RNF-01 | Textos, errores y UI en español; el código en inglés (constitución, principio 6).     |
| RNF-02 | Validación en vivo: feedback por campo al escribir, sin esperar al envío.             |
| RNF-03 | Cero datos de usuario en almacenamiento persistente salvo el token de sesión.         |
| RNF-04 | Los mensajes de error son accionables y claros; nunca se expone el detalle técnico.   |

## Casos límite

- **CL-01**: Token guardado pero expirado → sesión no recuperada, ir al signin.
- **CL-02**: Sin conexión al registrar o iniciar sesión → error amigable con
  reintento, conservando los datos ingresados.
- **CL-03**: Doble envío del formulario (clicks rápidos) → una sola petición.
- **CL-04**: Espacios al inicio/fin de los campos → se recortan antes de enviar.
- **CL-05**: Backend inactivo → mismo comportamiento que CL-02.

## Fuera de alcance (esta versión)

- OAuth social (los botones quedan deshabilitados como requisito visual).
- Recuperación de contraseña: no hay ruta ni endpoint; el link
  "¿Olvidaste tu contraseña?" se mantiene visible pero sin acción.
- Toggle "Recuérdame": se mantiene como elemento visual sin efecto.
- Validación de fortaleza de contraseña en el backend (encargo externo).
- Endpoint `/me` (encargo externo).
- Refresh token / sesiones largas diferenciadas.

## Criterios de finalización

1. Registro exitoso crea la cuenta, inicia sesión automáticamente y llega a `/`.
2. Login exitoso guarda el token y llega a `/`; la sesión sobrevive a una recarga.
3. Logout elimina el token y vuelve al signin, incluso si falla la red.
4. Las 4 reglas de contraseña se muestran en vivo y bloquean el envío.
5. Los errores del backend se muestran en español, junto al campo correspondiente.
6. Los encargos al backend quedan documentados (OAuth, reset, `/me`, refresh).

## Encargos al backend (dependencias externas)

1. Validar fortaleza de contraseña en el servidor (mismas 4 reglas).
2. Endpoint `GET /me` con JWT para el perfil completo de la sesión.
3. Refresh token o sesiones largas (desbloquearía el "Recuérdame").
4. OAuth social (Google/GitHub).
5. Recuperación/restablecimiento de contraseña.

## Dudas abiertas

Ninguna. Cierres acordados (2026-10-01):

1. Dependencia nativa de Capacitor para sesión móvil: **aplazada a la fase
   móvil**; no aplica en esta versión (solo web).
2. Endpoint `/me`: **encargo externo emitido**; la spec no depende de él
   (la sesión se recupera con id y correo contenidos en el token).
