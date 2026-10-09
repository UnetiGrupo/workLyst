import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ConfirmDialog } from "#/components/projects/confirm-dialog";

interface DialogProps {
	open?: boolean;
	action?: "archive" | "delete";
	projectName?: string;
	pending?: boolean;
	error?: string | null;
	onConfirm?: () => void;
	onClose?: () => void;
}

function renderDialog(props: DialogProps = {}) {
	const onConfirm = props.onConfirm ?? vi.fn();
	const onClose = props.onClose ?? vi.fn();
	render(
		<ConfirmDialog
			open={props.open ?? true}
			action={props.action ?? "archive"}
			projectName={props.projectName ?? "Plataforma de pagos"}
			pending={props.pending ?? false}
			error={props.error ?? null}
			onConfirm={onConfirm}
			onClose={onClose}
		/>,
	);
	return { onConfirm, onClose };
}

afterEach(() => {
	cleanup();
	vi.restoreAllMocks();
});

describe("ConfirmDialog content by action", () => {
	it("renders the archive copy with primary action and cancel", () => {
		renderDialog({ action: "archive" });

		expect(
			screen.getByRole("dialog", { name: "Archivar proyecto" }),
		).toBeTruthy();
		expect(
			screen.getByText(
				'"Plataforma de pagos" se quitará de tu espacio de trabajo.',
			),
		).toBeTruthy();
		const action = screen.getByRole("button", { name: "Archivar" });
		expect(action.className).not.toContain("red");
		expect(screen.getByRole("button", { name: "Cancelar" })).toBeTruthy();
	});

	it("renders the delete copy with a red danger action", () => {
		renderDialog({ action: "delete" });

		expect(screen.getByRole("dialog", { name: "Eliminar proyecto" })).toBeTruthy();
		expect(
			screen.getByText(
				'"Plataforma de pagos" se eliminará permanentemente. Esta acción no se puede deshacer.',
			),
		).toBeTruthy();
		const danger = screen.getByRole("button", { name: "Eliminar" });
		expect(danger.className).toContain("red");
		expect(screen.getByRole("button", { name: "Cancelar" })).toBeTruthy();
	});
});

describe("ConfirmDialog confirmation", () => {
	it("executes the action on confirm", async () => {
		const user = userEvent.setup();
		const { onConfirm } = renderDialog({ action: "archive" });

		await user.click(screen.getByRole("button", { name: "Archivar" }));

		expect(onConfirm).toHaveBeenCalledTimes(1);
	});

	it("does not execute on cancel", async () => {
		const user = userEvent.setup();
		const { onConfirm, onClose } = renderDialog();

		await user.click(screen.getByRole("button", { name: "Cancelar" }));

		expect(onClose).toHaveBeenCalledTimes(1);
		expect(onConfirm).not.toHaveBeenCalled();
	});

	it("does not execute with Escape", async () => {
		const user = userEvent.setup();
		const { onConfirm, onClose } = renderDialog();

		await user.keyboard("{Escape}");

		expect(onClose).toHaveBeenCalledTimes(1);
		expect(onConfirm).not.toHaveBeenCalled();
	});

	it("does not execute with the overlay", async () => {
		const user = userEvent.setup();
		const { onConfirm, onClose } = renderDialog();

		await user.click(screen.getByTestId("confirm-dialog-overlay"));

		expect(onClose).toHaveBeenCalledTimes(1);
		expect(onConfirm).not.toHaveBeenCalled();
	});
});

describe("ConfirmDialog accessibility", () => {
	it("moves the focus to the action button on open", async () => {
		renderDialog({ action: "delete" });

		await waitFor(() =>
			expect(document.activeElement).toBe(
				screen.getByRole("button", { name: "Eliminar" }),
			),
		);
	});

	it("traps Tab and Shift+Tab inside the dialog", async () => {
		const user = userEvent.setup();
		renderDialog({ action: "archive" });
		const action = screen.getByRole("button", { name: "Archivar" });
		const cancel = screen.getByRole("button", { name: "Cancelar" });

		await waitFor(() => expect(document.activeElement).toBe(action));

		await user.keyboard("{Tab}");
		expect(document.activeElement).toBe(cancel);

		await user.keyboard("{Shift>}{Tab}{/Shift}");
		expect(document.activeElement).toBe(action);
	});

	it("returns the focus to the trigger when it closes", async () => {
		const user = userEvent.setup();

		function Harness() {
			const [open, setOpen] = useState(false);
			return (
				<>
					<button type="button" onClick={() => setOpen(true)}>
						Abrir confirmación
					</button>
					<ConfirmDialog
						open={open}
						action="delete"
						projectName="Plataforma de pagos"
						pending={false}
						error={null}
						onConfirm={() => {}}
						onClose={() => setOpen(false)}
					/>
				</>
			);
		}

		render(<Harness />);
		const trigger = screen.getByRole("button", { name: "Abrir confirmación" });

		await user.click(trigger);
		await screen.findByRole("dialog", { name: "Eliminar proyecto" });
		await user.keyboard("{Escape}");

		await waitFor(() =>
			expect(
				screen.queryByRole("dialog", { name: "Eliminar proyecto" }),
			).toBeNull(),
		);
		expect(document.activeElement).toBe(trigger);
	});
});

describe("ConfirmDialog service error and loading", () => {
	it("shows the service error and allows retrying", async () => {
		const user = userEvent.setup();
		const { onConfirm } = renderDialog({
			action: "archive",
			error: "No se pudo archivar el proyecto",
		});

		expect(screen.getByRole("alert").textContent).toContain(
			"No se pudo archivar el proyecto",
		);

		await user.click(screen.getByRole("button", { name: "Archivar" }));
		expect(onConfirm).toHaveBeenCalledTimes(1);
	});

	it("disables the action and avoids double confirmation while pending", async () => {
		const user = userEvent.setup();
		const onConfirm = vi.fn();

		function Harness() {
			const [pending, setPending] = useState(false);
			return (
				<ConfirmDialog
					open
					action="delete"
					projectName="Plataforma de pagos"
					pending={pending}
					error={null}
					onConfirm={() => {
						onConfirm();
						setPending(true);
					}}
					onClose={() => {}}
				/>
			);
		}

		render(<Harness />);
		await user.click(screen.getByRole("button", { name: "Eliminar" }));

		expect(onConfirm).toHaveBeenCalledTimes(1);
		const action = screen.getByRole("button", {
			name: "Eliminando...",
		}) as HTMLButtonElement;
		expect(action.disabled).toBe(true);

		await user.click(action);
		expect(onConfirm).toHaveBeenCalledTimes(1);
	});
});
