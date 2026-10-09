/**
 * Adaptador mock de proyectos: siembra en memoria en formato de contrato,
 * latencia artificial, validaciones del contrato y reset para aislar tests.
 */
import { todayString } from "#/lib/projects/project-filters";
import {
	type BackendMember,
	type BackendProject,
	type ProjectsService,
	toUiProject,
} from "#/lib/projects/projects-api";
import { ProjectsError } from "#/lib/projects/types";

/** Latencia artificial por operación, en milisegundos. */
export const MOCK_LATENCY_MS = 300;

/** Mensajes del contrato que el mock reproduce. */
const MESSAGES = {
	missingName: "El nombre del proyecto es obligatorio",
	notFound: "Proyecto no encontrado",
} as const;

/** Fase inicial según la plantilla elegida al crear. */
const DEFAULT_PHASE: Record<BackendProject["template"], string> = {
	kanban: "Planeación",
	scrum: "Sprint 1",
};

function delay(ms: number = MOCK_LATENCY_MS): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

function members(...names: string[]): BackendMember[] {
	return names.map((name, index) => ({ id: `m${index + 1}`, name }));
}

/** Fecha `YYYY-MM-DD` desplazada en días desde la medianoche local de `base`. */
function offsetDate(base: Date, days: number): string {
	return todayString(
		new Date(base.getFullYear(), base.getMonth(), base.getDate() + days),
	);
}

/** Siembra en formato de contrato con fechas relativas al reloj actual. */
function seedRecords(now: Date): BackendProject[] {
	return [
		{
			id: "p1",
			name: "Rediseño del portal web",
			description: "Renovación de la interfaz pública y del área de clientes.",
			template: "kanban",
			phase: "Fase final",
			status: "activo",
			progress: 60,
			favorite: true,
			archived: false,
			createdAt: offsetDate(now, -20),
			dueDate: offsetDate(now, 5),
			members: members("Ana Torres", "Luis Pérez"),
		},
		{
			id: "p2",
			name: "App móvil Worklyst",
			description: "Primera versión móvil para iOS y Android.",
			template: "scrum",
			phase: "Sprint 1",
			status: "activo",
			progress: 0,
			favorite: false,
			archived: false,
			createdAt: offsetDate(now, -3),
			dueDate: offsetDate(now, 30),
			members: members(
				"Ada Lovelace",
				"Grace Hopper",
				"Alan Turing",
				"Linus Torvalds",
			),
		},
		{
			id: "p3",
			name: "Migración de base de datos",
			description: "Traslado del esquema heredado al nuevo motor.",
			template: "kanban",
			phase: "Bloqueado",
			status: "en_riesgo",
			progress: 35,
			favorite: false,
			archived: false,
			createdAt: offsetDate(now, -45),
			dueDate: offsetDate(now, 2),
			members: members("Sofía Ramírez", "Diego Fernández"),
		},
		{
			id: "p4",
			name: "Plataforma de cursos",
			description: "Módulo de formación con progreso por estudiante.",
			template: "scrum",
			phase: "Sprint 4",
			status: "en_riesgo",
			progress: 70,
			favorite: true,
			archived: false,
			createdAt: offsetDate(now, -30),
			dueDate: offsetDate(now, -3),
			members: members("Marta Gómez"),
		},
		{
			id: "p5",
			name: "Sitio de documentación",
			description: "Guías y referencia pública del producto.",
			template: "kanban",
			phase: "Entregado",
			status: "completado",
			progress: 100,
			favorite: false,
			archived: false,
			createdAt: offsetDate(now, -80),
			dueDate: offsetDate(now, -12),
			members: members("Pablo Ruiz", "Elena Díaz"),
		},
		{
			id: "p6",
			name: "Dashboard de analítica",
			description: "Panel interno con métricas de uso.",
			template: "scrum",
			phase: "Entregado",
			status: "completado",
			progress: 100,
			favorite: false,
			archived: false,
			createdAt: offsetDate(now, -120),
			dueDate: null,
			members: members("Raúl Moreno"),
		},
		{
			id: "p7",
			name: "Portal de facturación",
			description:
				"Iniciativa archivada que no aparece en el espacio de trabajo.",
			template: "kanban",
			phase: "Archivado",
			status: "activo",
			progress: 20,
			favorite: false,
			archived: true,
			createdAt: offsetDate(now, -200),
			dueDate: null,
			members: members("Nadia Castro"),
		},
	];
}

let records: BackendProject[] = seedRecords(new Date());
let nextId = records.length + 1;

/** Restablece el estado en memoria; pensado para aislar tests. */
export function resetProjectsMock(): void {
	records = seedRecords(new Date());
	nextId = records.length + 1;
}

function requireRecord(id: string): BackendProject {
	const project = records.find((record) => record.id === id);
	if (!project) {
		throw new ProjectsError("not_found", MESSAGES.notFound, 404);
	}
	return project;
}

function assertName(name: string): void {
	if (name.trim().length === 0) {
		throw new ProjectsError("missing_name", MESSAGES.missingName, 400);
	}
}

export const projectsMock: ProjectsService = {
	async list() {
		await delay();
		return records.filter((record) => !record.archived).map(toUiProject);
	},

	async create(input) {
		await delay();
		assertName(input.name);

		const id = String(nextId);
		nextId += 1;

		const project: BackendProject = {
			id,
			name: input.name,
			description: input.description,
			template: input.template,
			phase: DEFAULT_PHASE[input.template],
			status: "activo",
			progress: 0,
			favorite: false,
			archived: false,
			createdAt: todayString(new Date()),
			dueDate: null,
			members: [{ id: `m${id}`, name: input.memberName }],
		};
		records.push(project);

		return toUiProject(project);
	},

	async update(id, values) {
		await delay();
		const project = requireRecord(id);
		assertName(values.name);

		project.name = values.name;
		project.description = values.description;
		project.template = values.template;

		return toUiProject(project);
	},

	async archive(id) {
		await delay();
		const project = requireRecord(id);
		project.archived = true;
		return toUiProject(project);
	},

	async remove(id) {
		await delay();
		requireRecord(id);
		records = records.filter((record) => record.id !== id);
	},

	async setFavorite(id, favorite) {
		await delay();
		const project = requireRecord(id);
		project.favorite = favorite;
		return toUiProject(project);
	},
};
