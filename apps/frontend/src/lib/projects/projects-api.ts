/** Contrato del servicio de proyectos, adaptador axios y fábrica por modo. */
import { api } from "#/lib/api";
import { projectsMock } from "#/lib/projects/projects-mock";
import {
	type CreateProjectInput,
	type EditProjectInput,
	type Project,
	ProjectsError,
	type ProjectTemplate,
} from "#/lib/projects/types";

/** Operaciones de proyectos que consumen la vista y el hook. */
export interface ProjectsService {
	list(): Promise<Project[]>;
	create(input: CreateProjectInput): Promise<Project>;
	update(id: string, values: EditProjectInput): Promise<Project>;
	archive(id: string): Promise<Project>;
	remove(id: string): Promise<void>;
	setFavorite(id: string, favorite: boolean): Promise<Project>;
}

/** Miembro tal como viaja en el contrato REST. */
export interface BackendMember {
	id: string;
	name: string;
}

/** Proyecto en formato del contrato REST (incluye `archived`). */
export interface BackendProject {
	id: string;
	name: string;
	description: string;
	template: ProjectTemplate;
	phase: string;
	status: "activo" | "en_riesgo" | "completado";
	progress: number;
	favorite: boolean;
	archived: boolean;
	createdAt: string;
	dueDate: string | null;
	members: BackendMember[];
}

interface ProjectsListResponse {
	projects: BackendProject[];
}

interface ProjectResponse {
	project: BackendProject;
}

/** Traduce el contrato al modelo de UI; compartido con el adaptador mock. */
export function toUiProject(project: BackendProject): Project {
	return {
		id: project.id,
		name: project.name,
		description: project.description,
		template: project.template,
		phase: project.phase,
		status: project.status === "en_riesgo" ? "en riesgo" : project.status,
		progress: project.progress,
		members: project.members.map((member) => member.name),
		favorite: project.favorite,
		createdAt: project.createdAt,
		dueDate: project.dueDate,
	};
}

/** Forma mínima de un AxiosError que nos interesa aquí. */
interface ErrorLike {
	isAxiosError?: boolean;
	response?: { status?: number; data?: { mensaje?: unknown } };
	request?: unknown;
}

function getBackendMessage(data: unknown): string | null {
	if (typeof data !== "object" || data === null) {
		return null;
	}
	const { mensaje } = data as { mensaje?: unknown };
	return typeof mensaje === "string" && mensaje.length > 0 ? mensaje : null;
}

const NETWORK_MESSAGE =
	"No pudimos conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.";
const UNKNOWN_MESSAGE = "Algo salió mal. Inténtalo de nuevo más tarde.";
const MISSING_NAME_MESSAGE = "El nombre del proyecto es obligatorio";
const NOT_FOUND_MESSAGE = "Proyecto no encontrado";
const SESSION_MESSAGE = "Tu sesión no es válida. Inicia sesión de nuevo.";

/** Traduce cualquier error del cliente a `ProjectsError` normalizado. */
export function toProjectsError(error: unknown): ProjectsError {
	if (error instanceof ProjectsError) {
		return error;
	}

	const candidate = error as ErrorLike;

	// Error de red: petición sin respuesta del servidor (tiene `request`).
	if (
		candidate?.response === undefined &&
		(candidate.isAxiosError === true || candidate.request !== undefined)
	) {
		return new ProjectsError("network", NETWORK_MESSAGE, 0);
	}

	if (candidate?.response === undefined) {
		return new ProjectsError("unknown", UNKNOWN_MESSAGE, 0);
	}

	const status = candidate.response.status ?? 0;
	const backendMessage = getBackendMessage(candidate.response.data);

	if (status === 400) {
		return new ProjectsError(
			"missing_name",
			backendMessage ?? MISSING_NAME_MESSAGE,
			400,
		);
	}

	if (status === 404) {
		return new ProjectsError(
			"not_found",
			backendMessage ?? NOT_FOUND_MESSAGE,
			404,
		);
	}

	if (status === 401) {
		return new ProjectsError("session", backendMessage ?? SESSION_MESSAGE, 401);
	}

	if (status === 403) {
		// El detalle técnico de la API Key nunca se expone al usuario.
		return new ProjectsError("api_key", UNKNOWN_MESSAGE, 403);
	}

	return new ProjectsError("unknown", UNKNOWN_MESSAGE, status);
}

/** Adaptador axios contra el contrato REST de proyectos. */
export const projectsApi: ProjectsService = {
	async list(): Promise<Project[]> {
		try {
			const response = await api.get<ProjectsListResponse>("/api/projects");
			return response.data.projects.map(toUiProject);
		} catch (error) {
			throw toProjectsError(error);
		}
	},

	async create(input: CreateProjectInput): Promise<Project> {
		try {
			const response = await api.post<ProjectResponse>("/api/projects", {
				name: input.name,
				description: input.description,
				template: input.template,
				member: { name: input.memberName },
			});
			return toUiProject(response.data.project);
		} catch (error) {
			throw toProjectsError(error);
		}
	},

	async update(id: string, values: EditProjectInput): Promise<Project> {
		try {
			const response = await api.put<ProjectResponse>(`/api/projects/${id}`, {
				name: values.name,
				description: values.description,
				template: values.template,
			});
			return toUiProject(response.data.project);
		} catch (error) {
			throw toProjectsError(error);
		}
	},

	async archive(id: string): Promise<Project> {
		try {
			const response = await api.patch<ProjectResponse>(`/api/projects/${id}`, {
				archived: true,
			});
			return toUiProject(response.data.project);
		} catch (error) {
			throw toProjectsError(error);
		}
	},

	async remove(id: string): Promise<void> {
		try {
			await api.delete(`/api/projects/${id}`);
		} catch (error) {
			throw toProjectsError(error);
		}
	},

	async setFavorite(id: string, favorite: boolean): Promise<Project> {
		try {
			const response = await api.patch<ProjectResponse>(`/api/projects/${id}`, {
				favorite,
			});
			return toUiProject(response.data.project);
		} catch (error) {
			throw toProjectsError(error);
		}
	},
};

/** Único punto que conoce el modo; default `mock` salvo `api`/`real`. */
export function getProjectsService(): ProjectsService {
	const mode = import.meta.env.VITE_API_MODE;
	return mode === "api" || mode === "real" ? projectsApi : projectsMock;
}

export const projectsService: ProjectsService = getProjectsService();
