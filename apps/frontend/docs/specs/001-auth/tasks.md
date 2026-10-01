# Tareas — Spec 001 Auth

- [ ] **T1. Preparar entorno de tests y dependencias.** RF-04
  - Hecho cuando: `zustand` y `vitest` instalados, `pnpm test` corre con
    Vitest resolviendo el alias `#/`, y existe `.env.example` con las 3
    variables `VITE_*`.

- [ ] **T2. Funciones puras de contraseña + tests.** RF-02
  - Hecho cuando: `tests/auth/password.test.ts` pasa en verde cubriendo cada
    regla por separado y los 4 niveles de seguridad (0–3).

- [ ] **T3. Funciones puras de token y saneo + tests.** RF-04
  - Hecho cuando: `tests/auth/token.test.ts` pasa en verde cubriendo
    `isTokenValid` (vigente, expirado, corrupto, con `now` fijo) y `sanitizeText`.

- [ ] **T4. Cliente HTTP central `lib/api.ts`.** RF-01, RF-03, RF-05
  - Hecho cuando: la instancia axios usa `VITE_API_URL` como base, envía
    `x-api-key` por defecto y mapea errores del backend a `AuthError` con
    mensajes en español (test del mapeo en verde).

- [ ] **T5. Adaptador mock de auth + tests.** RF-01, RF-03, RF-05
  - Hecho cuando: `tests/auth/auth-mock.test.ts` pasa en verde cubriendo
    registro exitoso, correo duplicado, login válido, credenciales inválidas,
    logout, y latencia simulada.

- [ ] **T6. Store de sesión Zustand + tests.** RF-01, RF-03, RF-04, RF-05
  - Hecho cuando: `tests/auth/auth-store.test.ts` pasa en verde cubriendo
    login/register/logout/restoreSession contra el mock, incluyendo logout
    local-autoritativo cuando la API rechaza.

- [ ] **T7. Hook `useAuth` para la UI.** RF-01, RF-03, RF-04, RF-05
  - Hecho cuando: el hook expone el estado de sesión y las funciones listas,
    y `pnpm check` (Biome) no reporta errores de tipos.

- [ ] **T8. Conectar SigninForm al flujo real.** RF-03, RF-06
  - Hecho cuando: con mock, un login válido guarda token y redirige a `/`,
    credenciales inválidas muestran banner genérico conservando datos, el botón
    entra en estado de carga, y los botones sociales quedan deshabilitados
    con "Próximamente" (link forgot-password y toggle visuales sin acción).

- [ ] **T9. Conectar SignupForm al flujo real.** RF-01, RF-02
  - Hecho cuando: con mock, un registro válido encadena login y redirige a `/`,
    un correo duplicado muestra el error junto al campo email conservando
    datos, y las 4 reglas de contraseña se ven en vivo bloqueando el envío.

- [ ] **T10. Recuperación de sesión al arrancar.** RF-04
  - Hecho cuando: con un token vigente persistido la app entra directo a `/`
    sin pasar por signin, y con token expirado la limpia y muestra signin.
