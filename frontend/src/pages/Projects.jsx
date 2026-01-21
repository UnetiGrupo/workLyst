// Hooks
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useProjects } from "../context/ProjectsContext";
import { useAuth } from "../context/AuthContext";

// Componentes
import { ProjectModal } from "../components/projects/ProjectModal";
import { ProjectCard } from "../components/projects/ProjectCard";
import { ProjectStats } from "../components/projects/ProjectStats";
import { CreateProjectCard } from "../components/projects/CreateProjectCard";

export function Projects() {
  // Estados y Hooks
  const [showModal, setShowModal] = useState(false);
  const { projects, addProject, deleteProject } = useProjects();
  const { user, tokens } = useAuth();
  const navigate = useNavigate();

  // Efectos
  useEffect(() => {
    if (!tokens.tokenAcceso || !user) {
      return navigate("/login");
    }
  }, [tokens, user, navigate]);

  // Manejadores de eventos
  const handleShowModal = () => setShowModal(!showModal);

  const handleAddProject = (project) => {
    addProject(project);
    setShowModal(false);
  };

  return (
    <main className="flex flex-col gap-8 max-w-7xl mx-auto pt-12 px-6 pb-20">
      {/* Encabezado Principal */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-col gap-2">
          <p className="text-blue-600 font-medium">
            👋 Bienvenido, {user?.nombre}
          </p>
          <h1 className="text-4xl font-bold text-gray-900">Mis Proyectos</h1>
          <p className="text-gray-500 text-lg">
            Gestiona y colabora en tus proyectos de equipo
          </p>
        </div>
        <button
          onClick={handleShowModal}
          className="px-6 py-3 bg-blue-600 rounded-xl text-white font-medium hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex items-center gap-2"
          aria-label="Crear un nuevo proyecto"
        >
          <span>+</span> Nuevo Proyecto
        </button>
      </header>

      {/* Sección de Estadísticas */}
      <section aria-label="Estadísticas de proyectos">
        <ProjectStats projects={projects} />
      </section>

      {/* Grid de Proyectos */}
      <section aria-label="Lista de proyectos activo">
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {projects.map((project) => (
            <li key={project.id}>
              <ProjectCard
                {...project}
                onClick={(e) => {
                  e.preventDefault();
                  deleteProject(project.id);
                }}
              />
            </li>
          ))}

          <li>
            <CreateProjectCard onClick={handleShowModal} />
          </li>
        </ul>
      </section>

      {/* Modales */}
      {showModal && (
        <ProjectModal
          onClose={() => setShowModal(false)}
          onAddProject={handleAddProject}
        />
      )}
    </main>
  );
}
