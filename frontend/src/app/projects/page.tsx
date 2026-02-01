"use client";

// Components
import { CreateProjectCard } from "@/components/projects/CreateProjectCard";
import { ProjectStateCard } from "@/components/projects/ProjectStateCard";
// Hooks
import { useEffect, useMemo, useState } from "react";
// Contexts
import { useUsers } from "@/contexts/UsersContext";
import { useAuth } from "@/contexts/AuthContext";
import { useProjects } from "@/contexts/ProjectsContext";
//Constants
import { PROJECT_STATES } from "@/lib/constants";
// Icons
import { Plus, Loader2 } from "lucide-react";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { CreateProjectModal } from "@/components/projects/CreateProjectModal";

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
    <main className="min-h-screen flex flex-col gap-8 mt-12 max-w-11/12 xl:max-w-10/12 2xl:max-w-8/12 mx-auto relative">
      <header className="flex flex-col gap-4">
        <h2 className="text-xl text-blue-500 font-semibold">
          👋 ¡Bienvenido, {mounted && welcomeMessage}!
        </h2>
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-semibold tracking-wide">
            Mis Proyectos
          </h1>
          <button
            onClick={handleShowModal}
            className="flex items-center gap-2 px-6 py-3 rounded-lg bg-blue-500 text-white font-medium shadow-lg shadow-blue-500/30 hover:bg-blue-600 hover:shadow-blue-500/50 hover:-translate-y-1 transition-all duration-200 cursor-pointer"
          >
            <Plus />
            Nuevo Proyecto
          </button>
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
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
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
          <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 min-h-72">
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
