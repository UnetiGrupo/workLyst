import { act, renderHook, waitFor } from "@testing-library/react";
import { StrictMode } from "react";
import { afterEach, beforeEach, describe, expect, it, type Mock, vi } from "vitest";

import { useProjects } from "#/hooks/use-projects";
import { todayString } from "#/lib/projects/project-filters";
import type { ProjectsService } from "#/lib/projects/projects-api";
import { type Project, ProjectsError } from "#/lib/projects/types";
import { useAuthStore } from "#/stores/auth-store";

// Doble del servicio inyectado en el hook: ninguna llamada toca el mock real.

type ServiceDouble = ProjectsService & {
	list: Mock;
	create: Mock;
	update: Mock;
	archive: Mock;
	remove: Mock;
	setFavorite: Mock;
};

function isoOffset(days: number): string {
	const now = new Date();
	return todayString(
		new Date(now.getFullYear(), now.getMonth(), now.getDate() + days),
	);
}

function makeProject(overrides: Partial<Project> = {}): Project {
	return {
		id: "p1",
		name: "Proyecto uno",
		description: "",
		template: "kanban",
		phase: "Sprint 1",
		status: "activo",
		progress: 0,
		members: ["Ada Lovelace"],
		favorite: false,
		createdAt: isoOffset(-30),
		dueDate: null,
		...overrides,
	};
}

function makeService(projects: Project[] = []): ServiceDouble {
	return {
		list: vi.fn().mockResolvedValue(projects),
		create: vi.fn(),
		update: vi.fn(),
		archive: vi.fn(),
		remove: vi.fn(),
		setFavorite: vi.fn(),
	};
}

function deferred<T>() {
	let resolve!: (value: T) => void;
	let reject!: (reason?: unknown) => void;
	const promise = new Promise<T>((res, rej) => {
		resolve = res;
		reject = rej;
	});
	return { promise, resolve, reject };
}

const alfa = makeProject({
	id: "a",
	name: "Alfa",
	favorite: true,
	createdAt: isoOffset(-3),
});
const beta = makeProject({
	id: "b",
	name: "Beta",
	template: "scrum",
	status: "en riesgo",
	createdAt: isoOffset(-40),
	dueDate: isoOffset(2),
});
const gamma = makeProject({
	id: "c",
	name: "Gamma",
	status: "completado",
	createdAt: isoOffset(-40),
	dueDate: isoOffset(2),
});

beforeEach(() => {
	useAuthStore.setState({
		token: "session-token",
		user: { id: "u1", email: "ada@worklyst.com", nombre: "Ada Lovelace" },
		status: "authenticated",
	});
});

afterEach(() => {
	vi.restoreAllMocks();
});

describe("useProjects load", () => {
	it("loads the list on mount and reaches ready", async () => {
		const service = makeService([alfa]);
		const { result } = renderHook(() => useProjects(service));

		expect(result.current.listStatus).toBe("loading");
		await waitFor(() => expect(result.current.listStatus).toBe("ready"));

		expect(result.current.projects).toEqual([alfa]);
		expect(service.list).toHaveBeenCalledTimes(1);
	});

	it("stays loading until the request resolves", async () => {
		const pending = deferred<Project[]>();
		const service = makeService();
		service.list.mockReturnValue(pending.promise);

		const { result } = renderHook(() => useProjects(service));
		expect(result.current.listStatus).toBe("loading");

		await act(async () => {
			pending.resolve([alfa]);
		});
		await waitFor(() => expect(result.current.listStatus).toBe("ready"));
	});

	it("requests the list once under StrictMode", async () => {
		const service = makeService([alfa]);
		renderHook(() => useProjects(service), { wrapper: StrictMode });

		await waitFor(() => expect(service.list).toHaveBeenCalled());
		expect(service.list).toHaveBeenCalledTimes(1);
	});

	it.each([
		[
			"401",
			new ProjectsError(
				"session",
				"Tu sesión no es válida. Inicia sesión de nuevo.",
				401,
			),
		],
		[
			"403",
			new ProjectsError(
				"api_key",
				"Algo salió mal. Inténtalo de nuevo más tarde.",
				403,
			),
		],
		[
			"network",
			new ProjectsError(
				"network",
				"No pudimos conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.",
				0,
			),
		],
	])("surfaces a friendly message on a %s list failure", async (_label, error) => {
		const service = makeService();
		service.list.mockRejectedValue(error);

		const { result } = renderHook(() => useProjects(service));
		await waitFor(() => expect(result.current.listStatus).toBe("error"));

		expect(result.current.listError).toBe(error.message);
	});
});

describe("useProjects filters", () => {
	it("filters visible projects while KPIs stay over the full list", async () => {
		const service = makeService([alfa, beta, gamma]);
		const { result } = renderHook(() => useProjects(service));
		await waitFor(() => expect(result.current.listStatus).toBe("ready"));

		expect(result.current.visibleProjects.map((project) => project.id)).toEqual([
			"a",
			"b",
			"c",
		]);
		expect(result.current.kpis).toEqual({
			total: 3,
			activos: 1,
			enRiesgo: 1,
			vencenPronto: 1,
			completados: 1,
		});

		act(() => result.current.setSearch("bet"));
		expect(result.current.visibleProjects.map((project) => project.id)).toEqual([
			"b",
		]);
		expect(result.current.kpis.total).toBe(3);

		act(() => result.current.setSearch(""));
		act(() => result.current.setChip("nuevos"));
		expect(result.current.visibleProjects.map((project) => project.id)).toEqual([
			"a",
		]);

		act(() => result.current.setChip("todos"));
		act(() => result.current.setType("scrum"));
		expect(result.current.visibleProjects.map((project) => project.id)).toEqual([
			"b",
		]);

		act(() => result.current.setStatus("completado"));
		expect(result.current.visibleProjects).toHaveLength(0);
		expect(result.current.hasNoResults).toBe(true);
	});

	it("counts active refinements and clears every filter", async () => {
		const service = makeService([alfa, beta, gamma]);
		const { result } = renderHook(() => useProjects(service));
		await waitFor(() => expect(result.current.listStatus).toBe("ready"));

		expect(result.current.activeRefinementCount).toBe(0);

		act(() => result.current.setSearch("Alfa"));
		act(() => result.current.setChip("favoritos"));
		act(() => result.current.setType("kanban"));
		expect(result.current.activeRefinementCount).toBe(1);

		act(() => result.current.setStatus("activo"));
		expect(result.current.activeRefinementCount).toBe(2);

		act(() => result.current.clearFilters());
		expect(result.current.filters).toEqual({
			search: "",
			chip: "todos",
			type: "todos",
			status: "todos",
		});
		expect(result.current.activeRefinementCount).toBe(0);
		expect(result.current.visibleProjects).toHaveLength(3);
	});

	it("distinguishes an empty workspace from no filter results", async () => {
		const emptyService = makeService();
		const empty = renderHook(() => useProjects(emptyService));
		await waitFor(() => expect(empty.result.current.listStatus).toBe("ready"));
		expect(empty.result.current.isEmpty).toBe(true);
		expect(empty.result.current.hasNoResults).toBe(false);

		const service = makeService([alfa, beta, gamma]);
		const { result } = renderHook(() => useProjects(service));
		await waitFor(() => expect(result.current.listStatus).toBe("ready"));

		act(() => result.current.setSearch("zzz"));
		expect(result.current.isEmpty).toBe(false);
		expect(result.current.hasNoResults).toBe(true);
	});
});

describe("useProjects overlays", () => {
	it("opens the drawer, the modal and the confirmation dialog", async () => {
		const service = makeService([alfa]);
		const { result } = renderHook(() => useProjects(service));
		await waitFor(() => expect(result.current.listStatus).toBe("ready"));

		act(() => result.current.openDrawer());
		expect(result.current.drawerOpen).toBe(true);
		act(() => result.current.closeDrawer());
		expect(result.current.drawerOpen).toBe(false);

		act(() => result.current.openCreateModal());
		expect(result.current.modal).toEqual({ mode: "create", project: null });
		act(() => result.current.openEditModal(alfa));
		expect(result.current.modal).toEqual({ mode: "edit", project: alfa });
		act(() => result.current.closeModal());
		expect(result.current.modal).toBeNull();

		act(() => result.current.openArchiveConfirm(alfa));
		expect(result.current.confirm).toEqual({ action: "archive", project: alfa });
		act(() => result.current.openDeleteConfirm(alfa));
		expect(result.current.confirm).toEqual({ action: "delete", project: alfa });
		act(() => result.current.closeConfirm());
		expect(result.current.confirm).toBeNull();
	});
});

describe("useProjects mutations", () => {
	it("creates a project through the service and reflects the response", async () => {
		const existing = makeProject({ id: "a", name: "Alfa" });
		const created = makeProject({ id: "new", name: "Nuevo" });
		const service = makeService([existing]);
		service.create.mockResolvedValue(created);

		const { result } = renderHook(() => useProjects(service));
		await waitFor(() => expect(result.current.listStatus).toBe("ready"));

		act(() => result.current.openCreateModal());
		await act(async () => {
			await result.current.submitForm({
				name: "Nuevo",
				description: "",
				template: "kanban",
			});
		});

		expect(service.create).toHaveBeenCalledWith({
			name: "Nuevo",
			description: "",
			template: "kanban",
			memberName: "Ada Lovelace",
		});
		expect(result.current.projects.map((project) => project.id)).toEqual([
			"a",
			"new",
		]);
		expect(result.current.kpis.total).toBe(2);
		expect(result.current.modal).toBeNull();
	});

	it("edits a project and reflects the response", async () => {
		const project = makeProject({ id: "a", name: "Alfa" });
		const updated = {
			...project,
			name: "Alfa editada",
			description: "Descripción nueva",
			template: "scrum" as const,
		};
		const service = makeService([project]);
		service.update.mockResolvedValue(updated);

		const { result } = renderHook(() => useProjects(service));
		await waitFor(() => expect(result.current.listStatus).toBe("ready"));

		act(() => result.current.openEditModal(project));
		await act(async () => {
			await result.current.submitForm({
				name: "Alfa editada",
				description: "Descripción nueva",
				template: "scrum",
			});
		});

		expect(service.update).toHaveBeenCalledWith("a", {
			name: "Alfa editada",
			description: "Descripción nueva",
			template: "scrum",
		});
		expect(result.current.projects[0]).toEqual(updated);
	});

	it("archives a project and removes it from the list", async () => {
		const project = makeProject({ id: "a" });
		const service = makeService([project]);
		service.archive.mockResolvedValue(project);

		const { result } = renderHook(() => useProjects(service));
		await waitFor(() => expect(result.current.listStatus).toBe("ready"));

		act(() => result.current.openArchiveConfirm(project));
		await act(async () => {
			await result.current.confirmAction();
		});

		expect(service.archive).toHaveBeenCalledWith("a");
		expect(result.current.projects).toHaveLength(0);
		expect(result.current.confirm).toBeNull();
	});

	it("removes a project from the list", async () => {
		const project = makeProject({ id: "a" });
		const service = makeService([project]);
		service.remove.mockResolvedValue(undefined);

		const { result } = renderHook(() => useProjects(service));
		await waitFor(() => expect(result.current.listStatus).toBe("ready"));

		act(() => result.current.openDeleteConfirm(project));
		await act(async () => {
			await result.current.confirmAction();
		});

		expect(service.remove).toHaveBeenCalledWith("a");
		expect(result.current.projects).toHaveLength(0);
		expect(result.current.confirm).toBeNull();
	});

	it("toggles the favorite using the service response", async () => {
		const project = makeProject({ id: "a", favorite: false });
		const service = makeService([project]);
		service.setFavorite.mockResolvedValue({ ...project, favorite: true });

		const { result } = renderHook(() => useProjects(service));
		await waitFor(() => expect(result.current.listStatus).toBe("ready"));

		await act(async () => {
			await result.current.toggleFavorite(project);
		});

		expect(service.setFavorite).toHaveBeenCalledWith("a", true);
		expect(result.current.projects[0].favorite).toBe(true);
		expect(result.current.favoritePendingId).toBeNull();
	});
});

describe("useProjects action errors and pending states", () => {
	it("keeps the favorite unchanged and surfaces an error when it fails", async () => {
		const project = makeProject({ id: "a", favorite: false });
		const service = makeService([project]);
		service.setFavorite.mockRejectedValue(
			new ProjectsError(
				"network",
				"No pudimos conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.",
				0,
			),
		);

		const { result } = renderHook(() => useProjects(service));
		await waitFor(() => expect(result.current.listStatus).toBe("ready"));

		await act(async () => {
			await result.current.toggleFavorite(project);
		});

		expect(result.current.projects[0].favorite).toBe(false);
		expect(result.current.actionError).toBe(
			"No pudimos conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.",
		);

		act(() => result.current.dismissActionError());
		expect(result.current.actionError).toBeNull();
	});

	it("exposes a pending favorite while the request is in flight", async () => {
		const project = makeProject({ id: "a" });
		const service = makeService([project]);
		const pending = deferred<Project>();
		service.setFavorite.mockReturnValue(pending.promise);

		const { result } = renderHook(() => useProjects(service));
		await waitFor(() => expect(result.current.listStatus).toBe("ready"));

		let request: Promise<void> | undefined;
		act(() => {
			request = result.current.toggleFavorite(project);
		});
		expect(result.current.favoritePendingId).toBe("a");

		await act(async () => {
			pending.resolve({ ...project, favorite: true });
			await request;
		});

		expect(result.current.favoritePendingId).toBeNull();
	});

	it("keeps the modal open and shows the error when create fails", async () => {
		const service = makeService();
		service.create.mockRejectedValue(
			new ProjectsError(
				"missing_name",
				"El nombre del proyecto es obligatorio",
				400,
			),
		);

		const { result } = renderHook(() => useProjects(service));
		await waitFor(() => expect(result.current.listStatus).toBe("ready"));

		act(() => result.current.openCreateModal());
		await act(async () => {
			await result.current.submitForm({
				name: "Nuevo",
				description: "",
				template: "kanban",
			});
		});

		expect(result.current.modal).not.toBeNull();
		expect(result.current.formError).toBe("El nombre del proyecto es obligatorio");
		expect(result.current.formPending).toBe(false);
	});

	it("exposes a pending form while the create request is in flight", async () => {
		const service = makeService();
		const pending = deferred<Project>();
		service.create.mockReturnValue(pending.promise);

		const { result } = renderHook(() => useProjects(service));
		await waitFor(() => expect(result.current.listStatus).toBe("ready"));

		act(() => result.current.openCreateModal());
		let request: Promise<void> | undefined;
		act(() => {
			request = result.current.submitForm({
				name: "Nuevo",
				description: "",
				template: "kanban",
			});
		});
		expect(result.current.formPending).toBe(true);

		await act(async () => {
			pending.resolve(makeProject({ id: "new" }));
			await request;
		});

		expect(result.current.formPending).toBe(false);
	});

	it("keeps the dialog open and shows the error when archive fails", async () => {
		const project = makeProject({ id: "a" });
		const service = makeService([project]);
		service.archive.mockRejectedValue(
			new ProjectsError("not_found", "Proyecto no encontrado", 404),
		);

		const { result } = renderHook(() => useProjects(service));
		await waitFor(() => expect(result.current.listStatus).toBe("ready"));

		act(() => result.current.openArchiveConfirm(project));
		await act(async () => {
			await result.current.confirmAction();
		});

		expect(result.current.confirm).not.toBeNull();
		expect(result.current.confirmError).toBe("Proyecto no encontrado");
		expect(result.current.confirmPending).toBe(false);
	});

	it("exposes a pending confirmation while the request is in flight", async () => {
		const project = makeProject({ id: "a" });
		const service = makeService([project]);
		const pending = deferred<Project>();
		service.archive.mockReturnValue(pending.promise);

		const { result } = renderHook(() => useProjects(service));
		await waitFor(() => expect(result.current.listStatus).toBe("ready"));

		act(() => result.current.openArchiveConfirm(project));
		let request: Promise<void> | undefined;
		act(() => {
			request = result.current.confirmAction();
		});
		expect(result.current.confirmPending).toBe(true);

		await act(async () => {
			pending.resolve(project);
			await request;
		});

		expect(result.current.confirmPending).toBe(false);
	});
});

describe("useProjects member name", () => {
	it("falls back to the session email when there is no name", async () => {
		useAuthStore.setState({
			user: { id: "u2", email: "restored@worklyst.com" },
		});
		const service = makeService();
		service.create.mockResolvedValue(makeProject({ id: "new" }));

		const { result } = renderHook(() => useProjects(service));
		await waitFor(() => expect(result.current.listStatus).toBe("ready"));

		act(() => result.current.openCreateModal());
		await act(async () => {
			await result.current.submitForm({
				name: "Nuevo",
				description: "",
				template: "kanban",
			});
		});

		expect(service.create).toHaveBeenCalledWith(
			expect.objectContaining({ memberName: "restored@worklyst.com" }),
		);
	});
});
