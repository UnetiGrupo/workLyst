import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  MOCK_CREDENTIALS,
  MOCK_LATENCY_MS,
  authMock,
  resetAuthMock,
} from "#/lib/auth/auth-mock";

// Adaptador mock de auth, sin red real.
// La latencia artificial se verifica con temporizadores falsos.

const RATE_LIMIT_MESSAGE =
	"Demasiados intentos de inicio de sesión, por favor intente nuevamente después de 15 minutos";

describe("authMock", () => {
	beforeEach(() => {
		resetAuthMock();
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	// --- Registro ---------------------------------------------------------- 

	describe("register", () => {
		it("registers a new user and returns it", async () => {
			const promise = authMock.register({
				fullName: "Ada Lovelace",
				email: "ada@worklyst.com",
				password: "Password1!",
			});
			await vi.advanceTimersByTimeAsync(MOCK_LATENCY_MS);
			const user = await promise;

			expect(user.nombre).toBe("Ada Lovelace");
			expect(user.email).toBe("ada@worklyst.com");
			expect(typeof user.id).toBe("string");
		});

		it("simulates latency before resolving", async () => {
			let settled = false;
			const promise = authMock.register({
				fullName: "Grace Hopper",
				email: "grace@worklyst.com",
				password: "Password1!",
			});
			promise.then(() => {
				settled = true;
			});

			await vi.advanceTimersByTimeAsync(MOCK_LATENCY_MS - 1);
			expect(settled).toBe(false);

			await vi.advanceTimersByTimeAsync(1);
			await promise;
			expect(settled).toBe(true);
		});

		it("rejects with duplicate_email when the email already exists", async () => {
			const assertion = expect(
				authMock.register({
					fullName: "Demo Dos",
					email: MOCK_CREDENTIALS.email,
					password: "Password1!",
				}),
			).rejects.toMatchObject({
				code: "duplicate_email",
				status: 400,
				message: "El usuario ya existe",
			});
			await vi.advanceTimersByTimeAsync(MOCK_LATENCY_MS);
			await assertion;
		});

		it("detects duplicates ignoring email case and spaces", async () => {
			const assertion = expect(
				authMock.register({
					fullName: "Demo Dos",
					email: `  ${MOCK_CREDENTIALS.email.toUpperCase()}  `,
					password: "Password1!",
				}),
			).rejects.toMatchObject({ code: "duplicate_email" });
			await vi.advanceTimersByTimeAsync(MOCK_LATENCY_MS);
			await assertion;
		});

		it("rejects with missing_fields when fullName is empty", async () => {
			const assertion = expect(
				authMock.register({
					fullName: "   ",
					email: "ada@worklyst.com",
					password: "Password1!",
				}),
			).rejects.toMatchObject({
				code: "missing_fields",
				status: 400,
				message: "Todos los campos son obligatorios",
			});
			await vi.advanceTimersByTimeAsync(MOCK_LATENCY_MS);
			await assertion;
		});

		it("rejects with missing_fields when the password is empty", async () => {
			const assertion = expect(
				authMock.register({
					fullName: "Ada Lovelace",
					email: "ada@worklyst.com",
					password: "",
				}),
			).rejects.toMatchObject({ code: "missing_fields" });
			await vi.advanceTimersByTimeAsync(MOCK_LATENCY_MS);
			await assertion;
		});

		it("does not enforce password strength (server does not validate it)", async () => {
			const promise = authMock.register({
				fullName: "Alan Turing",
				email: "alan@worklyst.com",
				password: "weak",
			});
			await vi.advanceTimersByTimeAsync(MOCK_LATENCY_MS);
			await expect(promise).resolves.toMatchObject({ email: "alan@worklyst.com" });
		});
	});

	// --- Login --------------------------------------------------------------

	describe("login", () => {
		it("logs in the demo user and returns a session token", async () => {
			const promise = authMock.login({ ...MOCK_CREDENTIALS });
			await vi.advanceTimersByTimeAsync(MOCK_LATENCY_MS);
			const session = await promise;

			expect(session.user.email).toBe(MOCK_CREDENTIALS.email);
			expect(typeof session.token).toBe("string");
			// JWT simulado: header.payload.signature
			expect(session.token.split(".")).toHaveLength(3);
		});

		it("simulates latency before resolving", async () => {
			let settled = false;
			const promise = authMock.login({ ...MOCK_CREDENTIALS });
			promise.then(() => {
				settled = true;
			});

			await vi.advanceTimersByTimeAsync(MOCK_LATENCY_MS - 1);
			expect(settled).toBe(false);

			await vi.advanceTimersByTimeAsync(1);
			await promise;
			expect(settled).toBe(true);
		});

		it("rejects with invalid_credentials for a wrong password", async () => {
			const assertion = expect(
				authMock.login({ email: MOCK_CREDENTIALS.email, password: "wrong" }),
			).rejects.toMatchObject({
				code: "invalid_credentials",
				status: 401,
				message: "Credenciales inválidas",
			});
			await vi.advanceTimersByTimeAsync(MOCK_LATENCY_MS);
			await assertion;
		});

		it("rejects with invalid_credentials for an unknown email", async () => {
			const assertion = expect(
				authMock.login({ email: "nadie@worklyst.com", password: "Password1!" }),
			).rejects.toMatchObject({ code: "invalid_credentials" });
			await vi.advanceTimersByTimeAsync(MOCK_LATENCY_MS);
			await assertion;
		});

		it("rejects with missing_fields when email or password is empty", async () => {
			const assertion = expect(
				authMock.login({ email: "", password: "Password1!" }),
			).rejects.toMatchObject({
				code: "missing_fields",
				status: 400,
				message: "Todos los campos son obligatorios",
			});
			await vi.advanceTimersByTimeAsync(MOCK_LATENCY_MS);
			await assertion;
		});

		it("rejects with rate_limited after too many failed attempts", async () => {
			for (let attempt = 0; attempt < 5; attempt += 1) {
				const failure = expect(
					authMock.login({
						email: MOCK_CREDENTIALS.email,
						password: "wrong",
					}),
				).rejects.toMatchObject({ code: "invalid_credentials" });
				await vi.advanceTimersByTimeAsync(MOCK_LATENCY_MS);
				await failure;
			}

			const assertion = expect(
				authMock.login({
					email: MOCK_CREDENTIALS.email,
					password: "Password1!",
				}),
			).rejects.toMatchObject({
				code: "rate_limited",
				status: 429,
				message: RATE_LIMIT_MESSAGE,
			});
			await vi.advanceTimersByTimeAsync(MOCK_LATENCY_MS);
			await assertion;
		});

		it("resets the failed attempts counter after a successful login", async () => {
			// Cuatro fallos (por debajo del umbral) y luego un login correcto.
			for (let attempt = 0; attempt < 4; attempt += 1) {
				const failure = expect(
					authMock.login({
						email: MOCK_CREDENTIALS.email,
						password: "wrong",
					}),
				).rejects.toMatchObject({ code: "invalid_credentials" });
				await vi.advanceTimersByTimeAsync(MOCK_LATENCY_MS);
				await failure;
			}

			const success = authMock.login({ ...MOCK_CREDENTIALS });
			await vi.advanceTimersByTimeAsync(MOCK_LATENCY_MS);
			await expect(success).resolves.toHaveProperty("token");

			// Un fallo posterior vuelve a ser credenciales, no rate limit.
			const failure = expect(
				authMock.login({ email: MOCK_CREDENTIALS.email, password: "wrong" }),
			).rejects.toMatchObject({ code: "invalid_credentials" });
			await vi.advanceTimersByTimeAsync(MOCK_LATENCY_MS);
			await failure;
		});

		it("logs in a user registered at runtime", async () => {
			const registration = authMock.register({
				fullName: "Ada Lovelace",
				email: "ada@worklyst.com",
				password: "Password1!",
			});
			await vi.advanceTimersByTimeAsync(MOCK_LATENCY_MS);
			await registration;

			const session = authMock.login({
				email: "ada@worklyst.com",
				password: "Password1!",
			});
			await vi.advanceTimersByTimeAsync(MOCK_LATENCY_MS);
			await expect(session).resolves.toMatchObject({
				user: { nombre: "Ada Lovelace", email: "ada@worklyst.com" },
			});
		});
	});

	// --- Logout -------------------------------------------------------------

	describe("logout", () => {
		it("resolves after the simulated latency", async () => {
			let settled = false;
			const promise = authMock.logout("some-token");
			promise.then(() => {
				settled = true;
			});

			await vi.advanceTimersByTimeAsync(MOCK_LATENCY_MS - 1);
			expect(settled).toBe(false);

			await vi.advanceTimersByTimeAsync(1);
			await expect(promise).resolves.toBeUndefined();
		});
	});
});
