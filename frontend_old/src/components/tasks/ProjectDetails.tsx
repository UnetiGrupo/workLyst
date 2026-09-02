"use client";

// Hooks
import { useEffect, useState, useRef, useLayoutEffect } from "react";
// Contexts
import { useProjects } from "@/contexts/ProjectsContext";
import { useTasks } from "@/contexts/TasksContext";
import { useAuth } from "@/contexts/AuthContext";
import { useTaskStatuses } from "@/contexts/TaskStatusesContext";
// Components
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { MemberAvatar } from "@/components/common/MemberAvatar";
import { Button } from "../common/Button";
import { Plus, Pencil } from "lucide-react";
import { BoardColumn } from "./BoardColumn";
import { BoardColumnSkeleton } from "./skeleton/BoardColumnSkeleton";
import dynamic from "next/dynamic";

const CreateProjectModal = dynamic(
  () =>
    import("@/components/projects/CreateProjectModal").then(
      (mod) => mod.CreateProjectModal,
    ),
  { ssr: false },
);

const AddTaskModal = dynamic(
  () => import("./AddTaskModal").then((mod) => mod.AddTaskModal),
  { ssr: false },
);

const ConfirmDeletion = dynamic(
  () =>
    import("@/components/common/ConfirmDeletion").then(
      (mod) => mod.ConfirmDeletion,
    ),
  { ssr: false },
);
import { ProgressBar } from "@/components/common/ProggresBar";
// Icons
import { Circle, Clock, CheckCircle2 } from "lucide-react";
// Gsap
import gsap from "gsap";
import { Task } from "@/lib/types";

export function ProjectDetails({ projectId }: { projectId: string }) {
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [showEditProjectModal, setShowEditProjectModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { mounted, user } = useAuth();
  const {
    getProjectById,
    selectedProject,
    states,
    finishProject,
    updateProject,
  } = useProjects();
  const {
    fetchTasks,
    tasks,
    loading: tasksLoading,
    isDragging,
    deleteTask,
  } = useTasks();
  const { statuses, loading: statusesLoading } = useTaskStatuses();

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef<string | null>(null);

  // Detectar si la información en el contexto es de un proyecto anterior (Stale Data)
  const isStale = selectedProject?.id !== projectId;

  const isInitialTaskLoad = tasksLoading && tasks.length === 0;
  const isStatusesLoading = statusesLoading && statuses.length === 0;

  // Decidimos que parte esta cargando
  const showBoardSkeleton =
    isInitialTaskLoad || isStatusesLoading || isRefreshing || isStale;

  useEffect(() => {
    // Solo cargamos si tenemos montado el componente, el usuario y no hemos cargado este projectId ya
    if (mounted && user && initializedRef.current !== projectId) {
      getProjectById(projectId);
      fetchTasks(projectId);
      initializedRef.current = projectId;
    }
  }, [projectId, mounted, user, getProjectById, fetchTasks]);

  // Listener para refresco global (ej: desde el chatbot)
  useEffect(() => {
    const handleRefresh = async () => {
      if (mounted && user && projectId) {
        setIsRefreshing(true);
        await Promise.all([getProjectById(projectId), fetchTasks(projectId)]);
        setIsRefreshing(false);
      }
    };

    window.addEventListener("refresh_worklyst_data", handleRefresh);
    return () =>
      window.removeEventListener("refresh_worklyst_data", handleRefresh);
  }, [mounted, user, projectId, getProjectById, fetchTasks]);

  // Animaciones de entrada
  useLayoutEffect(() => {
    // Solo animamos una vez cuando los datos están listos y no se ve el skeleton
    if (!showBoardSkeleton && selectedProject && tasks.length >= 0) {
      const ctx = gsap.context(() => {
        const tl = gsap.timeline();

        // 1. Animamos el header
        tl.fromTo(
          ".header-anim",
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" },
        );

        // 2. Animamos las Columnas del tablero con un pequeño delay
        tl.fromTo(
          ".column-anim",
          { opacity: 0, y: 30, scale: 0.98 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.6,
            ease: "back.out(1.2)",
            stagger: 0.15,
          },
          "-=0.3", // Empezar un poco antes de que termine la anterior
        );
      });

      return () => ctx.revert();
    }
  }, [showBoardSkeleton, selectedProject]);

  // RECUPERAR TODOS LOS DATOS DEL PROYECTO (Solo si coinciden con el ID actual)
  const currentProject = !isStale ? selectedProject : null;
  const projectTasks = !isStale ? tasks : [];

  const { nombre, descripcion, miembros, estado } = currentProject || {};

  // Calcular progreso dinámico basado en los mismos criterios que el tablero
  const totalTasks = projectTasks.length;

  const completedStatus = statuses.find(
    (s) =>
      ["completada", "completed", "completado"].includes(
        (s.key || "").toLowerCase(),
      ) ||
      ["completada", "completed", "completado"].includes(
        (s.name || "").toLowerCase(),
      ),
  );

  const completedTasks = projectTasks.filter((t) => {
    if (!t.estado) return false;
    const estadoStr = String(t.estado).toLowerCase().trim();
    const completedKey = (completedStatus?.key || "___none___")
      .toLowerCase()
      .trim();
    const completedName = (completedStatus?.name || "___none___")
      .toLowerCase()
      .trim();

    return (
      estadoStr === completedKey ||
      estadoStr === completedName ||
      ["completada", "completed", "completado", "terminada"].includes(estadoStr)
    );
  }).length;

  useEffect(() => {
    if (
      totalTasks > 0 &&
      completedTasks === totalTasks &&
      selectedProject &&
      estado !== "completed" &&
      !tasksLoading // Asegurarnos de que no estamos en medio de una carga
    ) {
      finishProject(projectId);
    }
  }, [
    totalTasks,
    completedTasks,
    estado,
    projectId,
    finishProject,
    selectedProject,
    tasksLoading,
  ]);

  const breadcrumbsItems = [
    { label: "Inicio", href: "/" },
    { label: "Proyectos", href: "/projects" },
    { label: nombre || "", href: `/projects/${projectId}` },
  ];

  const handleAddTaskModal = () => {
    setShowAddTaskModal(!showAddTaskModal);
  };

  // --- LÓGICA DE AUTO-SCROLL AL ARRASTRAR ---
  const handleDragOverContainer = (e: React.DragEvent) => {
    const container = scrollContainerRef.current;
    if (!container || !isDragging) return;

    const { clientX } = e;
    const { left, width } = container.getBoundingClientRect();
    const edgeSize = 100; // Aumentado para mejor respuesta en bordes
    const scrollSpeed = 15; // Velocidad de scroll incrementada

    if (clientX - left < edgeSize) {
      container.scrollLeft -= scrollSpeed;
    } else if (left + width - clientX < edgeSize) {
      container.scrollLeft += scrollSpeed;
    }
  };

  const getIconByStatus = (key: string) => {
    switch (key) {
      case "pendiente":
      case "pending":
        return Circle;
      case "en_progreso":
      case "in_progress":
        return Clock;
      case "completada":
      case "completed":
        return CheckCircle2;
      default:
        return Circle;
    }
  };

  return (
    <section className="flex flex-col gap-6 2xl:gap-8 pb-10">
      <div className="px-4 md:px-0">
        <Breadcrumbs items={breadcrumbsItems} />
      </div>

      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 md:gap-4 px-4 md:px-0 border-b-2 border-gray-100 pb-8 relative group">
        <div
          className={`flex flex-col gap-3 flex-1 ${!showBoardSkeleton ? "header-anim" : ""}`}
          style={{ opacity: showBoardSkeleton ? 1 : 0 }}
        >
          <div className="flex items-center gap-3">
            <h1 className="text-3xl md:text-4xl 2xl:text-5xl font-black text-gray-900 tracking-tight transition-all">
              {nombre || (
                <div className="h-10 w-64 bg-gray-200 rounded-xl animate-pulse" />
              )}
            </h1>
            <div className="hidden md:block">
              <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest border border-blue-100 shadow-sm">
                Proyecto Activo
              </span>
            </div>
            {!showBoardSkeleton && (
              <button
                onClick={() => setShowEditProjectModal(true)}
                className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 hover:text-blue-600 transition-all active:scale-90"
                title="Editar detalles del proyecto"
              >
                <Pencil className="size-5" />
              </button>
            )}
          </div>

          <div className="text-gray-500 text-sm 2xl:text-lg max-w-2xl leading-relaxed">
            {descripcion || (
              <div className="flex flex-col gap-2 mt-2">
                <div className="h-4 w-full bg-gray-100 rounded-lg animate-pulse" />
                <div className="h-4 w-2/3 bg-gray-100 rounded-lg animate-pulse" />
              </div>
            )}
          </div>

          {!showBoardSkeleton && totalTasks > 0 && (
            <div className="max-w-md w-full mt-4">
              <ProgressBar
                totalTasks={totalTasks}
                completedTasks={completedTasks}
              />
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-6 w-full md:w-auto">
          <ul className="flex items-center border-0 md:border-r border-gray-100 pr-6">
            {miembros ? (
              miembros
                .sort((a, b) => (a.id === selectedProject?.creadorId ? -1 : 1))
                .map(({ id, nombre }) => (
                  <li
                    key={id}
                    className="-ml-3 first:ml-0 relative group/avatar"
                  >
                    <MemberAvatar
                      name={nombre}
                      className="ring-4 ring-white shadow-md hover:ring-blue-400 hover:-translate-y-1 transition-all"
                      isCreator={id === selectedProject?.creadorId}
                    />
                  </li>
                ))
            ) : (
              <div className="flex items-center -space-x-3 animate-pulse">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="size-11 rounded-full bg-gray-200 border-4 border-white"
                  />
                ))}
              </div>
            )}
          </ul>
          <Button
            onClick={handleAddTaskModal}
            disabled={showBoardSkeleton}
            className="w-full sm:w-auto shadow-xl shadow-blue-500/20 hover:shadow-blue-500/40 transition-shadow active:scale-95"
          >
            <Plus className="size-5" />
            <span className="font-bold">Nueva Tarea</span>
          </Button>
        </div>
      </header>

      {/* ÁREA DEL TABLERO - Glassmorphism & Patterns */}
      <section
        ref={scrollContainerRef}
        onDragOver={handleDragOverContainer}
        className={`relative flex md:grid md:grid-cols-3 gap-6 md:gap-8 min-h-[calc(100vh-320px)] overflow-x-auto pb-12 px-4 md:px-0 -mx-4 md:mx-0 scrollbar-hide transition-all duration-300 ${
          isDragging ? "bg-blue-50/20 cursor-grabbing" : "snap-x snap-mandatory"
        }`}
      >
        {/* Background Pattern Sutil */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at 2px 2px, #3b82f6 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />

        {showBoardSkeleton ? (
          <BoardColumnSkeleton />
        ) : (
          statuses
            .filter((status) => status.key !== "overdue")
            .map((status) => {
              // OPTIMIZATION: Combine iterations logic (vercel-react-best-practices js-combine-iterations)
              // Filter tasks once per status instead of twice for count and tasks props
              const statusTasks = projectTasks.filter(
                (task) =>
                  String(task.estado) === String(status.key) ||
                  String(task.estado) === String(status.name),
              );

              return (
                <div
                  key={status.id}
                  className="column-anim shrink-0 w-[85vw] md:w-auto snap-center first:pl-2 first:md:pl-0 last:pr-4 last:md:pr-0"
                  style={{ opacity: 0 }}
                >
                  <BoardColumn
                    statusKey={status.key}
                    column={status.name}
                    count={statusTasks.length}
                    Icon={getIconByStatus(status.key)}
                    color={status.color}
                    tasks={statusTasks}
                    openModal={handleAddTaskModal}
                    showAdd={
                      status.key === "pending" || status.key === "pendiente"
                    }
                    onEditTask={(task) => setTaskToEdit(task)}
                    onDeleteTask={(task) => setTaskToDelete(task)}
                  />
                </div>
              );
            })
        )}
      </section>

      {/* MODALES */}
      <AddTaskModal
        showModal={showAddTaskModal}
        closeModal={handleAddTaskModal}
        projectId={projectId}
      />

      {showEditProjectModal && currentProject && (
        <CreateProjectModal
          showModal={showEditProjectModal}
          setShowModal={setShowEditProjectModal}
          initialData={currentProject}
          onSubmit={async (data) => {
            const success = await updateProject(projectId, data);
            if (success) setShowEditProjectModal(false);
            return success;
          }}
        />
      )}

      {taskToEdit && (
        <AddTaskModal
          showModal={!!taskToEdit}
          closeModal={() => setTaskToEdit(null)}
          projectId={projectId}
          taskToEdit={taskToEdit}
        />
      )}

      {taskToDelete && (
        <ConfirmDeletion
          isOpen={!!taskToDelete}
          onClose={() => setTaskToDelete(null)}
          onSubmit={() => deleteTask(taskToDelete.id!)}
          type="task"
        />
      )}
    </section>
  );
}
