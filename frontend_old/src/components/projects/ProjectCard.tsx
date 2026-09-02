"use client";

// Components
import Link from "next/link";
import { ProjectStateTag } from "./ProjectStateTag";
import { Dropdown, DropdownItem } from "@/components/common/Dropdown";
import { MemberAvatar } from "@/components/common/MemberAvatar";
import { ProgressBar } from "@/components/common/ProggresBar";
// Hooks
import { useState } from "react";
// Icons
import {
  Ellipsis,
  Pencil,
  RefreshCw,
  UserMinus,
  UserPlus,
  Trash2,
  Calendar,
} from "lucide-react";
// Types
import type { Project, User } from "@/lib/types";

interface ProjectCardProps extends Project {
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
  onAddMember: (project: Project) => void;
  onRemoveMember: (project: Project) => void;
  isLoading?: boolean;
}

export function ProjectCard(props: ProjectCardProps) {
  const {
    id,
    nombre,
    descripcion,
    estado,
    creadoEn,
    actualizadoEn,
    miembros = [],
    onEdit,
    onDelete,
    onAddMember,
    onRemoveMember,
    totalTareas,
    tareasCompletadas,
    isLoading,
  } = props;
  const [showDropdown, setShowDropdown] = useState(false);

  // Renderizar siempre, incluso si no hay tareas (proyectos nuevos)
  if (!nombre) return null;

  const formatDate = (dateString?: string) => {
    if (!dateString) return "No disponible";
    return new Date(dateString).toLocaleDateString("es-ES");
  };

  const items: DropdownItem[] = [
    {
      label: "Editar proyecto",
      icon: Pencil,
      onClick: () => {
        onEdit(props);
        setShowDropdown(false);
      },
    },
    {
      label: "Agregar miembro",
      icon: UserPlus,
      onClick: () => {
        onAddMember(props);
        setShowDropdown(false);
      },
    },
    {
      label: "Eliminar miembro",
      icon: UserMinus,
      onClick: () => {
        onRemoveMember(props);
        setShowDropdown(false);
      },
    },
    {
      label: "Eliminar proyecto",
      icon: Trash2,
      variant: "danger",
      onClick: () => {
        onDelete(props);
        setShowDropdown(false);
      },
    },
  ];

  const maxVisibleMembers = 4;

  return (
    <Link
      href={`/projects/${id}`}
      onClick={(e) => showDropdown && e.preventDefault()}
      className="block h-full group/card"
    >
      <article
        className="flex flex-col h-full gap-5 p-6 rounded-2xl border border-gray-100 
        shadow-[0_4px_12px_-4px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_32px_-8px_rgba(59,130,246,0.15)] 
      hover:border-blue-400 hover:-translate-y-1.5 transition-all duration-300 bg-white relative overflow-hidden"
      >
        {/* Glow effect sutil */}
        <div className="absolute -right-10 -top-10 size-32 bg-blue-500/5 rounded-full blur-3xl group-hover/card:bg-blue-500/10 transition-colors" />

        <header className="flex items-center justify-between border-b border-gray-100 pb-3 relative">
          <h3 className="text-xl font-bold text-gray-900 group-hover/card:text-blue-600 transition-colors">
            {nombre}
          </h3>
          <div className="relative">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowDropdown(!showDropdown);
              }}
              className="p-2 rounded-xl text-gray-400 hover:bg-gray-50 hover:text-gray-900 transition-all active:scale-95"
            >
              <Ellipsis className="size-6" />
            </button>
            <Dropdown
              isOpen={showDropdown}
              onClose={() => setShowDropdown(false)}
              items={items}
            />
          </div>
        </header>

        <div className="flex flex-col gap-4 flex-1">
          <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-widest relative">
            <Calendar className="size-3 text-blue-400" /> CREADO EL{" "}
            {formatDate(creadoEn)}
          </div>
          <p
            className={`text-gray-500 text-sm leading-relaxed line-clamp-3 relative transition-opacity duration-300 ${isLoading ? "opacity-50" : "opacity-100"}`}
          >
            {descripcion || "Sin descripción disponible para este proyecto..."}
          </p>

          <div className="mt-auto space-y-3 relative">
            <div className="flex items-center justify-between">
              <ProjectStateTag estado={estado as any} />
            </div>
            <ProgressBar
              totalTasks={totalTareas || 0}
              completedTasks={tareasCompletadas || 0}
            />
          </div>
        </div>

        <footer className="flex items-center justify-between pt-4 border-t border-gray-50 relative">
          <ul className="flex items-center">
            {miembros
              .sort((a, b) => (a.id === props.creadorId ? -1 : 1))
              .slice(0, maxVisibleMembers)
              .map((miembro) => (
                <li className="-ml-2.5 first:ml-0 relative" key={miembro.id}>
                  <MemberAvatar
                    name={miembro?.nombre}
                    className="ring-4 ring-white shadow-sm"
                    isCreator={miembro.id === props.creadorId}
                  />
                </li>
              ))}
            {miembros.length > maxVisibleMembers && (
              <li className="-ml-2.5 relative">
                <div className="size-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-[10px] ring-4 ring-white shadow-sm border border-blue-100">
                  +{miembros.length - maxVisibleMembers}
                </div>
              </li>
            )}
          </ul>

          <div className="flex flex-col items-end">
            <span className="flex items-center gap-1.5 text-[9px] text-gray-400 uppercase font-black tracking-tighter">
              <RefreshCw
                className={`size-2.5 ${isLoading ? "animate-spin text-blue-500" : ""}`}
              />{" "}
              {formatDate(actualizadoEn)}
            </span>
          </div>
        </footer>
      </article>
    </Link>
  );
}
