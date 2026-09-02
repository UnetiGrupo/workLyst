"use client";

import { useState } from "react";
// Types
import { Task } from "@/lib/types";
// Components
import { TaskCard } from "./TaskCard";
import { AddTaskCard } from "./AddTaskCard";
// Contexts
import { useTasks } from "@/contexts/TasksContext";
// Icons
import { Plus } from "lucide-react";

interface BoardColumnProps {
  statusKey: "pendiente" | "en_progreso" | "completada" | string;
  column: string;
  count: number;
  Icon: React.ComponentType<{ className: string }>;
  color: string;
  tasks: Task[];
  openModal: () => void;
  showAdd?: boolean;
  className?: string;
  style?: React.CSSProperties;
  onEditTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
}

export function BoardColumn({
  style,
  statusKey,
  column,
  count,
  Icon,
  color,
  tasks,
  openModal,
  showAdd,
  className,
  onEditTask,
  onDeleteTask,
}: BoardColumnProps) {
  // Extraemos las funciones de movimiento del contexto
  const { moveTask, setIsDragging, draggedTaskId, setDraggedTaskId } =
    useTasks();

  // Estado local para el feedback visual del Drag Over
  const [isOver, setIsOver] = useState(false);

  // --- LÓGICA DE DRAG & DROP ---

  // Se ejecuta cuando una tarea entra en el área de la columna
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Obligatorio para permitir el drop
    setIsOver(true);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setIsOver(true);
  };

  // Se ejecuta cuando el elemento arrastrado sale del área
  const handleDragLeave = () => {
    setIsOver(false);
  };

  // Se ejecuta cuando soltamos la tarea en esta columna
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsOver(false);
    setIsDragging(false);

    // Recuperamos el ID de la tarea
    let taskId = e.dataTransfer.getData("taskId");

    // Fallback para móviles que no soportan dataTransfer correctamente
    if (!taskId && draggedTaskId) {
      taskId = draggedTaskId;
    }

    if (taskId) {
      // Movemos la tarea al estado que representa esta columna
      await moveTask(taskId, statusKey as any);
      setDraggedTaskId(null);
    }
  };

  return (
    <article
      style={style}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex flex-col gap-4 bg-gray-50/70 border border-gray-200/50 rounded-2xl p-3 md:p-4 min-h-[550px] transition-all duration-300 ${
        isOver
          ? "bg-blue-50/60 border-blue-300 border-dashed scale-[1.02] shadow-xl shadow-blue-500/10"
          : "hover:bg-gray-50/90 shadow-sm"
      } ${className}`}
    >
      {/* Cabecera de la Columna (Rediseñada - Sticky & Glass) */}
      <header className="sticky top-0 z-10 flex items-center justify-between py-2 mb-1 backdrop-blur-md bg-white/20 rounded-lg">
        <div className="flex items-center gap-3">
          {/* Icono con fondo sutil y aro dinámico */}
          <div
            className="size-10 rounded-xl flex items-center justify-center shadow-inner"
            style={{
              backgroundColor: `${color}15`,
              color: color,
              border: `1.5px solid ${color}30`,
            }}
          >
            <Icon className="size-5" />
          </div>

          <div className="flex flex-col">
            <h3 className="font-bold text-gray-900 text-sm md:text-base leading-tight tracking-tight capitalize">
              {column.replace("_", " ")}
            </h3>
            <div className="flex items-center gap-2">
              <span
                className="size-2 rounded-full animate-pulse"
                style={{ backgroundColor: color }}
              />
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                {count} {count === 1 ? "Tarea" : "Tareas"}
              </p>
            </div>
          </div>
        </div>

        {showAdd && (
          <button
            onClick={openModal}
            className="size-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-white hover:text-blue-500 hover:shadow-lg shadow-gray-200 transition-all active:scale-90"
            title="Añadir tarea"
          >
            <Plus className="size-5" />
          </button>
        )}
      </header>

      {/* Listado de Tareas */}
      <section className="flex flex-col gap-3.5 overflow-y-auto max-h-[calc(100vh-320px)] pr-2 custom-scrollbar">
        {tasks.length > 0 ? (
          <div className="flex flex-col gap-3.5 px-0.5 py-1">
            {tasks.map((task) => (
              <div key={task.id} className="task-card-anim">
                <TaskCard
                  {...task}
                  onEdit={onEditTask}
                  onDelete={onDeleteTask}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 px-4 border-2 border-dashed border-gray-200 rounded-2xl bg-white/40 group/empty hover:border-blue-200 transition-colors">
            <div className="size-14 bg-gray-50 rounded-full flex items-center justify-center mb-4 group-hover/empty:scale-110 transition-transform shadow-sm">
              <Icon className="size-6 text-gray-300" />
            </div>
            <h4 className="text-gray-900 text-xs font-bold mb-1">Sin tareas</h4>
            <p className="text-[10px] text-gray-400 font-medium text-center">
              Arrastra una tarea aquí o crea una nueva para comenzar.
            </p>
          </div>
        )}

        {showAdd && (
          <button
            onClick={openModal}
            className="flex items-center justify-center gap-2 w-full py-4 mt-2 rounded-2xl border-2 border-dashed border-gray-200 text-gray-400 hover:text-blue-600 hover:border-blue-300 hover:bg-white hover:shadow-xl shadow-blue-500/5 transition-all text-[11px] font-bold uppercase tracking-wider group active:scale-[0.98]"
          >
            <div className="size-5 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-blue-50 transition-colors">
              <Plus className="size-3 group-hover:rotate-90 transition-transform duration-300" />
            </div>
            Nueva tarea
          </button>
        )}
      </section>
    </article>
  );
}
