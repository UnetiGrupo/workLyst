# PLAN — Spec 001 Auth

> Generado: 2026-10-01 · Actualizado: 2026-10-02 (revisión QA).
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
| `src/services/auth-service.ts` | Interfaz/contrato del adaptador de auth (fachada pura). El store la consume; no sabe si el modo es mock o real | RF-01, RF-03, RF-05 |
| `src/services/mock/auth-mock.ts` | Adaptador mock: usuarios en memoria, latencia y errores simulados (mismo patrón que `home-mocks.ts`). Implementa `auth-service` | RF-01, RF-03, RF-05 |
| `src/services/api/auth-api.ts` | Adaptador real: llama a `lib/api.ts`, mapea `fullName → usuario`, `sessionToken → token`, y traduce errores | RF-01, RF-03, RF-05 |
| `src/services/auth-adapter.ts` | **Fábrica de adaptador**: lee `VITE_API_MODE` (`mock` \| `real`, por defecto `mock`) y devuelve la implementación correspondiente. Único punto que conoce el modo | Todos |
| `src/stores/auth-store.ts` | Store Zustand: estado `{ token, user, status }` + acciones `login`, `register`, `logout`, `restoreSession` (consumen `auth-adapter`) | RF-01, RF-03, RF-04, RF-05 |
| `src/hooks/use-auth.ts` | Hook consumidor del store: expone estado y funciones listas para la UI | Todos |
| `.env.example` | Plantilla: `VITE_API_URL`, `VITE_API_KEY`, `VITE_API_MODE=mock` | RF-04 |

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

Nota: sin provider nuevo — Zustand es estado global sin contexto.

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
canSubmitRegister(data: RegisterData, rules) → boolean
canSubmitLogin(credentials: Credentials) → boolean
```

Cero IO y cero React: 100% testeables con Vitest.

## 3. Algoritmos (pseudocódigo)

**Registro (RF-01, CA-01..04):**
```
register(data):
  data = sanitize(data)                 // trim fullName/email; NO password
  rules = validatePasswordRules(data.password)
  if !canSubmitRegister(data, rules) → abort, errores por campo (CA-01)
  usuario = data.fullName               // mapeo fullName → usuario (adaptador)
  await adapter.register(usuario, data.email, data.password)   // 201
      // 400 "El usuario ya existe" → error campo email (CA-02), conservar datos
      // 400 "Todos los campos son obligatorios" → error general (CA-04)
  session = await adapter.login(data.email, data.password)     // CA-03 encadenado
  store: set token + user → redirect "/"
```

**Login (RF-03):**
```
login(credentials):
  credentials = sanitize(credentials)
  if !canSubmitLogin(credentials) → abort, errores por campo
  status = "loading"; botón deshabilitado (CA-03)
  session = await adapter.login(credentials)
  store: set token + user; persist token → redirect "/"
  catch invalid_credentials|api_key → banner genérico (CA-01, CA-02)
  catch rate_limited → banner con mensaje del backend (429, CL-06)
  catch network → banner de reintento, conservar datos (CL-02, CL-05)
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

## 4. Selección de adaptador y desviación del patrón de scope.md

`docs/scope.md` propone un patrón genérico `src/services/<modulo>-service.ts`
+ `src/services/mock|api/<modulo>-*.ts` con `VITE_API_MODE`. La estructura
mínima de este módulo mantiene el mismo enfoque (contrato + mock + api +
fábrica) pero con nombres más cortos para auth. **Desviación documentada**: el
patrón genérico de `scope.md` aplica a los módulos futuros (fases 1+); auth es
la primera implementación y fija el precedente. La fábrica
`src/services/auth-adapter.ts` resuelve el modo:

```
mode = import.meta.env.VITE_API_MODE ?? "mock"   // default: mock
return mode === "real" ? authApi : authMock
```

**Decisión**: el modo por defecto cuando `VITE_API_MODE` no está presente es
`mock` (permite desarrollar y probar sin backend). `real` exige `VITE_API_URL`
y `VITE_API_KEY`.

## 5. Pintado en la interfaz

- **Por campo**: error bajo el input (rojo) en registro/validación (CA-01,
  CA-02 de RF-01); reglas de contraseña con check verde/rojo en vivo y barra de
  nivel (maquetado, solo se conecta). RF-02
- **Banner** sobre el formulario para el error genérico de login (credenciales,
  API Key, red, 429). RF-03
- **Botón**: `idle → loading ("Iniciando sesión…" / "Creando cuenta…") →
  error → éxito (redirige)`; deshabilitado mientras envía y si la validación
  no pasa. RF-01, RF-02, RF-03
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

Tests primero (rojo) por tarea, siguiendo la skill sdd. Los de store fuerzan
`VITE_API_MODE=mock` en el test setup.

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
6. **Mocks in-memory** en `src/services/mock/` — *descartado MSW*: dependencia
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

## 8. Mapeo de RF cubiertos

| RF | Archivos | Tests |
|---|---|---|
| RF-01 | api, auth-service, mock/api, adapter, store, signup-form, routes | auth-store.test.ts, signup-form.test.tsx |
| RF-02 | lib/auth/password, signup-form | password.test.ts, signup-form.test.tsx |
| RF-03 | api, adapter, store, signin-form, routes | auth-store.test.ts, signin-form.test.tsx |
| RF-04 | lib/auth/token, store, __root, routes auth | token.test.ts, auth-store.test.ts |
| RF-05 | api, adapter, store, header/logout UI | auth-store.test.ts |
| RF-06 | signin/signup social buttons | signin-form.test.tsx / signup-form.test.tsx (componente) |
