"use client";

// Components
import { CreateProjectCard } from "@/components/projects/CreateProjectCard";
import { ProjectStateCard } from "@/components/projects/ProjectStateCard";
// Hooks
import { useEffect, useMemo, useState } from "react";
// Contexts
import { useAuth } from "@/contexts/AuthContext";
import { useProjects } from "@/contexts/ProjectsContext";
//Constants
import { PROJECT_STATES } from "@/lib/constants";
// Icons
import { Plus, Loader2 } from "lucide-react";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { CreateProjectModal } from "@/components/projects/CreateProjectModal";
import { Button } from "@/components/common/Button";

export default function ProjectsPage() {
  const [showModal, setShowModal] = useState(false);

  const { fetchProjects, projects, createProject, states } = useProjects();
  const { user, mounted } = useAuth();

  useEffect(() => {
    if (mounted && user) {
      fetchProjects();
    }
  }, [mounted, user, fetchProjects]);

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

  return (
    <main className="min-h-screen flex flex-col gap-4 2xl:gap-8 mt-8 2xl:mt-12 max-w-11/12 2xl:max-w-10/12 mx-auto relative">
      <header className="flex flex-col gap-4">
        <h2 className="text-lg 2xl:text-xl text-blue-500 font-semibold">
          👋 ¡Bienvenido, {mounted && welcomeMessage}!
        </h2>
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl 2xl:text-4xl font-semibold tracking-wide">
              Mis Proyectos
            </h1>
            <p className="text-sm 2xl:text-base text-gray-500">
              Administra tus proyectos grupales aquí
            </p>
          </div>
          <Button onClick={handleShowModal}>
            <Plus />
            Nuevo Proyecto
          </Button>
        </div>
      </header>

      {states.loading && projects.length === 0 ? (
        <div className="flex h-64 w-full items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
            <p className="text-gray-500 font-medium">Cargando proyectos...</p>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mt-2 2xl:mt-0">
            {PROJECT_STATES.map((state) => {
              // Calcular valor dinamicamente
              const value =
                state.id === "total"
                  ? projects.length
                  : projects.filter((p) => p.estado === state.id).length;

              return (
                <ProjectStateCard key={state.id} {...state} value={value} />
              );
            })}
          </div>
          <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 min-h-48 2xl:min-h-72 mt-4 2xl:mt-0">
            {projects.map((project, index) => (
              <li
                key={project?.id || `project-${index}`}
                className="col-span-2"
              >
                <ProjectCard {...project} />
              </li>
            ))}
            <li className="col-span-2">
              <CreateProjectCard onClick={handleShowModal} />
            </li>
          </ul>
        </>
      )}

      {/* Modal para crear el Proyecto */}
      <CreateProjectModal
        onSubmit={createProject}
        showModal={showModal}
        setShowModal={setShowModal}
      />
    </main>
  );
}
