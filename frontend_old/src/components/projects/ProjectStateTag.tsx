interface ProjectStateTagProps {
  estado: "active" | "completed" | "overdue";
}

export function ProjectStateTag({ estado }: ProjectStateTagProps) {
  const state = {
    active: {
      label: "En Progreso",
      color: "bg-yellow-100 text-yellow-700",
    },
    completed: {
      label: "Completado",
      color: "bg-green-100 text-green-700",
    },
    overdue: {
      label: "Atrasado",
      color: "bg-red-100 text-red-700",
    },
  };

  return (
    <span
      className={`w-fit px-4 py-1 rounded-full text-sm font-medium ${state[estado]?.color} hover:scale-105 transition-transform duration-200`}
    >
      {state[estado]?.label}
    </span>
  );
}
