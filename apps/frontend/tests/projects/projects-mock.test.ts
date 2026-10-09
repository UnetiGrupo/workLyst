import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
	daysBetween,
	isDueSoon,
	isNew,
} from "#/lib/projects/project-filters";
import {
	MOCK_LATENCY_MS,
	projectsMock,
	resetProjectsMock,
} from "#/lib/projects/projects-mock";
import type { Project } from "#/lib/projects/types";

// Adaptador mock de proyectos: siembra, latencia, memoria y validaciones.
// Las fechas sembradas se calculan desde el reloj, que se fija con temporizadores
// falsos para que el panorama sea determinista.

const TODAY = new Date(2026, 5, 15);
const TODAY_STRING = "2026-06-15";

beforeEach(() => {
	vi.useFakeTimers();
	vi.setSystemTime(TODAY);
	resetProjectsMock();
});

afterEach(() => {
	vi.useRealTimers();
});

/** Consume la latencia simulada y resuelve la operación. */
async function run<T>(operation: Promise<T>): Promise<T> {
	await vi.advanceTimersByTimeAsync(MOCK_LATENCY_MS);
	return operation;
}

function listProjects(): Promise<Project[]> {
	return run(projectsMock.list());
}

function requireProject(projects: Project[], name: string): Project {
	const project = projects.find((candidate) => candidate.name === name);
	if (!project) {
		throw new Error(`Proyecto sembrado no encontrado: ${name}`);
	}
	return project;
}

describe("projectsMock.list — panorama sembrado", () => {
	it("covers every status and template at least once", async () => {
		const projects = await listProjects();

		expect([...new Set(projects.map((p) => p.status))].sort()).toEqual([
			"activo",
			"completado",
			"en riesgo",
		]);
		expect([...new Set(projects.map((p) => p.template))].sort()).toEqual([
			"kanban",
			"scrum",
		]);
	});

	it("includes at least one favorite", async () => {
		const projects = await listProjects();
		expect(projects.some((project) => project.favorite)).toBe(true);
	});

	it("includes a project created within the last 14 days", async () => {
		const projects = await listProjects();
		expect(projects.some((project) => isNew(project, TODAY_STRING))).toBe(true);
	});

	it("includes a project due within the next 7 days", async () => {
		const projects = await listProjects();
		expect(projects.some((project) => isDueSoon(project, TODAY_STRING))).toBe(
			true,
		);
	});

	it("includes a project with more than three members", async () => {
		const projects = await listProjects();
		expect(projects.some((project) => project.members.length > 3)).toBe(true);
	});

	it("includes projects with progress 0 and 100", async () => {
		const projects = await listProjects();
		expect(projects.some((project) => project.progress === 0)).toBe(true);
		expect(projects.some((project) => project.progress === 100)).toBe(true);
	});

	it("keeps names, descriptions and phases in Spanish", async () => {
		const projects = await listProjects();

		expect(projects.map((project) => project.name).join(" ")).toContain(
			"Rediseño",
		);
		expect(projects.every((project) => project.name.trim().length > 0)).toBe(
			true,
		);
		expect(projects.every((project) => project.phase.trim().length > 0)).toBe(
			true,
		);
	});

	it("excludes the archived project from the workspace", async () => {
		const projects = await listProjects();

		expect(projects).toHaveLength(6);
		expect(projects.some((project) => project.name === "Portal de facturación")).toBe(
			false,
		);
	});

	it("computes relative dates from the seeded clock", async () => {
		const projects = await listProjects();

		const mobile = requireProject(projects, "App móvil Worklyst");
		expect(daysBetween(mobile.createdAt, TODAY_STRING)).toBe(3);

		const renovation = requireProject(projects, "Rediseño del portal web");
		expect(renovation.dueDate).not.toBeNull();
		expect(daysBetween(TODAY_STRING, renovation.dueDate ?? "")).toBe(5);
	});
});

describe("projectsMock latency", () => {
	it("resolves list only after the mock latency elapses", async () => {
		let settled = false;
		const promise = projectsMock.list();
		promise.then(() => {
			settled = true;
		});

		await vi.advanceTimersByTimeAsync(MOCK_LATENCY_MS - 1);
		expect(settled).toBe(false);

		await vi.advanceTimersByTimeAsync(1);
		await promise;
		expect(settled).toBe(true);
	});
});

describe("projectsMock memory between operations", () => {
	it("reflects a created project in later listings", async () => {
		const created = await run(
			projectsMock.create({
				name: "Proyecto nuevo",
				description: "Descripción",
				template: "kanban",
				memberName: "Ada Lovelace",
			}),
		);

		const projects = await listProjects();
		expect(projects).toHaveLength(7);
		expect(projects.some((project) => project.id === created.id)).toBe(true);
	});

	it("reflects an update in later listings", async () => {
		const [target] = await listProjects();

		await run(
			projectsMock.update(target.id, {
				name: "Nombre editado",
				description: "Nueva descripción",
				template: "scrum",
			}),
		);

		const projects = await listProjects();
		expect(projects.find((project) => project.id === target.id)).toMatchObject({
			name: "Nombre editado",
			template: "scrum",
		});
	});

	it("removes an archived project from later listings", async () => {
		const [target] = await listProjects();

		await run(projectsMock.archive(target.id));

		const projects = await listProjects();
		expect(projects.some((project) => project.id === target.id)).toBe(false);
	});

	it("removes a deleted project from later listings", async () => {
		const [target] = await listProjects();

		await run(projectsMock.remove(target.id));

		const projects = await listProjects();
		expect(projects.some((project) => project.id === target.id)).toBe(false);
	});

	it("reflects a favorite toggle in later listings", async () => {
		const projects = await listProjects();
		const target = projects.find((project) => !project.favorite);
		if (!target) {
			throw new Error("La siembra no tiene un proyecto no favorito");
		}

		await run(projectsMock.setFavorite(target.id, true));

		const after = await listProjects();
		expect(after.find((project) => project.id === target.id)?.favorite).toBe(
			true,
		);
	});
});

describe("projectsMock create defaults", () => {
	it("applies contract defaults with the initial member and today's date", async () => {
		const project = await run(
			projectsMock.create({
				name: "Nuevo proyecto",
				description: "Primera descripción",
				template: "scrum",
				memberName: "Ada Lovelace",
			}),
		);

		expect(project).toMatchObject({
			name: "Nuevo proyecto",
			description: "Primera descripción",
			template: "scrum",
			phase: "Sprint 1",
			status: "activo",
			progress: 0,
			favorite: false,
			createdAt: TODAY_STRING,
			dueDate: null,
			members: ["Ada Lovelace"],
		});
	});

	it("uses the Kanban default phase", async () => {
		const project = await run(
			projectsMock.create({
				name: "Kanban nuevo",
				description: "",
				template: "kanban",
				memberName: "Ada Lovelace",
			}),
		);

		expect(project.phase).toBe("Planeación");
	});
});

describe("projectsMock contract validation", () => {
	it("rejects create with a blank name (400)", async () => {
		const assertion = expect(
			projectsMock.create({
				name: "   ",
				description: "",
				template: "kanban",
				memberName: "Ada Lovelace",
			}),
		).rejects.toMatchObject({
			code: "missing_name",
			status: 400,
			message: "El nombre del proyecto es obligatorio",
		});
		await vi.advanceTimersByTimeAsync(MOCK_LATENCY_MS);
		await assertion;
	});

	it("rejects update with a blank name (400)", async () => {
		const [target] = await listProjects();

		const assertion = expect(
			projectsMock.update(target.id, {
				name: "",
				description: "Descripción",
				template: "kanban",
			}),
		).rejects.toMatchObject({
			code: "missing_name",
			status: 400,
			message: "El nombre del proyecto es obligatorio",
		});
		await vi.advanceTimersByTimeAsync(MOCK_LATENCY_MS);
		await assertion;
	});

	it("rejects update on a missing id (404)", async () => {
		const assertion = expect(
			projectsMock.update("missing", {
				name: "Nombre",
				description: "",
				template: "kanban",
			}),
		).rejects.toMatchObject({
			code: "not_found",
			status: 404,
			message: "Proyecto no encontrado",
		});
		await vi.advanceTimersByTimeAsync(MOCK_LATENCY_MS);
		await assertion;
	});

	it("rejects archive on a missing id (404)", async () => {
		const assertion = expect(
			projectsMock.archive("missing"),
		).rejects.toMatchObject({
			code: "not_found",
			status: 404,
			message: "Proyecto no encontrado",
		});
		await vi.advanceTimersByTimeAsync(MOCK_LATENCY_MS);
		await assertion;
	});

	it("rejects remove on a missing id (404)", async () => {
		const assertion = expect(
			projectsMock.remove("missing"),
		).rejects.toMatchObject({
			code: "not_found",
			status: 404,
			message: "Proyecto no encontrado",
		});
		await vi.advanceTimersByTimeAsync(MOCK_LATENCY_MS);
		await assertion;
	});

	it("rejects setFavorite on a missing id (404)", async () => {
		const assertion = expect(
			projectsMock.setFavorite("missing", true),
		).rejects.toMatchObject({
			code: "not_found",
			status: 404,
			message: "Proyecto no encontrado",
		});
		await vi.advanceTimersByTimeAsync(MOCK_LATENCY_MS);
		await assertion;
	});
});

describe("projectsMock reset", () => {
	it("re-seeds deterministically from the fake clock", async () => {
		await run(
			projectsMock.create({
				name: "Proyecto nuevo",
				description: "",
				template: "kanban",
				memberName: "Ada Lovelace",
			}),
		);

		resetProjectsMock();

		const promise = projectsMock.list();
		await vi.advanceTimersByTimeAsync(MOCK_LATENCY_MS);
		const projects = await promise;

		expect(projects).toHaveLength(6);
		expect(projects.some((project) => project.name === "Proyecto nuevo")).toBe(
			false,
		);
		expect(requireProject(projects, "App móvil Worklyst").createdAt).toBe(
			"2026-06-12",
		);
	});
});
