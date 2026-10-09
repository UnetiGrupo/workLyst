import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { FiltersDrawer } from "#/components/projects/filters-drawer";
import type {
	ProjectStatusFilter,
	ProjectTypeFilter,
} from "#/lib/projects/types";

function renderDrawer(
	props: {
		type?: ProjectTypeFilter;
		status?: ProjectStatusFilter;
	} = {},
) {
	const handlers = {
		onTypeChange: vi.fn(),
		onStatusChange: vi.fn(),
		onClear: vi.fn(),
		onClose: vi.fn(),
	};
	render(
		<FiltersDrawer
			open
			type={props.type ?? "todos"}
			status={props.status ?? "todos"}
			{...handlers}
		/>,
	);
	return handlers;
}

function typeGroup() {
	return within(screen.getByRole("group", { name: "Tipo" }));
}

function statusGroup() {
	return within(screen.getByRole("group", { name: "Estado" }));
}

function radio(group: ReturnType<typeof within>, name: string) {
	return group.getByRole("radio", { name }) as HTMLInputElement;
}

function ControlledDrawer() {
	const [type, setType] = useState<ProjectTypeFilter>("kanban");
	const [status, setStatus] = useState<ProjectStatusFilter>("activo");
	return (
		<FiltersDrawer
			open
			type={type}
			status={status}
			onTypeChange={setType}
			onStatusChange={setStatus}
			onClear={() => {
				setType("todos");
				setStatus("todos");
			}}
			onClose={() => {}}
		/>
	);
}

function TriggerHarness() {
	const [open, setOpen] = useState(false);
	return (
		<>
			<button type="button" onClick={() => setOpen(true)}>
				Abrir filtros
			</button>
			<FiltersDrawer
				open={open}
				type="todos"
				status="todos"
				onTypeChange={() => {}}
				onStatusChange={() => {}}
				onClear={() => {}}
				onClose={() => setOpen(false)}
			/>
		</>
	);
}

afterEach(() => {
	cleanup();
	vi.restoreAllMocks();
});

describe("FiltersDrawer groups", () => {
	it("defaults both groups to Todos", () => {
		renderDrawer();

		expect(radio(typeGroup(), "Todos").checked).toBe(true);
		expect(radio(statusGroup(), "Todos").checked).toBe(true);
	});

	it("reflects the single selected option of each group", () => {
		renderDrawer({ type: "scrum", status: "en riesgo" });

		expect(radio(typeGroup(), "Scrum").checked).toBe(true);
		expect(radio(typeGroup(), "Kanban").checked).toBe(false);
		expect(radio(statusGroup(), "En riesgo").checked).toBe(true);
		expect(radio(statusGroup(), "Completado").checked).toBe(false);
	});

	it("notifies the parent on every selection", async () => {
		const user = userEvent.setup();
		const handlers = renderDrawer();

		await user.click(radio(typeGroup(), "Kanban"));
		expect(handlers.onTypeChange).toHaveBeenCalledWith("kanban");

		await user.click(radio(statusGroup(), "Completado"));
		expect(handlers.onStatusChange).toHaveBeenCalledWith("completado");
	});

	it("clears both groups back to Todos", async () => {
		const user = userEvent.setup();
		render(<ControlledDrawer />);

		await user.click(screen.getByRole("button", { name: "Limpiar filtros" }));

		expect(radio(typeGroup(), "Todos").checked).toBe(true);
		expect(radio(statusGroup(), "Todos").checked).toBe(true);
	});
});

describe("FiltersDrawer closing", () => {
	it("closes with its close button", async () => {
		const user = userEvent.setup();
		const handlers = renderDrawer();

		await user.click(
			screen.getByRole("button", { name: "Cerrar panel de filtros" }),
		);

		expect(handlers.onClose).toHaveBeenCalledTimes(1);
	});

	it("closes with the overlay", async () => {
		const user = userEvent.setup();
		const handlers = renderDrawer();

		await user.click(screen.getByTestId("filters-overlay"));

		expect(handlers.onClose).toHaveBeenCalledTimes(1);
	});

	it("closes with Escape", async () => {
		const user = userEvent.setup();
		const handlers = renderDrawer();

		await user.keyboard("{Escape}");

		expect(handlers.onClose).toHaveBeenCalledTimes(1);
	});
});

describe("FiltersDrawer accessibility", () => {
	it("exposes a labelled dialog", () => {
		renderDrawer();

		expect(screen.getByRole("dialog", { name: "Filtros" })).toBeTruthy();
	});

	it("moves the focus to the panel on open", async () => {
		renderDrawer();
		const dialog = screen.getByRole("dialog", { name: "Filtros" });

		await waitFor(() => expect(document.activeElement).toBe(dialog));
	});

	it("traps Tab and Shift+Tab inside the panel", async () => {
		const user = userEvent.setup();
		renderDrawer();
		const dialog = screen.getByRole("dialog", { name: "Filtros" });
		const first = screen.getByRole("button", {
			name: "Cerrar panel de filtros",
		});
		const last = screen.getByRole("button", { name: "Limpiar filtros" });

		await waitFor(() => expect(document.activeElement).toBe(dialog));

		await user.keyboard("{Shift>}{Tab}{/Shift}");
		expect(document.activeElement).toBe(last);

		await user.keyboard("{Tab}");
		expect(document.activeElement).toBe(first);

		await user.keyboard("{Shift>}{Tab}{/Shift}");
		expect(document.activeElement).toBe(last);
	});

	it("returns the focus to the trigger when it closes", async () => {
		const user = userEvent.setup();
		render(<TriggerHarness />);
		const trigger = screen.getByRole("button", { name: "Abrir filtros" });

		await user.click(trigger);
		const dialog = await screen.findByRole("dialog", { name: "Filtros" });
		await waitFor(() => expect(document.activeElement).toBe(dialog));

		await user.keyboard("{Escape}");

		await waitFor(() =>
			expect(screen.queryByRole("dialog", { name: "Filtros" })).toBeNull(),
		);
		expect(document.activeElement).toBe(trigger);
	});
});
