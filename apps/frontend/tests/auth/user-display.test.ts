import { describe, expect, it } from "vitest";

import { displayInitials, displayName } from "#/lib/auth/user-display";

describe("displayName", () => {
	it("returns the trimmed name when the session includes it", () => {
		expect(
			displayName({
				id: "1",
				email: "ada@worklyst.com",
				nombre: "  Ada Lovelace  ",
			}),
		).toBe("Ada Lovelace");
	});

	it("derives the name from the local part of the email when it is missing", () => {
		expect(displayName({ id: "1", email: "ada@worklyst.com" })).toBe("Ada");
	});

	it("derives from the email when the name is blank", () => {
		expect(
			displayName({ id: "1", email: "ada@worklyst.com", nombre: "   " }),
		).toBe("Ada");
	});

	it("capitalizes only the first letter of the local part", () => {
		expect(displayName({ id: "1", email: "ada.lovelace@worklyst.com" })).toBe(
			"Ada.lovelace",
		);
	});

	it("returns Guest without a session", () => {
		expect(displayName(null)).toBe("Invitado");
	});
});

describe("displayInitials", () => {
	it("returns the initials of the first two words", () => {
		expect(displayInitials("Ada Lovelace")).toBe("AL");
	});

	it("returns a single initial for a one-word name", () => {
		expect(displayInitials("Ada")).toBe("A");
	});

	it("uppercases the initials", () => {
		expect(displayInitials("ada lovelace")).toBe("AL");
	});

	it("ignores extra whitespace between words", () => {
		expect(displayInitials("  Ada   Lovelace  ")).toBe("AL");
	});

	it("returns an empty string for a blank name", () => {
		expect(displayInitials("   ")).toBe("");
	});
});
