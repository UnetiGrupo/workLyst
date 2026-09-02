"use client";

import { useRef, useState, useEffect } from "react";
import { useProjectModalAnimation } from "@/hooks/useProjectModalAnimation";
import { X } from "lucide-react";
import { ProjectInput } from "@/components/projects/ProjectInput";
import { UserSearchSelect } from "./UserSearchSelect";
import { useTasks } from "@/contexts/TasksContext";
import { useProjects } from "@/contexts/ProjectsContext";
import { Task, User } from "@/lib/types";
import { Button } from "@/components/common/Button";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { registerLocale } from "react-datepicker";
import { es } from "date-fns/locale/es";

registerLocale("es", es);

interface AddTaskModalProps {
  closeModal: () => void;
  showModal: boolean;
  projectId: string;
  taskToEdit?: Task | null;
}

export function AddTaskModal({
  closeModal,
  showModal,
  projectId,
  taskToEdit,
}: AddTaskModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Estado para el usuario seleccionado
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [deadline, setDeadline] = useState<Date | null>(null);

  const { createTask, updateTask } = useTasks();
  const { selectedProject } = useProjects(); // Necesario para buscar el usuario al editar

  // Hook de animación (asumo que ya lo tienes configurado)
  useProjectModalAnimation(showModal, overlayRef, contentRef);

  // --- EFECTO: Pre-cargar datos al EDITAR ---
  useEffect(() => {
    // Si estamos editando y tenemos un ID de usuario asignado...
    if (showModal && taskToEdit?.asignado_a && selectedProject?.miembros) {
      // Buscamos el objeto User completo dentro de los miembros del proyecto
      const userFound = selectedProject.miembros.find(
        (m) => m.id === taskToEdit.asignado_a,
      );

      // Si lo encontramos, lo seteamos (casteamos a User si es necesario por diferencias de tipos)
      if (userFound) {
        setSelectedUser({
          id: userFound.id,
          nombre: userFound.nombre,
          email: userFound.email || "",
        } as User);
      }

      if (taskToEdit.fecha_limite) {
        setDeadline(new Date(taskToEdit.fecha_limite));
      } else {
        setDeadline(null);
      }
    } else if (!showModal) {
      // Limpiar al cerrar
      setSelectedUser(null);
      setDeadline(null);
    }
  }, [taskToEdit, showModal, selectedProject]);

  // --- HELPER: Formatear fecha para el input (ISO -> YYYY-MM-DD) ---
  const getInputDate = (isoString?: string) => {
    if (!isoString) return "";
    // Cortamos la parte de la hora para que el input type="date" lo entienda
    return isoString.split("T")[0];
  };

  // --- SUBMIT ---
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    // 1. Obtener la fecha del input
    const rawDate = formData.get("fecha_limite") as string;

    // 2. Convertir a ISO string completo para la Base de Datos
    const isoDate = deadline ? deadline.toISOString() : undefined;

    const taskData: Partial<Task> = {
      titulo: formData.get("titulo") as string,
      descripcion: formData.get("descripcion") as string,
      fecha_limite: isoDate,
      asignado_a: selectedUser ? selectedUser.id : undefined,
      estado: taskToEdit ? taskToEdit.estado : "pendiente",
    };

    let success;
    if (taskToEdit) {
      success = await updateTask(taskToEdit.id!, taskData);
    } else {
      success = await createTask(projectId, taskData as Task);
    }

    if (success) {
      setSelectedUser(null);
      setDeadline(null);
      (e.target as HTMLFormElement).reset();
      closeModal();
    }
  };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 opacity-0"
    >
      <article
        ref={contentRef}
        className="flex flex-col gap-4 md:gap-6 bg-white p-5 md:p-8 rounded-2xl max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200"
      >
        <header className="flex items-center justify-between">
          <h4 className="text-2xl font-bold text-gray-900">
            {taskToEdit ? "Editar Tarea" : "Nueva Tarea"}
          </h4>
          <button
            onClick={closeModal}
            type="button"
            className="text-gray-400 hover:text-red-500 transition-colors"
          >
            <X className="size-6" />
          </button>
        </header>

        <form
          key={showModal ? taskToEdit?.id || "new-task" : "closed"}
          onSubmit={handleSubmit}
          className="flex flex-col gap-5"
        >
          {/* Título */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-bold text-gray-800">Título</label>
            <input
              name="titulo"
              defaultValue={taskToEdit?.titulo}
              placeholder="Ej. Diseño de la página de inicio"
              required
              className="w-full p-3 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>

          {/* Descripción */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-bold text-gray-800">
              Descripción
            </label>
            <textarea
              name="descripcion"
              defaultValue={taskToEdit?.descripcion}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm min-h-[100px] outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all resize-none"
              placeholder="Descripción de la tarea"
            />
          </div>

          {/* Fecha Límite con react-datepicker */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-bold text-gray-800">
              Fecha límite
            </label>
            <DatePicker
              selected={deadline}
              onChange={(date: Date | null) => setDeadline(date)}
              dateFormat="dd/MM/yyyy"
              placeholderText="Seleccionar fecha"
              locale="es"
              minDate={new Date()}
              isClearable
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-gray-600 cursor-pointer"
              wrapperClassName="w-full"
            />
          </div>

          {/* Selector de Usuario */}
          <UserSearchSelect
            selectedUser={selectedUser}
            onSelect={setSelectedUser}
          />

          <Button
            type="submit"
            style="primary"
            className="mt-4 w-full py-3 text-base font-semibold"
          >
            {taskToEdit ? "Guardar Cambios" : "Crear Tarea"}
          </Button>
        </form>
      </article>
    </div>
  );
}
