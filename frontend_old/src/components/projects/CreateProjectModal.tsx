"use client";

// Hooks
import { useEffect, useRef, useState } from "react";
import { useProjectModalAnimation } from "@/hooks/useProjectModalAnimation";
import { useDebounce } from "@/hooks/useDebounce";
// Context
import { useUsers } from "@/contexts/UsersContext";
import { useGroups } from "@/contexts/GroupContext";
// Types
import { Project, User, Group, GroupMember } from "@/lib/types";
// Icons
import {
  Plus,
  Search,
  X,
  UserPlus,
  Pencil,
  Loader2,
  Users,
} from "lucide-react";
// Components
import { ProjectInput } from "./ProjectInput";
import { MemberAvatar } from "@/components/common/MemberAvatar";
import { Button } from "@/components/common/Button";
// Constants
import { PROJECT_FORM } from "@/lib/constants";

interface ProjectModalProps {
  showModal: boolean;
  setShowModal: (show: boolean) => void;
  onSubmit: (project: Project) => Promise<boolean>;
  initialData?: Project;
}

export function CreateProjectModal({
  showModal,
  setShowModal,
  onSubmit,
  initialData,
}: ProjectModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [loadingAction, setLoadingAction] = useState(false);

  // -- LOGICA PARA MIEMBROS --
  const [selectedMembers, setSelectedMembers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const { searchUsers, userSearch, loading } = useUsers();
  const { groups, fetchGroups } = useGroups();
  const [showGroups, setShowGroups] = useState(false);

  const debouncedSearchTerm = useDebounce(searchTerm, 400);

  // ANIMACION
  useProjectModalAnimation(showModal, overlayRef, contentRef);

  useEffect(() => {
    if (showModal) {
      fetchGroups();

      // Inicializar miembros si estamos editando
      if (initialData?.miembros) {
        setSelectedMembers(
          initialData.miembros.map(
            (m) =>
              ({
                id: m.id,
                nombre: m.nombre,
                email: m.email,
                usuario: m.nombre,
              }) as User,
          ),
        );
      } else {
        setSelectedMembers([]);
      }
    }
  }, [showModal, fetchGroups, initialData]);

  useEffect(() => {
    const query = debouncedSearchTerm.trim();

    if (query.length >= 3) {
      searchUsers(query);
    } else {
      // Si el usuario borra el texto, reseteamos la lista para que no se quede pegada
      searchUsers("");
    }
  }, [debouncedSearchTerm, searchUsers]);

  // MANEJO DE CAMBIO
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // ACCIONES

  // 2. Limpiar el estado al añadir un miembro
  const addMember = (user: User) => {
    if (selectedMembers.some((m) => m.id === user.id)) return;
    setSelectedMembers((prev) => [...prev, user]);
    setSearchTerm(""); // Esto disparará el debounce a "" y detendrá el efecto
  };

  const removeMember = (userId: string) => {
    setSelectedMembers((prev) => prev.filter((m) => m.id !== userId));
  };

  const handleGroupSelect = (group: Group) => {
    if (group.miembros) {
      group.miembros.forEach((m) => {
        addMember({
          id: m.id,
          nombre: m.nombre,
          email: m.email,
          usuario: m.nombre,
        } as User);
      });
    }
    setShowGroups(false);
  };

  const formId = initialData
    ? `edit-project-form-${initialData.id}`
    : "create-project-form";

  const handleCreateProject = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loadingAction) return;
    setLoadingAction(true);
    const formData = new FormData(e.currentTarget);

    const projectData: Project = {
      ...initialData,
      nombre: formData.get("nombre") as string,
      descripcion: formData.get("descripcion") as string,
      estado: formData.get("estado") as any,
      miembros:
        selectedMembers.length > 0
          ? (selectedMembers.map((m) => m.id!) as any)
          : undefined,
    };

    try {
      const success = await onSubmit(projectData);
      if (success) {
        setShowModal(false);
        // No reseteamos inmediatamente si es edit para evitar parpadeo antes de desmontar
        if (!initialData) {
          setSelectedMembers([]);
          setSearchTerm("");
        }
      }
    } finally {
      setLoadingAction(false);
    }
  };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-100 hidden items-center justify-center bg-black/60 backdrop-blur-sm opacity-0"
    >
      <article
        ref={contentRef}
        className="relative flex flex-col gap-6 max-w-md w-full bg-white rounded-2xl p-4 2xl:p-8 shadow-2xl"
      >
        <header className="flex items-center justify-between">
          <div>
            <h3 className="text-xl 2xl:text-2xl font-bold text-gray-900">
              {initialData ? "Editar Proyecto" : "Nuevo Proyecto"}
            </h3>
          </div>
          <button onClick={() => setShowModal(false)}>
            <X className="size-5 2xl:size-6 text-gray-400 hover:text-red-500 transition-colors" />
          </button>
        </header>

        <form
          id={formId}
          onSubmit={handleCreateProject}
          className="flex flex-col gap-5"
        >
          {PROJECT_FORM.map((input) => (
            <ProjectInput
              key={input.name}
              {...input}
              required={input.name === "nombre"}
              defaultValue={
                initialData
                  ? (initialData[input.name as keyof Project] as string)
                  : ""
              }
            />
          ))}

          {initialData && (
            <ProjectInput
              label="Estado del Proyecto"
              name="estado"
              type="select"
              defaultValue={initialData.estado}
              options={[
                { label: "En Progreso", value: "active" },
                { label: "Completado", value: "completed" },
                { label: "Atrasado", value: "overdue" },
              ]}
            />
          )}

          <div className="flex flex-col gap-3">
            <label className="text-sm font-semibold text-gray-700">
              {initialData ? "Equipo del Proyecto" : "Añadir Equipo"}
            </label>

            {/* Chips de seleccionados */}
            <div className="flex flex-wrap gap-2">
              {selectedMembers.map((miembro) => (
                <div
                  key={miembro.id}
                  className="flex items-center gap-2 bg-blue-50 text-blue-600 px-2 py-1 rounded-lg text-xs border border-blue-100"
                >
                  <span className="truncate max-w-[100px]">
                    {miembro.nombre || miembro.usuario}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeMember(miembro.id!)}
                  >
                    <X className="size-3" />
                  </button>
                </div>
              ))}
            </div>

            {/* Buscador */}
            <div className="relative">
              <div className="relative">
                <Search
                  className={`absolute left-3 top-1/2 -translate-y-1/2 size-4 transition-colors ${
                    loading ? "text-blue-500 animate-spin" : "text-gray-400"
                  }`}
                />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={handleInputChange}
                  placeholder="Buscar por nombre o email..."
                  className="w-full pl-10 pr-24 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500 transition-all"
                />

                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  {loading && searchTerm.length >= 3 && (
                    <Loader2 className="size-3 animate-spin text-gray-400" />
                  )}
                  <button
                    type="button"
                    onClick={() => setShowGroups(!showGroups)}
                    className="flex items-center gap-1 px-2 py-1 bg-white border border-gray-200 rounded-lg text-[10px] font-bold text-gray-600 hover:bg-gray-50 transition-colors shadow-sm"
                  >
                    <Users className="size-3" />
                    Grupo
                  </button>
                </div>

                {/* Dropdown de Grupos */}
                {showGroups && (
                  <div className="absolute z-110 top-full mt-2 w-full bg-white border border-gray-100 rounded-xl shadow-2xl max-h-40 overflow-y-auto p-1">
                    <p className="p-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      Tus Comunidades
                    </p>
                    {groups.length === 0 ? (
                      <p className="p-2 text-xs text-center text-gray-500">
                        No tienes grupos creados
                      </p>
                    ) : (
                      groups.map((group) => (
                        <button
                          key={group.id}
                          type="button"
                          onClick={() => handleGroupSelect(group)}
                          className="w-full flex items-center justify-between p-2 hover:bg-blue-50 rounded-lg transition-colors text-left"
                        >
                          <div className="flex items-center gap-2">
                            <div className="size-6 bg-blue-100 rounded-md flex items-center justify-center text-blue-600">
                              <Users className="size-3" />
                            </div>
                            <span className="text-xs font-semibold">
                              {group.nombre}
                            </span>
                          </div>
                          <span className="text-[10px] text-gray-400">
                            {group.miembros?.length || 0} miemb.
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Dropdown de resultados filtrados */}
              {userSearch.length > 0 && (
                <ul className="absolute z-100 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-xl max-h-40 overflow-y-auto p-1">
                  {userSearch
                    .filter(
                      (user) => !selectedMembers.some((m) => m.id === user.id),
                    )
                    .map((user) => {
                      return (
                        <li key={user.id}>
                          <button
                            type="button"
                            onClick={() => addMember(user)}
                            className="w-full flex items-center justify-between p-2 hover:bg-blue-50 rounded-lg transition-colors group"
                          >
                            <div className="flex items-center gap-2 text-left">
                              <MemberAvatar
                                name={user.nombre || user.usuario}
                                className="size-6"
                              />
                              <div>
                                <p className="text-xs font-bold">
                                  {user.nombre || user.usuario}
                                </p>
                                <p className="text-[10px] text-gray-500">
                                  {user.email}
                                </p>
                              </div>
                            </div>
                            <UserPlus className="size-4 text-gray-400 group-hover:text-blue-500" />
                          </button>
                        </li>
                      );
                    })}
                </ul>
              )}
            </div>
          </div>
        </form>

        <footer className="flex items-center justify-end gap-3 mt-4">
          <Button
            onClick={() => setShowModal(false)}
            style="secondary"
            type="button"
          >
            Cancelar
          </Button>
          <Button type="submit" form={formId} disabled={loadingAction}>
            {loadingAction ? (
              <Loader2 className="size-4 animate-spin" />
            ) : initialData ? (
              <Pencil className="size-4" />
            ) : (
              <Plus className="size-4" />
            )}
            {initialData ? "Guardar" : "Crear"}
          </Button>
        </footer>
      </article>
    </div>
  );
}
