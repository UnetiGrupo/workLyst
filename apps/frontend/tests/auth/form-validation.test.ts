import { describe, expect, it } from "vitest";

import {
	canSubmitLogin,
	canSubmitRegister,
} from "#/lib/auth/form-validation";

describe("canSubmitRegister", () => {
	it("rejects untouched or whitespace-only required fields", () => {
		expect(
			canSubmitRegister({ fullName: "", email: "", password: "" }),
		).toBe(false);
		expect(
			canSubmitRegister({
				fullName: "   ",
				email: "ada@worklyst.com",
				password: "Password1!",
			}),
		).toBe(false);
		expect(
			canSubmitRegister({
				fullName: "Ada Lovelace",
				email: "   ",
				password: "Password1!",
			}),
		).toBe(false);
	});

	it("rejects an email without an at sign", () => {
		expect(
			canSubmitRegister({
				fullName: "Ada Lovelace",
				email: "ada.worklyst.com",
				password: "Password1!",
			}),
		).toBe(false);
	});

	it("rejects a password that misses any of the four rules", () => {
		const base = { fullName: "Ada Lovelace", email: "ada@worklyst.com" };
		expect(canSubmitRegister({ ...base, password: "Pw1!" })).toBe(false);
		expect(canSubmitRegister({ ...base, password: "password1!" })).toBe(false);
		expect(canSubmitRegister({ ...base, password: "Password!" })).toBe(false);
		expect(canSubmitRegister({ ...base, password: "Password1" })).toBe(false);
	});

	it("accepts a fully valid registration", () => {
		expect(
			canSubmitRegister({
				fullName: "Ada Lovelace",
				email: "ada@worklyst.com",
				password: "Password1!",
			}),
		).toBe(true);
	});

	it("ignores surrounding spaces in name and email, not in the password", () => {
		expect(
			canSubmitRegister({
				fullName: "  Ada Lovelace  ",
				email: "  ada@worklyst.com  ",
				password: "Password1!",
			}),
		).toBe(true);
	});
});

describe("canSubmitLogin", () => {
	it("rejects empty credentials", () => {
		expect(canSubmitLogin({ email: "", password: "" })).toBe(false);
		expect(canSubmitLogin({ email: "   ", password: "x" })).toBe(false);
		expect(
			canSubmitLogin({ email: "ada@worklyst.com", password: "" }),
		).toBe(false);
	});

	it("rejects an email without an at sign", () => {
		expect(
			canSubmitLogin({ email: "ada.worklyst.com", password: "x" }),
		).toBe(false);
	});

	it("accepts a weak but non-empty password", () => {
		expect(
			canSubmitLogin({ email: "ada@worklyst.com", password: "weak" }),
		).toBe(true);
	});

	it("accepts credentials with a valid-looking email", () => {
		expect(
			canSubmitLogin({ email: "  ada@worklyst.com  ", password: "Password1!" }),
		).toBe(true);
	});
});
