"use client";

import { createContext, useContext, useState, useCallback } from "react";
import { useAuth } from "./AuthContext";
import { useToast } from "./ToastContext";
import { Task } from "@/lib/types";
import axios from "axios";

interface TasksContextType {
  tasks: Task[];
  loading: boolean;
  isDragging: boolean;
  setIsDragging: (isDragging: boolean) => void;
  draggedTaskId: string | null;
  setDraggedTaskId: (id: string | null) => void;
  fetchTasks: (projectId: string) => Promise<void>;
  createTask: (projectId: string, taskData: Partial<Task>) => Promise<boolean>;
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<boolean>;
  moveTask: (taskId: string, newStatus: string) => Promise<boolean>;
  deleteTask: (taskId: string) => Promise<boolean>;
  setSelectedTask: (task: Task | null) => void;
  selectedTask: Task | null;
  assignTask: (taskId: string, userId: string) => Promise<boolean>;
}

export const TasksContext = createContext<TasksContextType | null>(null);

export function TasksProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  const { mounted, user } = useAuth();
  const { addToast } = useToast();
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const APP_API_KEY = process.env.NEXT_PUBLIC_APP_API_KEY;

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem("sessionToken");
    return {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "x-api-key": APP_API_KEY,
      },
    };
  }, []);

  // --- OBTENER TAREAS ---
  const fetchTasks = useCallback(
    async (projectId: string) => {
      if (!mounted || !user || !projectId) return;
      setLoading(true);
      try {
        const response = await axios.get(
          `${API_URL}/api/projects/${projectId}/tasks`,
          getAuthHeaders(),
        );
        setTasks(response.data);
      } catch (error: any) {
        console.error("Error al cargar tareas:", error);
      } finally {
        setLoading(false);
      }
    },
    [mounted, user, API_URL, APP_API_KEY, getAuthHeaders],
  );

  // --- CREAR TAREA ---
  const createTask = useCallback(
    async (projectId: string, taskData: Partial<Task>) => {
      if (!projectId) return false;
      setLoading(true);
      try {
        const response = await axios.post(
          `${API_URL}/api/projects/${projectId}/tasks`,
          {
            ...taskData,
            estado: taskData.estado || "pendiente",
          },
          getAuthHeaders(),
        );

        // 1. Solo actualizamos el estado local con la data real que viene del server (trae el ID)
        const newTask = response.data;
        setTasks((prev) => [...prev, newTask]);

        addToast("Tarea creada correctamente", "success");
        await fetchTasks(projectId);
        return true;
      } catch (error: any) {
        addToast("Error al crear la tarea", "error");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [API_URL, getAuthHeaders, addToast, fetchTasks],
  );

  // --- ACTUALIZAR / MOVER TAREA (PUT) ---

  const updateTask = useCallback(
    async (taskId: string, updates: Partial<Task>) => {
      // 1. Buscamos la tarea ANTES de hacer nada para asegurar que tenemos la data para el payload
      const taskToUpdate = tasks.find((t) => t.id === taskId);

      if (!taskToUpdate) {
        console.error("No se encontró la tarea con ID:", taskId);
        return false;
      }

      // 2. Actualización optimista inmediata en la UI
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, ...updates } : t)),
      );

      try {
        // 3. Construimos el payload completo (Merge de datos)
        const fullPayload = {
          titulo: updates.titulo ?? taskToUpdate.titulo,
          descripcion: updates.descripcion ?? taskToUpdate.descripcion,
          estado: updates.estado ?? taskToUpdate.estado,
          asignado_a: updates.asignado_a ?? taskToUpdate.asignado_a,
          fecha_limite: updates.fecha_limite ?? taskToUpdate.fecha_limite,
        };

        await axios.put(
          `${API_URL}/api/tasks/${taskId}`,
          fullPayload,
          getAuthHeaders(),
        );

        addToast("Tarea actualizada correctamente", "success");
        // Forzamos recarga para asegurar sincronización con la DB
        const currentTask = tasks.find((t) => t.id === taskId);
        if (currentTask?.proyecto_id) {
          await fetchTasks(currentTask.proyecto_id);
        }

        return true;
      } catch (error: any) {
        console.error("❌ Error API:", error.response?.data || error.message);

        // 4. ROLLBACK: Revertimos al objeto original que encontramos en el paso 1
        addToast("Error al sincronizar con el servidor", "error");
        setTasks((prev) =>
          prev.map((t) => (t.id === taskId ? taskToUpdate : t)),
        );

        return false;
      }
    },
    [API_URL, tasks, getAuthHeaders, addToast, fetchTasks], // Es vital que 'tasks' esté aquí para encontrar taskToUpdate
  );

  // Asegúrate de que moveTask también sea async y espere a updateTask
  const moveTask = useCallback(
    async (taskId: string, newStatus: string) => {
      return await updateTask(taskId, { estado: newStatus });
    },
    [updateTask],
  );

  // --- ELIMINAR TAREA (DELETE) ---
  const deleteTask = useCallback(
    async (taskId: string) => {
      // Guardamos el proyecto_id para recargar después
      const taskToDelete = tasks.find((t) => t.id === taskId);
      const projectId = taskToDelete?.proyecto_id;

      try {
        await axios.delete(`${API_URL}/api/tasks/${taskId}`, getAuthHeaders());
        setTasks((prev) => prev.filter((t) => t.id !== taskId));
        addToast("Tarea eliminada correctamente", "success");

        if (projectId) {
          await fetchTasks(projectId);
        }

        return true;
      } catch (error) {
        addToast("No se pudo eliminar la tarea", "error");
        return false;
      }
    },
    [API_URL, getAuthHeaders, addToast, fetchTasks, tasks],
  );

  // --- ASIGNAR TAREA (PATCH) ---
  const assignTask = useCallback(
    async (taskId: string, userId: string) => {
      setLoading(true);
      try {
        await axios.patch(
          `${API_URL}/api/tasks/${taskId}/assign`,
          {
            asignado_a: userId,
          },
          getAuthHeaders(),
        );
        addToast("Tarea asignada correctamente", "success");
        return true;
      } catch (error) {
        addToast("No se pudo asignar la tarea", "error");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [API_URL, APP_API_KEY, getAuthHeaders, addToast],
  );

  // -- ELIMINAR TAREA --

  return (
    <TasksContext.Provider
      value={{
        tasks,
        loading,
        isDragging,
        setIsDragging,
        draggedTaskId,
        setDraggedTaskId,
        fetchTasks,
        createTask,
        updateTask,
        moveTask,
        deleteTask,
        setSelectedTask,
        assignTask,
        selectedTask,
      }}
    >
      {children}
    </TasksContext.Provider>
  );
}

export const useTasks = () => {
  const context = useContext(TasksContext);
  if (!context) throw new Error("useTasks debe usarse dentro de TaskProvider");
  return context;
};
