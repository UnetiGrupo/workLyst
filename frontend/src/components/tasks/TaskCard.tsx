"use client";

// Hooks
import { useState } from "react";
// Types
import { Task } from "@/lib/types";
// Icons
import {
  ArrowRightLeft,
  Ellipsis,
  Pencil,
  Trash2,
  UserPlus,
} from "lucide-react";
// Components
import { MemberAvatarSmart } from "@/components/common/MemberAvatarSmart";
import { Dropdown, DropdownItem } from "@/components/common/Dropdown";
import { ConfirmDeletion } from "@/components/common/ConfirmDeletion";
// Constants
import { colors, tagColors } from "@/lib/constants";
// Contexts
import { useTasks } from "@/contexts/TasksContext";
import { AddTaskModal } from "./AddTaskModal";

export function TaskCard(task: Task) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const { titulo, descripcion, estado, asignado_a, fechaLimite } = task;

  const { deleteTask, updateTask } = useTasks();

  // --- FUNCIONES DE ACCION ---

  // == MOVER ==

  const handleMove = async () => {
    const estados: Task["estado"][] = ["pending", "in-progress", "completed"];
    const currentIndex = estados.indexOf(estado);
    const nextIndex = (currentIndex + 1) % estados.length;
    await updateTask(task.id!, { estado: estados[nextIndex] });
    setShowDropdown(false);
  };

  // == EDITAR ==

  const handleEdit = () => {
    setShowEditModal(true);
    setShowDropdown(false);
  };
  // == ELIMINAR ==

  const handleDelete = () => {
    setShowDeleteModal(true);
    setShowDropdown(false);
  };

  const handleDeleteSubmit = async () => {
    return await deleteTask(task.id!);
  };

  // --- CONFIGURACION DEL DROPDOWN ---

  const items: DropdownItem[] = [
    {
      label: "Editar Tarea",
      icon: Pencil,
      onClick: handleEdit,
    },
    {
      label: "Asignar a",
      icon: UserPlus,
      onClick: handleEdit,
    },
    {
      label: "Mover Tarea",
      icon: ArrowRightLeft,
      onClick: handleMove,
    },
    {
      label: "Eliminar Tarea",
      icon: Trash2,
      onClick: handleDelete,
      variant: "danger",
    },
  ];

  // --- HELPERS ---

  const handleDropdownToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDropdown(!showDropdown);
  };

  return (
    <>
      <article
        className={`flex flex-col gap-4 p-4 bg-white rounded-lg shadow-lg border border-gray-200 ${colors[estado]} transition-all duration-200 cursor-pointer`}
      >
        <header className="flex items-center justify-between border-b border-gray-200 pb-2">
          <h3 className="font-medium">{titulo}</h3>
          <div className="relative">
            <button onClick={handleDropdownToggle}>
              <Ellipsis className="p-2 size-10 rounded-full text-gray-600 hover:bg-gray-200 hover:text-blue-500 transition-colors duration-200" />
            </button>
            <Dropdown
              isOpen={showDropdown}
              onClose={() => setShowDropdown(false)}
              items={items}
            />
          </div>
        </header>
        <div className="flex flex-col gap-4 border-b border-gray-200 pb-4">
          <p className="text-sm text-gray-600">{descripcion}</p>
          <span
            className={`px-4 py-1.5 rounded text-xs font-medium w-fit border ${tagColors[estado].colors}`}
          >
            {tagColors[estado].text}
          </span>
        </div>
        <footer className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h4 className="text-xs text-gray-600">Asignado a:</h4>
            {asignado_a ? (
              <MemberAvatarSmart userId={asignado_a} />
            ) : (
              <span className="text-xs text-gray-400">Sin asignar</span>
            )}
          </div>
          <span className="text-xs text-gray-600">
            Fecha límite: {fechaLimite}
          </span>
        </footer>
      </article>

      {/* MODAL DE EDICION */}
      <AddTaskModal
        showModal={showEditModal}
        closeModal={() => setShowEditModal(false)}
        projectId={""}
        taskToEdit={task}
      />

      {/* MODAL DE ELIMINACION */}
      {showDeleteModal && (
        <ConfirmDeletion
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onSubmit={handleDeleteSubmit}
          type="task"
        />
      )}
    </>
  );
}
