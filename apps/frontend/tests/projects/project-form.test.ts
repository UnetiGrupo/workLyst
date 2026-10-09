import { describe, expect, it } from "vitest";
import {
	canSubmitProjectForm,
	initialProjectFormValues,
} from "#/lib/projects/project-form";
import type { Project } from "#/lib/projects/types";

// Predicado compartido del formulario y precarga de valores.

function makeProject(overrides: Partial<Project> = {}): Project {
	return {
		id: "p1",
		name: "Proyecto base",
		description: "Descripción base",
		template: "scrum",
		phase: "Sprint 4",
		status: "activo",
		progress: 0,
		members: [],
		favorite: false,
		createdAt: "2026-06-01",
		dueDate: null,
		...overrides,
	};
}

describe("canSubmitProjectForm", () => {
	it("is false for an empty name", () => {
		expect(canSubmitProjectForm("")).toBe(false);
	});

	it("is false for a whitespace-only name", () => {
		expect(canSubmitProjectForm("   ")).toBe(false);
	});

	it("is true for a valid name", () => {
		expect(canSubmitProjectForm("Proyecto")).toBe(true);
	});

	it("is true when the name has content after trimming", () => {
		expect(canSubmitProjectForm("  Proyecto  ")).toBe(true);
	});
});

describe("initialProjectFormValues", () => {
	it("returns an empty form with Kanban for creation", () => {
		expect(initialProjectFormValues()).toEqual({
			name: "",
			description: "",
			template: "kanban",
		});
	});

	it("preloads the project fields for editing", () => {
		const project = makeProject({
			name: "Rediseño",
			description: "Nueva marca",
			template: "kanban",
		});
		expect(initialProjectFormValues(project)).toEqual({
			name: "Rediseño",
			description: "Nueva marca",
			template: "kanban",
		});
	});
});
