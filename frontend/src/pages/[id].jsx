// Hooks
import { useParams, Link } from "react-router-dom";
import { useState } from "react";

// Componentes
import { Users, Calendar, Options, Plus } from "../components/common/Icons";

// Contexto
import { useProjects } from "../context/ProjectsContext";

export function ProjectDetail() {
  const { id } = useParams();
  const { getProject, addTask, moveTask } = useProjects();
  const project = getProject(id);

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [draggedTask, setDraggedTask] = useState(null);

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <h1 className="text-2xl font-bold text-gray-800">
          Proyecto no encontrado
        </h1>
        <Link
          to="/projects"
          className="text-blue-500 hover:underline mt-4"
          aria-label="Volver a la lista de proyectos"
        >
          Volver a mis proyectos
        </Link>
      </div>
    );
  }

  const handleAddTask = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const title = formData.get("title");
    const description = formData.get("description");

    if (title) {
      addTask(id, "todo", { title, description });
      setIsTaskModalOpen(false);
    }
  };

  const onDragStart = (e, task, sourceCol, index) => {
    setDraggedTask({ task, sourceCol, index });
    e.dataTransfer.effectAllowed = "move";
  };

  const onDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const onDrop = (e, destCol) => {
    e.preventDefault();
    if (draggedTask) {
      const destIndex = project.tasks[destCol].length;
      moveTask(
        id,
        draggedTask.sourceCol,
        destCol,
        draggedTask.index,
        destIndex,
      );
      setDraggedTask(null);
    }
  };

  return (
    <main className="max-w-7xl mx-auto pt-10 px-6 h-full flex flex-col">
      <nav className="mb-6" aria-label="Navegación de proyecto">
        <Link
          to="/projects"
          className="text-gray-500 hover:text-blue-600 transition-colors"
          aria-label="Volver a todos los proyectos"
        >
          ← Volver a Proyectos
        </Link>
      </nav>

      <header className="flex justify-between items-start mb-8">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <h1 className="text-4xl font-bold text-gray-900">{project.name}</h1>
            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
              {project.status}
            </span>
          </div>
          <p className="text-xl text-gray-500 max-w-2xl">
            {project.description}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div
            className="flex -space-x-2 overflow-hidden"
            aria-label="Colaboradores del proyecto"
          >
            {project.colaborators &&
              project.colaborators.map((c, i) => (
                <div
                  key={i}
                  className="h-10 w-10 rounded-full ring-2 ring-white bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600"
                  title={c}
                  aria-label={`Colaborador ${c}`}
                >
                  {c[0]}
                </div>
              ))}
          </div>
          <button
            onClick={() => setIsTaskModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            aria-label="Crear nueva tarea"
          >
            <Plus className="size-5" aria-hidden="true" />
            Nueva Tarea
          </button>
        </div>
      </header>

      <section
        className="flex-1 overflow-x-auto pb-8"
        aria-label="Tablero Kanban de tareas"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 min-w-[1000px] md:min-w-0 h-full">
          {/* Columns */}
          {["todo", "inprogress", "done"].map((columnId) => {
            const columnTitle = {
              todo: "Por hacer",
              inprogress: "En progreso",
              done: "Completado",
            }[columnId];

            const columnColor = {
              todo: "bg-gray-100/50 border-gray-200",
              inprogress: "bg-blue-50/50 border-blue-200",
              done: "bg-green-50/50 border-green-200",
            }[columnId];

            return (
              <section
                key={columnId}
                onDragOver={onDragOver}
                onDrop={(e) => onDrop(e, columnId)}
                className={`flex flex-col rounded-xl border ${columnColor} p-4 h-full min-h-[500px] transition-colors ${
                  draggedTask && draggedTask.sourceCol !== columnId
                    ? "bg-opacity-80 ring-2 ring-blue-400/20"
                    : ""
                }`}
                aria-label={`Columna ${columnTitle}`}
              >
                <h3 className="font-semibold text-gray-700 mb-4 flex justify-between items-center">
                  {columnTitle}
                  <span className="bg-white px-2 py-0.5 rounded-full text-sm border shadow-sm text-gray-500">
                    {project.tasks[columnId].length}
                  </span>
                </h3>

                <ul
                  className="flex flex-col gap-3 flex-1"
                  aria-label={`Lista de tareas en ${columnTitle}`}
                >
                  {project.tasks[columnId].map((task, index) => (
                    <li key={task.id || index}>
                      <article
                        draggable
                        onDragStart={(e) =>
                          onDragStart(e, task, columnId, index)
                        }
                        className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 cursor-move hover:shadow-md transition-shadow group focus-within:ring-2 focus-within:ring-blue-500"
                        tabIndex="0"
                        aria-label={`Tarea: ${task.title}`}
                      >
                        <h4 className="font-medium text-gray-900 mb-1">
                          {task.title}
                        </h4>
                        {task.description && (
                          <p className="text-sm text-gray-500 line-clamp-2">
                            {task.description}
                          </p>
                        )}
                        <div className="flex justify-end mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            className="p-1 hover:bg-gray-100 rounded"
                            aria-label="Opciones de tarea"
                          >
                            <Options
                              className="size-4 text-gray-400"
                              aria-hidden="true"
                            />
                          </button>
                        </div>
                      </article>
                    </li>
                  ))}
                  {project.tasks[columnId].length === 0 && (
                    <li className="list-none">
                      <div className="text-center py-8 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-lg">
                        Soltar tareas aquí
                      </div>
                    </li>
                  )}
                </ul>
              </section>
            );
          })}
        </div>
      </section>

      {isTaskModalOpen && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div
            className="absolute inset-0"
            onClick={() => setIsTaskModalOpen(false)}
            aria-hidden="true"
          />
          <article className="relative bg-white p-6 rounded-xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in duration-200">
            <h2 id="modal-title" className="text-xl font-bold mb-4">
              Nueva Tarea
            </h2>
            <form onSubmit={handleAddTask} className="flex flex-col gap-4">
              <label htmlFor="title" className="sr-only">
                Título de la tarea
              </label>
              <input
                id="title"
                name="title"
                required
                placeholder="Título de la tarea"
                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                autoFocus
              />

              <label htmlFor="description" className="sr-only">
                Descripción (opcional)
              </label>
              <textarea
                id="description"
                name="description"
                placeholder="Descripción (opcional)"
                rows={3}
                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              />
              <div className="flex justify-end gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setIsTaskModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Crear Tarea
                </button>
              </div>
            </form>
          </article>
        </div>
      )}
    </main>
  );
}
