"use client";

// Hooks
import { useEffect, useRef, useState } from "react";
import { useProjectModalAnimation } from "@/hooks/useProjectModalAnimation";
import { useDebounce } from "@/hooks/useDebounce";
// Context
import { useUsers } from "@/contexts/UsersContext";
// Types
import { Project, User } from "@/lib/types";
// Icons
import { Plus, Search, X, UserPlus, Pencil, Loader2 } from "lucide-react";
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

  const debouncedSearchTerm = useDebounce(searchTerm, 400);

  // ANIMACION
  useProjectModalAnimation(showModal, overlayRef, contentRef);

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
    setSelectedMembers((prev) => [...prev, user]);
    setSearchTerm(""); // Esto disparará el debounce a "" y detendrá el efecto
  };

  const removeMember = (userId: string) => {
    setSelectedMembers((prev) => prev.filter((m) => m.id !== userId));
  };

  const handleCreateProject = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loadingAction) return;
    setLoadingAction(true);
    const formData = new FormData(e.currentTarget);

    const projectData: Project = {
      ...initialData,
      nombre: formData.get("nombre") as string,
      descripcion: formData.get("descripcion") as string,
      miembros: selectedMembers.map((m) => m.id!) as any,
    };

    try {
      const success = await onSubmit(projectData);
      if (success) {
        setShowModal(false);
        setSelectedMembers([]);
        setSearchTerm("");
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
          id="project-form"
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

          {!initialData && (
            <div className="flex flex-col gap-3">
              <label className="text-sm font-semibold text-gray-700">
                Añadir Equipo
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
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500 transition-all"
                  />

                  {/* Opcional: Mostrar un loader pequeño si está cargando */}
                  {loading && searchTerm.length >= 3 && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Loader2 className="size-3 animate-spin text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Dropdown de resultados filtrados */}
                {userSearch.length > 0 && (
                  <ul className="absolute z-100 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-xl max-h-40 overflow-y-auto p-1">
                    {userSearch
                      .filter(
                        (user) =>
                          !selectedMembers.some((m) => m.id === user.id),
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
          )}
        </form>

        <footer className="flex items-center justify-end gap-3 mt-4">
          <Button
            onClick={() => setShowModal(false)}
            style="secondary"
            type="button"
          >
            Cancelar
          </Button>
          <Button type="submit" form="project-form" disabled={loadingAction}>
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
