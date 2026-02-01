// Components
import Link from "next/link";
import { ProjectStateTag } from "./ProjectStateTag";
import { Dropdown, DropdownItem } from "@/components/common/Dropdown";
import { AddMemberModal } from "./AddMemberModal";
import { CreateProjectModal } from "./CreateProjectModal";
import { RemoveMemberModal } from "./RemoveMemberModal";
import { ConfirmDeletion } from "@/components/common/ConfirmDeletion";
import { MemberAvatarSmart } from "@/components/common/MemberAvatarSmart";
// Hooks
import { useState, useEffect } from "react";
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
// Contexts
import { useProjects } from "@/contexts/ProjectsContext";
import { useUsers } from "@/contexts/UsersContext";

export function ProjectCard(project: Project) {
  const {
    id,
    nombre,
    descripcion,
    estado,
    creadorId,
    creadoEn,
    actualizadoEn,
    miembros = [],
  } = project;
  const [showDropdown, setShowDropdown] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showRemoveMemberModal, setShowRemoveMemberModal] = useState(false);

  const { updateProject, deleteProject, addMember, removeMember } =
    useProjects();

  const { usersMap, fetchUserById } = useUsers();

  // 1. Sincronizar con el caché de usuarios
  useEffect(() => {
    if (miembros.length > 0) {
      miembros.forEach((m) => {
        // Usamos m.id porque m es un objeto según lo que descubrimos
        if (m.id && !usersMap[m.id]) {
          fetchUserById(m.id);
        }
      });
    }
  }, [miembros, usersMap, fetchUserById]);

  // 2. Lógica de visualización corregida
  const MAX_VISIBLES = 3;

  // Ordenar: Creador primero. Usamos m.id para comparar.
  const miembrosOrdenados = [...miembros].sort((a, b) =>
    a.id === creadorId ? -1 : b.id === creadorId ? 1 : 0,
  );

  const miembrosAMostrar = miembrosOrdenados.slice(0, MAX_VISIBLES);
  const extraCount = miembros.length - MAX_VISIBLES;

  const formatDate = (dateString?: string) => {
    if (!dateString) return "No disponible";
    return new Date(dateString).toLocaleDateString("es-ES");
  };

  // --- FUNCIONES DE ACCION ---

  // == EDITAR ==

  const handleEdit = () => {
    setShowEditModal(true);
    setShowDropdown(false);
  };

  const handleUpdateSubmit = async (projectData: Project) => {
    return await updateProject(id!, projectData);
  };

  // == ELIMINAR ==

  const handleDelete = () => {
    setShowDeleteModal(true);
    setShowDropdown(false);
  };

  const handleDeleteSubmit = async () => {
    return await deleteProject(id!);
  };

  // == AGREGAR MIEMBRO ==

  const handleAddMember = () => {
    setShowAddMemberModal(true);
    setShowDropdown(false);
  };

  const handleAddMemberSubmit = async (user: User) => {
    if (!user || !user.id) {
      console.error("User or user ID is missing");
      return false;
    }

    const success = await addMember(id!, user.id, 0);

    if (success) {
      setShowAddMemberModal(false);
      setShowDropdown(false);
    }
    return success;
  };

  // == ELIMINAR MIEMBRO ==

  const handleRemoveMember = () => {
    setShowRemoveMemberModal(true);
    setShowDropdown(false);
  };

  const handleRemoveMemberSubmit = async (userId: string) => {
    const success = await removeMember(id!, userId);

    if (success) {
      setShowRemoveMemberModal(false);
      setShowDropdown(false);
    }
    return success;
  };

  // --- CONFIGURACION EL DROPDOWN ---

  const items: DropdownItem[] = [
    {
      label: "Editar proyecto",
      icon: Pencil,
      onClick: handleEdit,
    },
    {
      label: "Agregar miembro",
      icon: UserPlus,
      onClick: handleAddMember,
    },
    {
      label: "Eliminar miembro",
      icon: UserMinus,
      onClick: handleRemoveMember,
    },
    {
      label: "Eliminar proyecto",
      icon: Trash2,
      variant: "danger",
      onClick: handleDelete,
    },
  ];

  // --- HELPERS ---

  const handleDropdownToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDropdown(!showDropdown);
  };

  console.log(`Proyecto ${nombre}:`, miembros);

  return (
    <>
      <Link
        href={`/projects/${id}`}
        onClick={(e) => showDropdown && e.preventDefault()}
      >
        <article className="flex flex-col h-full gap-4 p-6 rounded-xl border border-gray-200 shadow-lg hover:-translate-y-1 transition-all duration-300 bg-white">
          <header className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h3 className="text-xl font-bold text-gray-800">{nombre}</h3>
            <div className="relative">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowDropdown(!showDropdown);
                }}
              >
                <Ellipsis className="p-2 size-10 rounded-full text-gray-500 hover:bg-gray-100 transition-colors" />
              </button>
              <Dropdown
                isOpen={showDropdown}
                onClose={() => setShowDropdown(false)}
                items={[
                  {
                    label: "Editar",
                    icon: Pencil,
                    onClick: () => setShowEditModal(true),
                  },
                  {
                    label: "Miembros",
                    icon: UserPlus,
                    onClick: () => setShowAddMemberModal(true),
                  },
                  {
                    label: "Eliminar",
                    icon: Trash2,
                    variant: "danger",
                    onClick: () => setShowDeleteModal(true),
                  },
                ]}
              />
            </div>
          </header>

          <div className="flex flex-col gap-3 flex-1">
            <span className="flex items-center gap-2 text-xs text-gray-400 font-medium">
              <Calendar className="size-3" /> CREADO EL {formatDate(creadoEn)}
            </span>
            <p className="text-gray-600 text-sm line-clamp-3">{descripcion}</p>
            <ProjectStateTag estado={estado as any} />
          </div>

          <footer className="flex items-center justify-between pt-4 border-t border-gray-50">
            <ul className="flex items-center">
              {miembrosAMostrar.map((m, index) => (
                <li
                  key={m.id}
                  className="-ml-3 first:ml-0 relative"
                  style={{ zIndex: 10 - index }}
                >
                  <div className="relative group">
                    <MemberAvatarSmart userId={m.id} />
                    {m.id === creadorId && (
                      <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500 border-2 border-white"></span>
                      </span>
                    )}
                    {/* Tooltip simple con el nombre */}
                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-800 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap z-50">
                      {m.nombre}
                    </span>
                  </div>
                </li>
              ))}
              {extraCount > 0 && (
                <li className="-ml-3 flex items-center justify-center size-8 rounded-full bg-gray-100 border-2 border-white text-[10px] font-bold text-gray-500 z-0">
                  +{extraCount}
                </li>
              )}
            </ul>

            <div className="text-right">
              <span className="flex items-center gap-1 text-[10px] text-gray-400 uppercase font-bold">
                <RefreshCw className="size-3" /> {formatDate(actualizadoEn)}
              </span>
            </div>
          </footer>
        </article>
      </Link>

      {/* Modal de Edición */}
      {showEditModal && (
        <CreateProjectModal
          showModal={showEditModal}
          setShowModal={setShowEditModal}
          initialData={project}
          onSubmit={handleUpdateSubmit}
        />
      )}

      {/* Modal de Eliminación */}
      {showDeleteModal && (
        <ConfirmDeletion
          type="project"
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onSubmit={handleDeleteSubmit}
        />
      )}

      {/* Modal de Agregar Miembro */}
      {showAddMemberModal && (
        <AddMemberModal
          isOpen={showAddMemberModal}
          onClose={() => setShowAddMemberModal(false)}
          onAddMember={handleAddMemberSubmit}
          currentMembers={
            miembros.map((m: any) => ({
              id: m.id,
              nombre: m.nombre,
              email: m.email,
              rol: m.rol,
            })) as User[]
          }
        />
      )}

      {/* Modal de Eliminar Miembro */}
      {showRemoveMemberModal && (
        <RemoveMemberModal
          isOpen={showRemoveMemberModal}
          onClose={() => setShowRemoveMemberModal(false)}
          onRemoveMember={handleRemoveMemberSubmit}
          memberIds={
            (project.miembros || []).map((m) =>
              typeof m === "string" ? m : m.id,
            ) as string[]
          }
        />
      )}
    </>
  );
}
