import { describe, expect, it } from "vitest";
import { avatarColor, avatarInitials } from "#/lib/projects/project-display";

// Identidad visible de miembros: iniciales y color determinista.

// Paleta existente del proyecto (home/current-projects.tsx).
const PALETTE = [
	"bg-primary-500",
	"bg-emerald-500",
	"bg-amber-500",
	"bg-rose-500",
];

describe("avatarInitials", () => {
	it("returns the first letter for a single word", () => {
		expect(avatarInitials("Orlando")).toBe("O");
	});

	it("returns the initials of the two first words", () => {
		expect(avatarInitials("Orlando Rivera")).toBe("OR");
	});

	it("ignores words beyond the second", () => {
		expect(avatarInitials("Ana Maria Lopez")).toBe("AM");
	});

	it("uppercases lowercase names", () => {
		expect(avatarInitials("ada lovelace")).toBe("AL");
	});

	it("collapses extra whitespace", () => {
		expect(avatarInitials("  Ada   Lovelace ")).toBe("AL");
	});

	it("returns an empty string for a blank name", () => {
		expect(avatarInitials("   ")).toBe("");
	});
});

describe("avatarColor", () => {
	it("is deterministic for the same name", () => {
		expect(avatarColor("Orlando Rivera")).toBe(avatarColor("Orlando Rivera"));
	});

	it("returns a class from the existing palette", () => {
		const names = [
			"Orlando Rivera",
			"Ada Lovelace",
			"Grace Hopper",
			"Alan Turing",
			"Linus Torvalds",
			"",
		];
		for (const name of names) {
			expect(PALETTE).toContain(avatarColor(name));
		}
	});
});
