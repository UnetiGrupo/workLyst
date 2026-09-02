"use client";

// Components
import { CreateProjectCard } from "@/components/projects/CreateProjectCard";
import { ProjectStateCard } from "@/components/projects/ProjectStateCard";
// Skeleton Components
import { ProjectStateSkeleton } from "@/components/projects/skeleton/ProjectStateSkeleton";
import { ProjectCardSkeleton } from "@/components/projects/skeleton/ProjectCardSkeleton";
// Hooks
import { useEffect, useMemo, useState } from "react";
// Contexts
import { useAuth } from "@/contexts/AuthContext";
import { useProjects } from "@/contexts/ProjectsContext";
//Constants
import { PROJECT_STATES } from "@/lib/constants";
// Icons
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { Button } from "@/components/common/Button";
import type { Project, User } from "@/lib/types";
import dynamic from "next/dynamic";

const CreateProjectModal = dynamic(
  () =>
    import("@/components/projects/CreateProjectModal").then(
      (mod) => mod.CreateProjectModal,
    ),
  { ssr: false },
);

const ConfirmDeletion = dynamic(
  () =>
    import("@/components/common/ConfirmDeletion").then(
      (mod) => mod.ConfirmDeletion,
    ),
  { ssr: false },
);

const AddMemberModal = dynamic(
  () =>
    import("@/components/projects/AddMemberModal").then(
      (mod) => mod.AddMemberModal,
    ),
  { ssr: false },
);

const RemoveMemberModal = dynamic(
  () =>
    import("@/components/projects/RemoveMemberModal").then(
      (mod) => mod.RemoveMemberModal,
    ),
  { ssr: false },
);

import gsap from "gsap";

export default function ProjectsPage() {
  const [showModal, setShowModal] = useState(false);
  const [isDataReady, setIsDataReady] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 4;

  // States for card modals
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [projectToAddMember, setProjectToAddMember] = useState<Project | null>(
    null,
  );
  const [projectToRemoveMember, setProjectToRemoveMember] =
    useState<Project | null>(null);

  const {
    fetchProjects,
    projects,
    createProject,
    states,
    updateProject,
    deleteProject,
    addMember,
    removeMember,
  } = useProjects();
  const { user, mounted } = useAuth();
  const isLoading = states.loading && !isDataReady;

  useEffect(() => {
    async function handleDataLoad() {
      if (mounted && user) {
        setIsDataReady(false);
        await fetchProjects();
        setIsDataReady(true);
      }
    }

    // Carga inicial
    handleDataLoad();

    // Listener para refresco global
    window.addEventListener("refresh_worklyst_data", handleDataLoad);
    return () =>
      window.removeEventListener("refresh_worklyst_data", handleDataLoad);
  }, [mounted, user, fetchProjects]);

  useEffect(() => {
    // Solo animamos si ya no esta cargando y hay proyectos en el DOM
    if (!isLoading && projects.length > 0 && isDataReady) {
      animatePageChange();
    }
  }, [isLoading, projects.length, isDataReady]);

  const animatePageChange = () => {
    const cards = document.querySelectorAll(".project-card-anim");
    if (cards.length > 0) {
      gsap.fromTo(
        cards,
        {
          opacity: 0,
          y: 30,
          scale: 0.9,
          filter: "blur(10px)",
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          filter: "blur(0px)",
          duration: 0.8,
          ease: "back.out(1.2)",
          stagger: {
            each: 0.1,
            from: "start",
          },
          clearProps: "all",
        },
      );
    }
  };

  const handlePageChange = (newPage: number) => {
    const cards = document.querySelectorAll(".project-card-anim");

    // Animación de salida "cool"
    gsap.to(cards, {
      opacity: 0,
      y: -20,
      scale: 0.95,
      filter: "blur(5px)",
      duration: 0.4,
      stagger: 0.05,
      ease: "power2.in",
      onComplete: () => {
        setCurrentPage(newPage);
        // La animación de entrada se dispara por el useEffect cuando cambia projects o pagina
        window.scrollTo({ top: 0, behavior: "smooth" });
      },
    });
  };

  // Paginación lógica
  const totalPages = Math.ceil(projects.length / ITEMS_PER_PAGE);
  const paginatedProjects = projects.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  // Re-ajustar pagina si se eliminan proyectos
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [projects.length, totalPages]);

  useEffect(() => {
    if (isDataReady) {
      animatePageChange();
    }
  }, [currentPage]);

  const welcomeMessage = useMemo(() => {
    if (!user?.nombre) return "Usuario";
    const names = user.nombre.split(" ");
    const firstName = names[0];
    const lastInitial = names[1] ? ` ${names[1].charAt(0).toUpperCase()}.` : "";
    return `${firstName}${lastInitial}`;
  }, [user?.nombre]);

  const handleShowModal = () => {
    setShowModal(!showModal);
  };

  // --- Modal Handlers ---

  const handleEditSubmit = async (projectData: Project) => {
    const success = await updateProject(projectToEdit!.id!, projectData);
    if (success) setProjectToEdit(null);
    return success;
  };

  const handleDeleteSubmit = async () => {
    const success = await deleteProject(projectToDelete!.id!);
    if (success) setProjectToDelete(null);
    return success;
  };

  const handleAddMemberSubmit = async (user: User) => {
    const success = await addMember(projectToAddMember!.id!, user.id!, 0);
    if (success) setProjectToAddMember(null);
    return success;
  };

  const handleRemoveMemberSubmit = async (userId: string) => {
    const success = await removeMember(projectToRemoveMember!.id!, userId);
    if (success) setProjectToRemoveMember(null);
    return success;
  };

  return (
    <main className="min-h-screen flex flex-col gap-4 2xl:gap-8 mt-8 2xl:mt-12 max-w-11/12 2xl:max-w-10/12 mx-auto relative">
      <header className="flex flex-col gap-4">
        <h2 className="text-lg 2xl:text-xl text-blue-500 font-semibold">
          👋 ¡Bienvenido, {mounted && welcomeMessage}!
        </h2>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-0 justify-between">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl md:text-3xl 2xl:text-4xl font-semibold tracking-wide">
              Mis Proyectos
            </h1>
            <p className="text-xs md:text-sm 2xl:text-base text-gray-500">
              Administra tus proyectos grupales aquí
            </p>
          </div>
          <Button onClick={handleShowModal}>
            <Plus />
            Nuevo Proyecto
          </Button>
        </div>
      </header>

      {isLoading ? (
        <>
          <ProjectStateSkeleton />
          <ProjectCardSkeleton />
        </>
      ) : (
        <>
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-6 mt-2 2xl:mt-0">
            {PROJECT_STATES.map((state) => {
              // Calcular valor dinamicamente
              const value =
                state.id === "total"
                  ? projects.length
                  : projects.filter((p) => p.estado === state.id).length;

              return (
                <div key={state.id} className="project-card-anim">
                  <ProjectStateCard {...state} value={value} />
                </div>
              );
            })}
          </div>
          <ul
            className={`grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 min-h-48 2xl:min-h-72 mt-4 2xl:mt-0 transition-all duration-700 ${isDataReady ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          >
            {paginatedProjects.map((project, index) => (
              <li
                key={project?.id || `project-${index}`}
                className="col-span-2 project-card-anim"
              >
                <ProjectCard
                  {...project}
                  onEdit={(p) => setProjectToEdit(p)}
                  onDelete={(p) => setProjectToDelete(p)}
                  onAddMember={(p) => setProjectToAddMember(p)}
                  onRemoveMember={(p) => setProjectToRemoveMember(p)}
                  isLoading={states.loading}
                />
              </li>
            ))}
            {/* Solo mostramos el CreateProjectCard si hay espacio o es la última página */}
            {(paginatedProjects.length < ITEMS_PER_PAGE ||
              currentPage === totalPages) && (
              <li className="col-span-2 project-card-anim">
                <CreateProjectCard onClick={handleShowModal} />
              </li>
            )}
          </ul>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-8 mb-12">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:border-blue-300"
                  aria-label="Página anterior"
                >
                  <ChevronLeft className="size-5 text-slate-600" />
                </button>

                <div className="flex items-center gap-1.5 px-2">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() =>
                        currentPage !== i + 1 && handlePageChange(i + 1)
                      }
                      className={`size-10 rounded-xl text-sm font-semibold transition-all ${
                        currentPage === i + 1
                          ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                          : "text-slate-500 hover:bg-slate-100"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:border-blue-300"
                  aria-label="Página siguiente"
                >
                  <ChevronRight className="size-5 text-slate-600" />
                </button>
              </div>

              <span className="text-sm text-slate-400 font-medium">
                Mostrando {paginatedProjects.length} de {projects.length}{" "}
                proyectos
              </span>
            </div>
          )}
        </>
      )}

      {/* Modal para crear el Proyecto */}
      <CreateProjectModal
        onSubmit={createProject}
        showModal={showModal}
        setShowModal={setShowModal}
      />

      {/* Modal de Edición */}
      {projectToEdit && (
        <CreateProjectModal
          showModal={!!projectToEdit}
          setShowModal={(show) => !show && setProjectToEdit(null)}
          initialData={projectToEdit}
          onSubmit={handleEditSubmit}
        />
      )}

      {/* Modal de Eliminación */}
      {projectToDelete && (
        <ConfirmDeletion
          type="project"
          isOpen={!!projectToDelete}
          onClose={() => setProjectToDelete(null)}
          onSubmit={handleDeleteSubmit}
        />
      )}

      {/* Modal de Agregar Miembro */}
      {projectToAddMember && (
        <AddMemberModal
          isOpen={!!projectToAddMember}
          onClose={() => setProjectToAddMember(null)}
          onAddMember={handleAddMemberSubmit}
          currentMembers={projectToAddMember.miembros}
        />
      )}

      {/* Modal de Eliminar Miembro */}
      {projectToRemoveMember && (
        <RemoveMemberModal
          isOpen={!!projectToRemoveMember}
          onClose={() => setProjectToRemoveMember(null)}
          onRemoveMember={handleRemoveMemberSubmit}
          members={projectToRemoveMember.miembros || []}
        />
      )}
    </main>
  );
}
