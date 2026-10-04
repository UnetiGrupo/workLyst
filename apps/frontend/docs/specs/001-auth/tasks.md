# Tareas — Spec 001 Auth

- [x] **T1. Preparar entorno de tests y dependencias.** RF-04
  - Hecho cuando: `zustand` y `vitest` instalados, `pnpm test` corre con
    Vitest resolviendo el alias `#/`, y existe `.env.example` con
    `VITE_API_URL`, `VITE_API_KEY` y `VITE_API_MODE=mock` (default documentado).

- [x] **T2. Funciones puras de contraseña + tests.** RF-02
  - Hecho cuando: `tests/auth/password.test.ts` pasa en verde cubriendo cada
    regla por separado (incluido el set especial `!@#$%^&*`), los 4 niveles de
    seguridad (0–3 con la fórmula de la spec) y combinaciones límite.

- [x] **T3. Funciones puras de token y saneo + tests.** RF-04
  - Hecho cuando: `tests/auth/token.test.ts` pasa en verde cubriendo
    `isTokenValid` (vigente, expirado, corrupto/malformado, con `now` fijo) y
    `sanitizeText` (recorta `fullName`/`email`, no la contraseña).

- [x] **T4. Cliente HTTP central `lib/api.ts`.** RF-01, RF-03, RF-05
  - Hecho cuando: la instancia axios usa `VITE_API_URL` como base, envía
    `x-api-key` desde `VITE_API_KEY`, y mapea errores a `AuthError` con `code`
    y mensajes en español (`400` por `mensaje`: duplicado vs. obligatorios;
    `401/403`, `429`, red).

- [x] **T5. Adaptadores de auth (mock + api) y fábrica.** RF-01, RF-03, RF-05
  - Hecho cuando: `auth-service.ts` define el contrato, `mock/auth-mock.ts`
    implementa registro/login/logout con latencia y errores, `api/auth-api.ts`
    mapea `fullName → usuario` y `sessionToken → token`, y `auth-adapter.ts`
    elige el adaptador con `VITE_API_MODE` (default `mock`). Test
    `tests/auth/auth-mock.test.ts` en verde.
  - Nota (Cambio v1.1, 2026-10-02): completada con la estructura de cuatro
    unidades (`auth-service.ts`, `auth-adapter.ts`, `api/`, `mock/`); esa
    estructura queda sustituida por la mínima aprobada y se refactora en T5b.

- [x] **T5b. Refactor a la estructura mínima de la capa de auth (Cambio v1.1).**
  RF-01, RF-03, RF-05 · RNF-05, RNF-06
  - Consolidar `src/lib/auth/auth-api.ts` (contrato `AuthService` + adaptador
    real + fábrica `getAuthService()`/`authService` con `VITE_API_MODE`,
    default `mock`) y subir el mock a `src/lib/auth/auth-mock.ts`; se
    eliminan `auth-service.ts`, `auth-adapter.ts` y las carpetas `api/` y
    `mock/`.
  - Hecho cuando: los mismos 97 tests quedan redistribuidos sin pérdida de
    cobertura (`auth-adapter.test.ts` se consolida en `auth-api.test.ts`),
    `pnpm test` y `pnpm check` en verde, y los comentarios reducidos a los
    imprescindibles (RNF-06).

- [x] **T6. Store de sesión Zustand + tests.** RF-01, RF-03, RF-04, RF-05
  - Hecho cuando: `tests/auth/auth-store.test.ts` pasa en verde cubriendo
    login/register/logout/restoreSession contra el mock, registro enviando
    `usuario`, `400` de duplicado vs. campos faltantes, `429`, logout
    local-autoritativo cuando la API rechaza.

- [x] **T7. Conectar SigninForm al flujo real.** RF-03, RF-06
  - Hecho cuando: con mock, un login válido guarda token y redirige a `/`;
    credenciales inválidas muestran banner genérico conservando datos; `429` del
    backend muestra su mensaje; el botón entra en estado de carga; los botones
    sociales quedan deshabilitados con "Próximamente"; el link "¿Olvidaste tu
    contraseña?" queda visible **sin `href` ni atributo `forgot-password`**.

- [x] **T8. Conectar SignupForm al flujo real.** RF-01, RF-02
  - Hecho cuando: con mock, un registro válido encadena login y redirige a `/`
    enviando la clave `usuario`; un correo duplicado muestra el error junto al
    campo email conservando datos; un `400` de campos faltantes muestra el
    mensaje del backend sin marcarlo como email duplicado; las 4 reglas se ven
    en vivo bloqueando el envío.

- [x] **T9. Arranque y recuperación de sesión.** RF-04
  - Hecho cuando: `__root.tsx` invoca `restoreSession` al montar y muestra una
    pantalla de carga mínima; con token vigente la app entra directo a `/` y
    `/auth/signin`|`/auth/signup` redirigen a `/`; con token expirado o
    corrupto la limpia y muestra signin. Se cubre la recarga de página.

- [x] **T10. Tests de componente SigninForm/SignupForm.** RF-01, RF-02, RF-03, RF-06
  - Dependencias aprobadas (2026-10-02): `jsdom` + `@testing-library/react` +
    `@testing-library/user-event`. Tarea **no condicional** de esta iteración.
  - Hecho cuando: `tests/auth/signin-form.test.tsx` y
    `tests/auth/signup-form.test.tsx` pasan en verde montando ambos formularios
    con `@testing-library/react` y verificando envío, bloqueo por reglas, banner
    de error de login y botones sociales deshabilitados.
  - Nota (2026-10-04): para verificar los botones sociales deshabilitados
    montando `SignupForm`, el bloque social (Google/GitHub `disabled` +
    "Próximamente") y su separador se movieron de `src/routes/auth/signup.tsx`
    a `src/components/auth/signup-form.tsx`, espejo del patrón de SigninForm
    (decisión del escalamiento de T8).

- [ ] **T11 (DIFERIDA — fuera de esta iteración). E2E de auth.** RF-01,
  RF-03, RF-04, RF-05
  - `MCP chrome-devtools` **no se aprueba y no se instala**; el E2E se retomará
    cuando la app esté terminada (excepción documentada al principio 4,
    "E2E para los flujos críticos"; ver plan.md §6.2).
  - **No se ejecuta ahora.** Cuando se retome, cubrirá registro→dashboard,
    login→dashboard, recarga mantiene sesión y logout→signin, contra el
    adaptador mock.

---

## Registro de decisiones (2026-10-02)

- **Spec 001-auth aprobada** tal cual tras la revisión QA.
- **Opción B** para tests: se aprueban `jsdom`,
  `@testing-library/react` y `@testing-library/user-event`; T10 no condicional.
- **E2E diferido**: `MCP chrome-devtools` no se aprueba; T11 queda fuera de esta
  iteración como deuda técnica (excepción al principio 4, justificada en que la
  app no está terminada).
- `docs/scope.md` no se modifica (documento de referencia futura, no rector).
- **Cambio v1.1 aprobado (2026-10-02)**: estructura mínima de la capa de auth —
  `src/lib/auth/auth-api.ts` (contrato `AuthService` + adaptador real +
  fábrica `getAuthService()`/`authService`) y `src/lib/auth/auth-mock.ts`
  (fixtures/estado simulado, separado); desaparecen `auth-service.ts`,
  `auth-adapter.ts` y las carpetas `api/` y `mock/`. Se documenta en la spec
  (RNF-05/RNF-06) y se ejecuta como T5b, pendiente por decisión del usuario.
  `AGENTS.md` incorpora las reglas de comentarios imprescindibles y de
  estructura mínima (YAGNI).
- **T7 eliminada (2026-10-02)**: el hook `useAuth` se descarta (YAGNI); la UI
  consume `useAuthStore` directamente.
