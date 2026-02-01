import { ProjectInputProps } from "@/components/projects/ProjectInput";
import type { AuthForm, Feature, ProjectState } from "./types";
import type { NavbarItem } from "./types";
import {
  Bot,
  ChartNoAxesColumn,
  FileChartColumn,
  Folder,
  Handshake,
  Home,
  LayoutDashboard,
  Timer,
  Users,
} from "lucide-react";

export const NAVBAR_ITEMS: NavbarItem[] = [
  {
    label: "Inicio",
    href: "/",
    icon: Home,
  },
  {
    label: "Proyectos",
    href: "/projects",
    icon: Folder,
  },
  {
    label: "Comunidad",
    href: "/community",
    icon: Users,
  },
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
];

export const LOGIN_FORM: AuthForm[] = [
  {
    label: "Correo Electronico",
    name: "email",
    type: "email",
    placeholder: "tucorreo@gmail.com",
  },
  {
    label: "Contraseña",
    name: "password",
    type: "password",
    placeholder: "********",
  },
];

export const REGISTER_FORM: AuthForm[] = [
  {
    label: "Nombre Completo",
    name: "usuario",
    type: "text",
    placeholder: "John Doe",
  },
  {
    label: "Correo Electronico",
    name: "email",
    type: "email",
    placeholder: "tucorreo@gmail.com",
  },
  {
    label: "Contraseña",
    name: "password",
    type: "password",
    placeholder: "********",
  },
];

export const FEATURES: Feature[] = [
  {
    id: "bot",
    icon: Bot,
    title: "Agente IA Especializado",
    description:
      "Obtén sugerencias inteligentes para organizar tareas y asignar trabajo según las habilidades del equipo.",
    iconColor: "text-blue-600",
    iconBgColor: "bg-blue-100",
  },
  {
    id: "handshake",
    icon: Handshake,
    title: "Colaboración en tiempo real",
    description:
      "Trabaja con tu equipo en tiempo real con chat integrado y actualizaciones instantáneas.",
    iconColor: "text-green-600",
    iconBgColor: "bg-green-100",
  },
  {
    id: "file-chart-column",
    icon: FileChartColumn,
    title: "Tableros Kanban",
    description:
      "Visualiza el progreso de tus proyectos con tableros Kanban intuitivos y personalizables.",
    iconColor: "text-orange-600",
    iconBgColor: "bg-orange-100",
  },
  {
    id: "timer",
    icon: Timer,
    title: "Gestión de Tiempo",
    description:
      "Seguimiento automático del tiempo y estimaciones inteligentes para una planificación precisa.",
    iconColor: "text-purple-600",
    iconBgColor: "bg-purple-100",
  },
  {
    id: "chart-no-axes-column",
    icon: ChartNoAxesColumn,
    title: "Análisis de Proyectos",
    description:
      "Obtén análisis detallados de tus proyectos para identificar oportunidades de mejora y optimización.",
    iconColor: "text-red-600",
    iconBgColor: "bg-red-100",
  },
];

export const PROJECT_STATES: ProjectState[] = [
  {
    id: "total",
    titulo: "Proyectos Totales",
    color: "text-blue-500",
    borderColor: "border-blue-500",
    hoverBgColor: "hover:bg-blue-500/10",
    aditionalInfo: "Activos",
  },
  {
    id: "completed",
    titulo: "Completados",
    color: "text-green-500",
    borderColor: "border-green-500",
    hoverBgColor: "hover:bg-green-500/10",
  },
  {
    id: "active",
    titulo: "En Progreso",
    color: "text-yellow-500",
    borderColor: "border-yellow-500",
    hoverBgColor: "hover:bg-yellow-500/10",
  },
  {
    id: "overdue",
    titulo: "Atrasados",
    color: "text-red-500",
    borderColor: "border-red-500",
    hoverBgColor: "hover:bg-red-500/10",
  },
];

export const PROJECT_FORM: ProjectInputProps[] = [
  {
    label: "Nombre del Proyecto",
    name: "nombre",
    placeholder: "Ej. Desarrollo de página web",
  },
  {
    label: "Descripción",
    name: "descripcion",
    placeholder: "Describe brevemente tu proyecto",
  },
];

export const colors = {
  pending: "hover:border-yellow-500 hover:shadow-yellow-500/30",
  "in-progress": "hover:border-blue-500 hover:shadow-blue-500/30",
  completed: "hover:border-green-500 hover:shadow-green-500/30",
};

export const tagColors = {
  pending: {
    text: "Pendiente",
    colors: "bg-yellow-200/30 text-yellow-500 border border-yellow-500",
  },
  "in-progress": {
    text: "En Proceso",
    colors: "bg-blue-200/30 text-blue-500 border border-blue-500",
  },
  completed: {
    text: "Completada",
    colors: "bg-green-200/30 text-green-500 border border-green-500",
  },
};
