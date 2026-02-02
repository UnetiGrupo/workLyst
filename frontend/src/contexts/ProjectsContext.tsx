"use client";

import { createContext, useContext, useState, useCallback } from "react";
import { useAuth } from "./AuthContext";
import { useToast } from "./ToastContext";
import axios from "axios";
import type { Project } from "@/lib/types";

interface ProjectsContextType {
  projects: Project[];
  selectedProject: Project | null;
  setSelectedProject: (project: Project | null) => void;
  states: {
    loading: boolean;
    error: string | null;
    success: boolean;
  };
  isCreating: boolean;
  fetchProjects: () => Promise<void>;
  getProjectById: (id: string) => Promise<void>;
  createProject: (projectData: Partial<Project>) => Promise<boolean>;
  updateProject: (
    id: string,
    projectData: Partial<Project>,
  ) => Promise<boolean>;
  deleteProject: (id: string) => Promise<boolean>;
  addMember: (id: string, userId: string, rolId: 0 | 1) => Promise<boolean>;
  removeMember: (id: string, userId: string) => Promise<boolean>;
}

const ProjectsContext = createContext<ProjectsContextType | undefined>(
  undefined,
);

export function ProjectsProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [states, setStates] = useState({
    loading: false,
    error: null,
    success: false,
  });

  const { mounted, user } = useAuth();
  const { addToast } = useToast();
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const APP_API_KEY = process.env.NEXT_PUBLIC_APP_API_KEY;

  // Helper para headers (fácil de cambiar cuando cambie la auth)
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

  // Helper centralizado para resetear estados antes de una acción
  const startAction = useCallback(() => {
    setStates({ loading: true, error: null, success: false });
  }, []);

  const fetchProjects = useCallback(async () => {
    if (!mounted || !user) return;
    startAction();
    try {
      const response = await axios.get(
        `${API_URL}/api/projects`,
        getAuthHeaders(),
      );

      const proyectosBasicos = response.data;
      setProjects(proyectosBasicos); // Mostramos los proyectos rápido aunque no tengan miembros todavía

      // Opcional: Cargar los miembros en segundo plano para cada proyecto
      const proyectosCompletos = await Promise.all(
        proyectosBasicos.map(async (p: Project) => {
          try {
            const detail = await axios.get(
              `${API_URL}/api/projects/${p.id}`,
              getAuthHeaders(),
            );
            return detail.data;
          } catch {
            return p; // Si falla uno, devolvemos el básico
          }
        }),
      );

      setProjects(proyectosCompletos); // Actualizamos la lista con los miembros incluidos
      setStates((prev) => ({ ...prev, loading: false, success: true }));
    } catch (error: any) {
      const msg = error.response?.data?.mensaje || "Error al cargar proyectos";
      addToast(msg, "error");
      setStates({ loading: false, error: msg, success: false });
    }
  }, [mounted, user, API_URL, getAuthHeaders, startAction, addToast]);

  const getProjectById = useCallback(
    async (id: string) => {
      if (!mounted || !user) return;
      startAction();
      try {
        const response = await axios.get(
          `${API_URL}/api/projects/${id}`,
          getAuthHeaders(),
        );
        setSelectedProject(response.data);
        setStates((prev) => ({ ...prev, loading: false, success: true }));
      } catch (error: any) {
        const msg =
          error.response?.data?.mensaje || "Error al obtener el proyecto";
        addToast(msg, "error");
        setStates({ loading: false, error: msg, success: false });
      }
    },
    [mounted, user, API_URL, APP_API_KEY, getAuthHeaders, addToast],
  );

  const createProject = useCallback(
    async (projectData: Partial<Project>) => {
      if (!mounted || !user) return false;
      setIsCreating(true);
      startAction();
      try {
        const response = await axios.post(
          `${API_URL}/api/projects`,
          projectData,
          getAuthHeaders(),
        );
        setProjects((prev) => [...prev, response.data]);
        setStates((prev) => ({ ...prev, loading: false, success: true }));
        addToast("Proyecto creado exitosamente", "success");
        await fetchProjects();
        return true;
      } catch (error: any) {
        const msg =
          error.response?.data?.mensaje || "Error al crear el proyecto";
        addToast(msg, "error");
        setStates({ loading: false, error: msg, success: false });
        return false;
      } finally {
        setIsCreating(false);
      }
    },
    [mounted, user, API_URL, APP_API_KEY, getAuthHeaders, addToast],
  );

  // Función genérica para actualizar el estado local de proyectos y el seleccionado
  const updateLocalProjectState = useCallback((updatedProject: Project) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === updatedProject.id ? updatedProject : p)),
    );
    // Usamos la versión funcional de setter para no depender del estado externo
    setSelectedProject((current) =>
      current?.id === updatedProject.id ? updatedProject : current,
    );
  }, []);

  const updateProject = useCallback(
    async (id: string, projectData: Partial<Project>) => {
      if (!mounted || !user) return false;
      setIsCreating(true);
      startAction();
      try {
        await axios.put(
          `${API_URL}/api/projects/${id}`,
          projectData,
          getAuthHeaders(),
        );
        const projectResponse = await axios.get(
          `${API_URL}/api/projects/${id}`,
          getAuthHeaders(),
        );
        updateLocalProjectState(projectResponse.data);
        setStates((prev) => ({ ...prev, loading: false, success: true }));
        addToast("Proyecto actualizado", "success");
        return true;
      } catch (error: any) {
        const msg = error.response?.data?.mensaje || "Error al actualizar";
        addToast(msg, "error");
        setStates({ loading: false, error: msg, success: false });
        return false;
      } finally {
        setIsCreating(false);
      }
    },
    [
      mounted,
      user,
      API_URL,
      APP_API_KEY,
      getAuthHeaders,
      addToast,
      updateLocalProjectState,
    ],
  );

  const deleteProject = useCallback(
    async (id: string) => {
      if (!mounted || !user) return false;
      setIsCreating(true);
      startAction();
      try {
        await axios.delete(`${API_URL}/api/projects/${id}`, getAuthHeaders());
        setProjects((prev) => prev.filter((p) => p.id !== id));
        if (selectedProject?.id === id) setSelectedProject(null);
        setStates((prev) => ({ ...prev, loading: false, success: true }));
        addToast("Proyecto eliminado", "success");
        return true;
      } catch (error: any) {
        const msg = error.response?.data?.mensaje || "Error al eliminar";
        addToast(msg, "error");
        setStates({ loading: false, error: msg, success: false });
        return false;
      } finally {
        setIsCreating(false);
      }
    },
    [
      mounted,
      user,
      API_URL,
      APP_API_KEY,
      getAuthHeaders,
      addToast,
      selectedProject,
    ],
  );

  const addMember = useCallback(
    async (id: string, userId: string, rolId: 0 | 1) => {
      if (!mounted || !user) return false;
      setIsCreating(true);
      startAction();
      try {
        await axios.post(
          `${API_URL}/api/projects/${id}/members`,
          { usuarioId: userId, rolId },
          getAuthHeaders(),
        );

        // Actualizar el proyecto local
        const projectResponse = await axios.get(
          `${API_URL}/api/projects/${id}`,
          getAuthHeaders(),
        );

        updateLocalProjectState(projectResponse.data);
        setStates((prev) => ({ ...prev, loading: false, success: true }));
        addToast("Miembro agregado", "success");
        return true;
      } catch (error: any) {
        const msg = error.response?.data?.mensaje || "Error al agregar miembro";
        addToast(msg, "error");
        setStates({ loading: false, error: msg, success: false });
        return false;
      } finally {
        setIsCreating(false);
      }
    },
    [
      mounted,
      user,
      API_URL,
      APP_API_KEY,
      getAuthHeaders,
      addToast,
      updateLocalProjectState,
    ],
  );

  const removeMember = useCallback(
    async (id: string, userId: string) => {
      if (!mounted || !user) return false;
      setIsCreating(true);
      startAction();
      try {
        await axios.delete(
          `${API_URL}/api/projects/${id}/members/${userId}`,
          getAuthHeaders(),
        );

        // Fetch el proyecto actualizado
        const projectResponse = await axios.get(
          `${API_URL}/api/projects/${id}`,
          getAuthHeaders(),
        );

        updateLocalProjectState(projectResponse.data);
        setStates((prev) => ({ ...prev, loading: false, success: true }));
        addToast("Miembro eliminado", "success");
        return true;
      } catch (error: any) {
        const msg =
          error.response?.data?.mensaje || "Error al eliminar miembro";
        addToast(msg, "error");
        setStates({ loading: false, error: msg, success: false });
        return false;
      } finally {
        setIsCreating(false);
      }
    },
    [
      mounted,
      user,
      API_URL,
      APP_API_KEY,
      getAuthHeaders,
      addToast,
      updateLocalProjectState,
    ],
  );

  return (
    <ProjectsContext.Provider
      value={{
        projects,
        selectedProject,
        setSelectedProject,
        states,
        isCreating,
        fetchProjects,
        getProjectById,
        createProject,
        updateProject,
        deleteProject,
        addMember,
        removeMember,
      }}
    >
      {children}
    </ProjectsContext.Provider>
  );
}

export function useProjects() {
  const context = useContext(ProjectsContext);
  if (context === undefined)
    throw new Error("useProjects must be used within ProjectsProvider");
  return context;
}
