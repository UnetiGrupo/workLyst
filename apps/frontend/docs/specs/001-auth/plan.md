# PLAN — Spec 001 Auth

> Generado: 2026-10-01 · Actualizado: 2026-10-02 (revisión QA · Cambio v1.1:
> estructura mínima de la capa de auth · Cambio v1.2: sin hook, la UI consume
> el store directamente) · 2026-10-04 (Cambio v1.3: mínimo obligatorio de los
> botones con coherencia botón/envío, identidad real en la barra lateral,
> mensajes para flujos no previstos y limpieza de comentarios con referencias
> a la spec).
> Aprobado por el usuario con estructura mínima de archivos (Zustand) y tests en
> Vitest. Espeja la decisión del alcance (docs/scope.md): contrato + adaptadores,
> mock por defecto.

## 1. Archivos a crear y su responsabilidad

| Archivo | Responsabilidad | RF |
|---|---|---|
| `src/lib/api.ts` | Instancia axios: `baseURL` desde `VITE_API_URL`, header `x-api-key` desde `VITE_API_KEY`, y mapeo de errores del backend (`400` por `mensaje`, `401/403`, `429`, red) a `AuthError` en español. Único punto de contacto con la red | RF-01, RF-03, RF-05 |
| `src/lib/auth/password.ts` | Funciones puras de contraseña: 4 reglas (con set especial `!@#$%^&*`) y nivel 0–3 | RF-02 |
| `src/lib/auth/token.ts` | Funciones puras de token: decodificación JWT, vigencia y detección de token corrupto | RF-04 |
| `src/lib/auth/types.ts` | Tipos compartidos: `AuthUser`, `Session`, `RegisterData` (`fullName`), `Credentials`, `AuthError` con `code` | Todos |
| `src/lib/auth/auth-api.ts` | Contrato `AuthService` + adaptador real (llama a `lib/api.ts`, mapea `fullName → usuario`, `sessionToken → token`, traduce errores) + fábrica `getAuthService()`/`authService` que lee `VITE_API_MODE` (default `mock`; `api` \| `real` seleccionan el real). Único punto que conoce el modo | RF-01, RF-03, RF-05 |
| `src/lib/auth/auth-mock.ts` | Adaptador mock: usuarios en memoria, latencia y errores simulados (mismo patrón que `home-mocks.ts`). Implementa el contrato `AuthService` de `auth-api.ts`; separado de él por ser fixtures/estado simulado | RF-01, RF-03, RF-05 |
| `src/stores/auth-store.ts` | Store Zustand: estado `{ token, user, status }` + acciones `login`, `register`, `logout`, `restoreSession` (consumen `authService` de `auth-api.ts`); la UI lo consume directamente vía `useAuthStore` | RF-01, RF-03, RF-04, RF-05 |
| `.env.example` | Plantilla: `VITE_API_URL`, `VITE_API_KEY`, `VITE_API_MODE=mock` | RF-04 |

Nota (Cambio v1.1, 2026-10-02): la capa de adaptadores queda reducida a los dos
archivos de auth listados arriba (RNF-05 de la spec). Desaparecen
`auth-service.ts`, `auth-adapter.ts` y las carpetas `api/` y `mock/` (estructura
de T5); el refactor pendiente es la tarea T5b.

Archivos a modificar (solo consumen el store; la lógica sale de ellos):

- `src/components/auth/signin-form.tsx` — conectar login; error genérico en
  banner; el link "¿Olvidaste tu contraseña?" visible **sin navegación** (hoy
  apunta a `/auth/forgot-password`, ruta inexistente, y tiene el atributo
  inválido `forgot-password`: se elimina el `href` y el atributo, dejándolo sin
  acción); toggle "Recuérdame" visual. **RF-03, RF-06**
- `src/components/auth/signup-form.tsx` — conectar registro→login encadenado;
  reglas de contraseña bloquean el envío (reglas se mueven a `lib/auth`). Envía
  `fullName`; el adaptador lo mapea. **RF-01, RF-02**
- `src/routes/auth/signin.tsx`, `signup.tsx` — redirección a `/` tras éxito; si
  ya hay sesión vigente al entrar, redirigir a `/`. **RF-01, RF-03, RF-04**
- `src/routes/__root.tsx` — punto de arranque: montaje que llama a
  `restoreSession()` una vez (en el cliente) y muestra la pantalla de carga
  mínima mientras `status === "loading"`. **RF-04**
- `src/routes/index.tsx` — consume la sesión restaurada; sin guard de roles en
  esta versión (el guard real llega con la fase 1), pero la entrada a `/`
  respeta el resultado de `restoreSession`. **RF-04**

Nota (Cambio v1.2): sin provider ni hook envoltorio — Zustand es estado global
sin contexto; la UI consume `useAuthStore` directamente.

Nota (Cambio v1.3, 2026-10-04): dos módulos puros nuevos y tres archivos a
modificar:

| Archivo | Responsabilidad | RF |
|---|---|---|
| `src/lib/auth/form-validation.ts` | Predicados puros de envío mínimo: `canSubmitRegister` (campos llenos tras recorte + correo con `@` + 4 reglas) y `canSubmitLogin` (campos llenos + correo con `@` + contraseña no vacía, sin reglas) | RF-01, RF-03 |
| `src/lib/auth/user-display.ts` | Identidad visible pura: `displayName` (`nombre` → parte local del correo capitalizada → «Invitado») e `displayInitials` | RF-07 |

Se modifican: `signin-form.tsx` y `signup-form.tsx` (botón deshabilitado hasta
el mínimo con el mismo predicado que el envío + mensajes para flujos no
previstos), `src/components/layout/sidebar.tsx` (identidad real de la sesión en
lugar de los datos fijos "Orlando Lopez"/"orlando@worklyst.com"), y se limpian
los comentarios con referencias a la spec en `src/lib/api.ts`,
`src/lib/auth/token.ts` y `tests/auth/{api,token,password}.test.ts` (RNF-06,
sin perder la información útil: se reexpresa como descripción funcional).

Dependencias aprobadas por el usuario: `zustand` (runtime) y `vitest` (dev).
Constitución, principio 1. **Actualización 2026-10-02**: se aprueban además las
dependencias de test de componente `jsdom`, `@testing-library/react` y
`@testing-library/user-event`. `@playwright/test` **NO se aprueba**: el E2E
queda diferido (ver sección 6.2). El plan se cierra con la **Opción B**.

## 2. Funciones puras (con `now` como parámetro donde aplique)

```
validatePasswordRules(password) → { minLength, upperAndLower, number, special, level: 0..3 }
isTokenValid(token: string, now: Date) → boolean   // decodifica JWT; false si exp/corrupto/malformado
sanitizeText(text: string) → string                // trim (excepto password)
canSubmitRegister(data: RegisterData) → boolean     // Cambio v1.3: campos llenos + correo con "@" + 4 reglas (usa validatePasswordRules)
canSubmitLogin(credentials: Credentials) → boolean  // Cambio v1.3: campos llenos + correo con "@" + contraseña no vacía (sin reglas)
displayName(user: AuthUser | null) → string          // Cambio v1.3: nombre → parte local del correo → "Invitado"
displayInitials(name: string) → string               // Cambio v1.3: iniciales de las dos primeras palabras (una palabra → su inicial)
```

Cero IO y cero React: 100% testeables con Vitest.

## 3. Algoritmos (pseudocódigo)

**Registro (RF-01, CA-01..06):**
```
register(data):
  data = sanitize(data)                 // trim fullName/email; NO password
  if !canSubmitRegister(data) → abort, errores por campo (CA-01)
      // el botón comparte este predicado: nunca habilitado con envío inválido
  usuario = data.fullName               // mapeo fullName → usuario (adaptador)
  await adapter.register(usuario, data.email, data.password)   // 201
      // 400 "El usuario ya existe" → error campo email (CA-02), conservar datos
      // 400 "Todos los campos son obligatorios" → error general (CA-04)
      // fallo no previsto (no-AuthError, código no cubierto) → genérico amable (CA-06)
  session = await adapter.login(data.email, data.password)     // CA-03 encadenado
      // CA-05: si falla → sin token, estado guest, banner "cuenta creada,
      // inicia sesión manualmente" (amable, en español)
  store: set token + user → redirect "/"
```

**Login (RF-03):**
```
login(credentials):
  credentials = sanitize(credentials)
  if !canSubmitLogin(credentials) → abort, errores por campo (CA-04)
      // sin reglas de fortaleza: solo contraseña no vacía (decisión del usuario)
  status = "loading"; botón deshabilitado (CA-03)
  session = await adapter.login(credentials)
  store: set token + user; persist token → redirect "/"
  catch invalid_credentials|api_key → banner genérico (CA-01, CA-02)
  catch rate_limited → banner con mensaje del backend (429, CL-06)
  catch missing_fields → banner con mensaje del backend (CA-05)
  catch network → banner de reintento, conservar datos (CL-02, CL-05)
  catch unknown|no-AuthError → banner genérico amable (CA-06, CL-08)
```

**Recuperar sesión al arrancar (RF-04):**
```
restoreSession():                       // invocada una vez por __root al montar
  status = "loading"                    // pantalla de carga (CA-04)
  token = storage.get()
  if !token || !isTokenValid(token, now) → storage.clear(); status = "guest"
  else → status = "authenticated" con { id, email } del payload (CA-03)
```

**Redirección desde rutas de auth (RF-04 CA-01/CA-02):**
```
antes de renderizar /auth/signin|signup:
  if store.status === "authenticated" → redirect "/"
```

**Logout (RF-05):**
```
logout():
  try: adapter.logout(token)     // si falla, se ignora y continúa (CA-01)
  storage.clear(); store reset; redirect "/auth/signin"
```

**Identidad del miembro en la barra lateral (RF-07, Cambio v1.3):**
```
sidebar(user = store.user):
  name = displayName(user)      // nombre → parte local del correo → "Invitado"
  initials = displayInitials(name)
  email = user?.email           // sin sesión → no se renderiza la línea de correo
```

## 4. Selección de adaptador y desviación del patrón de scope.md

`docs/scope.md` propone un patrón genérico `src/services/<modulo>-service.ts`
+ `src/services/mock|api/<modulo>-*.ts` con `VITE_API_MODE`. **Desviación
documentada (radicalizada en el Cambio v1.1)**: la capa de auth se reduce a dos
archivos en `src/lib/auth/` (estructura mínima, RNF-05 de la spec):
`auth-api.ts` (contrato `AuthService` + adaptador real + fábrica) y
`auth-mock.ts` (fixtures/estado simulado, separado por responsabilidad real).
El patrón genérico de `scope.md` aplica a los módulos futuros (fases 1+); auth
es la primera implementación y fija el precedente. La fábrica vive dentro de
`auth-api.ts` y resuelve el modo:

```
getAuthService():
  mode = import.meta.env.VITE_API_MODE          // default: mock
  return mode === "api" || mode === "real" ? authApi : authMock

export const authService = getAuthService()    // consumido por el store
```

**Decisión**: el modo por defecto cuando `VITE_API_MODE` no está presente (o
tiene un valor desconocido) es `mock` (permite desarrollar y probar sin
backend). `api`/`real` exigen `VITE_API_URL` y `VITE_API_KEY`.

## 5. Pintado en la interfaz

- **Por campo**: error bajo el input (rojo) en registro/validación (CA-01,
  CA-02 de RF-01); reglas de contraseña con check verde/rojo en vivo y barra de
  nivel (maquetado, solo se conecta). RF-02
- **Banner** sobre el formulario para el error genérico de login (credenciales,
  API Key, red, 429). RF-03
- **Botón**: `idle → loading ("Iniciando sesión…" / "Creando cuenta…") →
  error → éxito (redirige)`; deshabilitado mientras envía y hasta cumplir el
  mínimo obligatorio (registro: campos + `@` + 4 reglas; login: campos + `@` +
  contraseña no vacía), siempre con el mismo predicado que el envío. El correo
  sin `@` muestra «Ingresa un correo electrónico válido» junto al campo.
  RF-01, RF-02, RF-03
- **Barra lateral (Cambio v1.3)**: chip con identidad de la sesión — nombre
  visible (`nombre`, o derivado del correo; sin sesión «Invitado»), correo
  real (oculto sin sesión) e iniciales derivadas; sin datos fijos de maqueta.
  RF-07
- **Sociales**: `disabled` + indicación "Próximamente". RF-06
- **Link forgot-password y toggle recuérdame**: visibles, sin acción (el link
  sin `href` ni atributo inválido).
- **Arranque de la app**: pantalla de carga mínima en `__root` mientras
  `restoreSession` decide (evita el flash de signin con sesión válida). RF-04

## 6. Estrategia de tests

### 6.1 Tests de lógica (Vitest, carpeta `tests/auth/`) — cubiertos en esta iteración

Config: `vite.config.ts` añade `test` con resolve alias `#` → `src`. Script
`pnpm test` = `vitest run`.

| RF | Test | Qué cubre |
|---|---|---|
| RF-01 | `auth-store.test.ts` | registro OK → sesión + login encadenado; payload con `usuario`; duplicado (`400` "El usuario ya existe") → error campo email; campos faltantes (`400`) → mensaje backend; campos inválidos → sin petición |
| RF-02 | `password.test.ts` | cada regla por separado (incluye set especial `!@#$%^&*`); los 4 niveles (0 sin escribir, 1 débil, 2 media, 3 fuerte); combinaciones límite |
| RF-03 | `auth-store.test.ts` | login OK → token y user en store; `401` → `AuthError` genérico; `429` → mensaje backend; errores de red → reintento |
| RF-04 | `token.test.ts` | `isTokenValid`: vigente / expirado / corrupto / malformado, con `now` fijo; `sanitizeText`; `restoreSession` con localStorage |
| RF-05 | `auth-store.test.ts` | logout limpia store y storage aunque `adapter.logout` rechace |
| RF-06 | `signin-form.test.tsx` / `signup-form.test.tsx` | botones sociales deshabilitados con "Próximamente" (test de componente, `@testing-library/react`) |
| RF-01/RF-03 (Cambio v1.3) | `form-validation.test.ts` | `canSubmitRegister`/`canSubmitLogin`: campos vacíos (con recorte), correo con/sin `@`, 4 reglas solo en registro, contraseña no vacía en login |
| RF-07 (Cambio v1.3) | `user-display.test.ts` | `displayName` (con `nombre`, sin `nombre` → derivado del correo, sin sesión → «Invitado») e `displayInitials` (dos palabras, una palabra) |
| RF-01 CA-01/CA-05/CA-06 · RF-03 CA-04/CA-05/CA-06 (Cambio v1.3) | `signin-form.test.tsx` / `signup-form.test.tsx` (extensión) | botón nace deshabilitado y se habilita exactamente al cumplir el mínimo; error no-`AuthError` → genérico amable (no el de credenciales); `missing_fields` en login → mensaje del backend; login encadenado caído en registro → banner de cuenta creada |
| RF-07 (Cambio v1.3) | `tests/layout/sidebar.test.tsx` | chip del sidebar con nombre real, derivado del correo y fallback «Invitado» sin correo, montado con el store en sus tres estados |

Tests primero (rojo) por tarea, siguiendo la skill sdd. Los de store fuerzan
`VITE_API_MODE=mock` en el test setup.

Nota (Cambio v1.3): `tests/layout/` espeja el área `src/components/layout/`
del componente bajo prueba (la responsabilidad de área justifica la carpeta,
RNF-05); crecerá con los tests de layout de la fase 1.

**Redistribución de tests del adaptador (Cambio v1.1)**: con la estructura de
dos archivos, el contrato/adaptador real y la fábrica se prueban en
`tests/auth/auth-api.test.ts` (absorbe los casos de `auth-adapter.test.ts`) y
el mock en `tests/auth/auth-mock.test.ts`. Los mismos 97 tests se
redistribuyen sin pérdida de cobertura; la ejecución del refactor es la tarea
T5b.

### 6.2 Tests de componente y E2E — Opción B aprobada (2026-10-02)

La constitución (principio 4) exige "1 test mínimo por componente público" y
"E2E para flujos críticos". Esto requiere dependencias nuevas (principio 1).
Opciones evaluadas (tabla como histórico de la decisión):

| Opción | Dependencias nuevas | Alcance | Estado |
|---|---|---|---|
| A. Completar ahora | `jsdom` + `@testing-library/react` + `@testing-library/user-event` + `@playwright/test` | Tests de `SigninForm`/`SignupForm` + E2E de login/registro/logout | **Descartada**: el E2E se difiere (ver más abajo) |
| B. Solo componente ahora | `jsdom` + `@testing-library/react` + `@testing-library/user-event` | Cubre RF de componentes; E2E se difiere con excepción documentada | **APROBADA el 2026-10-02** |
| C. Diferir todo | Ninguna | Excepción explícita al principio 4 para este módulo | Rechazada: deja sin cubrir los componentes |

**Resultado de la decisión (2026-10-02): Opción B.**

- **Aprobado**: dependencias de test de componente `jsdom`,
  `@testing-library/react` y `@testing-library/user-event`. La tarea **T11 pasa
  a ser no condicional** y forma parte de esta iteración.
- **`@playwright/test` NO se aprueba y no se instala.**
- **Excepción documentada al principio 4 ("E2E para los flujos críticos")**: el
  E2E se difiere porque la aplicación aún no está terminada (razón textual del
  usuario: "no puede haber E2E si no está terminada la app"). El E2E de auth se
  retomará cuando la app esté completa; queda como deuda técnica explícita, no
  como tarea ejecutable de esta iteración (T12 reformulada como DIFERIDA).
  Los flujos críticos quedan cubiertos en esta iteración por los tests de lógica
  (6.1) y de componente (T11), que no bastan para satisfacer el principio 4 en
  su parte de E2E: la excepción se registra aquí para auditoría.

## 7. Decisiones técnicas (justificadas, con alternativa descartada)

1. **Zustand** para el estado de sesión (aprobado) — *descartado Contexto React*:
   más boilerplate; *descartada TanStack Query*: aquí aún no hay datos de
   servidor que sincronizar.
2. **TanStack Form** (ya instalado) para los formularios — *descartada
   react-hook-form*: dependencia nueva sin necesidad (principio 1).
3. **axios** (ya instalado) centralizado en `lib/api.ts` — *descartado un
   wrapper de fetch*: axios ya existe y da interceptores para el JWT futuro.
4. **`localStorage` en web** para el token (única excepción de la constitución)
   — *descartadas cookies httpOnly*: el backend no gestiona cookies y rompería
   la abstracción multiplataforma (Capacitor).
5. **register→login encadenado en cliente** — *descartado pedir auto-login al
   backend*: no dependemos de cambios externos (CA-03 lo define).
6. **Mocks in-memory** en `src/lib/auth/auth-mock.ts` — *descartado MSW*: dependencia
   pesada para simular lo mismo; mismo patrón que el código existente.
7. **Adaptador elegido por `VITE_API_MODE` en una fábrica** (default `mock`) —
   *descartada la conmutación en runtime*: evita estados mixtos.
8. **Vitest** para tests (aprobado) — *descartado `node --test`*: requiere
   loaders experimentales y no resuelve el alias `#/` sin config extra.
9. **Desambiguar el `400` por el `mensaje`** — *descartado asumir duplicado por
   código*: el backend usa `400` para dos causas distintas.
10. **Punto de arranque en `__root.tsx`** que invoca `restoreSession` y redirige
    desde rutas de auth — *descartado un guard por ruta*: `__root` es el único
    punto común y evita repetir la lógica.
11. **Estructura mínima de la capa de auth: dos archivos (Cambio v1.1,
    aprobado)** — `src/lib/auth/auth-api.ts` agrupa el contrato `AuthService`,
    el adaptador real y la fábrica `getAuthService()`/`authService`;
    `src/lib/auth/auth-mock.ts` se mantiene separado por ser fixtures/estado
    simulado. *Descartada la estructura de cuatro unidades de T5*
    (`auth-service.ts` + `auth-adapter.ts` + carpetas `api/` y `mock/`): un
    contrato y una fábrica sin tamaño ni responsabilidad real propia no
    justifican archivos ni carpetas de un solo archivo (YAGNI, RNF-05).
    *Descartado también fusionar el mock dentro de `auth-api.ts`*: mezclaría
    fixtures con el contrato y el adaptador real.
12. **La UI consume el store directamente, sin hook envoltorio (Cambio v1.2,
    aprobado)** — `useAuthStore` expone el estado y las acciones listas para
    la UI. *Descartado el hook `useAuth`* (`src/hooks/use-auth.ts`): un
    envoltorio mínimo que solo reexportaba el store, indirección sin valor
    propio (YAGNI, RNF-05).
13. **Un único predicado de envío compartido por botón y submit (Cambio v1.3,
    aprobado)** — `canSubmitRegister`/`canSubmitLogin` puras en
    `src/lib/auth/form-validation.ts`, consumidas por el botón (suscripción a
    los valores del formulario) y como guarda de `onSubmit`. *Descartado
    depender solo de `canSubmit` de TanStack Form*: no bloquea campos vacíos
    intactos al montar y mezcla validez con estado de envío (riesgo de
    desajuste botón/envío, justo lo que el cambio prohíbe). *Descartados
    helpers locales en cada componente*: duplicarían la regla del correo y no
    serían testeables como funciones puras (constitución, principios 3 y 4).
14. **Validación de correo = contiene `@`** (decisión del usuario) — el mínimo
    obligatorio visible es que el correo contenga `@`; el error de campo es
    «Ingresa un correo electrónico válido». *Descartada una regex de formato
    completo (RFC)*: añadiría bloqueos sin valor para el mínimo obligatorio.
15. **Login sin reglas de fortaleza** (decisión explícita del usuario) — el
    login exige contraseña no vacía; las 4 reglas viven solo en el registro
    (RF-02 ya lo acotaba). *Descartado exigirlas también al login*: bloquearía
    credenciales válidas creadas fuera del flujo de registro de la UI.
16. **Identidad visible como funciones puras** `displayName`/`displayInitials`
    en `src/lib/auth/user-display.ts` (Cambio v1.3, aprobado) — *descartado
    derivar dentro del sidebar*: la UI solo renderiza (constitución, principio
    3). *Descartado pedir el nombre al backend ahora*: el endpoint `/me`
    sigue como encargo externo y la derivación del correo cubre el hueco
    (RF-07 CA-02).
17. **Mensajes de flujo imprevisto cerrados en el mapeo de cada formulario**
    (Cambio v1.3, aprobado) — cada formulario conserva su helper de mapeo y se
    cierran los huecos: no-`AuthError` → genérico amable (nunca el de
    credenciales), `missing_fields` en login → mensaje del backend, login
    encadenado caído en registro → banner de cuenta creada. *Descartado un
    catálogo global de mensajes*: los helpers ya existen y son presentación
    por formulario (precedente de `isPasswordStrong`).

## 8. Mapeo de RF cubiertos

| RF | Archivos | Tests |
|---|---|---|
| RF-01 | api, auth-api (contrato + real + fábrica), auth-mock, store, form-validation, signup-form, routes | auth-store.test.ts, form-validation.test.ts, signup-form.test.tsx |
| RF-02 | lib/auth/password, form-validation, signup-form | password.test.ts, form-validation.test.ts, signup-form.test.tsx |
| RF-03 | api, auth-api, auth-mock, store, form-validation, signin-form, routes | auth-store.test.ts, form-validation.test.ts, signin-form.test.tsx |
| RF-04 | lib/auth/token, store, __root, routes auth | token.test.ts, auth-store.test.ts |
| RF-05 | api, auth-api, auth-mock, store, header/logout UI | auth-store.test.ts |
| RF-06 | signin/signup social buttons | signin-form.test.tsx / signup-form.test.tsx (componente) |
| RF-07 | user-display, sidebar | user-display.test.ts, sidebar.test.tsx |
