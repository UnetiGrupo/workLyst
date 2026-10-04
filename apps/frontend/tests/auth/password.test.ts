import { describe, expect, it } from "vitest";
import { validatePasswordRules } from "#/lib/auth/password";

// Reglas de contraseña y nivel de seguridad (función pura, solo cliente).

describe("validatePasswordRules", () => {
	// --- Regla: minLength (longitud >= 8) ---------------------------------
	describe("minLength", () => {
		it("fails when password is shorter than 8 characters", () => {
			expect(validatePasswordRules("aB3!aB3").minLength).toBe(false);
		});

		it("passes with exactly 8 characters", () => {
			expect(validatePasswordRules("aB3!aB34").minLength).toBe(true);
		});

		it("passes with more than 8 characters", () => {
			expect(validatePasswordRules("aB3!aB3456").minLength).toBe(true);
		});
	});

	// --- Regla: upperAndLower (al menos una mayúscula y una minúscula) ----
	describe("upperAndLower", () => {
		it("fails with only lowercase letters", () => {
			expect(validatePasswordRules("abcdefgh").upperAndLower).toBe(false);
		});

		it("fails with only uppercase letters", () => {
			expect(validatePasswordRules("ABCDEFGH").upperAndLower).toBe(false);
		});

		it("passes with at least one uppercase and one lowercase", () => {
			expect(validatePasswordRules("Abcdefgh").upperAndLower).toBe(true);
		});
	});

	// --- Regla: number (al menos un dígito) -------------------------------
	describe("number", () => {
		it("fails without any digit", () => {
			expect(validatePasswordRules("Abcdefgh").number).toBe(false);
		});

		it("passes with at least one digit", () => {
			expect(validatePasswordRules("Abcdefg1").number).toBe(true);
		});
	});

	// --- Regla: special (conjunto exacto !@#$%^&*) ------------------------
	describe("special", () => {
		it("fails without any special character", () => {
			expect(validatePasswordRules("Abcdefg1").special).toBe(false);
		});

		it.each(["!", "@", "#", "$", "%", "^", "&", "*"])(
			"passes with the allowed special character %s",
			(character) => {
				expect(
					validatePasswordRules(`Abcdefg1${character}`).special,
				).toBe(true);
			},
		);

		it.each(["?", "(", ")", "-", "_", "+", "=", ".", ",", "~", "`", "[", "]"])(
			"fails with a symbol outside the exact set (%s)",
			(symbol) => {
				expect(validatePasswordRules(`Abcdefg1${symbol}`).special).toBe(
					false,
				);
			},
		);
	});

	// --- Nivel de seguridad (0-3) -----------------------------------------
	describe("level", () => {
		it("is 0 for an empty password", () => {
			expect(validatePasswordRules("").level).toBe(0);
		});

		it("is 1 when no rule passes (weak)", () => {
			expect(validatePasswordRules("short").level).toBe(1);
		});

		it("is 1 when exactly one rule passes (weak)", () => {
			// Solo minLength (8 chars, sin mayúscula, sin dígito, sin especial).
			expect(validatePasswordRules("abcdefgh").level).toBe(1);
		});

		it("is 2 when exactly two rules pass (medium)", () => {
			// minLength + upperAndLower.
			expect(validatePasswordRules("Abcdefgh").level).toBe(2);
		});

		it("is 3 when three rules pass (strong)", () => {
			// minLength + upperAndLower + number.
			expect(validatePasswordRules("Abcdefg1").level).toBe(3);
		});

		it("is 3 when all four rules pass (strong)", () => {
			expect(validatePasswordRules("Abcdefg1!").level).toBe(3);
		});
	});

	// --- Combinaciones limite ---------------------------------------------
	describe("boundary combinations", () => {
		it("returns the individual rule flags alongside level 0 for an empty password", () => {
			expect(validatePasswordRules("")).toEqual({
				minLength: false,
				upperAndLower: false,
				number: false,
				special: false,
				level: 0,
			});
		});

		it("passes only special and level is 1 for a one-character allowed symbol", () => {
			expect(validatePasswordRules("!")).toEqual({
				minLength: false,
				upperAndLower: false,
				number: false,
				special: true,
				level: 1,
			});
		});

		it("passes the four rules for a boundary 8-character password", () => {
			expect(validatePasswordRules("Abcdef1!")).toEqual({
				minLength: true,
				upperAndLower: true,
				number: true,
				special: true,
				level: 3,
			});
		});

		it("does not count whitespace as a special character", () => {
			expect(validatePasswordRules("Abcdefg ").special).toBe(false);
		});
	});
});
