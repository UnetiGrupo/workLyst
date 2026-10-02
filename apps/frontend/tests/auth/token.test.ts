import { describe, expect, it } from "vitest";
import { isTokenValid, sanitizeText } from "#/lib/auth/token";

// RF-04: vigencia de token (función pura) y saneo de texto de entrada.
// CL-04: se recortan `fullName`/`email`, nunca la contraseña.

/**
 * Codifica un objeto a base64url (sin padding), válido en Node y navegador.
 * base64url: `+` -> `-`, `/` -> `_` y se elimina el `=`.
 */
function toBase64Url(value: string): string {
	const base64 = globalThis.btoa(
		String.fromCharCode(...new TextEncoder().encode(value)),
	);
	return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/**
 * Ensambla un JWT de prueba: header fijo + payload + firma ficticia.
 * No se verifica la firma en el frontend; solo importa la estructura.
 */
function buildToken(payload: unknown): string {
	const header = toBase64Url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
	const body = toBase64Url(JSON.stringify(payload));
	return `${header}.${body}.fake-signature`;
}

// `now` fijo para todos los casos (función pura, sin tiempo real).
const NOW = new Date("2026-10-02T12:00:00.000Z");
const NOW_IN_SECONDS = Math.floor(NOW.getTime() / 1000);

describe("isTokenValid", () => {
	describe("valid tokens", () => {
		it("returns true for a token expiring in the future", () => {
			const token = buildToken({ id: "1", email: "a@b.com", exp: NOW_IN_SECONDS + 60 });
			expect(isTokenValid(token, NOW)).toBe(true);
		});

		it("returns true for a base64url payload using - and _ and a valid exp", () => {
			// El payload incluye caracteres que fuerzan `-` y `_` en base64url.
			const token = buildToken({
				id: "user-1",
				email: "user_test@example.com",
				exp: NOW_IN_SECONDS + 3600,
			});
			expect(token).toMatch(/[-_]/);
			expect(isTokenValid(token, NOW)).toBe(true);
		});
	});

	describe("expiration", () => {
		it("returns false for an expired token", () => {
			const token = buildToken({ exp: NOW_IN_SECONDS - 1 });
			expect(isTokenValid(token, NOW)).toBe(false);
		});

		it("returns false when exp is exactly now (strict >)", () => {
			const token = buildToken({ exp: NOW_IN_SECONDS });
			expect(isTokenValid(token, NOW)).toBe(false);
		});
	});

	describe("malformed or corrupt tokens", () => {
		it("returns false for an empty string", () => {
			expect(isTokenValid("", NOW)).toBe(false);
		});

		it("returns false for a token without three parts", () => {
			expect(isTokenValid("onlyone", NOW)).toBe(false);
			expect(isTokenValid("header.payload", NOW)).toBe(false);
			expect(isTokenValid("a.b.c.d", NOW)).toBe(false);
		});

		it("returns false when the payload is not valid JSON", () => {
			const header = toBase64Url(JSON.stringify({ alg: "HS256" }));
			const body = toBase64Url("not-json-at-all");
			expect(isTokenValid(`${header}.${body}.sig`, NOW)).toBe(false);
		});

		it("returns false when the payload is invalid base64", () => {
			// Cadena con caracteres fuera del alfabeto base64/base64url.
			expect(isTokenValid("head.@@@@.sig", NOW)).toBe(false);
		});

		it("returns false when exp is missing", () => {
			const token = buildToken({ id: "1", email: "a@b.com" });
			expect(isTokenValid(token, NOW)).toBe(false);
		});

		it("returns false when exp is a string", () => {
			const token = buildToken({ exp: String(NOW_IN_SECONDS + 60) });
			expect(isTokenValid(token, NOW)).toBe(false);
		});

		it("returns false when exp is null", () => {
			const token = buildToken({ exp: null });
			expect(isTokenValid(token, NOW)).toBe(false);
		});

		it("returns false when the decoded payload is not an object", () => {
			const header = toBase64Url(JSON.stringify({ alg: "HS256" }));
			const body = toBase64Url(JSON.stringify("just-a-string"));
			expect(isTokenValid(`${header}.${body}.sig`, NOW)).toBe(false);
		});
	});
});

describe("sanitizeText", () => {
	it("trims leading and trailing whitespace", () => {
		expect(sanitizeText("  Ada Lovelace  ")).toBe("Ada Lovelace");
	});

	it("does not alter internal content", () => {
		expect(sanitizeText("  Ada  Lovelace  ")).toBe("Ada  Lovelace");
	});

	it("returns an empty string unchanged", () => {
		expect(sanitizeText("")).toBe("");
	});

	it("returns an empty string for whitespace only", () => {
		expect(sanitizeText("   \t\n  ")).toBe("");
	});
});
