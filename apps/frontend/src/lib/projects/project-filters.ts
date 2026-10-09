import type {
	Project,
	ProjectChip,
	ProjectFilters,
	WorkspaceStats,
} from "#/lib/projects/types";

// Lógica pura del espacio de trabajo: fechas a día local, filtrado combinado y
// conteos de KPIs. Sin React y sin IO.

const MS_PER_DAY = 86_400_000;
const NEW_WINDOW_DAYS = 14;
const DUE_SOON_WINDOW_DAYS = 7;

/** Día local de `now` en formato `YYYY-MM-DD`. */
export function todayString(now: Date): string {
	const year = now.getFullYear();
	const month = String(now.getMonth() + 1).padStart(2, "0");
	const day = String(now.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
}

/**
 * Medianoche local del día `YYYY-MM-DD`. Nunca usa `new Date(string)` porque
 * lo interpretaría como UTC y desplazaría el día en zonas horarias.
 */
function localMidnight(date: string): number {
	const [year, month, day] = date.split("-").map(Number);
	return new Date(year, month - 1, day).getTime();
}

/**
 * Diferencia `to − from` en días completos entre las medianoches locales de
 * cada fecha (hoy = 0; fechas pasadas, negativo). `Math.round` absorbe la hora
 * de más o de menos de los cambios de horario.
 */
export function daysBetween(from: string, to: string): number {
	return Math.round((localMidnight(to) - localMidnight(from)) / MS_PER_DAY);
}

/** Proyecto creado hace 14 días o menos. */
export function isNew(project: Project, today: string): boolean {
	return daysBetween(project.createdAt, today) <= NEW_WINDOW_DAYS;
}

/** Proyecto no completado con fecha límite a 7 días o menos (vencidos incluidos). */
export function isDueSoon(project: Project, today: string): boolean {
	if (project.status === "completado" || !project.dueDate) {
		return false;
	}
	return daysBetween(today, project.dueDate) <= DUE_SOON_WINDOW_DAYS;
}

function matchesChip(
	project: Project,
	chip: ProjectChip,
	today: string,
): boolean {
	switch (chip) {
		case "favoritos":
			return project.favorite;
		case "nuevos":
			return isNew(project, today);
		case "en_riesgo":
			return project.status === "en riesgo";
		default:
			return true;
	}
}

/** Filtrado acumulativo: búsqueda por nombre + chip activo + refinamientos. */
export function filterProjects(
	projects: Project[],
	filters: ProjectFilters,
	today: string,
): Project[] {
	const term = filters.search.trim().toLowerCase();
	return projects.filter((project) => {
		if (term && !project.name.toLowerCase().includes(term)) {
			return false;
		}
		if (!matchesChip(project, filters.chip, today)) {
			return false;
		}
		if (filters.type !== "todos" && project.template !== filters.type) {
			return false;
		}
		if (filters.status !== "todos" && project.status !== filters.status) {
			return false;
		}
		return true;
	});
}

/** KPIs derivados de la lista completa del espacio de trabajo. */
export function countWorkspaceStats(
	projects: Project[],
	today: string,
): WorkspaceStats {
	let activos = 0;
	let enRiesgo = 0;
	let vencenPronto = 0;
	let completados = 0;

	for (const project of projects) {
		if (project.status === "activo") {
			activos += 1;
		}
		if (project.status === "en riesgo") {
			enRiesgo += 1;
		}
		if (project.status === "completado") {
			completados += 1;
		}
		if (isDueSoon(project, today)) {
			vencenPronto += 1;
		}
	}

	return {
		total: projects.length,
		activos,
		enRiesgo,
		vencenPronto,
		completados,
	};
}
