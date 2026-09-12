/**
 * Tipos de Datos (Interfaces)
 */

export interface StatItem {
	id: string;
	title: string;
	count: string;
	iconName: string;
	subtitle: string;
	variant: "default" | "success" | "warning" | "danger";
	barPercent?: number;
}

export interface TaskItem {
	id: string;
	title: string;
	dueDate: string;
	priority: "URGENTE" | "MEDIA" | "BAJA" | "ALTA";
	assignee: string;
	assigneeColor: string;
}

export interface ProjectItem {
	id: string;
	title: string;
	statusText: string;
	progress: number;
	membersCount: number;
	sprintLabel?: string;
}

export interface ActivityItem {
	id: string;
	user: string;
	userInitial: string;
	userColor: string;
	action: string;
	timeAgo: string;
}

/**
 * Mocks de datos simulados
 */

export const STATS_MOCK: StatItem[] = [
	{
		id: "1",
		title: "PROYECTOS",
		count: "12",
		iconName: "Folder",
		subtitle: "+2 nuevos este mes",
		variant: "default",
	},
	{
		id: "2",
		title: "COMPLETADOS",
		count: "48",
		iconName: "CheckCircle2",
		subtitle: "85% tasa de éxito",
		variant: "success",
	},
	{
		id: "3",
		title: "EN TIEMPO",
		count: "92%",
		iconName: "Clock",
		subtitle: "+4% vs sprint anterior",
		variant: "default",
		barPercent: 92,
	},
	{
		id: "4",
		title: "PENDIENTES",
		count: "07",
		iconName: "AlertTriangle",
		subtitle: "¡2 requieren atención hoy!",
		variant: "danger",
	},
];

export const TASKS_MOCK: TaskItem[] = [
	{
		id: "1",
		title: "Revisar arquitectura API",
		dueDate: "Hoy, 14:00 PM",
		priority: "URGENTE",
		assignee: "OR",
		assigneeColor: "bg-primary-500",
	},
	{
		id: "2",
		title: "Feedback de diseño UI",
		dueDate: "Mañana, 10:00 AM",
		priority: "MEDIA",
		assignee: "SR",
		assigneeColor: "bg-emerald-500",
	},
	{
		id: "3",
		title: "Refactorización de componentes de navegación",
		dueDate: "24 Oct",
		priority: "MEDIA",
		assignee: "JD",
		assigneeColor: "bg-amber-500",
	},
	{
		id: "4",
		title: "Pruebas de estrés y seguridad en endpoints",
		dueDate: "26 Oct",
		priority: "ALTA",
		assignee: "MV",
		assigneeColor: "bg-rose-500",
	},
];

export const PROJECTS_MOCK: ProjectItem[] = [
	{
		id: "1",
		title: "Fintech App",
		statusText: "8 de 12 tareas completadas",
		progress: 66,
		membersCount: 2,
		sprintLabel: "Sprint 4",
	},
	{
		id: "2",
		title: "E-commerce 2.0",
		statusText: "2 tareas restantes",
		progress: 90,
		membersCount: 4,
		sprintLabel: "Final",
	},
	{
		id: "3",
		title: "Migración Cloud",
		statusText: "Planeación inicial",
		progress: 15,
		membersCount: 1,
	},
];

export const ACTIVITY_MOCK: ActivityItem[] = [
	{
		id: "1",
		user: "Carlos",
		userInitial: "C",
		userColor: "bg-primary-500",
		action: "subió un nuevo diseño UI para el módulo de checkout.",
		timeAgo: "Hace 12 min",
	},
	{
		id: "2",
		user: "Sofía",
		userInitial: "S",
		userColor: "bg-emerald-500",
		action: "comentó en la tarea de autenticación biométrica.",
		timeAgo: "Hace 45 min",
	},
	{
		id: "3",
		user: "Marcos",
		userInitial: "M",
		userColor: "bg-amber-500",
		action: "actualizó los despliegues en el entorno staging.",
		timeAgo: "Hace 2 horas",
	},
];
