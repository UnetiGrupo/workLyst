"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { useAuth } from "./AuthContext";
import { TaskStatus } from "@/lib/types";
import axios from "axios";

interface TaskStatusesContextType {
  statuses: TaskStatus[];
  loading: boolean;
  fetchStatuses: () => Promise<void>;
  getStatusByKey: (key: string) => TaskStatus | undefined;
}

export const TaskStatusesContext =
  createContext<TaskStatusesContextType | null>(null);

export function TaskStatusesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [statuses, setStatuses] = useState<TaskStatus[]>([]);
  const [loading, setLoading] = useState(false);

  const { mounted, user } = useAuth();
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
  }, [APP_API_KEY]);

  const fetchStatuses = useCallback(async () => {
    if (!mounted || !user) return;
    setLoading(true);
    try {
      const response = await axios.get(
        `${API_URL}/api/task-statuses`,
        getAuthHeaders(),
      );
      setStatuses(response.data);
    } catch (error: any) {
      console.error("Error al cargar estados de tareas:", error);
    } finally {
      setLoading(false);
    }
  }, [mounted, user, API_URL, getAuthHeaders]);

  const getStatusByKey = useCallback(
    (keyOrName: string) => {
      return statuses.find((s) => s.key === keyOrName || s.name === keyOrName);
    },
    [statuses],
  );

  // Fetch statuses on mount
  useEffect(() => {
    if (mounted && user && statuses.length === 0) {
      fetchStatuses();
    }
  }, [mounted, user, fetchStatuses, statuses.length]);

  return (
    <TaskStatusesContext.Provider
      value={{
        statuses,
        loading,
        fetchStatuses,
        getStatusByKey,
      }}
    >
      {children}
    </TaskStatusesContext.Provider>
  );
}

export const useTaskStatuses = () => {
  const context = useContext(TaskStatusesContext);
  if (!context)
    throw new Error(
      "useTaskStatuses debe usarse dentro de TaskStatusesProvider",
    );
  return context;
};
