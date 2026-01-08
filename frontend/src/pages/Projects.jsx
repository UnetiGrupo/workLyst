import { useState } from "react";
import { ProjectModal } from "../components/projects/ProjectModal";
import { ProjectsStatus } from "../lib/constants";

export function Projects() {
  const [showModal, setShowModal] = useState(false);

  const handleShowModal = () => {
    setShowModal(!showModal);
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
        {showModal && <ProjectModal />}
      </section>
    </main>
  );
}
