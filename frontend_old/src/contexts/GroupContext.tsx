"use client";

import { createContext, useContext, useState, useCallback } from "react";
import { useAuth } from "./AuthContext";
import { useToast } from "./ToastContext";
import { Group, GroupMember } from "@/lib/types";
import axios from "axios";

interface GroupsContextType {
  groups: Group[];
  selectedGroup: Group | null;
  loading: boolean;
  fetchGroups: () => Promise<void>;
  getGroupById: (id: string) => Promise<void>;
  createGroup: (data: {
    nombre: string;
    descripcion: string;
    miembros: string[];
  }) => Promise<boolean>;
  updateGroup: (id: string, data: Partial<Group>) => Promise<boolean>;
  deleteGroup: (id: string) => Promise<boolean>;
  addMembers: (groupId: string, userIds: string[]) => Promise<boolean>;
  removeMember: (groupId: string, userId: string) => Promise<boolean>;
}

const GroupsContext = createContext<GroupsContextType | undefined>(undefined);

export function GroupsProvider({ children }: { children: React.ReactNode }) {
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(false);

  const { token } = useAuth();
  const { addToast } = useToast();
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const APP_API_KEY = process.env.NEXT_PUBLIC_APP_API_KEY;

  const getHeaders = useCallback(
    () => ({
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "x-api-key": APP_API_KEY,
      },
    }),
    [token, APP_API_KEY],
  );

  const fetchGroups = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/groups`, getHeaders());
      const basicGroups = response.data.grupos || response.data;

      // Mostrar grupos básicos rápido
      setGroups(basicGroups);

      // Cargar detalles (miembros) en segundo plano para cada grupo
      const detailedGroups = await Promise.all(
        basicGroups.map(async (g: Group) => {
          try {
            const detailResponse = await axios.get(
              `${API_URL}/api/groups/${g.id}`,
              getHeaders(),
            );
            // El API puede devolver { grupo: { ... } } o el objeto directo
            return detailResponse.data.grupo || detailResponse.data;
          } catch (err) {
            console.error(`Error al cargar detalles del grupo ${g.id}:`, err);
            return g; // Retornar el básico si falla el detalle
          }
        }),
      );

      setGroups(detailedGroups);
    } catch (error) {
      console.error("Error al cargar comunidades:", error);
      addToast("Error al cargar las comunidades", "error");
    } finally {
      setLoading(false);
    }
  }, [API_URL, getHeaders, addToast]);

  const createGroup = useCallback(
    async (data: any) => {
      try {
        const response = await axios.post(
          `${API_URL}/api/groups`,
          data,
          getHeaders(),
        );
        // El API devuelve { grupo: { ... } } o el grupo directamente. Ajustamos.
        const newGroup = response.data.grupo || response.data;
        setGroups((prev) => [...prev, newGroup]);
        addToast("Comunidad creada con éxito", "success");
        return true;
      } catch (error) {
        addToast("Error al crear la comunidad", "error");
        return false;
      }
    },
    [API_URL, getHeaders, addToast],
  );

  const getGroupById = useCallback(
    async (id: string) => {
      setLoading(true);
      try {
        const response = await axios.get(
          `${API_URL}/api/groups/${id}`,
          getHeaders(),
        );
        setSelectedGroup(response.data);
      } catch (error) {
        addToast("No se pudo obtener la información del grupo", "error");
      } finally {
        setLoading(false);
      }
    },
    [API_URL, getHeaders, addToast],
  );

  const deleteGroup = useCallback(
    async (id: string) => {
      try {
        await axios.delete(`${API_URL}/api/groups/${id}`, getHeaders());
        setGroups((prev) => prev.filter((g) => g.id !== id));
        addToast("Comunidad eliminada", "info");
        return true;
      } catch (error) {
        addToast("No se pudo eliminar el grupo", "error");
        return false;
      }
    },
    [API_URL, getHeaders, addToast],
  );

  const updateGroup = useCallback(
    async (id: string, data: Partial<Group>) => {
      try {
        const response = await axios.put(
          `${API_URL}/api/groups/${id}`,
          data,
          getHeaders(),
        );
        // El API devuelve { grupo: { ... } } o el grupo directamente.
        const updatedGroup = response.data.grupo || response.data;

        setGroups((prev) => prev.map((g) => (g.id === id ? updatedGroup : g)));

        if (selectedGroup?.id === id) {
          setSelectedGroup(updatedGroup);
        }

        addToast("Comunidad actualizada", "success");
        return true;
      } catch (error) {
        addToast("No se pudo actualizar la comunidad", "error");
        return false;
      }
    },
    [API_URL, getHeaders, addToast, selectedGroup],
  );

  const addMembers = useCallback(
    async (groupId: string, userIds: string[]) => {
      try {
        await axios.post(
          `${API_URL}/api/groups/${groupId}/members`,
          { usuarios: userIds },
          getHeaders(),
        );

        // Refrescamos la información del grupo para tener los miembros actualizados
        const updatedGroupResp = await axios.get(
          `${API_URL}/api/groups/${groupId}`,
          getHeaders(),
        );
        const updatedGroup =
          updatedGroupResp.data.grupo || updatedGroupResp.data;

        setGroups((prev) =>
          prev.map((g) => (g.id === groupId ? updatedGroup : g)),
        );

        if (selectedGroup?.id === groupId) {
          setSelectedGroup(updatedGroup);
        }

        addToast("Miembros añadidos", "success");
        return true;
      } catch (error) {
        addToast("Error al añadir miembros", "error");
        return false;
      }
    },
    [API_URL, getHeaders, addToast, selectedGroup],
  );

  const removeMember = useCallback(
    async (groupId: string, userId: string) => {
      try {
        await axios.delete(
          `${API_URL}/api/groups/${groupId}/members/${userId}`,
          getHeaders(),
        );

        // Refrescamos la información del grupo para tener los miembros actualizados
        const updatedGroupResp = await axios.get(
          `${API_URL}/api/groups/${groupId}`,
          getHeaders(),
        );
        const updatedGroup =
          updatedGroupResp.data.grupo || updatedGroupResp.data;

        setGroups((prev) =>
          prev.map((g) => (g.id === groupId ? updatedGroup : g)),
        );

        if (selectedGroup?.id === groupId) {
          setSelectedGroup(updatedGroup);
        }

        addToast("Miembro eliminado", "info");
        return true;
      } catch (error) {
        addToast("Error al eliminar miembro", "error");
        return false;
      }
    },
    [API_URL, getHeaders, addToast, selectedGroup],
  );

  return (
    <GroupsContext.Provider
      value={{
        updateGroup,
        groups,
        selectedGroup,
        loading,
        fetchGroups,
        createGroup,
        getGroupById,
        deleteGroup,
        addMembers,
        removeMember,
      }}
    >
      {children}
    </GroupsContext.Provider>
  );
}

export const useGroups = () => {
  const context = useContext(GroupsContext);
  if (!context)
    throw new Error("useGroups debe usarse dentro de GroupsProvider");
  return context;
};
