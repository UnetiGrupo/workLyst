import { useState } from "react";
import { ProjectModal } from "../components/projects/ProjectModal";
import { ProjectsStatus } from "../lib/constants";
import { Plus, Folder } from "../components/common/Icons";

export function Projects() {
  const [showModal, setShowModal] = useState(false);

  const handleShowModal = () => {
    setShowModal(!showModal);
  };

  const [projects, setProjects] = useState([
    {
      id: 1,
      name: "Diseño de Sistema",
      status: "En Progreso",
      date: "12/01/2026",
    },
  ]);

  const handleAddProject = (project) => {
    setProjects([...projects, project]);
    setShowModal(false);
  };

  return (
    <main className="flex flex-col gap-6 max-w-9/12 mx-auto pt-12">
      <header className="flex justify-between items-center">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-bold">Mis Proyectos</h1>
          <p className="text-gray-500 text-lg">
            Gestiona y colabora en tus proyectos de equipo
          </p>
        </div>
        <button
          onClick={handleShowModal}
          className="px-4 py-2.5 bg-blue-500 rounded-lg text-white font-medium 
        hover:bg-blue-600 hover:scale-105 transition cursor-pointer"
        >
          Nuevo Proyecto
        </button>
      </header>
      <section className="flex flex-col gap-4 mt-2">
        <div className="grid grid-cols-4 gap-4">
          {ProjectsStatus.map(
            ({
              label,
              value,
              status,
              bgColor,
              borderColor,
              textColor,
              ringColor,
            }) => (
              <article
                key={status}
                className={`flex flex-col gap-2 p-4 ${bgColor} rounded-xl border-r-3 border-b-3 ${borderColor} ring-2 ${ringColor}`}
              >
                <h2 className="text-lg text-gray-700 font-medium">{label}</h2>
                <p className={`text-4xl ${textColor}`}>{value}</p>
              </article>
            )
          )}
        </div>
        <div className="grid grid-cols-4 gap-4">
          {projects.map((project) => (
            <article
              key={project.id}
              className="group flex flex-col justify-between p-6 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all hover:border-blue-200 cursor-pointer min-h-[200px]"
            >
              <div className="flex justify-between items-start">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Folder className="size-6" />
                </div>
                <span className="text-xs font-medium px-2 py-1 bg-green-100 text-green-700 rounded-full">
                  {project.status}
                </span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-1 group-hover:text-blue-600 transition-colors">
                  {project.name}
                </h3>
                <p className="text-sm text-gray-500">Editado: {project.date}</p>
              </div>
            </article>
          ))}
          <article
            onClick={handleShowModal}
            className="flex flex-col items-center justify-center gap-2 p-8 rounded-2xl border-2 border-dashed border-gray-800 cursor-pointer hover:bg-gray-200 hover:border-yellow-500 transition min-h-[200px]"
          >
            <Plus className="size-12 p-2 rounded-full bg-gray-300 text-gray-600" />
            <h3 className="text-2xl font-medium">Crear Nuevo Proyecto</h3>
            <p className="text-gray-500 text-center">
              Comienza un nuevo proyecto colaborativo
            </p>
          </article>
        </div>
        {showModal && (
          <ProjectModal
            onClose={() => setShowModal(false)}
            onAddProject={handleAddProject}
          />
        )}
      </section>
    </main>
  );
}
