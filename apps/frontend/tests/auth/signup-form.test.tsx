import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { SignupForm } from "#/components/auth/signup-form";
import { authService } from "#/lib/auth/auth-api";
import { resetAuthMock } from "#/lib/auth/auth-mock";
import { AuthError } from "#/lib/auth/types";
import { SESSION_TOKEN_KEY, useAuthStore } from "#/stores/auth-store";

const VALID_REGISTER = {
	fullName: "Ada Lovelace",
	email: "ada@worklyst.com",
	password: "Password1!",
};

function submitButton(): HTMLButtonElement {
	return screen.getByRole("button", {
		name: "Crear cuenta de Worklyst",
	}) as HTMLButtonElement;
}

async function fillValidForm(user: ReturnType<typeof userEvent.setup>) {
	await user.type(screen.getByLabelText("Nombre Completo"), VALID_REGISTER.fullName);
	await user.type(
		screen.getByLabelText("Correo Electrónico de Trabajo"),
		VALID_REGISTER.email,
	);
	await user.type(
		screen.getByLabelText("Contraseña Segura"),
		VALID_REGISTER.password,
	);
}

beforeEach(() => {
	resetAuthMock();
	localStorage.clear();
	useAuthStore.setState({ token: null, user: null, status: "guest" });
});

afterEach(() => {
	cleanup();
	vi.restoreAllMocks();
});

describe("SignupForm", () => {
	it("renders the social buttons disabled with the coming-soon note", () => {
		render(<SignupForm />);

		expect(
			(screen.getByRole("button", { name: /google/i }) as HTMLButtonElement)
				.disabled,
		).toBe(true);
		expect(
			(screen.getByRole("button", { name: /github/i }) as HTMLButtonElement)
				.disabled,
		).toBe(true);
		expect(screen.getByText("Próximamente")).toBeTruthy();
	});

	it("keeps the submit blocked until the password rules are met", async () => {
		const user = userEvent.setup();
		const register = vi.spyOn(authService, "register");
		render(<SignupForm />);

		await user.type(
			screen.getByLabelText("Nombre Completo"),
			VALID_REGISTER.fullName,
		);
		await user.type(
			screen.getByLabelText("Correo Electrónico de Trabajo"),
			VALID_REGISTER.email,
		);
		await user.type(screen.getByLabelText("Contraseña Segura"), "weak");

		expect(submitButton().disabled).toBe(true);
		await user.click(submitButton());
		expect(register).not.toHaveBeenCalled();

		await user.clear(screen.getByLabelText("Contraseña Segura"));
		await user.type(
			screen.getByLabelText("Contraseña Segura"),
			VALID_REGISTER.password,
		);

		expect(submitButton().disabled).toBe(false);
	});

	it("registers and chains the login through the store", async () => {
		const user = userEvent.setup();
		const register = vi.spyOn(authService, "register").mockResolvedValue({
			id: "9",
			email: VALID_REGISTER.email,
			nombre: VALID_REGISTER.fullName,
		});
		const login = vi.spyOn(authService, "login").mockResolvedValue({
			token: "session-token",
			user: { id: "9", email: VALID_REGISTER.email },
		});
		render(<SignupForm />);

		await fillValidForm(user);
		await user.click(submitButton());

		await waitFor(() => {
			expect(register).toHaveBeenCalledWith({
				fullName: VALID_REGISTER.fullName,
				email: VALID_REGISTER.email,
				password: VALID_REGISTER.password,
			});
			expect(login).toHaveBeenCalledWith({
				email: VALID_REGISTER.email,
				password: VALID_REGISTER.password,
			});
		});
	});

	it("shows the duplicate-email error next to the email field", async () => {
		const user = userEvent.setup();
		vi.spyOn(authService, "register").mockRejectedValue(
			new AuthError("duplicate_email", "El usuario ya existe", 400),
		);
		const login = vi.spyOn(authService, "login");
		render(<SignupForm />);

		await fillValidForm(user);
		await user.click(submitButton());

		expect(await screen.findByText("El usuario ya existe")).toBeTruthy();
		expect(screen.queryByRole("alert")).toBeNull();
		expect(login).not.toHaveBeenCalled();
	});

	it("shows a general banner when the backend reports missing fields", async () => {
		const user = userEvent.setup();
		const message = "Todos los campos son obligatorios";
		vi.spyOn(authService, "register").mockRejectedValue(
			new AuthError("missing_fields", message, 400),
		);
		render(<SignupForm />);

		await fillValidForm(user);
		await user.click(submitButton());

		const alert = await screen.findByRole("alert");
		expect(alert.textContent).toContain(message);
	});

	it("keeps the submit disabled until the email has an at sign", async () => {
		const user = userEvent.setup();
		render(<SignupForm />);

		expect(submitButton().disabled).toBe(true);

		await user.type(
			screen.getByLabelText("Nombre Completo"),
			VALID_REGISTER.fullName,
		);
		await user.type(
			screen.getByLabelText("Correo Electrónico de Trabajo"),
			"ada.worklyst.com",
		);
		await user.type(
			screen.getByLabelText("Contraseña Segura"),
			VALID_REGISTER.password,
		);

		expect(screen.getByText("Ingresa un correo electrónico válido")).toBeTruthy();
		expect(submitButton().disabled).toBe(true);
	});

	it("shows a friendly banner when the chained login fails after registering", async () => {
		const user = userEvent.setup();
		vi.spyOn(authService, "register").mockResolvedValue({
			id: "9",
			email: VALID_REGISTER.email,
			nombre: VALID_REGISTER.fullName,
		});
		vi.spyOn(authService, "login").mockRejectedValue(
			new AuthError("network", "sin conexión", 0),
		);
		render(<SignupForm />);

		await fillValidForm(user);
		await user.click(submitButton());

		const alert = await screen.findByRole("alert");
		expect(alert.textContent).toContain("Tu cuenta se creó");
		expect(useAuthStore.getState().status).toBe("guest");
		expect(localStorage.getItem(SESSION_TOKEN_KEY)).toBeNull();
	});

	it("shows a friendly generic banner for an unexpected registration failure", async () => {
		const user = userEvent.setup();
		vi.spyOn(authService, "register").mockRejectedValue(new Error("boom"));
		render(<SignupForm />);

		await fillValidForm(user);
		await user.click(submitButton());

		const alert = await screen.findByRole("alert");
		expect(alert.textContent).toBeTruthy();
		expect(alert.textContent).not.toContain("boom");
	});

	it("shows a friendly generic banner for an uncovered AuthError code", async () => {
		const user = userEvent.setup();
		vi.spyOn(authService, "register").mockRejectedValue(
			new AuthError("api_key", "detalle interno", 403),
		);
		render(<SignupForm />);

		await fillValidForm(user);
		await user.click(submitButton());

		const alert = await screen.findByRole("alert");
		expect(alert.textContent).toBeTruthy();
		expect(alert.textContent).not.toContain("detalle interno");
	});
});
