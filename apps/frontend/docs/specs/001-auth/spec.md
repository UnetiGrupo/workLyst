# Spec 001 — Auth

Estado: aprobada — Cambios v1.1, v1.2 y v1.3 incorporados (2026-10-04)

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
  En web se implementa con `localStorage`, por lo que la sesión sobrevive al
  cierre del navegador hasta que el token expire o se cierre sesión.
- **Campo `usuario`**: nombre del usuario en el backend. La UI lo captura como
  "nombre completo" (`fullName`) y el adaptador lo envía como `usuario`.
- **X-API-Key global**: cabecera `x-api-key` requerida por todo endpoint. Si
  falta, el backend responde `401`; si es inválida o inactiva, `403`.
- **sessionToken**: JWT devuelto por el backend en login. Contiene `{ id, email }`.
  El adaptador del frontend lo expone como `token`.

## Requisitos funcionales

**RF-01: Registro**
CUANDO el visitante envíe el formulario de registro con nombre, correo y
contraseña válidos, EL SISTEMA creará la cuenta y redirigirá a `/` (dashboard).

Contrato con el backend (`POST /api/auth/register`):
- Entrada: `{ usuario, email, password }`. El adaptador mapea el campo de UI
  `fullName` → `usuario`; no se envía `fullName` ni `name`.
- Éxito: `201` con `{ mensaje, usuario: { id, nombre, email } }`.
- Error `400` con dos causas distintas (ver CA-02 y CA-04), distinguibles por
  `mensaje`.

- CA-01: SI algún campo obligatorio está vacío (tras recortar espacios en
  `fullName`/`email`), o el correo no contiene `@`, o la contraseña no cumple
  las 4 reglas, ENTONCES no se enviará ninguna petición, el botón de envío
  permanecerá deshabilitado y se mostrará el error junto al campo
  correspondiente (campo vacío: «Este campo es requerido»; correo sin `@`:
  «Ingresa un correo electrónico válido»). El predicado de «listo para
  enviar» es único y gobierna a la vez el botón y el envío: no puede haber
  botón habilitado con un envío que abortaría, ni envío bloqueado con el
  botón habilitado.
- CA-02: SI el backend responde `400` con `mensaje === "El usuario ya existe"`,
  ENTONCES se mostrará el error junto al campo de correo y el formulario
  conservará los datos ingresados.
- CA-03: CUANDO el registro sea exitoso, EL SISTEMA iniciará sesión
  automáticamente con las mismas credenciales antes de redirigir (el backend
  no inicia sesión en el registro).
- CA-04: SI el backend responde `400` con `mensaje === "Todos los campos son
  obligatorios"`, ENTONCES se mostrará ese mensaje en español como error
  general del formulario; no se asociará al campo de correo. La distinción
  entre CA-02 y CA-04 se hace por el `mensaje` de la respuesta, documentado
  como contrato del adaptador.
- CA-05: SI la cuenta se crea (`201`) pero el login encadenado falla, ENTONCES
  no se guardará ningún token, el estado volverá a visitante y se mostrará en
  el banner un mensaje en español, amable, que informe que la cuenta se creó
  pero no se pudo iniciar sesión automáticamente e invite a iniciar sesión
  manualmente (p. ej. «Tu cuenta se creó, pero no pudimos iniciar sesión
  automáticamente. Intenta iniciar sesión con tu correo y contraseña.»).
- CA-06: SI el registro falla por una causa no prevista (error inesperado del
  adaptador, `AuthError` con código no cubierto), ENTONCES se mostrará un
  mensaje genérico y amable en español; nunca un error técnico ni un banner
  vacío.

**RF-02: Validación de contraseña (solo cliente, solo registro)**
CUANDO el visitante escriba una contraseña en el formulario de registro, EL
SISTEMA mostrará en vivo los 4 requisitos y su nivel de seguridad. Estas reglas
no se aplican al login.

- Las 4 reglas y su comprobación exacta:
  1. `minLength`: longitud ≥ 8.
  2. `upperAndLower`: contiene al menos una mayúscula (`[A-Z]`) y una
     minúscula (`[a-z]`).
  3. `number`: contiene al menos un dígito (`[0-9]`).
  4. `special`: contiene al menos un carácter del conjunto **`!@#$%^&*`**.
     Este es el conjunto exacto; no se consideran otros símbolos.
- Nivel de seguridad (`level`, entero 0–3), calculado por el número de reglas
  cumplidas (`passed`):
  - `0` si la contraseña está vacía ("Sin ingresar").
  - `1` si `passed ≤ 1` ("Débil").
  - `2` si `passed = 2` ("Media").
  - `3` si `passed ≥ 3` ("Fuerte").
- CA-01: SI no se cumplen las 4 reglas, ENTONCES el botón de envío
  permanecerá deshabilitado y no se enviará ninguna petición.
- CA-02: la verificación de fortaleza vive solo en el cliente; el backend aún
  no la valida (encargo externo).

**RF-03: Login**
CUANDO el visitante envíe credenciales válidas, EL SISTEMA almacenará el token
de sesión y redirigirá a `/`.

Contrato con el backend (`POST /api/auth/login`):
- Entrada: `{ email, password }`.
- Éxito: `200` con `{ mensaje, sessionToken, usuario: { id, nombre, email } }`.
  El adaptador mapea `sessionToken` → `token` de la sesión.
- Error: `400` campos faltantes, `401` credenciales inválidas, `401`/`403`
  API Key faltante/inválida, `429` rate limit.

- CA-01: SI las credenciales son incorrectas (`401` con `mensaje ===
  "Credenciales inválidas"`), ENTONCES se mostrará un mensaje de error genérico
  sobre el formulario, conservando los datos.
- CA-02: SI la petición falla por API Key (`401`/`403`), ENTONCES se mostrará
  el mismo mensaje de error genérico (el usuario no debe saber detalles internos).
- CA-03: MIENTRAS la petición está en curso, EL SISTEMA mostrará el estado de
  carga y deshabilitará el botón de envío.
- CA-04: EL SISTEMA mantendrá el botón de envío deshabilitado hasta que ambos
  campos estén llenos (tras recorte) y el correo contenga `@`. La contraseña
  solo se exige no vacía: las 4 reglas de fortaleza NO se aplican al login
  (decisión explícita del usuario: no bloquear credenciales válidas). El
  predicado de «listo para enviar» es único y gobierna a la vez el botón y el
  envío: sin desajuste entre ambos.
- CA-05: SI el backend responde `400` (campos faltantes) pese a la validación
  local, ENTONCES se mostrará su mensaje en español en el banner; no el
  mensaje de credenciales incorrectas.
- CA-06: SI el login falla por una causa no prevista (error inesperado del
  adaptador, `AuthError` con código no cubierto), ENTONCES se mostrará un
  mensaje genérico y amable en español, distinto del mensaje de credenciales;
  nunca un error técnico ni un banner vacío. El mensaje de credenciales
  incorrectas queda reservado a los fallos de credenciales y de API Key
  (CA-01/CA-02).

**RF-04: Sesión multiplataforma**
EL SISTEMA guardará el token de sesión en el almacenamiento de sesión de la
plataforma y lo usará al iniciar la app para recuperar la sesión sin pedir
credenciales.

- CA-01: AL iniciar la app con un token guardado y vigente, EL SISTEMA
  restaurará la sesión y entrará directo a `/`. El arranque de la app invoca la
  recuperación de sesión antes de resolver la primera ruta.
- CA-02: SI el token guardado está expirado o es inválido/corrupto, ENTONCES se
  tratará como sesión inexistente (se limpia y se muestra el signin). Si el
  usuario intenta entrar a `/auth/signin` o `/auth/signup` con una sesión
  vigente, se le redirige a `/`.
- CA-03: Los datos del usuario se mantienen en memoria; al recuperar sesión
  solo se dispone de id y correo (están dentro del token). Encargo externo:
  endpoint `/me` para el perfil completo.
- CA-04: MIENTRAS se decide la recuperación de sesión, EL SISTEMA mostrará una
  pantalla de carga mínima (evita el parpadeo del signin cuando hay sesión válida).

**RF-05: Logout**
CUANDO el miembro cierre sesión, EL SISTEMA avisará al backend, eliminará el
token del almacenamiento de sesión y redirigirá a `/auth/signin`.

Contrato con el backend (`POST /api/auth/logout`): entrada
`{ sessionToken }`; el adaptador envía el `token` de la sesión bajo la clave
`sessionToken`.

- CA-01: SI el aviso al backend falla (red, error), ENTONCES el logout local
  se aplicará igualmente: es el comportamiento autoritativo.

**RF-06: Botones sociales deshabilitados**
EL SISTEMA mostrará los botones de Google y GitHub deshabilitados con una
indicación de próxima disponibilidad (no hay OAuth en el backend).

**RF-07: Identidad real del miembro en la interfaz**
CUANDO se muestre la barra lateral, EL SISTEMA mostrará la identidad del
usuario derivada de la sesión (nombre visible, correo e iniciales); sin datos
fijos de maqueta.

- CA-01: SI la sesión incluye `nombre` (login o registro), ENTONCES el nombre
  visible será ese `nombre` y el correo será el de la sesión.
- CA-02: SI la sesión no incluye `nombre` (o este está vacío tras recorte; p.
  ej. sesión restaurada desde el token, que solo contiene `id` y `email`),
  ENTONCES el nombre visible se derivará del correo: la parte local (antes de
  la `@`) con la primera letra en mayúscula.
- CA-03: SI no hay sesión, ENTONCES el nombre visible será «Invitado» y no se
  mostrará la línea de correo.
- CA-04: Las iniciales serán las primeras letras (en mayúsculas) de la primera
  y segunda palabra del nombre visible; con una sola palabra, solo su primera
  letra.

## Requisitos no funcionales

| ID     | Requisito                                                                            |
| :----- | :----------------------------------------------------------------------------------- |
| RNF-01 | Textos, errores y UI en español; el código en inglés (constitución, principio 6).     |
| RNF-02 | Validación de formato/fortaleza en vivo mientras se escribe (no espera al envío), acotada a validación local (contraseña de registro y campos obligatorios); los errores del servidor no se anticipan. |
| RNF-03 | Cero datos de usuario en almacenamiento persistente salvo el token de sesión.         |
| RNF-04 | Los mensajes de error son accionables y claros; nunca se expone el detalle técnico.   |
| RNF-05 | Estructura mínima de archivos (YAGNI): no separar contrato, fábrica o mock en archivos propios ni usar carpetas de un solo archivo, salvo cuando el tamaño o la responsabilidad real lo exijan. |
| RNF-06 | Comentarios solo lo imprescindible: prohibidas la paráfrasis del código, las referencias a RF/RNF y el historial de cambios; un mejor nombre es preferible a un comentario. |

## Casos límite

- **CL-01**: Token guardado pero expirado, inválido o corrupto/malformado →
  sesión no recuperada, se limpia y se va al signin.
- **CL-02**: Sin conexión al registrar o iniciar sesión → error amigable
  conservando los datos ingresados; el usuario reintenta reenviando el
  formulario (el reenvío es el mecanismo de reintento, sin UI adicional).
- **CL-03**: Doble envío del formulario (clicks rápidos) → una sola petición.
- **CL-04**: Espacios al inicio/fin de `fullName` y `email` → se recortan antes
  de validar y enviar. La **contraseña no se recorta** (los espacios pueden ser
  caracteres legítimos).
- **CL-05**: Backend inactivo → mismo comportamiento que CL-02.
- **CL-06**: Rate limit del backend (`429`) en register/login → se muestra el
  `mensaje` del backend en español ("Demasiados intentos de inicio de sesión,
  por favor intente nuevamente después de 15 minutos"), conservando los datos.
- **CL-07**: Registro creado (`201`) pero login encadenado falla → sin token
  persistido, estado visitante y banner informando que la cuenta se creó e
  invitando a iniciar sesión manualmente (RF-01 CA-05).
- **CL-08**: El adaptador lanza un error que no es `AuthError` o con código no
  cubierto (bug o flujo imprevisto) en login o registro → mensaje genérico y
  amable en español; nunca detalle técnico ni banner vacío (RF-01 CA-06,
  RF-03 CA-06).
- **CL-09**: Barra lateral sin sesión → nombre visible «Invitado» y sin línea
  de correo (RF-07 CA-03).

## Fuera de alcance (esta versión)

- OAuth social (los botones quedan deshabilitados como requisito visual).
- Recuperación de contraseña: no hay ruta ni endpoint; el link
  "¿Olvidaste tu contraseña?" se mantiene visible pero **sin acción** (sin
  navegación, no apunta a ninguna ruta).
- Toggle "Recuérdame": se mantiene como elemento visual sin efecto.
- Validación de fortaleza de contraseña en el backend (encargo externo).
- Endpoint `/me` (encargo externo).
- Refresh token / sesiones largas diferenciadas.

## Criterios de finalización

1. Registro exitoso crea la cuenta (enviando `usuario`, no `fullName`), inicia
   sesión automáticamente y llega a `/`.
2. Login exitoso guarda el token y llega a `/`; la sesión sobrevive a una
   recarga; entrar directo a `/` con sesión vigente restaura la sesión y
   entrar a una ruta de auth con sesión vigente redirige a `/`.
3. Logout elimina el token y vuelve al signin, incluso si falla la red.
4. Las 4 reglas de contraseña (con el conjunto especial `!@#$%^&*`) se muestran
   en vivo y bloquean el envío del registro.
5. Los errores se muestran en español: los de validación y registro (CA-02)
   junto al campo correspondiente; los de login (credenciales, API Key, red,
   rate limit) en un banner genérico sobre el formulario.
6. Los encargos al backend quedan documentados (OAuth, reset, `/me`, refresh,
   validación de contraseña en servidor).
7. Los botones de registro y login permanecen deshabilitados hasta su mínimo
   obligatorio (registro: campos llenos + correo con `@` + 4 reglas; login:
   campos llenos + correo con `@` + contraseña no vacía) y el botón y el
   envío nunca se desajustan.
8. La barra lateral muestra la identidad real de la sesión (nombre, correo e
   iniciales), con derivación del nombre desde el correo cuando falta y
   fallback «Invitado» sin sesión.
9. Todo error imprevisto (error inesperado del adaptador, código no cubierto,
   login encadenado caído tras registro) muestra un mensaje en español,
   genérico y amable; nunca un error técnico ni un banner vacío.
10. Ningún comentario de código o tests referencia identificadores de la spec
    (RF/RNF/CA/CL): la información útil se conserva reexpresada como
    descripción funcional en español (RNF-06 aplicado de forma exhaustiva).

## Contrato del adaptador (resumen)

| Acción | Backend | Entrada adaptador (UI) | Salida adaptador |
| :----- | :------ | :--------------------- | :--------------- |
| Registro | `POST /api/auth/register` | `{ fullName, email, password }` → envía `{ usuario, email, password }` | `{ id, nombre, email }` |
| Login | `POST /api/auth/login` | `{ email, password }` | `{ token, user: { id, nombre, email } }` (mapea `sessionToken` → `token`) |
| Logout | `POST /api/auth/logout` | `{ token }` → envía `{ sessionToken }` | — |

Errores mapeados a un `AuthError` con: `status`, `code` (p. ej.
`invalid_credentials`, `duplicate_email`, `missing_fields`, `rate_limited`,
`api_key`, `network`) y `message` en español. Bajo HTTP, los códigos pueden
ser 0 (red), 400, 401, 403, 429 o 500.

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

## Cambios de la revisión QA (2026-10-02)

Correcciones incorporadas tras la fase de revisión, verificadas contra el
backend real:

1. **RF-01/HU-01**: fijado el payload de registro `{ usuario, email, password }`
   y el mapeo `fullName → usuario`.
2. **RF-01 CA-02/CA-04**: desambiguado el `400` del backend (duplicado vs.
   campos faltantes) por el `mensaje` de la respuesta.
3. **RF-04 CA-01/CA-02/CA-04**: definido el arranque que invoca la recuperación
   de sesión, el redireccionamiento desde rutas de auth con sesión vigente y la
   pantalla de carga.
4. **RF-02**: fijado el set especial `!@#$%^&*` y la fórmula del nivel 0–3;
   acotado explícitamente al registro.
5. **Criterio 5**: acotado "junto al campo" a validación/registro; login usa
   banner genérico.
6. **Contrato del adaptador**: documentado `sessionToken → token` y la salida.
7. **RNF-02**: acotado el feedback en vivo a validación local.
8. **CL-01**: incluido token corrupto/malformado.
9. **CL-02/CL-05**: formalizado el reintento como reenvío del formulario.
10. **CL-04**: exceptuada la contraseña del recorte de espacios.
11. **CL-06**: documentado el `429` del rate limiter con mensaje en español.
12. **Fuera de alcance RF-06**: aclarado que el link de recuperación no navega.
13. **Definiciones/almacenamiento**: aclarado que la sesión web sobrevive al
    cierre del navegador (localStorage).

## Cambio v1.1 (2026-10-02)

Cambio estructural aprobado por el usuario. Ningún requisito funcional
cambia: los RF, los casos límite y los criterios de finalización se mantienen
intactos; solo se añaden dos requisitos no funcionales y se fija la estructura
interna de la capa de adaptadores. El refactor del código queda pendiente
(tarea T5b del plan).

1. **RNF-05 (nuevo)**: la capa de adaptadores de auth se reduce a dos archivos:
   - `src/lib/auth/auth-api.ts`: contrato `AuthService` + adaptador real +
     fábrica `getAuthService()`/`authService`, que resuelve `VITE_API_MODE`
     (default `mock`; `api` y `real` seleccionan el adaptador real).
   - `src/lib/auth/auth-mock.ts`: adaptador mock, subido desde `mock/`; queda
     separado del anterior por ser fixtures/estado simulado.
2. **Desaparecen** `auth-service.ts`, `auth-adapter.ts` y las carpetas `api/` y
   `mock/`: ni el contrato ni la fábrica justifican archivo propio ni carpetas
   de un solo archivo (YAGNI).
3. **RNF-06 (nuevo)**: política de comentarios, aplicada durante el refactor.
4. Los tests se redistribuyen sin pérdida de cobertura (plan §6.1, tarea T5b).
5. Hasta ejecutar T5b, el código mantiene la estructura anterior (cuatro
   archivos); esta spec ya refleja la aprobada (la spec manda, constitución
   principio 2).

## Cambio v1.2 (2026-10-02)

Cambio estructural aprobado por el usuario. Ningún requisito funcional cambia:
los RF, los casos límite y los criterios de finalización se mantienen intactos.
La UI consume el store de sesión directamente (`useAuthStore`); se descarta el
hook intermedio `useAuth` por ser una indirección sin valor propio (YAGNI,
coherente con RNF-05). No se crea `src/hooks/use-auth.ts` ni archivo
equivalente.

## Cambio v1.3 (2026-10-04)

Cambio de requisitos aprobado por el usuario, con sus decisiones ya tomadas. A
diferencia de v1.1 y v1.2, este cambio SÍ modifica requisitos funcionales:
RF-01 (CA-01 reescrito; CA-05 y CA-06 nuevas), RF-03 (CA-04, CA-05 y CA-06
nuevas), RF-07 nuevo, casos límite CL-07–CL-09 y criterios de finalización
7–10. RNF-06 se aplica de forma exhaustiva (punto 1).

1. **Comentarios sin identificadores de spec (aplicación exhaustiva de
   RNF-06)**: ningún comentario de código o tests referenciará RF/RNF/CA/CL;
   la información útil se conserva reexpresada como descripción funcional en
   español. Residuos conocidos: `src/lib/api.ts`, `src/lib/auth/token.ts` y
   `tests/auth/{api,token,password}.test.ts`.
2. **Identidad real en la barra lateral (RF-07)**: el sidebar consume la
   sesión (`useAuthStore`): nombre visible desde `nombre` o derivado del
   correo, correo real, iniciales derivadas y fallback «Invitado» sin sesión.
   Sustituye a los datos fijos «Orlando Lopez»/«orlando@worklyst.com».
3. **Botones deshabilitados hasta el mínimo obligatorio (RF-01 CA-01,
   RF-03 CA-04)**: un único predicado de «listo para enviar» compartido por el
   botón y el envío (cero desajuste). Registro: campos llenos + correo con `@`
   + 4 reglas. Login: campos llenos + correo con `@` + contraseña no vacía
   (las 4 reglas NO se aplican al login: decisión explícita del usuario para
   no bloquear credenciales válidas).
4. **Errores en cualquier flujo no previsto (RF-01 CA-05/CA-06,
   RF-03 CA-05/CA-06, CL-07/CL-08)**: todo caso imprevisto (error inesperado
   del adaptador, código desconocido, login encadenado caído tras registro,
   `400` de campos en login) muestra un mensaje de usuario en español,
   genérico y amable; nunca un error técnico ni un banner vacío. El mensaje de
   credenciales incorrectas queda reservado a los fallos de credenciales y de
   API Key.
