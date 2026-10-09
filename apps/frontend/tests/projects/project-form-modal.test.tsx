import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ProjectFormModal } from "#/components/projects/project-form-modal";
import type { Project, ProjectFormValues } from "#/lib/projects/types";

function makeProject(overrides: Partial<Project> = {}): Project {
	return {
		id: "p1",
		name: "Plataforma de pagos",
		description: "Integración del checkout",
		template: "scrum",
		phase: "Sprint 4",
		status: "activo",
		progress: 40,
		members: ["Ada Lovelace"],
		favorite: false,
		createdAt: "2026-01-01",
		dueDate: null,
		...overrides,
	};
}

interface ModalProps {
	open?: boolean;
	mode?: "create" | "edit";
	project?: Project | null;
	pending?: boolean;
	error?: string | null;
	onSubmit?: (values: ProjectFormValues) => void;
	onClose?: () => void;
}

function renderModal(props: ModalProps = {}) {
	const onSubmit = props.onSubmit ?? vi.fn();
	const onClose = props.onClose ?? vi.fn();
	render(
		<ProjectFormModal
			open={props.open ?? true}
			mode={props.mode ?? "create"}
			project={props.project ?? null}
			pending={props.pending ?? false}
			error={props.error ?? null}
			onSubmit={onSubmit}
			onClose={onClose}
		/>,
	);
	return { onSubmit, onClose };
}

function nameInput() {
	return screen.getByLabelText("Nombre") as HTMLInputElement;
}

function descriptionInput() {
	return screen.getByLabelText("Descripción") as HTMLTextAreaElement;
}

afterEach(() => {
	cleanup();
	vi.restoreAllMocks();
});

describe("ProjectFormModal modes", () => {
	it("renders the create mode with an empty Kanban form", () => {
		renderModal();

		expect(screen.getByRole("dialog", { name: "Nuevo proyecto" })).toBeTruthy();
		expect(screen.getByRole("button", { name: "Crear proyecto" })).toBeTruthy();
		expect(nameInput().value).toBe("");
		expect(descriptionInput().value).toBe("");
		expect(
			(screen.getByRole("radio", { name: "Kanban" }) as HTMLInputElement).checked,
		).toBe(true);
		expect(
			(screen.getByRole("radio", { name: "Scrum" }) as HTMLInputElement).checked,
		).toBe(false);
	});

	it("renders the edit mode prefilled with the project values", () => {
		renderModal({ mode: "edit", project: makeProject() });

		expect(
			screen.getByRole("dialog", { name: "Editar proyecto" }),
		).toBeTruthy();
		expect(screen.getByRole("button", { name: "Guardar cambios" })).toBeTruthy();
		expect(nameInput().value).toBe("Plataforma de pagos");
		expect(descriptionInput().value).toBe("Integración del checkout");
		expect(
			(screen.getByRole("radio", { name: "Scrum" }) as HTMLInputElement).checked,
		).toBe(true);
	});
});

describe("ProjectFormModal validation", () => {
	it("disables the submit while the name is empty", () => {
		renderModal();

		expect(
			(screen.getByRole("button", { name: "Crear proyecto" }) as HTMLButtonElement)
				.disabled,
		).toBe(true);
	});

	it("shows the required error and keeps the submit disabled with only spaces", async () => {
		const user = userEvent.setup();
		renderModal();

		await user.type(nameInput(), "   ");

		expect(screen.getByText("El nombre es obligatorio")).toBeTruthy();
		expect(
			(screen.getByRole("button", { name: "Crear proyecto" }) as HTMLButtonElement)
				.disabled,
		).toBe(true);
	});

	it("enables the submit once the name has content", async () => {
		const user = userEvent.setup();
		renderModal();

		await user.type(nameInput(), "Nuevo proyecto");

		expect(screen.queryByText("El nombre es obligatorio")).toBeNull();
		expect(
			(screen.getByRole("button", { name: "Crear proyecto" }) as HTMLButtonElement)
				.disabled,
		).toBe(false);
	});
});

describe("ProjectFormModal submission", () => {
	it("submits the typed values with the chosen template", async () => {
		const user = userEvent.setup();
		const { onSubmit } = renderModal();

		await user.type(nameInput(), "Nuevo proyecto");
		await user.type(descriptionInput(), "Detalles del proyecto");
		await user.click(screen.getByRole("radio", { name: "Scrum" }));
		await user.click(screen.getByRole("button", { name: "Crear proyecto" }));

		expect(onSubmit).toHaveBeenCalledWith({
			name: "Nuevo proyecto",
			description: "Detalles del proyecto",
			template: "scrum",
		});
	});

	it("does not submit an empty form", async () => {
		const user = userEvent.setup();
		const { onSubmit } = renderModal();

		await user.click(screen.getByRole("button", { name: "Crear proyecto" }));

		expect(onSubmit).not.toHaveBeenCalled();
	});
});

describe("ProjectFormModal closing", () => {
	it("closes with Escape", async () => {
		const user = userEvent.setup();
		const { onClose } = renderModal();

		await user.keyboard("{Escape}");

		expect(onClose).toHaveBeenCalledTimes(1);
	});

	it("closes with the Cancel button", async () => {
		const user = userEvent.setup();
		const { onClose } = renderModal();

		await user.click(screen.getByRole("button", { name: "Cancelar" }));

		expect(onClose).toHaveBeenCalledTimes(1);
	});

	it("closes with the overlay", async () => {
		const user = userEvent.setup();
		const { onClose } = renderModal();

		await user.click(screen.getByTestId("project-form-overlay"));

		expect(onClose).toHaveBeenCalledTimes(1);
	});
});

describe("ProjectFormModal accessibility", () => {
	it("moves the focus to the first field on open", async () => {
		renderModal();

		await waitFor(() => expect(document.activeElement).toBe(nameInput()));
	});

	it("traps Tab and Shift+Tab inside the modal", async () => {
		const user = userEvent.setup();
		renderModal();

		await user.type(nameInput(), "Proyecto");
		const first = nameInput();
		const last = screen.getByRole("button", { name: "Crear proyecto" });
		await waitFor(() => expect(document.activeElement).toBe(first));

		await user.keyboard("{Shift>}{Tab}{/Shift}");
		expect(document.activeElement).toBe(last);

		await user.keyboard("{Tab}");
		expect(document.activeElement).toBe(first);
	});

	it("returns the focus to the trigger when it closes", async () => {
		const user = userEvent.setup();

		function Harness() {
			const [open, setOpen] = useState(false);
			return (
				<>
					<button type="button" onClick={() => setOpen(true)}>
						Abrir modal
					</button>
					<ProjectFormModal
						open={open}
						mode="create"
						pending={false}
						error={null}
						onSubmit={() => {}}
						onClose={() => setOpen(false)}
					/>
				</>
			);
		}

		render(<Harness />);
		const trigger = screen.getByRole("button", { name: "Abrir modal" });

		await user.click(trigger);
		await screen.findByRole("dialog", { name: "Nuevo proyecto" });
		await user.keyboard("{Escape}");

		await waitFor(() =>
			expect(screen.queryByRole("dialog", { name: "Nuevo proyecto" })).toBeNull(),
		);
		expect(document.activeElement).toBe(trigger);
	});
});

describe("ProjectFormModal service error and loading", () => {
	it("keeps the written values and shows the service error", async () => {
		const user = userEvent.setup();

		function Harness() {
			const [error, setError] = useState<string | null>(null);
			return (
				<ProjectFormModal
					open
					mode="create"
					pending={false}
					error={error}
					onSubmit={() => setError("No se pudo guardar el proyecto")}
					onClose={() => {}}
				/>
			);
		}

		render(<Harness />);
		await user.type(nameInput(), "Mi proyecto");
		await user.type(descriptionInput(), "Detalles");
		await user.click(screen.getByRole("button", { name: "Crear proyecto" }));

		expect(screen.getByRole("alert").textContent).toContain(
			"No se pudo guardar el proyecto",
		);
		expect(nameInput().value).toBe("Mi proyecto");
		expect(descriptionInput().value).toBe("Detalles");
	});

	it("disables the submit and avoids double submission while pending", async () => {
		const user = userEvent.setup();
		const onSubmit = vi.fn();

		function Harness() {
			const [pending, setPending] = useState(false);
			return (
				<ProjectFormModal
					open
					mode="create"
					pending={pending}
					error={null}
					onSubmit={(values) => {
						onSubmit(values);
						setPending(true);
					}}
					onClose={() => {}}
				/>
			);
		}

		render(<Harness />);
		await user.type(nameInput(), "Proyecto");
		await user.click(screen.getByRole("button", { name: "Crear proyecto" }));

		expect(onSubmit).toHaveBeenCalledTimes(1);
		const submit = screen.getByRole("button", {
			name: "Guardando...",
		}) as HTMLButtonElement;
		expect(submit.disabled).toBe(true);

		await user.click(submit);
		expect(onSubmit).toHaveBeenCalledTimes(1);
	});
});
