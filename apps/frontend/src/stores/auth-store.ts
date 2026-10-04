import { create } from "zustand";

import { authService } from "#/lib/auth/auth-api";
import { isTokenValid, readTokenClaims, sanitizeText } from "#/lib/auth/token";
import type { AuthUser, Credentials, RegisterData } from "#/lib/auth/types";

export const SESSION_TOKEN_KEY = "worklyst.session-token";

/** La cuenta se creó, pero el login encadenado no pudo abrir sesión. */
export class RegisterSessionError extends Error {
	constructor() {
		super("No se pudo iniciar sesión tras crear la cuenta.");
		this.name = "RegisterSessionError";
	}
}

export type AuthStatus = "guest" | "loading" | "authenticated";

interface AuthState {
	token: string | null;
	user: AuthUser | null;
	status: AuthStatus;
	login: (credentials: Credentials) => Promise<void>;
	register: (data: RegisterData) => Promise<void>;
	logout: () => Promise<void>;
	restoreSession: () => Promise<void>;
}

function readStoredToken(): string | null {
	return globalThis.localStorage?.getItem(SESSION_TOKEN_KEY) ?? null;
}

function persistToken(token: string): void {
	globalThis.localStorage?.setItem(SESSION_TOKEN_KEY, token);
}

function clearToken(): void {
	globalThis.localStorage?.removeItem(SESSION_TOKEN_KEY);
}

export const useAuthStore = create<AuthState>((set, get) => ({
	token: null,
	user: null,
	status: "guest",

	async login(credentials) {
		set({ status: "loading" });
		try {
			const session = await authService.login({
				email: sanitizeText(credentials.email),
				password: credentials.password,
			});
			persistToken(session.token);
			set({
				token: session.token,
				user: session.user,
				status: "authenticated",
			});
		} catch (error) {
			set({ status: "guest" });
			throw error;
		}
	},

	async register(data) {
		set({ status: "loading" });
		const email = sanitizeText(data.email);
		try {
			await authService.register({
				fullName: sanitizeText(data.fullName),
				email,
				password: data.password,
			});
		} catch (error) {
			set({ status: "guest" });
			throw error;
		}

		try {
			// El backend no inicia sesión al registrar: se encadena el login.
			const session = await authService.login({
				email,
				password: data.password,
			});
			persistToken(session.token);
			set({
				token: session.token,
				user: session.user,
				status: "authenticated",
			});
		} catch {
			set({ status: "guest" });
			throw new RegisterSessionError();
		}
	},

	async logout() {
		const { token } = get();
		try {
			if (token) {
				await authService.logout(token);
			}
		} catch {
			// Local-autoritativo: el cierre local se aplica aunque falle el aviso.
		}
		clearToken();
		set({ token: null, user: null, status: "guest" });
	},

	async restoreSession() {
		set({ status: "loading" });
		const token = readStoredToken();
		if (!token || !isTokenValid(token, new Date())) {
			clearToken();
			set({ token: null, user: null, status: "guest" });
			return;
		}

		const claims = readTokenClaims(token);
		if (!claims) {
			clearToken();
			set({ token: null, user: null, status: "guest" });
			return;
		}

		set({
			token,
			user: { id: claims.id, email: claims.email },
			status: "authenticated",
		});
	},
}));
