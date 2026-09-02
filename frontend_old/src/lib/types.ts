import { ComponentType, ElementType } from "react";

export interface NavbarItem {
  label: string;
  href: string;
  icon?: ElementType;
}

export interface Feature {
  id?: string;
  title: string;
  description: string;
  icon: ComponentType<{ className: string }>;
  iconColor: string;
  iconBgColor: string;
}

export interface AuthForm {
  label: string;
  name: string;
  type: string;
  placeholder: string;
}

export interface User {
  id?: string;
  usuario?: string;
  email: string;
  password?: string;
  nombre?: string;
}

export interface ProjectState {
  id?: string;
  titulo: string;
  value?: number;
  color?: string;
  borderColor?: string;
  hoverBgColor?: string;
  aditionalInfo?: string;
}

export interface ProjectMember {
  id: string;
  nombre?: string;
  email?: string;
  rol?: string;
  fechaUnion?: string;
}

export interface Project {
  id?: string;
  nombre: string;
  descripcion?: string;
  estado?: "active" | "completed" | "overdue";
  creadoEn?: string;
  actualizadoEn?: string;
  miembros?: ProjectMember[];
  creadorId?: string;
  totalTareas?: number;
  tareasCompletadas?: number;
}

export interface Task {
  id?: string;
  proyecto_id?: string;
  titulo: string;
  descripcion: string;
  estado: string; // El API devuelve valores dinámicos como "pendiente", "en_progreso", etc.
  asignado_a?: string;
  fecha_limite?: string;
  creado_en?: string;
}

export interface TaskStatus {
  id: number;
  name: string;
  key: string;
  color: string;
  is_system: boolean;
}

export interface GroupMember {
  id: string;
  nombre: string;
  email: string;
  fecha_union: string;
}

export interface Group {
  id: string;
  nombre: string;
  descripcion: string;
  creador: string;
  estado: string;
  creado_en: string;
  miembros?: GroupMember[]; // Solo viene en el GET individual
}
