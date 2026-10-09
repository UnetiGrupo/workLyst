import type { Project, ProjectFormValues } from "#/lib/projects/types";

// Predicado compartido (botón/envío) y precarga del formulario del proyecto.

/** El formulario es enviable cuando el nombre tiene contenido tras recortar. */
export function canSubmitProjectForm(name: string): boolean {
	return name.trim().length > 0;
}

/** Valores iniciales: crear vacío con Kanban; editar, precargado del proyecto. */
export function initialProjectFormValues(project?: Project): ProjectFormValues {
	if (project) {
		return {
			name: project.name,
			description: project.description,
			template: project.template,
		};
	}
	return { name: "", description: "", template: "kanban" };
}
