import { api, toAuthError } from "#/lib/api";
import { authMock } from "#/lib/auth/auth-mock";
import type {
	AuthUser,
	Credentials,
	RegisterData,
	Session,
} from "#/lib/auth/types";

export interface AuthService {
	register(data: RegisterData): Promise<AuthUser>;
	login(credentials: Credentials): Promise<Session>;
	logout(token: string): Promise<void>;
}

interface BackendUser {
	id: string;
	nombre: string;
	email: string;
}

interface RegisterResponse {
	mensaje?: string;
	usuario: BackendUser;
}

interface LoginResponse {
	mensaje?: string;
	sessionToken: string;
	usuario: BackendUser;
}

function toAuthUser(usuario: BackendUser): AuthUser {
	return { id: usuario.id, nombre: usuario.nombre, email: usuario.email };
}

export const authApi: AuthService = {
	async register(data: RegisterData): Promise<AuthUser> {
		try {
			const response = await api.post<RegisterResponse>("/api/auth/register", {
				// El backend espera `usuario`, no `fullName`.
				usuario: data.fullName,
				email: data.email,
				password: data.password,
			});
			return toAuthUser(response.data.usuario);
		} catch (error) {
			throw toAuthError(error);
		}
	},

	async login(credentials: Credentials): Promise<Session> {
		try {
			const response = await api.post<LoginResponse>(
				"/api/auth/login",
				credentials,
			);
			// El backend devuelve `sessionToken`; la sesión lo expone como `token`.
			return {
				token: response.data.sessionToken,
				user: toAuthUser(response.data.usuario),
			};
		} catch (error) {
			throw toAuthError(error);
		}
	},

	async logout(token: string): Promise<void> {
		try {
			await api.post("/api/auth/logout", { sessionToken: token });
		} catch (error) {
			throw toAuthError(error);
		}
	},
};

/** Único punto que conoce el modo; default `mock` salvo `api`/`real`. */
export function getAuthService(): AuthService {
	const mode = import.meta.env.VITE_API_MODE;
	return mode === "api" || mode === "real" ? authApi : authMock;
}

export const authService: AuthService = getAuthService();
