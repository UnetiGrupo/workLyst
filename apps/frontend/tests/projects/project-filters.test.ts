import { describe, expect, it } from "vitest";
import {
	countWorkspaceStats,
	daysBetween,
	filterProjects,
	isDueSoon,
	isNew,
	todayString,
} from "#/lib/projects/project-filters";
import type { Project, ProjectFilters } from "#/lib/projects/types";

// Fechas a día local, filtrado combinado y KPIs del espacio de trabajo.

const TODAY = "2026-06-15";

const NO_FILTERS: ProjectFilters = {
	search: "",
	chip: "todos",
	type: "todos",
	status: "todos",
};

function makeProject(overrides: Partial<Project> = {}): Project {
	return {
		id: "p1",
		name: "Proyecto base",
		description: "",
		template: "kanban",
		phase: "Planeación",
		status: "activo",
		progress: 0,
		members: [],
		favorite: false,
		createdAt: TODAY,
		dueDate: null,
		...overrides,
	};
}

describe("todayString", () => {
	it("formats a local date as YYYY-MM-DD", () => {
		expect(todayString(new Date(2026, 5, 5))).toBe("2026-06-05");
	});

	it("pads single-digit month and day", () => {
		expect(todayString(new Date(2026, 0, 1))).toBe("2026-01-01");
	});

	it("uses the local day, not UTC", () => {
		// 23:30 local del 14: en UTC ya sería el 15 en zonas negativas.
		expect(todayString(new Date(2026, 5, 14, 23, 30))).toBe("2026-06-14");
	});
});

describe("daysBetween", () => {
	it("returns 0 for the same day", () => {
		expect(daysBetween("2026-03-10", "2026-03-10")).toBe(0);
	});

	it("returns the positive difference in whole days forward", () => {
		expect(daysBetween("2026-03-10", "2026-03-15")).toBe(5);
	});

	it("returns a negative difference for past dates", () => {
		expect(daysBetween("2026-03-15", "2026-03-10")).toBe(-5);
	});

	it("crosses month boundaries", () => {
		expect(daysBetween("2026-01-30", "2026-02-02")).toBe(3);
	});

	it("crosses year boundaries", () => {
		expect(daysBetween("2025-12-30", "2026-01-02")).toBe(3);
	});

	it("counts the leap day in a leap year", () => {
		expect(daysBetween("2024-02-28", "2024-03-01")).toBe(2);
	});

	it("survives the spring-forward DST transition", () => {
		// 2026-03-08 es el cambio de hora en varias zonas: la medianoche local
		// de cada día evita el off-by-one que produciría dividir milisegundos.
		expect(daysBetween("2026-03-07", "2026-03-09")).toBe(2);
	});

	it("survives the fall-back DST transition", () => {
		expect(daysBetween("2026-10-31", "2026-11-02")).toBe(2);
	});

	it("does not reinterpret the string as UTC", () => {
		// Si se usara `new Date("2026-01-01")` (UTC) en zonas negativas la
		// diferencia contra otra fecha UTC sería correcta, pero contra una
		// medianoche local no; se comprueba con dos fechas contiguas largas.
		expect(daysBetween("2026-01-01", "2026-01-02")).toBe(1);
	});
});

describe("isNew", () => {
	it("is true for a project created today", () => {
		expect(isNew(makeProject({ createdAt: TODAY }), TODAY)).toBe(true);
	});

	it("is true at exactly 14 days", () => {
		expect(isNew(makeProject({ createdAt: "2026-06-01" }), TODAY)).toBe(true);
	});

	it("is false at 15 days", () => {
		expect(isNew(makeProject({ createdAt: "2026-05-31" }), TODAY)).toBe(false);
	});

	it("is true for a project created one day ago", () => {
		expect(isNew(makeProject({ createdAt: "2026-06-14" }), TODAY)).toBe(true);
	});
});

describe("isDueSoon", () => {
	it("is true when due in exactly 7 days and not completed", () => {
		expect(
			isDueSoon(
				makeProject({ status: "activo", dueDate: "2026-06-22" }),
				TODAY,
			),
		).toBe(true);
	});

	it("is false when due in 8 days", () => {
		expect(
			isDueSoon(
				makeProject({ status: "activo", dueDate: "2026-06-23" }),
				TODAY,
			),
		).toBe(false);
	});

	it("is true when due today", () => {
		expect(isDueSoon(makeProject({ dueDate: TODAY }), TODAY)).toBe(true);
	});

	it("is true for overdue projects", () => {
		expect(isDueSoon(makeProject({ dueDate: "2026-06-10" }), TODAY)).toBe(true);
	});

	it("is false for completed projects even if due soon", () => {
		expect(
			isDueSoon(
				makeProject({ status: "completado", dueDate: "2026-06-17" }),
				TODAY,
			),
		).toBe(false);
	});

	it("is false without a due date", () => {
		expect(isDueSoon(makeProject({ dueDate: null }), TODAY)).toBe(false);
	});
});

describe("filterProjects", () => {
	it("returns every project when there is no filter", () => {
		const projects = [makeProject({ id: "a" }), makeProject({ id: "b" })];
		expect(filterProjects(projects, NO_FILTERS, TODAY)).toHaveLength(2);
	});

	describe("search", () => {
		it("matches case-insensitively on the name", () => {
			const projects = [
				makeProject({ id: "a", name: "Alpha App" }),
				makeProject({ id: "b", name: "Beta Tool" }),
			];
			expect(
				filterProjects(projects, { ...NO_FILTERS, search: "ALPHA" }, TODAY),
			).toEqual([projects[0]]);
		});

		it("trims the search term before matching", () => {
			const projects = [makeProject({ id: "a", name: "Alpha App" })];
			expect(
				filterProjects(projects, { ...NO_FILTERS, search: "  alpha  " }, TODAY),
			).toHaveLength(1);
		});

		it("does not filter when the term is only spaces", () => {
			const projects = [makeProject({ id: "a" }), makeProject({ id: "b" })];
			expect(
				filterProjects(projects, { ...NO_FILTERS, search: "   " }, TODAY),
			).toHaveLength(2);
		});

		it("returns an empty list when nothing matches", () => {
			const projects = [makeProject({ id: "a", name: "Alpha" })];
			expect(
				filterProjects(projects, { ...NO_FILTERS, search: "zzz" }, TODAY),
			).toEqual([]);
		});
	});

	describe("chips", () => {
		it("todos returns the whole list", () => {
			const projects = [makeProject({ id: "a" }), makeProject({ id: "b" })];
			expect(
				filterProjects(projects, { ...NO_FILTERS, chip: "todos" }, TODAY),
			).toHaveLength(2);
		});

		it("favoritos keeps only favorites", () => {
			const projects = [
				makeProject({ id: "a", favorite: true }),
				makeProject({ id: "b", favorite: false }),
			];
			expect(
				filterProjects(projects, { ...NO_FILTERS, chip: "favoritos" }, TODAY),
			).toEqual([projects[0]]);
		});

		it("nuevos keeps only projects created within 14 days", () => {
			const projects = [
				makeProject({ id: "a", createdAt: "2026-06-10" }),
				makeProject({ id: "b", createdAt: "2026-05-01" }),
			];
			expect(
				filterProjects(projects, { ...NO_FILTERS, chip: "nuevos" }, TODAY),
			).toEqual([projects[0]]);
		});

		it("en_riesgo keeps only at-risk projects", () => {
			const projects = [
				makeProject({ id: "a", status: "en riesgo" }),
				makeProject({ id: "b", status: "activo" }),
			];
			expect(
				filterProjects(projects, { ...NO_FILTERS, chip: "en_riesgo" }, TODAY),
			).toEqual([projects[0]]);
		});
	});

	describe("refinements", () => {
		it("filters by type when it is not todos", () => {
			const projects = [
				makeProject({ id: "a", template: "kanban" }),
				makeProject({ id: "b", template: "scrum" }),
			];
			expect(
				filterProjects(projects, { ...NO_FILTERS, type: "scrum" }, TODAY),
			).toEqual([projects[1]]);
		});

		it("filters by status when it is not todos", () => {
			const projects = [
				makeProject({ id: "a", status: "activo" }),
				makeProject({ id: "b", status: "completado" }),
			];
			expect(
				filterProjects(projects, { ...NO_FILTERS, status: "completado" }, TODAY),
			).toEqual([projects[1]]);
		});
	});

	describe("combination", () => {
		const projects = [
			makeProject({
				id: "match",
				name: "Alpha Kanban",
				template: "kanban",
				status: "en riesgo",
				favorite: true,
			}),
			makeProject({
				id: "wrong-search",
				name: "Beta Kanban",
				template: "kanban",
				status: "en riesgo",
				favorite: true,
			}),
			makeProject({
				id: "not-favorite",
				name: "Alpha Kanban",
				template: "kanban",
				status: "en riesgo",
				favorite: false,
			}),
			makeProject({
				id: "wrong-type",
				name: "Alpha Kanban",
				template: "scrum",
				status: "en riesgo",
				favorite: true,
			}),
			makeProject({
				id: "wrong-status",
				name: "Alpha Kanban",
				template: "kanban",
				status: "completado",
				favorite: true,
			}),
		];

		it("shows only projects satisfying search, chip and refinements at once", () => {
			expect(
				filterProjects(
					projects,
					{
						search: "alpha",
						chip: "favoritos",
						type: "kanban",
						status: "en riesgo",
					},
					TODAY,
				),
			).toEqual([projects[0]]);
		});

		it("returns an empty list when the combination leaves nothing", () => {
			expect(
				filterProjects(
					projects,
					{
						search: "alpha",
						chip: "favoritos",
						type: "kanban",
						status: "activo",
					},
					TODAY,
				),
			).toEqual([]);
		});

		it("keeps chip and refinements when the search is cleared", () => {
			const result = filterProjects(
				projects,
				{ search: "", chip: "favoritos", type: "kanban", status: "en riesgo" },
				TODAY,
			);
			expect(result.map((project) => project.id)).toEqual([
				"match",
				"wrong-search",
			]);
		});
	});
});

describe("countWorkspaceStats", () => {
	it("returns zeros for an empty workspace", () => {
		expect(countWorkspaceStats([], TODAY)).toEqual({
			total: 0,
			activos: 0,
			enRiesgo: 0,
			vencenPronto: 0,
			completados: 0,
		});
	});

	it("counts each status and the total", () => {
		const projects = [
			makeProject({ id: "a", status: "activo" }),
			makeProject({ id: "b", status: "activo" }),
			makeProject({ id: "c", status: "en riesgo" }),
			makeProject({ id: "d", status: "completado" }),
		];
		expect(countWorkspaceStats(projects, TODAY)).toEqual({
			total: 4,
			activos: 2,
			enRiesgo: 1,
			vencenPronto: 0,
			completados: 1,
		});
	});

	it("counts as due soon non-completed projects due within 7 days, including overdue", () => {
		const projects = [
			makeProject({ id: "edge", status: "activo", dueDate: "2026-06-22" }),
			makeProject({ id: "overdue", status: "en riesgo", dueDate: "2026-06-10" }),
			makeProject({ id: "later", status: "activo", dueDate: "2026-06-23" }),
			makeProject({
				id: "done",
				status: "completado",
				dueDate: "2026-06-16",
			}),
			makeProject({ id: "none", status: "activo", dueDate: null }),
		];
		expect(countWorkspaceStats(projects, TODAY).vencenPronto).toBe(2);
	});

	it("keeps total equal to the full list, independent of any filter", () => {
		const projects = [makeProject({ id: "a" }), makeProject({ id: "b" })];
		expect(countWorkspaceStats(projects, TODAY).total).toBe(2);
	});
});
