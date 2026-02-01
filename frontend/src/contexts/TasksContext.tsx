"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from "react";
import { useAuth } from "./AuthContext";
import { useToast } from "./ToastContext";
import { Task } from "@/lib/types";
import axios from "axios";

interface TasksContextType {
  tasks: Task[];
  columns: {
    todo: Task[];
    inProgress: Task[];
    done: Task[];
  };
  loading: boolean;
  isDragging: boolean;
  setIsDragging: (isDragging: boolean) => void;
  fetchTasks: (projectId: string) => Promise<void>;
  createTask: (projectId: string, taskData: Partial<Task>) => Promise<boolean>;
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<boolean>;
  moveTask: (
    taskId: string,
    newStatus: "pending" | "in-progress" | "completed",
  ) => Promise<boolean>;
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
  // --- COLUMNAS DERIVADAS (Single Source of Truth) ---
  const columns = useMemo(() => {
    return {
      todo: tasks.filter((t) => t.estado === "pending"),
      inProgress: tasks.filter((t) => t.estado === "in-progress"),
      done: tasks.filter((t) => t.estado === "completed"),
    };
  }, [tasks]);

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
            estado: taskData.estado || "pending",
          },
          getAuthHeaders(),
        );

        // Actualizamos el estado local agregando la nueva tarea
        setTasks((prev) => [...prev, response.data]);
        addToast("Tarea creada correctamente", "success");
        await fetchTasks(projectId);
        return true;
      } catch (error: any) {
        const msg = error.response?.data?.mensaje || "Error al crear la tarea";
        addToast(msg, "error");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [API_URL, APP_API_KEY, getAuthHeaders, addToast, fetchTasks],
  );

  // --- ACTUALIZAR / MOVER TAREA (PUT) ---
  const updateTask = useCallback(
    async (taskId: string, updates: Partial<Task>) => {
      // 1. Guardamos una referencia para revertir si falla
      // Pero ojo: no podemos usar "originalTasks" directamente del scope si es vieja
      let previousTasks: Task[] = [];

      setTasks((prev) => {
        previousTasks = prev; // Guardamos el estado actual justo antes de cambiarlo
        return prev.map((t) => (t.id === taskId ? { ...t, ...updates } : t));
      });

      try {
        await axios.put(
          `${API_URL}/api/tasks/${taskId}`,
          updates,
          getAuthHeaders(),
        );
        return true;
      } catch (error) {
        // 2. Si falla, restauramos el estado anterior
        setTasks(previousTasks);
        addToast("No se pudo actualizar la tarea", "error");
        return false;
      }
    },
    [API_URL, getAuthHeaders, addToast], // Quitamos 'tasks' de aquí
  );

  // --- ELIMINAR TAREA (DELETE) ---
  const deleteTask = useCallback(
    async (taskId: string) => {
      try {
        await axios.delete(`${API_URL}/api/tasks/${taskId}`, getAuthHeaders());
        setTasks((prev) => prev.filter((t) => t.id !== taskId));
        addToast("Tarea eliminada correctamente", "success");
        return true;
      } catch (error) {
        addToast("No se pudo eliminar la tarea", "error");
        return false;
      }
    },
    [API_URL, APP_API_KEY, getAuthHeaders, addToast],
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

  // Helper específico para el Drag & Drop
  const moveTask = (
    taskId: string,
    newStatus: "pending" | "in-progress" | "completed",
  ) => {
    return updateTask(taskId, { estado: newStatus });
  };

  // -- ELIMINAR TAREA --

  return (
    <TasksContext.Provider
      value={{
        tasks,
        columns,
        loading,
        isDragging,
        setIsDragging,
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
