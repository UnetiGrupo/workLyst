import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ProjectCard } from "#/components/projects/project-card";
import type { Project, ProjectStatus } from "#/lib/projects/types";

function makeProject(overrides: Partial<Project> = {}): Project {
	return {
		id: "p1",
		name: "Plataforma de pagos",
		description: "Integración del checkout",
		template: "kanban",
		phase: "Fase final",
		status: "activo",
		progress: 60,
		members: ["Ada Lovelace", "Alan Turing", "Grace Hopper"],
		favorite: false,
		createdAt: "2026-01-01",
		dueDate: null,
		...overrides,
	};
}

function setup(
	overrides: Partial<Project> = {},
	props: { favoritePending?: boolean } = {},
) {
	const handlers = {
		onToggleFavorite: vi.fn(),
		onEdit: vi.fn(),
		onArchive: vi.fn(),
		onDelete: vi.fn(),
	};
	const project = makeProject(overrides);
	render(<ProjectCard project={project} {...handlers} {...props} />);
	return { project, ...handlers };
}

afterEach(() => {
	cleanup();
	vi.restoreAllMocks();
});

describe("ProjectCard content", () => {
	it("renders the type, phase, status, name, description, members and progress", () => {
		setup();

		expect(screen.getByText("Kanban")).toBeTruthy();
		expect(screen.getByText("Fase final")).toBeTruthy();
		expect(screen.getByText("Activo")).toBeTruthy();
		expect(screen.getByText("Plataforma de pagos")).toBeTruthy();
		expect(screen.getByText("Integración del checkout")).toBeTruthy();
		expect(screen.getByText("AL")).toBeTruthy();
		expect(screen.getByText("AT")).toBeTruthy();
		expect(screen.getByText("GH")).toBeTruthy();
		expect(screen.getByText("60%")).toBeTruthy();

		const bar = screen.getByRole("progressbar");
		expect(bar.getAttribute("aria-valuenow")).toBe("60");
	});

	it("omits the description block when the description is empty", () => {
		setup({ description: "" });

		expect(screen.queryByTestId("project-description")).toBeNull();
	});

	it.each([
		["activo", "Activo", "primary"],
		["en riesgo", "En riesgo", "red"],
		["completado", "Completado", "emerald"],
	] as const)(
		"paints the %s status badge with its semantic color",
		(status: ProjectStatus, label: string, color: string) => {
			setup({ status });

			expect(screen.getByText(label).className).toContain(color);
		},
	);

	it("shows three avatars and a +N indicator for larger teams", () => {
		setup({
			members: [
				"Ada Lovelace",
				"Alan Turing",
				"Grace Hopper",
				"Linus Torvalds",
				"Margaret Hamilton",
			],
		});

		expect(screen.getByText("AL")).toBeTruthy();
		expect(screen.getByText("AT")).toBeTruthy();
		expect(screen.getByText("GH")).toBeTruthy();
		expect(screen.getByText("+2")).toBeTruthy();
		expect(screen.queryByText("LT")).toBeNull();
		expect(screen.queryByText("MH")).toBeNull();
	});
});

describe("ProjectCard progress", () => {
	it.each([
		[90, "bg-emerald-500"],
		[60, "bg-primary-500"],
		[30, "bg-amber-500"],
		[10, "bg-slate-400"],
	] as const)(
		"colors the progress bar at %i%% with the threshold color %s",
		(progress: number, color: string) => {
			setup({ progress });

			const bar = screen.getByRole("progressbar");
			expect(bar.firstElementChild?.className).toContain(color);
		},
	);
});

describe("ProjectCard favorite", () => {
	it("toggles the favorite through its callback", async () => {
		const user = userEvent.setup();
		const { onToggleFavorite, project } = setup({ favorite: false });

		await user.click(screen.getByRole("button", { name: "Añadir a favoritos" }));

		expect(onToggleFavorite).toHaveBeenCalledWith(project);
	});

	it("labels the star according to the current favorite state", () => {
		setup({ favorite: true });

		expect(
			screen.getByRole("button", { name: "Quitar de favoritos" }),
		).toBeTruthy();
	});

	it("disables the star while the favorite request is in flight", () => {
		setup({ favorite: false }, { favoritePending: true });

		const star = screen.getByRole("button", {
			name: "Añadir a favoritos",
		}) as HTMLButtonElement;
		expect(star.disabled).toBe(true);
	});
});

describe("ProjectCard actions menu", () => {
	it("opens the menu and invokes edit, archive and delete", async () => {
		const user = userEvent.setup();
		const { onEdit, onArchive, onDelete, project } = setup();

		await user.click(
			screen.getByRole("button", { name: "Acciones del proyecto" }),
		);
		await user.click(screen.getByRole("menuitem", { name: "Editar" }));
		expect(onEdit).toHaveBeenCalledWith(project);
		expect(screen.queryByRole("menu")).toBeNull();

		await user.click(
			screen.getByRole("button", { name: "Acciones del proyecto" }),
		);
		await user.click(screen.getByRole("menuitem", { name: "Archivar" }));
		expect(onArchive).toHaveBeenCalledWith(project);

		await user.click(
			screen.getByRole("button", { name: "Acciones del proyecto" }),
		);
		await user.click(screen.getByRole("menuitem", { name: "Eliminar" }));
		expect(onDelete).toHaveBeenCalledWith(project);
	});

	it("closes the menu with Escape", async () => {
		const user = userEvent.setup();
		setup();

		await user.click(
			screen.getByRole("button", { name: "Acciones del proyecto" }),
		);
		expect(screen.getByRole("menu")).toBeTruthy();

		await user.keyboard("{Escape}");

		await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());
	});

	it("closes the menu when clicking outside of it", async () => {
		const user = userEvent.setup();
		setup();

		await user.click(
			screen.getByRole("button", { name: "Acciones del proyecto" }),
		);
		expect(screen.getByRole("menu")).toBeTruthy();

		await user.click(document.body);

		await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());
	});

	it("does not trigger any action when the card body is clicked", async () => {
		const user = userEvent.setup();
		const handlers = setup();

		await user.click(screen.getByText("Plataforma de pagos"));
		await user.click(screen.getByText("Integración del checkout"));

		expect(handlers.onToggleFavorite).not.toHaveBeenCalled();
		expect(handlers.onEdit).not.toHaveBeenCalled();
		expect(handlers.onArchive).not.toHaveBeenCalled();
		expect(handlers.onDelete).not.toHaveBeenCalled();
	});
});
