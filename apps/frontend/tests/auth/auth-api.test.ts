import { afterEach, describe, expect, it, vi } from "vitest";
import { api } from "#/lib/api";
import { authApi, authService, getAuthService } from "#/lib/auth/auth-api";
import { authMock } from "#/lib/auth/auth-mock";

// Adaptador real y fábrica; se espía la instancia axios (sin red real).

describe("authApi.register", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("maps fullName to usuario in the request body", async () => {
		const post = vi.spyOn(api, "post").mockResolvedValue({
			data: {
				mensaje: "Usuario registrado",
				usuario: { id: "1", nombre: "Ada", email: "ada@worklyst.com" },
			},
		});

		const user = await authApi.register({
			fullName: "Ada Lovelace",
			email: "ada@worklyst.com",
			password: "Password1!",
		});

		expect(post).toHaveBeenCalledWith("/api/auth/register", {
			usuario: "Ada Lovelace",
			email: "ada@worklyst.com",
			password: "Password1!",
		});
		expect(user).toEqual({
			id: "1",
			nombre: "Ada",
			email: "ada@worklyst.com",
		});
	});

	it("translates a 400 duplicate error to AuthError", async () => {
		vi.spyOn(api, "post").mockRejectedValue({
			response: { status: 400, data: { mensaje: "El usuario ya existe" } },
		});

		await expect(
			authApi.register({
				fullName: "Ada Lovelace",
				email: "ada@worklyst.com",
				password: "Password1!",
			}),
		).rejects.toMatchObject({ code: "duplicate_email", status: 400 });
	});
});

describe("authApi.login", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("maps sessionToken to token and returns the user", async () => {
		const post = vi.spyOn(api, "post").mockResolvedValue({
			data: {
				mensaje: "Sesión iniciada",
				sessionToken: "header.payload.signature",
				usuario: { id: "7", nombre: "Grace", email: "grace@worklyst.com" },
			},
		});

		const session = await authApi.login({
			email: "grace@worklyst.com",
			password: "Password1!",
		});

		expect(post).toHaveBeenCalledWith("/api/auth/login", {
			email: "grace@worklyst.com",
			password: "Password1!",
		});
		expect(session).toEqual({
			token: "header.payload.signature",
			user: { id: "7", nombre: "Grace", email: "grace@worklyst.com" },
		});
	});

	it("translates a 401 to invalid_credentials", async () => {
		vi.spyOn(api, "post").mockRejectedValue({
			response: { status: 401, data: { mensaje: "Credenciales inválidas" } },
		});

		await expect(
			authApi.login({ email: "a@b.com", password: "nope" }),
		).rejects.toMatchObject({ code: "invalid_credentials", status: 401 });
	});
});

describe("authApi.logout", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("maps token to sessionToken in the request body", async () => {
		const post = vi.spyOn(api, "post").mockResolvedValue({ data: {} });

		await authApi.logout("the-token");

		expect(post).toHaveBeenCalledWith("/api/auth/logout", {
			sessionToken: "the-token",
		});
	});

	it("propagates a translated error so the store can ignore it", async () => {
		vi.spyOn(api, "post").mockRejectedValue({
			response: { status: 401, data: { mensaje: "API Key inválida" } },
		});

		await expect(authApi.logout("the-token")).rejects.toMatchObject({
			code: "api_key",
		});
	});
});

describe("getAuthService", () => {
	afterEach(() => {
		vi.unstubAllEnvs();
	});

	it("returns the mock adapter for an unknown mode", () => {
		vi.stubEnv("VITE_API_MODE", "otro");
		expect(getAuthService()).toBe(authMock);
	});

	it("returns the api adapter for 'api'", () => {
		vi.stubEnv("VITE_API_MODE", "api");
		expect(getAuthService()).toBe(authApi);
	});

	it("returns the api adapter for 'real'", () => {
		vi.stubEnv("VITE_API_MODE", "real");
		expect(getAuthService()).toBe(authApi);
	});

	it("defaults to the mock adapter when VITE_API_MODE is absent", () => {
		expect(authService).toBe(authMock);
	});
});
