# PLAN — Spec 001 Auth

> Generado: 2026-10-01 · Aprobado por el usuario con estructura mínima de
> archivos (Zustand) y tests en Vitest. Espeja la decisión del alcance
> (docs/scope.md): contrato + adaptadores, mock por defecto.

## 1. Archivos a crear y su responsabilidad

| Archivo | Responsabilidad | RF |
|---|---|---|
| `src/lib/api.ts` | Instancia axios: `baseURL` desde `VITE_API_URL`, header `x-api-key` por defecto, y mapeo de errores del backend a mensajes en español. Único punto de contacto con la red | RF-01, RF-03, RF-05 |
| `src/lib/auth/password.ts` | Funciones puras de contraseña: reglas y nivel de seguridad | RF-02 |
| `src/lib/auth/token.ts` | Funciones puras de token: decodificación JWT y vigencia | RF-04 |
| `src/stores/auth-store.ts` | Store Zustand: estado de sesión `{ token, user, status }` + acciones `login`, `register`, `logout`, `restoreSession` (consumen `lib/api`) | RF-01, RF-03, RF-04, RF-05 |
| `src/hooks/use-auth.ts` | Hook consumidor del store: expone estado y funciones listas para la UI | Todos |
| `src/data/auth-mocks.ts` | Mock del módulo: usuarios en memoria, latencia y errores simulados (patrón de `home-mocks.ts`). Se activa con `VITE_API_MODE=mock` | RF-01, RF-03, RF-05 |
| `.env.example` | Plantilla: `VITE_API_URL`, `VITE_API_KEY`, `VITE_API_MODE` | RF-04 |

Archivos a modificar (solo consumen el store; la lógica sale de ellos):

- `src/components/auth/signin-form.tsx` — conectar login; error genérico en
  banner; el link "¿Olvidaste tu contraseña?" visible sin acción; toggle
  "Recuérdame" visual. **RF-03, RF-06**
- `src/components/auth/signup-form.tsx` — conectar registro→login encadenado;
  reglas de contraseña bloquean el envío (reglas se mueven a `lib/auth`).
  **RF-01, RF-02**
- `src/routes/auth/signin.tsx`, `signup.tsx` — redirección a `/` tras éxito.
  **RF-01, RF-03**
- `src/routes/index.tsx` — sin guard necesario en esta versión (solo hay
  vistas públicas y dashboard maquetado; el guard real llega con fase 1).

Nota: sin `__root.tsx` provider — Zustand es estado global sin contexto.

Dependencias aprobadas por el usuario: `zustand` (runtime) y `vitest`
(dev, para tests). Constitución, principio 1.

## 2. Funciones puras (con `now` como parámetro donde aplique)

```
validatePasswordRules(password) → { minLength, upperAndLower, number, special, level: 0..3 }
isTokenValid(token: string, now: Date) → boolean   // decodifica payload JWT, compara exp
sanitizeText(text: string) → string                // trim
canSubmitRegister(data: RegisterData, rules) → boolean
canSubmitLogin(credentials: Credentials) → boolean
```

Cero IO y cero React: 100% testeables con Vitest.

## 3. Algoritmos (pseudocódigo)

**Registro (RF-01, CA-01..03):**
```
register(data):
  data = sanitize(data)
  rules = validatePasswordRules(data.password)
  if !canSubmitRegister(data, rules) → abort, errores por campo (CA-01)
  await api.register(data)                          // 201 (CA-02: duplicado → error campo email)
  session = await api.login(data.email, data.password)   // CA-03: encadenado
  store: set token + user → redirect "/"
```

**Login (RF-03):**
```
login(credentials):
  credentials = sanitize(credentials)
  if !canSubmitLogin(credentials) → abort, errores por campo
  status = "loading"; botón deshabilitado (CA-03)
  session = await api.login(credentials)
  store: set token + user; persist token → redirect "/" 
  catch 401 → banner genérico "Credenciales inválidas" (CA-01, CA-02)
```

**Recuperar sesión al arrancar (RF-04):**
```
restoreSession():
  token = storage.get()
  if !token || !isTokenValid(token, now) → storage.clear(); status = "guest"
  else → status = "authenticated" con datos parciales { id, email } del payload
```

**Logout (RF-05):**
```
logout():
  try: api.logout(token)     // si falla, se ignora y continúa (CA-01)
  storage.clear(); store reset; redirect "/auth/signin"
```

## 4. Pintado en la interfaz

- **Por campo**: error bajo el input (rojo); reglas de contraseña con check
  verde/rojo en vivo y barra de nivel (maquetado, solo se conecta). RF-02
- **Banner** sobre el formulario para el error genérico de login. RF-03
- **Botón**: `idle → loading ("Iniciando sesión…" / "Creando cuenta…") →
  error → éxito (redirige)`; deshabilitado mientras envía y si la validación
  no pasa. RF-01, RF-02, RF-03
- **Sociales**: `disabled` + indicación "Próximamente". RF-06
- **Link forgot-password y toggle recuérdame**: visibles, sin acción.
- **Arranque de la app**: pantalla de carga mínima mientras `restoreSession`
  decide (evita flash de signin cuando hay sesión válida). RF-04

## 5. Decisiones técnicas (justificadas, con alternativa descartada)

1. **Zustand** para el estado de sesión (aprobado) — *descartado Contexto React*: más
   boilerplate (provider + context) para lo mismo; *descartada TanStack Query*: es
   estado de servidor y aquí aún no hay datos de servidor que sincronizar.
2. **TanStack Form** (ya instalado) para los formularios — *descartada
   react-hook-form*: dependencia nueva sin necesidad (principio 1).
3. **axios** (ya instalado) centralizado en `lib/api.ts` — *descartado un wrapper de
   fetch*: axios ya existe y da interceptores para el JWT futuro.
4. **`localStorage` en web** para el token (única excepción de la constitución) —
   *descartadas cookies httpOnly*: el backend no gestiona cookies y rompería la
   abstracción multiplataforma (Capacitor).
5. **register→login encadenado en cliente** — *descartado pedir auto-login al
   backend*: no dependemos de cambios externos (CA-03 lo define).
6. **Mocks in-memory** en `src/data/` — *descartado MSW*: dependencia pesada para
   simular lo mismo; mismo patrón que el código existente.
7. **Adaptador elegido por `VITE_API_MODE` en arranque** — *descartada la
   conmutación en runtime*: evita estados mixtos.
8. **Vitest** para tests (aprobado) — *descartado `node --test`*: requiere loaders
   experimentales y no resuelve el alias `#/` sin config extra.

## 6. Estrategia de tests (Vitest, carpeta `tests/auth/`)

Config: `vite.config.ts` añade `test` con resolve alias `#` → `src`. Script
`pnpm test` = `vitest run`.

| RF | Test | Qué cubre |
|---|---|---|
| RF-01 | `auth-store.test.ts` | registro OK → sesión + login encadenado; duplicado → error con mensaje por campo; campos inválidos → sin petición |
| RF-02 | `password.test.ts` | cada regla por separado; los 4 niveles (0 sin escribir, 1 débil, 2 media, 3 fuerte); combinaciones límite |
| RF-03 | `auth-store.test.ts` | login OK → token y user en store; credenciales inválidas → `AuthError` genérico; errores de red |
| RF-04 | `token.test.ts` | `isTokenValid`: vigente / expirado / corrupto, con `now` fijo; `sanitizeText` |
| RF-05 | `auth-store.test.ts` | logout limpia store y storage aunque `api.logout` rechace |
| RF-06 | — | visual; se cubrirá en E2E de fases futuras |

Tests primero (rojo) por tarea, siguiendo la skill sdd. Los de store usan el
adaptador mock con `VITE_API_MODE=mock` fijo en el test setup.
