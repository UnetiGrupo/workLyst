import { afterEach, describe, expect, it, vi } from "vitest";
import { api } from "#/lib/api";
import {
	type BackendProject,
	getProjectsService,
	projectsApi,
	projectsService,
	toUiProject,
} from "#/lib/projects/projects-api";
import { projectsMock } from "#/lib/projects/projects-mock";
import { ProjectsError } from "#/lib/projects/types";

// Adaptador real de proyectos y fábrica; se espía la instancia axios (sin red).

function backendProject(
	overrides: Partial<BackendProject> = {},
): BackendProject {
	return {
		id: "p1",
		name: "Proyecto base",
		description: "Descripción base",
		template: "kanban",
		phase: "Planeación",
		status: "activo",
		progress: 0,
		favorite: false,
		archived: false,
		createdAt: "2026-01-01",
		dueDate: null,
		members: [{ id: "u1", name: "Ada" }],
		...overrides,
	};
}

/** Error de red: sin `response`, con `request`. */
const networkError = { request: {}, message: "Network Error" };

/** Error con respuesta HTTP del backend. */
function httpError(status: number, mensaje?: string) {
	return {
		response: { status, data: mensaje === undefined ? {} : { mensaje } },
	};
}

afterEach(() => {
	vi.restoreAllMocks();
});

describe("toUiProject", () => {
	it("normalizes en_riesgo and flattens member names", () => {
		const ui = toUiProject(
			backendProject({
				status: "en_riesgo",
				members: [
					{ id: "u1", name: "Ada" },
					{ id: "u2", name: "Grace" },
				],
			}),
		);

		expect(ui.status).toBe("en riesgo");
		expect(ui.members).toEqual(["Ada", "Grace"]);
	});

	it("drops the contract-only archived flag", () => {
		const ui = toUiProject(backendProject({ archived: true }));
		expect(ui).not.toHaveProperty("archived");
	});
});

describe("projectsApi.list", () => {
	it("GETs /api/projects and unwraps the `{ projects }` envelope", async () => {
		const get = vi.spyOn(api, "get").mockResolvedValue({
			data: { projects: [backendProject()] },
		});

		const projects = await projectsApi.list();

		expect(get).toHaveBeenCalledWith("/api/projects");
		expect(projects).toEqual([toUiProject(backendProject())]);
	});

	it("translates a 403 without leaking the backend detail", async () => {
		vi.spyOn(api, "get").mockRejectedValue(
			httpError(403, "API Key (x-api-key) inválida"),
		);

		const error = await projectsApi.list().catch((e) => e);

		expect(error).toBeInstanceOf(ProjectsError);
		expect(error.code).toBe("api_key");
		expect(error.status).toBe(403);
		expect(error.message).not.toContain("x-api-key");
	});
});

describe("projectsApi.create", () => {
	it("POSTs the contract body with the initial member and unwraps `{ project }`", async () => {
		const post = vi.spyOn(api, "post").mockResolvedValue({
			data: { project: backendProject({ name: "Nuevo" }) },
		});

		const project = await projectsApi.create({
			name: "Nuevo",
			description: "Descripción",
			template: "scrum",
			memberName: "Ada Lovelace",
		});

		expect(post).toHaveBeenCalledWith("/api/projects", {
			name: "Nuevo",
			description: "Descripción",
			template: "scrum",
			member: { name: "Ada Lovelace" },
		});
		expect(project).toMatchObject({ id: "p1", name: "Nuevo" });
	});
});

describe("projectsApi.update", () => {
	it("PUTs the editable fields and unwraps `{ project }`", async () => {
		const put = vi.spyOn(api, "put").mockResolvedValue({
			data: { project: backendProject({ name: "Editado" }) },
		});

		const project = await projectsApi.update("p1", {
			name: "Editado",
			description: "Nueva",
			template: "kanban",
		});

		expect(put).toHaveBeenCalledWith("/api/projects/p1", {
			name: "Editado",
			description: "Nueva",
			template: "kanban",
		});
		expect(project).toMatchObject({ name: "Editado" });
	});
});

describe("projectsApi.archive", () => {
	it("PATCHes `{ archived: true }` and unwraps `{ project }`", async () => {
		const patch = vi.spyOn(api, "patch").mockResolvedValue({
			data: { project: backendProject({ archived: true }) },
		});

		const project = await projectsApi.archive("p1");

		expect(patch).toHaveBeenCalledWith("/api/projects/p1", { archived: true });
		expect(project).toMatchObject({ id: "p1" });
	});
});

describe("projectsApi.setFavorite", () => {
	it("PATCHes `{ favorite }` and unwraps `{ project }`", async () => {
		const patch = vi.spyOn(api, "patch").mockResolvedValue({
			data: { project: backendProject({ favorite: true }) },
		});

		const project = await projectsApi.setFavorite("p1", true);

		expect(patch).toHaveBeenCalledWith("/api/projects/p1", { favorite: true });
		expect(project.favorite).toBe(true);
	});
});

describe("projectsApi.remove", () => {
	it("DELETEs and resolves void without a body (204)", async () => {
		const del = vi
			.spyOn(api, "delete")
			.mockResolvedValue({ data: undefined, status: 204 });

		await expect(projectsApi.remove("p1")).resolves.toBeUndefined();
		expect(del).toHaveBeenCalledWith("/api/projects/p1");
	});
});

describe("projectsApi error translation", () => {
	it("maps 400 to missing_name preserving the contract message", async () => {
		vi.spyOn(api, "post").mockRejectedValue(
			httpError(400, "El nombre del proyecto es obligatorio"),
		);

		await expect(
			projectsApi.create({
				name: "",
				description: "",
				template: "kanban",
				memberName: "Ada",
			}),
		).rejects.toMatchObject({
			code: "missing_name",
			status: 400,
			message: "El nombre del proyecto es obligatorio",
		});
	});

	it("maps 400 without a backend message to the default Spanish message", async () => {
		vi.spyOn(api, "put").mockRejectedValue(httpError(400));

		await expect(
			projectsApi.update("p1", {
				name: "",
				description: "",
				template: "kanban",
			}),
		).rejects.toMatchObject({
			code: "missing_name",
			status: 400,
			message: "El nombre del proyecto es obligatorio",
		});
	});

	it("maps 404 to not_found preserving the contract message", async () => {
		vi.spyOn(api, "delete").mockRejectedValue(
			httpError(404, "Proyecto no encontrado"),
		);

		await expect(projectsApi.remove("missing")).rejects.toMatchObject({
			code: "not_found",
			status: 404,
			message: "Proyecto no encontrado",
		});
	});

	it("maps 404 without a backend message to the default Spanish message", async () => {
		vi.spyOn(api, "patch").mockRejectedValue(httpError(404));

		await expect(projectsApi.archive("missing")).rejects.toMatchObject({
			code: "not_found",
			status: 404,
			message: "Proyecto no encontrado",
		});
	});

	it("maps 401 to session", async () => {
		vi.spyOn(api, "get").mockRejectedValue(httpError(401, "Sesión no válida"));

		await expect(projectsApi.list()).rejects.toMatchObject({
			code: "session",
			status: 401,
		});
	});

	it("maps 403 to api_key with a generic message", async () => {
		vi.spyOn(api, "get").mockRejectedValue(
			httpError(403, "API Key (x-api-key) inválida"),
		);

		const error = await projectsApi.list().catch((e) => e);

		expect(error.code).toBe("api_key");
		expect(error.status).toBe(403);
		expect(error.message).not.toContain("x-api-key");
	});

	it("maps a network error to network with status 0", async () => {
		vi.spyOn(api, "get").mockRejectedValue(networkError);

		await expect(projectsApi.list()).rejects.toMatchObject({
			code: "network",
			status: 0,
			message:
				"No pudimos conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.",
		});
	});

	it("maps any other status to unknown", async () => {
		vi.spyOn(api, "get").mockRejectedValue(httpError(500, "Internal"));

		await expect(projectsApi.list()).rejects.toMatchObject({
			code: "unknown",
			status: 500,
		});
	});

	it("returns the same ProjectsError when given one", async () => {
		const original = new ProjectsError("not_found", "m", 404);
		vi.spyOn(api, "get").mockRejectedValue(original);

		await expect(projectsApi.list()).rejects.toBe(original);
	});
});

describe("getProjectsService", () => {
	afterEach(() => {
		vi.unstubAllEnvs();
	});

	it("returns the mock adapter for an unknown mode", () => {
		vi.stubEnv("VITE_API_MODE", "otro");
		expect(getProjectsService()).toBe(projectsMock);
	});

	it("returns the api adapter for 'api'", () => {
		vi.stubEnv("VITE_API_MODE", "api");
		expect(getProjectsService()).toBe(projectsApi);
	});

	it("returns the api adapter for 'real'", () => {
		vi.stubEnv("VITE_API_MODE", "real");
		expect(getProjectsService()).toBe(projectsApi);
	});

	it("defaults to the mock adapter when VITE_API_MODE is absent", () => {
		expect(projectsService).toBe(projectsMock);
	});
});
