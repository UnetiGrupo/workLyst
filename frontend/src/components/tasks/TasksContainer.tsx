"use client";

// Hooks
import { useEffect, useState } from "react";
// Context
import { useProjects } from "@/contexts/ProjectsContext";
import { useAuth } from "@/contexts/AuthContext";
import { useTasks } from "@/contexts/TasksContext";
import { Plus, Loader2 } from "lucide-react";
import { TaskBoard } from "./TaskBoard";
import { AddTaskModal } from "./AddTaskModal";

interface TasksContainerProps {
  projectId: string;
}

export function TasksContainer({ projectId }: TasksContainerProps) {
  const [showTaskModal, setShowTaskModal] = useState(false);

  const { mounted, user } = useAuth();
  const { getProjectById, selectedProject, states } = useProjects();
  const { fetchTasks, tasks, loading: tasksLoading } = useTasks();

  useEffect(() => {
    if (mounted && user) {
      getProjectById(projectId);
      fetchTasks(projectId);
    }
  }, [projectId, getProjectById, fetchTasks, mounted, user]);

  // Loading Logic:
  // 1. Si no hay proyecto Y está cargando -> Loader Full Screen
  // 2. Si hay proyecto pero NO hay tareas Y está cargando tareas -> Loader en el cuerpo, pero manteniendo estructura
  const isProjectLoading = states.loading && !selectedProject;
  const isInitialTaskLoad = tasksLoading && tasks.length === 0;

  if (isProjectLoading) {
    return (
      <div className="flex h-[80vh] w-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
          <p className="text-gray-500 font-medium">Cargando proyecto...</p>
        </div>
      </div>
    );
  }

  if (!selectedProject) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-gray-500">No se encontró el proyecto.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 max-w-10/12 mx-auto mt-12 min-h-screen relative">
      <header className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold">{selectedProject.nombre}</h1>
          <p className="text-lg text-gray-600 max-w-xl">
            {selectedProject.descripcion}
          </p>
        </div>
        <button
          className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg shadow-lg 
          shadow-blue-500/30 hover:bg-blue-600 hover:shadow-blue-500/50 hover:-translate-y-1 transition-all font-medium"
          onClick={() => setShowTaskModal(true)}
        >
          <Plus /> Nueva tarea
        </button>
      </header>

      {/* CARGANDO TAREAS */}
      {isInitialTaskLoad ? (
        <div className="flex h-64 w-full items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
            <p className="text-gray-500 font-medium">Cargando tareas...</p>
          </div>
        </div>
      ) : (
        <TaskBoard openModal={() => setShowTaskModal(true)} tasks={tasks} />
      )}

      {/* MODAL SIEMPRE RENDERIZADO */}
      <AddTaskModal
        projectId={projectId}
        closeModal={() => setShowTaskModal(false)}
        showModal={showTaskModal}
      />
    </div>
  );
}
