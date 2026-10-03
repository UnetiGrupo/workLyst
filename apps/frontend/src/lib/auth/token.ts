/**
 * RF-04: utilidades puras de sesión.
 * Funciones puras: sin IO y sin React.
 */

/**
 * Decodifica una cadena base64url a texto.
 * No depende de `Buffer` (Node): usa `atob`, disponible en navegador y jsdom.
 * base64url: `-` -> `+`, `_` -> `/` y se restaura el padding `=`.
 * Devuelve `null` si la cadena no es decodificable (base64 inválido).
 */
function decodeBase64Url(value: string): string | null {
	const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
	const padding = (4 - (normalized.length % 4)) % 4;
	const padded = normalized + "=".repeat(padding);

	try {
		return globalThis.atob(padded);
	} catch {
		// atob lanza si la cadena no es base64 válido.
		return null;
	}
}

/**
 * Comprueba si un JWT es estructuralmente válido y sigue vigente en `now`.
 * No verifica la firma (el frontend no puede validarla); solo decodifica el
 * payload y exige un `exp` (segundos UNIX) estrictamente mayor que `now`.
 * Nunca lanza: devuelve `false` ante cualquier error.
 */
export function isTokenValid(token: string, now: Date): boolean {
	if (!token) {
		return false;
	}

	const parts = token.split(".");
	// Un JWT tiene exactamente 3 partes: header.payload.signature.
	if (parts.length !== 3) {
		return false;
	}

	const decoded = decodeBase64Url(parts[1]);
	if (decoded === null) {
		return false;
	}

	let payload: unknown;
	try {
		payload = JSON.parse(decoded);
	} catch {
		return false;
	}

	// El payload debe ser un objeto JSON con un `exp` numérico.
	if (typeof payload !== "object" || payload === null) {
		return false;
	}

	const { exp } = payload as { exp?: unknown };
	if (typeof exp !== "number" || !Number.isFinite(exp)) {
		return false;
	}

	return exp * 1000 > now.getTime();
}

/** Datos de sesión (`{ id, email }`) embebidos en el payload del token. */
export interface TokenClaims {
	id: string;
	email: string;
}

/**
 * Extrae `{ id, email }` del payload sin verificar vigencia ni firma.
 * Devuelve `null` si el token está malformado o no trae ambos campos como texto.
 */
export function readTokenClaims(token: string): TokenClaims | null {
	const parts = token.split(".");
	if (parts.length !== 3) {
		return null;
	}

	const decoded = decodeBase64Url(parts[1]);
	if (decoded === null) {
		return null;
	}

	let payload: unknown;
	try {
		payload = JSON.parse(decoded);
	} catch {
		return null;
	}

	if (typeof payload !== "object" || payload === null) {
		return null;
	}

	const { id, email } = payload as { id?: unknown; email?: unknown };
	if (typeof id !== "string" || typeof email !== "string") {
		return null;
	}

	return { id, email };
}

/**
 * Recorta espacios al inicio y fin.
 * Se aplica a `fullName` y `email`; NUNCA a la contraseña, porque los espacios
 * pueden ser caracteres legítimos (spec, CL-04).
 */
export function sanitizeText(text: string): string {
	return text.trim();
}
