/** Tipos compartidos del módulo de proyectos. */

/** Estado normalizado del proyecto ya traducido al modelo de UI. */
export type ProjectStatus = "activo" | "en riesgo" | "completado";

/** Plantilla del proyecto. */
export type ProjectTemplate = "kanban" | "scrum";

/** Proyecto en su modelo de UI: sin `archived` ni formato del contrato. */
export interface Project {
	id: string;
	name: string;
	description: string;
	template: ProjectTemplate;
	phase: string;
	status: ProjectStatus;
	progress: number;
	members: string[];
	favorite: boolean;
	createdAt: string;
	dueDate: string | null;
}

/** Filtro rápido de la sección «Espacio de trabajo». */
export type ProjectChip = "todos" | "favoritos" | "nuevos" | "en_riesgo";

/** Refinamiento por tipo. */
export type ProjectTypeFilter = "todos" | ProjectTemplate;

/** Refinamiento por estado. */
export type ProjectStatusFilter = "todos" | ProjectStatus;

/** Estado completo de los filtros de la vista. */
export interface ProjectFilters {
	search: string;
	chip: ProjectChip;
	type: ProjectTypeFilter;
	status: ProjectStatusFilter;
}

/** KPIs del espacio de trabajo, siempre sobre la lista completa. */
export interface WorkspaceStats {
	total: number;
	activos: number;
	enRiesgo: number;
	vencenPronto: number;
	completados: number;
}

/** Valores del formulario del modal de crear/editar. */
export interface ProjectFormValues {
	name: string;
	description: string;
	template: ProjectTemplate;
}

/** Entrada del servicio para crear un proyecto (incluye el miembro inicial). */
export interface CreateProjectInput {
	name: string;
	description: string;
	template: ProjectTemplate;
	memberName: string;
}

/** Entrada del servicio para editar un proyecto. */
export interface EditProjectInput {
	name: string;
	description: string;
	template: ProjectTemplate;
}

/** Códigos de error normalizados del módulo de proyectos. */
export type ProjectsErrorCode =
	| "missing_name"
	| "not_found"
	| "session"
	| "api_key"
	| "network"
	| "unknown";

/**
 * Error normalizado del módulo. `status` es el código HTTP o 0 cuando no hubo
 * respuesta (error de red).
 */
export class ProjectsError extends Error {
	readonly code: ProjectsErrorCode;
	readonly status: number;

	constructor(code: ProjectsErrorCode, message: string, status: number) {
		super(message);
		this.name = "ProjectsError";
		this.code = code;
		this.status = status;
	}
}
