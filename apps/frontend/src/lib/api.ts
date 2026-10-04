/**
 * Cliente HTTP central del frontend: instancia axios y traducción de los
 * errores del backend a `AuthError` con código y mensaje en español.
 */
import axios from "axios";

import { AuthError, type AuthErrorCode } from "#/lib/auth/types";

/** Instancia axios con baseURL y API Key tomadas del entorno. */
export const api = axios.create({
	baseURL: import.meta.env.VITE_API_URL,
	headers: {
		"x-api-key": import.meta.env.VITE_API_KEY,
	},
});

/** Forma mínima de un AxiosError que nos interesa aquí. */
interface ErrorLike {
	isAxiosError?: boolean;
	response?: { status?: number; data?: { mensaje?: unknown } };
	request?: unknown;
}

/** Extrae el `mensaje` del backend si es un string no vacío. */
function getBackendMessage(data: unknown): string | null {
	if (typeof data !== "object" || data === null) {
		return null;
	}
	const { mensaje } = data as { mensaje?: unknown };
	return typeof mensaje === "string" && mensaje.length > 0 ? mensaje : null;
}

/** Mensaje genérico para cuando no hay conexión con el servidor. */
const NETWORK_MESSAGE =
	"No pudimos conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.";
/** Mensaje genérico para errores no clasificados (nunca expone detalle). */
const UNKNOWN_MESSAGE = "Algo salió mal. Inténtalo de nuevo más tarde.";

/**
 * Traduce cualquier error (AxiosError, AuthError, desconocido) a `AuthError`.
 * El `400` del backend se desambigua por su `mensaje`: «El usuario ya existe»
 * indica correo duplicado; cualquier otro texto, campos obligatorios.
 */
export function toAuthError(error: unknown): AuthError {
	// Si ya es un AuthError, se devuelve tal cual (idempotente).
	if (error instanceof AuthError) {
		return error;
	}

	const candidate = error as ErrorLike;

	// Error de red: petición axios sin respuesta del servidor (tiene `request`).
	if (
		candidate?.response === undefined &&
		(candidate.isAxiosError === true || candidate.request !== undefined)
	) {
		return new AuthError("network", NETWORK_MESSAGE, 0);
	}

	// Valor sin forma de AxiosError: no se asume red, se trata como desconocido.
	if (candidate?.response === undefined) {
		return new AuthError("unknown", UNKNOWN_MESSAGE, 0);
	}

	const status = candidate.response.status ?? 0;
	const backendMessage = getBackendMessage(candidate.response.data);

	if (status === 400) {
		// 400 con dos causas distinguibles por el mensaje.
		const code: AuthErrorCode =
			backendMessage === "El usuario ya existe"
				? "duplicate_email"
				: "missing_fields";
		return new AuthError(code, backendMessage ?? UNKNOWN_MESSAGE, 400);
	}

	if (status === 401) {
		const code: AuthErrorCode = backendMessage
			?.toLowerCase()
			.includes("credenciales")
			? "invalid_credentials"
			: "api_key";
		// El detalle técnico de la API Key nunca se expone al usuario.
		const message =
			code === "api_key"
				? UNKNOWN_MESSAGE
				: (backendMessage ?? UNKNOWN_MESSAGE);
		return new AuthError(code, message, 401);
	}

	if (status === 403) {
		return new AuthError("api_key", UNKNOWN_MESSAGE, 403);
	}

	if (status === 429) {
		return new AuthError(
			"rate_limited",
			backendMessage ?? UNKNOWN_MESSAGE,
			429,
		);
	}

	// Cualquier otro código: desconocido, sin filtar detalle técnico.
	return new AuthError("unknown", UNKNOWN_MESSAGE, status);
}
