import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { api } from "#/lib/api";
import { authApi, authService } from "#/lib/auth/auth-api";
import {
	MOCK_CREDENTIALS,
	MOCK_LATENCY_MS,
	authMock,
	resetAuthMock,
} from "#/lib/auth/auth-mock";
import { SESSION_TOKEN_KEY, useAuthStore } from "#/stores/auth-store";

// Store de sesión contra el adaptador mock; la latencia se controla con
// temporizadores falsos.

const RATE_LIMIT_MESSAGE =
	"Demasiados intentos de inicio de sesión, por favor intente nuevamente después de 15 minutos";

const REGISTER_DATA = {
	fullName: "Ada Lovelace",
	email: "ada@worklyst.com",
	password: "Password1!",
};

function toBase64Url(value: string): string {
	const base64 = globalThis.btoa(
		String.fromCharCode(...new TextEncoder().encode(value)),
	);
	return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function buildToken(payload: Record<string, unknown>): string {
	const header = toBase64Url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
	const body = toBase64Url(JSON.stringify(payload));
	return `${header}.${body}.sig`;
}

function nowInSeconds(): number {
	return Math.floor(Date.now() / 1000);
}

beforeEach(() => {
	resetAuthMock();
	localStorage.clear();
	useAuthStore.setState({ token: null, user: null, status: "guest" });
	vi.useFakeTimers();
});

afterEach(() => {
	vi.useRealTimers();
	vi.restoreAllMocks();
});

describe("useAuthStore.login", () => {
	it("stores the session and persists the token for valid credentials", async () => {
		const promise = useAuthStore.getState().login({ ...MOCK_CREDENTIALS });
		await vi.advanceTimersByTimeAsync(MOCK_LATENCY_MS);
		await promise;

		const state = useAuthStore.getState();
		expect(state.status).toBe("authenticated");
		expect(state.user?.email).toBe(MOCK_CREDENTIALS.email);
		expect(state.token).toBeTruthy();
		expect(localStorage.getItem(SESSION_TOKEN_KEY)).toBe(state.token);
	});

	it("trims the email before sending it", async () => {
		const login = vi.spyOn(authService, "login");
		const promise = useAuthStore.getState().login({
			email: `  ${MOCK_CREDENTIALS.email}  `,
			password: MOCK_CREDENTIALS.password,
		});
		await vi.advanceTimersByTimeAsync(MOCK_LATENCY_MS);
		await promise;

		expect(login).toHaveBeenCalledWith({
			email: MOCK_CREDENTIALS.email,
			password: MOCK_CREDENTIALS.password,
		});
	});

	it("surfaces invalid_credentials and returns to guest", async () => {
		const promise = useAuthStore.getState().login({
			email: MOCK_CREDENTIALS.email,
			password: "wrong",
		});
		const assertion = expect(promise).rejects.toMatchObject({
			code: "invalid_credentials",
			status: 401,
		});
		await vi.advanceTimersByTimeAsync(MOCK_LATENCY_MS);
		await assertion;

		expect(useAuthStore.getState().status).toBe("guest");
		expect(localStorage.getItem(SESSION_TOKEN_KEY)).toBeNull();
	});

	it("surfaces missing_fields without persisting a session", async () => {
		const promise = useAuthStore.getState().login({ email: "", password: "" });
		const assertion = expect(promise).rejects.toMatchObject({
			code: "missing_fields",
			status: 400,
		});
		await vi.advanceTimersByTimeAsync(MOCK_LATENCY_MS);
		await assertion;

		expect(useAuthStore.getState().status).toBe("guest");
	});

	it("surfaces rate_limited with the backend message", async () => {
		for (let attempt = 0; attempt < 5; attempt += 1) {
			const failure = authMock.login({
				email: MOCK_CREDENTIALS.email,
				password: "wrong",
			});
			const assertion = expect(failure).rejects.toMatchObject({
				code: "invalid_credentials",
			});
			await vi.advanceTimersByTimeAsync(MOCK_LATENCY_MS);
			await assertion;
		}

		const promise = useAuthStore.getState().login({ ...MOCK_CREDENTIALS });
		const assertion = expect(promise).rejects.toMatchObject({
			code: "rate_limited",
			status: 429,
			message: RATE_LIMIT_MESSAGE,
		});
		await vi.advanceTimersByTimeAsync(MOCK_LATENCY_MS);
		await assertion;

		expect(useAuthStore.getState().status).toBe("guest");
	});
});

describe("useAuthStore.register", () => {
	it("registers, chains login and authenticates", async () => {
		const promise = useAuthStore.getState().register({ ...REGISTER_DATA });
		await vi.advanceTimersByTimeAsync(MOCK_LATENCY_MS * 2);
		await promise;

		const state = useAuthStore.getState();
		expect(state.status).toBe("authenticated");
		expect(state.user?.nombre).toBe("Ada Lovelace");
		expect(state.user?.email).toBe("ada@worklyst.com");
		expect(localStorage.getItem(SESSION_TOKEN_KEY)).toBe(state.token);
	});

	it("sends the registration payload under the `usuario` key", async () => {
		const post = vi
			.spyOn(api, "post")
			.mockResolvedValueOnce({
				data: {
					usuario: { id: "9", nombre: "Ada", email: "ada@worklyst.com" },
				},
			})
			.mockResolvedValueOnce({
				data: {
					sessionToken: "header.payload.sig",
					usuario: { id: "9", nombre: "Ada", email: "ada@worklyst.com" },
				},
			});
		// Delegar en el adaptador real para ejercitar el mapeo del payload.
		vi.spyOn(authService, "register").mockImplementation((data) =>
			authApi.register(data),
		);
		vi.spyOn(authService, "login").mockImplementation((credentials) =>
			authApi.login(credentials),
		);

		await useAuthStore.getState().register({ ...REGISTER_DATA });

		expect(post).toHaveBeenNthCalledWith(1, "/api/auth/register", {
			usuario: "Ada Lovelace",
			email: "ada@worklyst.com",
			password: "Password1!",
		});
		expect(useAuthStore.getState().status).toBe("authenticated");
	});

	it("surfaces duplicate_email and keeps the user as guest", async () => {
		const promise = useAuthStore.getState().register({
			fullName: "Demo Dos",
			email: MOCK_CREDENTIALS.email,
			password: "Password1!",
		});
		const assertion = expect(promise).rejects.toMatchObject({
			code: "duplicate_email",
			status: 400,
			message: "El usuario ya existe",
		});
		await vi.advanceTimersByTimeAsync(MOCK_LATENCY_MS);
		await assertion;

		expect(useAuthStore.getState().status).toBe("guest");
	});

	it("surfaces missing_fields separately from duplicate_email", async () => {
		const promise = useAuthStore.getState().register({
			fullName: "   ",
			email: "nadie@worklyst.com",
			password: "",
		});
		const assertion = expect(promise).rejects.toMatchObject({
			code: "missing_fields",
			status: 400,
			message: "Todos los campos son obligatorios",
		});
		await vi.advanceTimersByTimeAsync(MOCK_LATENCY_MS);
		await assertion;

		expect(useAuthStore.getState().status).toBe("guest");
	});
});

describe("useAuthStore.logout", () => {
	it("clears the session and storage on success", async () => {
		useAuthStore.setState({
			token: "token-1",
			user: { id: "1", email: MOCK_CREDENTIALS.email },
			status: "authenticated",
		});
		localStorage.setItem(SESSION_TOKEN_KEY, "token-1");

		const promise = useAuthStore.getState().logout();
		await vi.advanceTimersByTimeAsync(MOCK_LATENCY_MS);
		await promise;

		const state = useAuthStore.getState();
		expect(state.status).toBe("guest");
		expect(state.token).toBeNull();
		expect(state.user).toBeNull();
		expect(localStorage.getItem(SESSION_TOKEN_KEY)).toBeNull();
	});

	it("clears the session even when the API rejects", async () => {
		vi.spyOn(authService, "logout").mockRejectedValue(new Error("network"));
		useAuthStore.setState({
			token: "token-1",
			user: { id: "1", email: MOCK_CREDENTIALS.email },
			status: "authenticated",
		});
		localStorage.setItem(SESSION_TOKEN_KEY, "token-1");

		await expect(useAuthStore.getState().logout()).resolves.toBeUndefined();

		const state = useAuthStore.getState();
		expect(state.status).toBe("guest");
		expect(state.token).toBeNull();
		expect(localStorage.getItem(SESSION_TOKEN_KEY)).toBeNull();
	});
});

describe("useAuthStore.restoreSession", () => {
	it("restores id and email from a valid stored token", async () => {
		const token = buildToken({
			id: "42",
			email: "ada@worklyst.com",
			exp: nowInSeconds() + 3600,
		});
		localStorage.setItem(SESSION_TOKEN_KEY, token);

		await useAuthStore.getState().restoreSession();

		const state = useAuthStore.getState();
		expect(state.status).toBe("authenticated");
		expect(state.token).toBe(token);
		expect(state.user).toEqual({ id: "42", email: "ada@worklyst.com" });
	});

	it("clears an expired token and stays guest", async () => {
		const token = buildToken({
			id: "42",
			email: "ada@worklyst.com",
			exp: nowInSeconds() - 10,
		});
		localStorage.setItem(SESSION_TOKEN_KEY, token);

		await useAuthStore.getState().restoreSession();

		expect(useAuthStore.getState().status).toBe("guest");
		expect(localStorage.getItem(SESSION_TOKEN_KEY)).toBeNull();
	});

	it("clears a corrupt token and stays guest", async () => {
		localStorage.setItem(SESSION_TOKEN_KEY, "not-a-token");

		await useAuthStore.getState().restoreSession();

		expect(useAuthStore.getState().status).toBe("guest");
		expect(localStorage.getItem(SESSION_TOKEN_KEY)).toBeNull();
	});

	it("passes through loading while deciding the session", async () => {
		const statuses: string[] = [];
		const unsubscribe = useAuthStore.subscribe((state) =>
			statuses.push(state.status),
		);

		await useAuthStore.getState().restoreSession();
		unsubscribe();

		expect(statuses).toContain("loading");
		expect(statuses.at(-1)).toBe("guest");
	});

	it("stays guest when there is no stored token", async () => {
		await useAuthStore.getState().restoreSession();

		expect(useAuthStore.getState().status).toBe("guest");
	});
});
