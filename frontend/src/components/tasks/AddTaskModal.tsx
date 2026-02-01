"use client";
import { useRef, useState, useEffect } from "react";
import { useProjectModalAnimation } from "@/hooks/useProjectModalAnimation";
import { X } from "lucide-react";
import { ProjectInput } from "@/components/projects/ProjectInput";
import { UserSearchSelect } from "./UserSearchSelect";
import { useTasks } from "@/contexts/TasksContext";
import { Task, User } from "@/lib/types";
import { useUsers } from "@/contexts/UsersContext";

interface AddTaskModalProps {
  closeModal: () => void;
  showModal: boolean;
  projectId: string;
  taskToEdit?: Task | null; // Nueva prop
}

export function AddTaskModal({
  closeModal,
  showModal,
  projectId,
  taskToEdit,
}: AddTaskModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const { createTask, updateTask } = useTasks();
  const { usersMap } = useUsers();

  // Si estamos editando, cargar el usuario asignado inicialmente
  useEffect(() => {
    if (taskToEdit?.asignado_a) {
      setSelectedUser(usersMap[taskToEdit.asignado_a] || null);
    } else {
      setSelectedUser(null);
    }
  }, [taskToEdit, usersMap, showModal]);

  useProjectModalAnimation(showModal, overlayRef, contentRef);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const taskData: Partial<Task> = {
      titulo: formData.get("titulo") as string,
      descripcion: formData.get("descripcion") as string,
      fechaLimite: formData.get("fechaLimite") as string,
      asignado_a: selectedUser ? selectedUser.id : undefined,
      estado: taskToEdit ? taskToEdit.estado : "pending",
    };

    let success;
    if (taskToEdit) {
      success = await updateTask(taskToEdit.id!, taskData);
    } else {
      success = await createTask(projectId, taskData as Task);
    }

    if (success) {
      setSelectedUser(null);
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
        className="flex flex-col gap-6 bg-white p-8 rounded-2xl max-w-md w-full shadow-2xl"
      >
        <header className="flex items-center justify-between">
          <h4 className="text-2xl font-bold text-gray-900">
            {taskToEdit ? "Editar Tarea" : "Nueva Tarea"}
          </h4>
          <button onClick={closeModal} type="button">
            <X className="size-6 text-gray-400 hover:text-red-500" />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <ProjectInput
            label="Título"
            name="titulo"
            defaultValue={taskToEdit?.titulo}
            placeholder="Ej. Diseño de la página de inicio"
            required
          />
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold">Descripción</label>
            <textarea
              name="descripcion"
              defaultValue={taskToEdit?.descripcion}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm min-h-24 outline-none focus:border-blue-500"
              placeholder="Descripción de la tarea"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold">Fecha límite</label>
            <input
              type="date"
              name="fechaLimite"
              defaultValue={taskToEdit?.fechaLimite}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm"
            />
          </div>
          <UserSearchSelect
            selectedUser={selectedUser}
            onSelect={setSelectedUser}
          />
          <button
            type="submit"
            className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg"
          >
            {taskToEdit ? "Guardar Cambios" : "Crear Tarea"}
          </button>
        </form>
      </article>
    </div>
  );
}
