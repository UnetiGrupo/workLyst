/**
 * RF-01, RF-03, RF-04, RF-05: tipos compartidos del módulo de auth.
 */

/** Usuario autenticado según el backend (`nombre` en el contrato REST). */
export interface AuthUser {
	id: string;
	email: string;
	/** Ausente al recuperar sesión: el token solo contiene `id` y `email`. */
	nombre?: string;
}

/** Sesión activa: token de sesión + datos del usuario en memoria. */
export interface Session {
	token: string;
	user: AuthUser;
}

/** Credenciales de login. */
export interface Credentials {
	email: string;
	password: string;
}

/** Datos de registro tal como los captura la UI (`fullName`). */
export interface RegisterData {
	fullName: string;
	email: string;
	password: string;
}

/** Códigos de error normalizados del módulo de auth. */
export type AuthErrorCode =
	| "invalid_credentials"
	| "duplicate_email"
	| "missing_fields"
	| "rate_limited"
	| "api_key"
	| "network"
	| "unknown";

/**
 * Error de auth normalizado. `status` es el código HTTP o 0 cuando no hubo
 * respuesta (error de red).
 */
export class AuthError extends Error {
	readonly code: AuthErrorCode;
	readonly status: number;

	constructor(code: AuthErrorCode, message: string, status: number) {
		super(message);
		this.name = "AuthError";
		this.code = code;
		this.status = status;
	}
}
