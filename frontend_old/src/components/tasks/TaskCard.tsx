"use client";

import { useState } from "react";
import { Task } from "@/lib/types";
import {
  ArrowRightLeft,
  Ellipsis,
  Pencil,
  Trash2,
  UserPlus,
  Calendar,
} from "lucide-react";
import { Dropdown, DropdownItem } from "@/components/common/Dropdown";
import { useTasks } from "@/contexts/TasksContext";
import { useTaskStatuses } from "@/contexts/TaskStatusesContext";
import { useProjects } from "@/contexts/ProjectsContext";
import { MemberAvatar } from "@/components/common/MemberAvatar";

interface TaskCardProps extends Task {
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

export function TaskCard(props: TaskCardProps) {
  const {
    id,
    titulo,
    descripcion,
    estado,
    asignado_a,
    fecha_limite,
    proyecto_id,
    onEdit,
    onDelete,
  } = props;
  const [showDropdown, setShowDropdown] = useState(false);

  const { updateTask, setIsDragging, setDraggedTaskId } = useTasks();
  const { getStatusByKey, statuses } = useTaskStatuses();
  const { selectedProject } = useProjects();

  // 1. Obtener info del usuario asignado desde el proyecto actual
  const assignedUser = selectedProject?.miembros?.find(
    (m) => m.id === asignado_a,
  );

  // 2. Info visual del estado (color, nombre)
  const statusInfo = getStatusByKey(estado);

  // 3. Formatear fecha para la UI
  const formattedDate = fecha_limite
    ? new Date(fecha_limite).toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "short",
      })
    : "Sin fecha";

  // --- LÓGICA DE DRAG AND DROP ---
  const handleDragStart = (e: React.DragEvent) => {
    // Guardamos el ID de la tarea para que BoardColumn lo reciba
    e.dataTransfer.setData("taskId", id!);
    e.dataTransfer.effectAllowed = "move";
    setIsDragging(true);
    setDraggedTaskId(id!);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  // --- FUNCIONES DE ACCIÓN ---
  const handleMoveViaDropdown = async () => {
    if (statuses.length === 0) return;

    // Buscamos el siguiente estado en la lista
    const currentIndex = statuses.findIndex((s) => s.key === estado);
    const nextIndex = (currentIndex + 1) % statuses.length;
    const nextStatus = statuses[nextIndex];

    await updateTask(id!, { estado: nextStatus.key });
    setShowDropdown(false);
  };

  const items: DropdownItem[] = [
    {
      label: "Editar Tarea",
      icon: Pencil,
      onClick: () => {
        onEdit(props);
        setShowDropdown(false);
      },
    },
    {
      label: `Mover a: ${statuses[(statuses.findIndex((s) => s.key === estado) + 1) % statuses.length]?.name || "Siguiente"}`,
      icon: ArrowRightLeft,
      onClick: handleMoveViaDropdown,
    },
    {
      label: "Eliminar",
      icon: Trash2,
      onClick: () => {
        onDelete(props);
        setShowDropdown(false);
      },
      variant: "danger",
    },
  ];

  // 4. Lógica de urgencia (fecha próxima o vencida)
  const getDeadlineStatus = () => {
    if (!fecha_limite || estado === "completada") return "normal";

    const now = new Date();
    const deadlineDate = new Date(fecha_limite);
    const diffDays = Math.ceil(
      (deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (diffDays < 0) return "overdue";
    if (diffDays <= 3) return "urgent";
    return "normal";
  };

  const deadlineStatus = getDeadlineStatus();

  return (
    <article
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={`flex flex-col gap-3 p-3 md:p-4 bg-white rounded-2xl border shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] 
                 hover:shadow-[0_8px_24px_-8px_rgba(0,0,0,0.12)] hover:-translate-y-1 transition-all duration-300 group 
                 cursor-grab active:cursor-grabbing relative overflow-hidden
                 ${
                   deadlineStatus === "overdue"
                     ? "border-red-200 bg-red-50/10"
                     : deadlineStatus === "urgent"
                       ? "border-amber-200 bg-amber-50/10"
                       : "border-gray-100 hover:border-blue-200"
                 }`}
    >
      {/* Indicador lateral sutil */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-1 transition-opacity ${deadlineStatus !== "normal" ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
        style={{
          backgroundColor:
            deadlineStatus === "overdue"
              ? "#ef4444"
              : deadlineStatus === "urgent"
                ? "#f59e0b"
                : statusInfo?.color,
        }}
      />

      <header className="flex items-start justify-between gap-2">
        <h3
          className={`font-bold text-[13px] md:text-sm leading-snug line-clamp-2 transition-colors ${
            deadlineStatus === "overdue"
              ? "text-red-700"
              : "text-gray-800 group-hover:text-blue-600"
          }`}
        >
          {titulo}
        </h3>
        <div className="relative shrink-0">
          <button
            onClick={(e) => {
              e.preventDefault();
              setShowDropdown(!showDropdown);
            }}
            className="p-1.5 rounded-lg hover:bg-gray-50 text-gray-400 hover:text-gray-600 transition-all"
          >
            <Ellipsis className="size-4 md:size-5" />
          </button>
          <Dropdown
            isOpen={showDropdown}
            onClose={() => setShowDropdown(false)}
            items={items}
          />
        </div>
      </header>

      <p className="text-[11px] md:text-xs text-gray-500 line-clamp-2 min-h-[32px] leading-relaxed">
        {descripcion || "Sin descripción adicional..."}
      </p>

      {/* Badge de Estado & Metadata */}
      <div className="flex items-center justify-between mt-1">
        <span
          className="px-2.5 py-1 rounded-lg text-[9px] md:text-[10px] font-bold uppercase tracking-widest border shadow-sm"
          style={{
            backgroundColor: `${statusInfo?.color}10`,
            borderColor: `${statusInfo?.color}30`,
            color: statusInfo?.color || "#6b7280",
          }}
        >
          {statusInfo?.name || estado}
        </span>
      </div>

      <div className="h-px bg-linear-to-r from-transparent via-gray-100 to-transparent w-full my-1" />

      <footer className="flex items-center justify-between">
        {/* Usuario Asignado */}
        <div className="flex items-center gap-2">
          {assignedUser ? (
            <div
              className={`flex items-center gap-2 p-0.5 pr-2 rounded-full transition-colors border border-transparent ${
                deadlineStatus === "overdue"
                  ? "bg-red-50 border-red-100"
                  : "bg-gray-50 group-hover:bg-blue-50 group-hover:border-blue-100"
              }`}
              title={assignedUser.nombre}
            >
              <MemberAvatar
                name={assignedUser.nombre}
                size="sm"
                className="size-6 text-[9px] shadow-sm border border-white"
              />
              <span className="text-[10px] md:text-[11px] font-bold text-gray-600 truncate max-w-[65px]">
                {assignedUser.nombre?.split(" ")[0]}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-gray-400 group-hover:text-blue-400 transition-colors">
              <div className="size-6 rounded-full border border-dashed border-gray-300 flex items-center justify-center">
                <UserPlus className="size-3" />
              </div>
              <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-wider">
                Sin asignar
              </span>
            </div>
          )}
        </div>

        {/* Fecha Límite */}
        <div
          className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-[9px] md:text-[10px] font-bold shadow-sm border transition-colors
          ${
            estado === "completada"
              ? "bg-green-50 text-green-600 border-green-100"
              : deadlineStatus === "overdue"
                ? "bg-red-500 text-white border-red-600 animate-pulse"
                : deadlineStatus === "urgent"
                  ? "bg-amber-100 text-amber-700 border-amber-200"
                  : "bg-gray-50 text-gray-500 border-gray-100"
          }`}
        >
          <Calendar className="size-3" />
          {formattedDate}
        </div>
      </footer>
    </article>
  );
}
