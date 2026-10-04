import { describe, expect, it } from "vitest";
import { api, toAuthError } from "#/lib/api";
import { AuthError } from "#/lib/auth/types";

// Cliente HTTP central y mapeo de los errores del backend a `AuthError`.
// Los objetos de error imitan la forma de un AxiosError sin necesidad de red.

/** Error de red: sin `response`, con `request`. */
const networkError = { request: {}, message: "Network Error" };

/** Error con respuesta HTTP del backend. */
function httpError(status: number, mensaje?: string) {
	return { response: { status, data: mensaje === undefined ? {} : { mensaje } } };
}

describe("toAuthError", () => {
	// --- 400: desambiguado por el `mensaje` (duplicado vs. campos) ----------

	it("maps 400 'El usuario ya existe' to duplicate_email", () => {
		const error = toAuthError(httpError(400, "El usuario ya existe"));
		expect(error).toBeInstanceOf(AuthError);
		expect(error.code).toBe("duplicate_email");
		expect(error.status).toBe(400);
		expect(error.message).toBe("El usuario ya existe");
	});

	it("maps 400 'Todos los campos son obligatorios' to missing_fields", () => {
		const error = toAuthError(
			httpError(400, "Todos los campos son obligatorios"),
		);
		expect(error.code).toBe("missing_fields");
		expect(error.status).toBe(400);
		expect(error.message).toBe("Todos los campos son obligatorios");
	});

	it("maps any other 400 to missing_fields preserving the backend message", () => {
		const error = toAuthError(httpError(400, "El correo no es válido"));
		expect(error.code).toBe("missing_fields");
		expect(error.status).toBe(400);
		expect(error.message).toBe("El correo no es válido");
	});

	// --- 401 / 403: credenciales vs. API Key --------------------------------

	it("maps 401 'Credenciales inválidas' to invalid_credentials", () => {
		const error = toAuthError(httpError(401, "Credenciales inválidas"));
		expect(error.code).toBe("invalid_credentials");
		expect(error.status).toBe(401);
	});

	it("maps 401 mentioning the API Key to api_key", () => {
		const error = toAuthError(
			httpError(401, "API Key (x-api-key) es obligatoria"),
		);
		expect(error.code).toBe("api_key");
		expect(error.status).toBe(401);
	});

	it("maps 403 mentioning the API Key to api_key", () => {
		const error = toAuthError(
			httpError(403, "API Key inválida o inactiva"),
		);
		expect(error.code).toBe("api_key");
		expect(error.status).toBe(403);
	});

	it("never exposes technical detail for a 401 api_key", () => {
		const error = toAuthError(httpError(401, "API Key (x-api-key) es obligatoria"));
		expect(error.message.toLowerCase()).not.toContain("x-api-key");
	});

	// --- 429: límite de solicitudes -----------------------------------------

	it("maps 429 to rate_limited using the backend message", () => {
		const mensaje =
			"Demasiados intentos de inicio de sesión, por favor intente nuevamente después de 15 minutos";
		const error = toAuthError(httpError(429, mensaje));
		expect(error.code).toBe("rate_limited");
		expect(error.status).toBe(429);
		expect(error.message).toBe(mensaje);
	});

	// --- Errores de red -----------------------------------------------------

	it("maps a network error to network with status 0", () => {
		const error = toAuthError(networkError);
		expect(error.code).toBe("network");
		expect(error.status).toBe(0);
		expect(error.message).toBe(
			"No pudimos conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.",
		);
	});

	// --- Desconocido (500, forma inesperada) --------------------------------

	it("maps a 500 to unknown without leaking technical detail", () => {
		const error = toAuthError(httpError(500, "Internal Server Error"));
		expect(error.code).toBe("unknown");
		expect(error.status).toBe(500);
		expect(error.message).not.toContain("500");
	});

	it("maps a non-axios-like value to unknown", () => {
		const error = toAuthError(new Error("boom"));
		expect(error.code).toBe("unknown");
	});

	it("returns the same AuthError when given one", () => {
		const original = new AuthError("network", "sin red", 0);
		expect(toAuthError(original)).toBe(original);
	});
});

describe("api instance", () => {
	// La config vive en `import.meta.env`; en el entorno de test se leen los
	// defaults de axios para comprobar baseURL y el header `x-api-key`.
	it("sets a baseURL from VITE_API_URL", () => {
		expect(api.defaults.baseURL).toBe(import.meta.env.VITE_API_URL);
	});

	it("sends the x-api-key header from VITE_API_KEY", () => {
		const headers = api.defaults.headers as {
			common?: Record<string, unknown>;
		};
		const apiKey =
			headers.common?.["x-api-key"] ??
			(api.defaults.headers as Record<string, unknown>)["x-api-key"];
		expect(apiKey).toBe(import.meta.env.VITE_API_KEY);
	});
});
