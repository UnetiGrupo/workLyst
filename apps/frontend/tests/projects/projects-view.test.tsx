import {
	Outlet,
	RouterProvider,
	createMemoryHistory,
	createRootRoute,
	createRoute,
	createRouter,
} from "@tanstack/react-router";
import {
	cleanup,
	render,
	screen,
	waitFor,
	within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { Header, HeaderActionsProvider } from "#/components/layout/header";
import { projectsService } from "#/lib/projects/projects-api";
import { resetProjectsMock } from "#/lib/projects/projects-mock";
import { ProjectsView } from "#/routes/projects";
import { useAuthStore } from "#/stores/auth-store";

// Integración de la vista con el adaptador mock real: sin dobles del servicio.
// Temporizadores reales: la latencia del mock (300 ms) y el arranque del router
// se resuelven con `findBy`/`waitFor`.

function SigninMarker() {
	return <div>Iniciar sesión</div>;
}

function renderProjectsView() {
	const rootRoute = createRootRoute({
		component: () => (
			<HeaderActionsProvider>
				<Header />
				<Outlet />
			</HeaderActionsProvider>
		),
	});
	const projectsRoute = createRoute({
		getParentRoute: () => rootRoute,
		path: "/projects",
		component: ProjectsView,
	});
	const signinRoute = createRoute({
		getParentRoute: () => rootRoute,
		path: "/auth/signin",
		component: SigninMarker,
	});
	const routeTree = rootRoute.addChildren([projectsRoute, signinRoute]);
	const router = createRouter({
		routeTree,
		history: createMemoryHistory({ initialEntries: ["/projects"] }),
	});

	render(<RouterProvider router={router} />);
	return router;
}

async function waitForGrid() {
	await screen.findByText("Rediseño del portal web");
}

function cardFor(name: string): HTMLElement {
	const node = screen.getByText(name).closest("article");
	if (!node) {
		throw new Error(`Tarjeta no encontrada: ${name}`);
	}
	return node as HTMLElement;
}

function gridContainer(): HTMLElement {
	return screen.getByTestId("projects-grid");
}

beforeEach(() => {
	resetProjectsMock();
	useAuthStore.setState({
		token: "session-token",
		user: { id: "u1", email: "ada@worklyst.com", nombre: "Ada Lovelace" },
		status: "authenticated",
	});
});

afterEach(() => {
	cleanup();
	vi.restoreAllMocks();
});

describe("ProjectsView guard", () => {
	it("redirects a guest to the sign-in page", async () => {
		useAuthStore.setState({ token: null, user: null, status: "guest" });
		renderProjectsView();

		expect(await screen.findByText("Iniciar sesión")).toBeTruthy();
		expect(screen.queryByRole("heading", { name: "Proyectos" })).toBeNull();
	});
});

describe("ProjectsView loading", () => {
	it("shows skeletons without cards or empty states until the list is ready", async () => {
		renderProjectsView();

		expect(await screen.findByLabelText("Cargando proyectos")).toBeTruthy();
		expect(screen.getByLabelText("Cargando indicadores")).toBeTruthy();
		expect(screen.queryByText("Aún no hay proyectos")).toBeNull();
		expect(screen.queryByText("No se encontraron proyectos")).toBeNull();
		expect(screen.queryByText("Rediseño del portal web")).toBeNull();

		await waitForGrid();

		expect(screen.queryByLabelText("Cargando proyectos")).toBeNull();
		expect(screen.getAllByRole("article")).toHaveLength(6);
		expect(screen.getByText("de 6 proyectos totales")).toBeTruthy();
	});
});

describe("ProjectsView header slot", () => {
	it("registers the search bar and the primary action in the header", async () => {
		renderProjectsView();
		await waitForGrid();

		expect(screen.getByPlaceholderText("Buscar proyectos...")).toBeTruthy();
		expect(screen.getByRole("button", { name: "Nuevo proyecto" })).toBeTruthy();
	});
});

describe("ProjectsView search and filters", () => {
	it("filters the grid live by name as the member types", async () => {
		const user = userEvent.setup();
		renderProjectsView();
		await waitForGrid();

		await user.type(screen.getByPlaceholderText("Buscar proyectos..."), "móvil");

		expect(screen.getByText("App móvil Worklyst")).toBeTruthy();
		expect(screen.queryByText("Rediseño del portal web")).toBeNull();
		expect(screen.getAllByRole("article")).toHaveLength(1);
	});

	it("keeps a single exclusive chip active and never deactivates it", async () => {
		const user = userEvent.setup();
		renderProjectsView();
		await waitForGrid();

		const favorites = screen.getByRole("button", { name: "Favoritos" });
		await user.click(favorites);

		expect(favorites.getAttribute("aria-pressed")).toBe("true");
		expect(screen.getAllByRole("article")).toHaveLength(2);

		await user.click(screen.getByRole("button", { name: "Favoritos" }));

		expect(
			screen
				.getByRole("button", { name: "Favoritos" })
				.getAttribute("aria-pressed"),
		).toBe("true");
		expect(screen.getAllByRole("article")).toHaveLength(2);
	});

	it("applies refinements live and shows the counter badge", async () => {
		const user = userEvent.setup();
		renderProjectsView();
		await waitForGrid();

		expect(screen.queryByTestId("filters-badge")).toBeNull();

		await user.click(screen.getByRole("button", { name: "Filtros" }));
		const dialog = screen.getByRole("dialog", { name: "Filtros" });

		await user.click(within(dialog).getByRole("radio", { name: "Scrum" }));

		expect(screen.getByTestId("filters-badge").textContent).toBe("1");
		expect(screen.getAllByRole("article")).toHaveLength(3);

		await user.click(within(dialog).getByRole("radio", { name: "Completado" }));

		expect(screen.getByTestId("filters-badge").textContent).toBe("2");
		expect(screen.getAllByRole("article")).toHaveLength(1);
	});

	it("combines search, chip and refinements and clears them all", async () => {
		const user = userEvent.setup();
		renderProjectsView();
		await waitForGrid();

		await user.click(screen.getByRole("button", { name: "En riesgo" }));
		await user.click(screen.getByRole("button", { name: "Filtros" }));
		const dialog = screen.getByRole("dialog", { name: "Filtros" });
		await user.click(within(dialog).getByRole("radio", { name: "Scrum" }));
		await user.type(
			screen.getByPlaceholderText("Buscar proyectos..."),
			"Plataforma",
		);

		expect(screen.getAllByRole("article")).toHaveLength(1);
		expect(screen.getByText("Plataforma de cursos")).toBeTruthy();

		await user.click(
			within(dialog).getByRole("button", { name: "Limpiar filtros" }),
		);

		expect(screen.queryByTestId("filters-badge")).toBeNull();
		expect(
			screen.getByRole("button", { name: "Todos" }).getAttribute("aria-pressed"),
		).toBe("true");
		expect(screen.getAllByRole("article")).toHaveLength(6);
	});
});

describe("ProjectsView empty states", () => {
	it("shows the no-results state and clears the filters", async () => {
		const user = userEvent.setup();
		renderProjectsView();
		await waitForGrid();

		await user.type(
			screen.getByPlaceholderText("Buscar proyectos..."),
			"zzzz",
		);

		expect(screen.getByText("No se encontraron proyectos")).toBeTruthy();
		expect(screen.queryAllByRole("article")).toHaveLength(0);

		await user.click(
			within(screen.getByTestId("empty-results")).getByRole("button", {
				name: "Limpiar filtros",
			}),
		);

		expect(screen.queryByText("No se encontraron proyectos")).toBeNull();
		expect(screen.getAllByRole("article")).toHaveLength(6);
	});

	it("shows the empty-workspace state and opens the creation modal", async () => {
		const seeded = await projectsService.list();
		await Promise.all(seeded.map((project) => projectsService.remove(project.id)));

		const user = userEvent.setup();
		renderProjectsView();

		expect(await screen.findByText("Aún no hay proyectos")).toBeTruthy();
		expect(screen.queryAllByRole("article")).toHaveLength(0);

		await user.click(
			within(screen.getByTestId("empty-workspace")).getByRole("button", {
				name: "Nuevo proyecto",
			}),
		);

		expect(screen.getByRole("dialog", { name: "Nuevo proyecto" })).toBeTruthy();
	});
});

describe("ProjectsView mutations", () => {
	it("creates a project and recalculates the KPIs", async () => {
		const user = userEvent.setup();
		renderProjectsView();
		await waitForGrid();

		await user.click(screen.getByRole("button", { name: "Nuevo proyecto" }));
		const dialog = screen.getByRole("dialog", { name: "Nuevo proyecto" });
		await user.type(within(dialog).getByLabelText("Nombre"), "Proyecto nuevo");
		await user.click(
			within(dialog).getByRole("button", { name: "Crear proyecto" }),
		);

		expect(await screen.findByText("Proyecto nuevo")).toBeTruthy();
		expect(screen.queryByRole("dialog", { name: "Nuevo proyecto" })).toBeNull();
		expect(screen.getByText("de 7 proyectos totales")).toBeTruthy();
	});

	it("edits a project and reflects the new name", async () => {
		const user = userEvent.setup();
		renderProjectsView();
		await waitForGrid();

		const card = cardFor("Rediseño del portal web");
		await user.click(
			within(card).getByRole("button", { name: "Acciones del proyecto" }),
		);
		await user.click(screen.getByRole("menuitem", { name: "Editar" }));

		const dialog = screen.getByRole("dialog", { name: "Editar proyecto" });
		const name = within(dialog).getByLabelText("Nombre");
		await user.clear(name);
		await user.type(name, "Portal renovado");
		await user.click(
			within(dialog).getByRole("button", { name: "Guardar cambios" }),
		);

		expect(await screen.findByText("Portal renovado")).toBeTruthy();
		expect(screen.queryByText("Rediseño del portal web")).toBeNull();
	});

	it("removes an edited project that no longer matches the filter and focuses the grid", async () => {
		const user = userEvent.setup();
		renderProjectsView();
		await waitForGrid();

		await user.type(
			screen.getByPlaceholderText("Buscar proyectos..."),
			"Rediseño",
		);
		expect(screen.getAllByRole("article")).toHaveLength(1);

		const card = cardFor("Rediseño del portal web");
		await user.click(
			within(card).getByRole("button", { name: "Acciones del proyecto" }),
		);
		await user.click(screen.getByRole("menuitem", { name: "Editar" }));

		const dialog = screen.getByRole("dialog", { name: "Editar proyecto" });
		const name = within(dialog).getByLabelText("Nombre");
		await user.clear(name);
		await user.type(name, "Portal renovado");
		await user.click(
			within(dialog).getByRole("button", { name: "Guardar cambios" }),
		);

		await waitFor(() =>
			expect(screen.queryByText("Rediseño del portal web")).toBeNull(),
		);
		expect(screen.queryByText("Portal renovado")).toBeNull();
		expect(screen.queryAllByRole("article")).toHaveLength(0);
		await waitFor(() =>
			expect(document.activeElement).toBe(gridContainer()),
		);
	});

	it("archives a project after confirmation and moves the focus to the grid", async () => {
		const user = userEvent.setup();
		renderProjectsView();
		await waitForGrid();

		const card = cardFor("Migración de base de datos");
		await user.click(
			within(card).getByRole("button", { name: "Acciones del proyecto" }),
		);
		await user.click(screen.getByRole("menuitem", { name: "Archivar" }));

		const dialog = screen.getByRole("dialog", { name: "Archivar proyecto" });
		await user.click(within(dialog).getByRole("button", { name: "Archivar" }));

		await waitFor(() =>
			expect(screen.queryByText("Migración de base de datos")).toBeNull(),
		);
		expect(screen.getByText("de 5 proyectos totales")).toBeTruthy();
		await waitFor(() =>
			expect(document.activeElement).toBe(gridContainer()),
		);
	});

	it("deletes a project after confirmation and moves the focus to the grid", async () => {
		const user = userEvent.setup();
		renderProjectsView();
		await waitForGrid();

		const card = cardFor("App móvil Worklyst");
		await user.click(
			within(card).getByRole("button", { name: "Acciones del proyecto" }),
		);
		await user.click(screen.getByRole("menuitem", { name: "Eliminar" }));

		const dialog = screen.getByRole("dialog", { name: "Eliminar proyecto" });
		await user.click(within(dialog).getByRole("button", { name: "Eliminar" }));

		await waitFor(() =>
			expect(screen.queryByText("App móvil Worklyst")).toBeNull(),
		);
		expect(screen.getByText("de 5 proyectos totales")).toBeTruthy();
		await waitFor(() =>
			expect(document.activeElement).toBe(gridContainer()),
		);
	});
});

describe("ProjectsView favorite", () => {
	it("removes an unfavorited project from the Favoritos chip and focuses the grid", async () => {
		const user = userEvent.setup();
		renderProjectsView();
		await waitForGrid();

		await user.click(screen.getByRole("button", { name: "Favoritos" }));
		expect(screen.getAllByRole("article")).toHaveLength(2);

		const card = cardFor("Rediseño del portal web");
		await user.click(
			within(card).getByRole("button", { name: "Quitar de favoritos" }),
		);

		await waitFor(() =>
			expect(screen.queryByText("Rediseño del portal web")).toBeNull(),
		);
		expect(screen.getAllByRole("article")).toHaveLength(1);
		await waitFor(() =>
			expect(document.activeElement).toBe(gridContainer()),
		);
	});

	it("keeps the favorite unchanged and shows a friendly error when the service fails", async () => {
		const user = userEvent.setup();
		renderProjectsView();
		await waitForGrid();

		// El proyecto desaparece del servicio pero la tarjeta sigue en la vista.
		await projectsService.remove("p1");

		const card = cardFor("Rediseño del portal web");
		await user.click(
			within(card).getByRole("button", { name: "Quitar de favoritos" }),
		);

		expect(await screen.findByText("Proyecto no encontrado")).toBeTruthy();
		expect(
			within(cardFor("Rediseño del portal web")).getByRole("button", {
				name: "Quitar de favoritos",
			}),
		).toBeTruthy();
	});
});
