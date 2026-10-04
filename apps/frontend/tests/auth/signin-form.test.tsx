import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { SigninForm } from "#/components/auth/signin-form";
import { authService } from "#/lib/auth/auth-api";
import { resetAuthMock } from "#/lib/auth/auth-mock";
import { AuthError } from "#/lib/auth/types";
import { useAuthStore } from "#/stores/auth-store";

function submitButton(): HTMLButtonElement {
	return screen.getByRole("button", {
		name: "Iniciar sesión",
	}) as HTMLButtonElement;
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

describe("SigninForm", () => {
	it("renders the social buttons disabled with the coming-soon note", () => {
		render(<SigninForm />);

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

	it("blocks submission while a required field is invalid", async () => {
		const user = userEvent.setup();
		const login = vi.spyOn(authService, "login");
		render(<SigninForm />);

		const email = screen.getByLabelText("Correo Electrónico");
		await user.type(email, "x");
		await user.clear(email);

		expect(screen.getByText("Este campo es requerido")).toBeTruthy();

		await user.click(submitButton());
		expect(login).not.toHaveBeenCalled();
	});

	it("submits the credentials through the store", async () => {
		const user = userEvent.setup();
		const login = vi.spyOn(authService, "login").mockResolvedValue({
			token: "session-token",
			user: { id: "1", email: "demo@worklyst.com" },
		});
		render(<SigninForm />);

		await user.type(
			screen.getByLabelText("Correo Electrónico"),
			"demo@worklyst.com",
		);
		await user.type(screen.getByLabelText("Contraseña"), "Password1!");
		await user.click(submitButton());

		await waitFor(() =>
			expect(login).toHaveBeenCalledWith({
				email: "demo@worklyst.com",
				password: "Password1!",
			}),
		);
	});

	it("shows a generic banner when the credentials are invalid", async () => {
		const user = userEvent.setup();
		vi.spyOn(authService, "login").mockRejectedValue(
			new AuthError("invalid_credentials", "Credenciales inválidas", 401),
		);
		render(<SigninForm />);

		await user.type(
			screen.getByLabelText("Correo Electrónico"),
			"demo@worklyst.com",
		);
		await user.type(screen.getByLabelText("Contraseña"), "wrong-password");
		await user.click(submitButton());

		const alert = await screen.findByRole("alert");
		expect(alert.textContent).toContain("Correo o contraseña incorrectos");
	});

	it("shows the backend message in the banner on rate limit", async () => {
		const user = userEvent.setup();
		const rateLimitMessage = "Demasiados intentos, intenta más tarde";
		vi.spyOn(authService, "login").mockRejectedValue(
			new AuthError("rate_limited", rateLimitMessage, 429),
		);
		render(<SigninForm />);

		await user.type(
			screen.getByLabelText("Correo Electrónico"),
			"demo@worklyst.com",
		);
		await user.type(screen.getByLabelText("Contraseña"), "Password1!");
		await user.click(submitButton());

		const alert = await screen.findByRole("alert");
		expect(alert.textContent).toContain(rateLimitMessage);
	});

	it("keeps the submit disabled until the email has an at sign and the password is filled", async () => {
		const user = userEvent.setup();
		render(<SigninForm />);

		expect(submitButton().disabled).toBe(true);

		await user.type(screen.getByLabelText("Correo Electrónico"), "demo");
		expect(submitButton().disabled).toBe(true);
		expect(screen.getByText("Ingresa un correo electrónico válido")).toBeTruthy();

		await user.type(screen.getByLabelText("Correo Electrónico"), "@worklyst.com");
		await user.type(screen.getByLabelText("Contraseña"), "weak");
		expect(submitButton().disabled).toBe(false);
	});

	it("shows the backend message in the banner when the backend reports missing fields", async () => {
		const user = userEvent.setup();
		const message = "Todos los campos son obligatorios";
		vi.spyOn(authService, "login").mockRejectedValue(
			new AuthError("missing_fields", message, 400),
		);
		render(<SigninForm />);

		await user.type(
			screen.getByLabelText("Correo Electrónico"),
			"demo@worklyst.com",
		);
		await user.type(screen.getByLabelText("Contraseña"), "Password1!");
		await user.click(submitButton());

		const alert = await screen.findByRole("alert");
		expect(alert.textContent).toContain(message);
		expect(alert.textContent).not.toContain("Correo o contraseña incorrectos");
	});

	it("shows a friendly generic banner when the failure is not an AuthError", async () => {
		const user = userEvent.setup();
		vi.spyOn(authService, "login").mockRejectedValue(new Error("boom"));
		render(<SigninForm />);

		await user.type(
			screen.getByLabelText("Correo Electrónico"),
			"demo@worklyst.com",
		);
		await user.type(screen.getByLabelText("Contraseña"), "Password1!");
		await user.click(submitButton());

		const alert = await screen.findByRole("alert");
		expect(alert.textContent).toBeTruthy();
		expect(alert.textContent).not.toContain("Correo o contraseña incorrectos");
	});

	it("shows a friendly generic banner for an uncovered AuthError code", async () => {
		const user = userEvent.setup();
		vi.spyOn(authService, "login").mockRejectedValue(
			new AuthError("unknown", "Algo salió mal", 500),
		);
		render(<SigninForm />);

		await user.type(
			screen.getByLabelText("Correo Electrónico"),
			"demo@worklyst.com",
		);
		await user.type(screen.getByLabelText("Contraseña"), "Password1!");
		await user.click(submitButton());

		const alert = await screen.findByRole("alert");
		expect(alert.textContent).toBeTruthy();
		expect(alert.textContent).not.toContain("Correo o contraseña incorrectos");
	});
});
