import type { AuthService } from "#/lib/auth/auth-api";
import {
	AuthError,
	type AuthUser,
	type Credentials,
	type RegisterData,
	type Session,
} from "#/lib/auth/types";

/** Latencia artificial por operación, en milisegundos. */
export const MOCK_LATENCY_MS = 300;

/** Intentos fallidos de login antes de simular el rate limit (`429`). */
const MAX_LOGIN_ATTEMPTS = 5;

/** Vigencia del token simulado: 1 hora. */
const TOKEN_TTL_MS = 60 * 60 * 1000;

/** Mensajes del backend que el mock reproduce (contrato de la spec). */
const MESSAGES = {
	duplicate: "El usuario ya existe",
	missingFields: "Todos los campos son obligatorios",
	invalidCredentials: "Credenciales inválidas",
	rateLimited:
		"Demasiados intentos de inicio de sesión, por favor intente nuevamente después de 15 minutos",
} as const;

/** Cuenta de demostración disponible sin registro previo. */
export const MOCK_CREDENTIALS = {
	email: "demo@worklyst.com",
	password: "Password1!",
} as const;

interface MockUserRecord extends AuthUser {
	password: string;
}

const users = new Map<string, MockUserRecord>();
const failedAttempts = new Map<string, number>();
let nextId = 1;

function normalizeEmail(email: string): string {
	return email.trim().toLowerCase();
}

function seedUsers(): void {
	users.set(MOCK_CREDENTIALS.email, {
		id: "1",
		nombre: "Usuario de Demostración",
		email: MOCK_CREDENTIALS.email,
		password: MOCK_CREDENTIALS.password,
	});
	nextId = 2;
}

seedUsers();

/** Restablece el estado en memoria; pensado para aislar tests. */
export function resetAuthMock(): void {
	users.clear();
	failedAttempts.clear();
	seedUsers();
}

function delay(ms: number = MOCK_LATENCY_MS): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

function toBase64Url(value: string): string {
	const bytes = new TextEncoder().encode(value);
	let binary = "";
	for (const byte of bytes) {
		binary += String.fromCharCode(byte);
	}
	return globalThis
		.btoa(binary)
		.replace(/\+/g, "-")
		.replace(/\//g, "_")
		.replace(/=+$/, "");
}

// JWT simulado (sin firma) con `{ id, email, exp }` para que `isTokenValid` lo
// acepte; solo se valida el payload.
function createToken(user: MockUserRecord): string {
	const header = toBase64Url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
	const payload = toBase64Url(
		JSON.stringify({
			id: user.id,
			email: user.email,
			exp: Math.floor((Date.now() + TOKEN_TTL_MS) / 1000),
		}),
	);
	return `${header}.${payload}.mock-signature`;
}

function toAuthUser(user: MockUserRecord): AuthUser {
	return { id: user.id, nombre: user.nombre, email: user.email };
}

export const authMock: AuthService = {
	async register(data: RegisterData): Promise<AuthUser> {
		await delay();

		const fullName = data.fullName.trim();
		const email = data.email.trim();
		if (!fullName || !email || !data.password) {
			throw new AuthError("missing_fields", MESSAGES.missingFields, 400);
		}

		const key = normalizeEmail(email);
		if (users.has(key)) {
			throw new AuthError("duplicate_email", MESSAGES.duplicate, 400);
		}

		const user: MockUserRecord = {
			id: String(nextId),
			nombre: fullName,
			email,
			password: data.password,
		};
		nextId += 1;
		users.set(key, user);

		return toAuthUser(user);
	},

	async login(credentials: Credentials): Promise<Session> {
		await delay();

		const email = credentials.email.trim();
		if (!email || !credentials.password) {
			throw new AuthError("missing_fields", MESSAGES.missingFields, 400);
		}

		const key = normalizeEmail(email);
		const attempts = failedAttempts.get(key) ?? 0;
		if (attempts >= MAX_LOGIN_ATTEMPTS) {
			throw new AuthError("rate_limited", MESSAGES.rateLimited, 429);
		}

		const user = users.get(key);
		if (!user || user.password !== credentials.password) {
			failedAttempts.set(key, attempts + 1);
			throw new AuthError(
				"invalid_credentials",
				MESSAGES.invalidCredentials,
				401,
			);
		}

		failedAttempts.delete(key);
		return { token: createToken(user), user: toAuthUser(user) };
	},

	async logout(_token: string): Promise<void> {
		await delay();
	},
};
