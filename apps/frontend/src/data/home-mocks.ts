/**
 * Tipos de Datos (Interfaces)
 */

export interface StatItem {
  id: string
  title: string
  count: string
  iconName: string
}

export interface TaskItem {
  id: string
  title: string
  dueDate: string
  priority: 'URGENTE' | 'MEDIA' | 'BAJA'
}

export interface ProjectItem {
  id: string
  title: string
  statusText: string
  iconColor: string
  membersCount: number
}

/**
 * Mocks de datos simulados
 */

export const STATS_MOCK: StatItem[] = [
  { id: '1', title: 'PROYECTOS', count: '12', iconName: 'Folder' },
  { id: '2', title: 'COMPLETADOS', count: '48', iconName: 'CheckCircle2' },
  { id: '3', title: 'TAREAS', count: '08', iconName: 'ClipboardList' },
  { id: '4', title: 'PENDIENTES', count: '08', iconName: 'Clock' },
]

export const TASKS_MOCK: TaskItem[] = [
  { id: '1', title: 'Revisar Arquitectura API', dueDate: 'Hoy, 2:00 PM', priority: 'URGENTE' },
  { id: '2', title: 'Feedback de diseño UI', dueDate: 'Mañana, 10:00 AM', priority: 'MEDIA' },
]

export const PROJECTS_MOCK: ProjectItem[] = [
  { 
    id: '1', 
    title: 'Fintech App', 
    statusText: '8 de 12 tareas completadas', 
    iconColor: 'bg-blue-100 text-blue-600', 
    membersCount: 3 
  },
  { 
    id: '2', 
    title: 'E-commerce 2.0', 
    statusText: '2 tareas restantes', 
    iconColor: 'bg-red-100 text-red-500', 
    membersCount: 3 
  },
  { 
    id: '3', 
    title: 'Migracion Cloud', 
    statusText: 'Planeacion Inicial', 
    iconColor: 'bg-slate-200 text-slate-600', 
    membersCount: 3 
  },
]