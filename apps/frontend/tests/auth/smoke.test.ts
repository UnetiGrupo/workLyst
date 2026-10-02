import { describe, expect, it } from "vitest";

// Test de humo: confirma que Vitest corre y resuelve el alias `#/`.
import { STATS_MOCK } from "#/data/home-mocks";

describe("smoke", () => {
	it("resolves the #/ alias and runs Vitest", () => {
		expect(STATS_MOCK).toBeDefined();
	});
});
