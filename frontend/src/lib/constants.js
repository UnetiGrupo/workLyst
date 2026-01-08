export const LoginForm = [
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

export const RegisterForm = [
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

export const NavbarItems = [
  {
    label: "Inicio",
    href: "/",
  },
  {
    label: "Proyectos",
    href: "/projects",
  },
  {
    label: "Dashboard",
    href: "/dashboard",
  },
  {
    label: "Chat",
    href: "/chat",
  },
];

export const ProjectsStatus = [
  {
    label: "Proyectos Totales",
    value: 0,
    status: "total",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500",
    textColor: "text-blue-500",
    ringColor: "ring-blue-500/20",
  },
  {
    label: "Completados",
    value: 0,
    status: "completed",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500",
    textColor: "text-green-500",
    ringColor: "ring-green-500/20",
  },
  {
    label: "En Progreso",
    value: 0,
    status: "inprogress",
    bgColor: "bg-yellow-500/10",
    borderColor: "border-yellow-500",
    textColor: "text-yellow-500",
    ringColor: "ring-yellow-500/20",
  },
  {
    label: "Atrasados",
    value: 0,
    status: "overdue",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500",
    textColor: "text-red-500",
    ringColor: "ring-red-500/20",
  },
];
