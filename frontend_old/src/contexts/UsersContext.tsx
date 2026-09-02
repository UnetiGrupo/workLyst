"use client";

import { createContext, useContext, useState, useCallback } from "react";
import type { User } from "@/lib/types";
import { useAuth } from "./AuthContext";
import axios from "axios";

interface UsersContextType {
  loading: boolean;
  searchUsers: (query: string) => Promise<void>;
  fetchUserById: (id: string) => Promise<void>;
  userSearch: User[];
  selectedUser: User | null;
  updateUser: (id: string, updates: Partial<User>) => Promise<void>;
}

const UsersContext = createContext<UsersContextType | null>(null);

export function UsersProvider({ children }: { children: React.ReactNode }) {
  const [userSearch, setUserSearch] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  const { mounted, token, user: currentUser, updateUserLocal } = useAuth();
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const APP_API_KEY = process.env.NEXT_PUBLIC_APP_API_KEY;

  // Helper para el Token
  const getHeaders = useCallback(
    () => ({
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "x-api-key": APP_API_KEY,
      },
    }),
    [APP_API_KEY, token],
  );

  // == BUSCAR USUARIOS POR NOMBRE ==

  const searchUsers = useCallback(
    async (query: string) => {
      if (!query || query.length < 2) {
        setUserSearch([]);
        return;
      }

      setLoading(true);
      try {
        // 1. Traemos usuarios. Intentamos traer una lista base.
        // Si tu API permite traer todos sin query, mejor.
        const response = await axios.get(`${API_URL}/api/users`, getHeaders());

        const todosLosUsuarios = Array.isArray(response.data)
          ? response.data
          : [];

        // 2. FILTRADO INTELIGENTE EN FRONTEND (Ignora mayúsculas y acentos)
        const normalizedQuery = query
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "");

        const filtrados = todosLosUsuarios.filter((user: User) => {
          const nombreYUsuario = `${user.nombre} ${user.usuario} ${user.email}`
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");

          return nombreYUsuario.includes(normalizedQuery);
        });

        setUserSearch(filtrados);
      } catch (error) {
        console.error("Error filtrando usuarios", error);
      } finally {
        setLoading(false);
      }
    },
    [API_URL, getHeaders],
  );

  // == BUSCAR USUARIOS POR ID ==

  const fetchUserById = async (id: string) => {
    if (!id) return;

    setLoading(true);
    setSelectedUser(null);

    try {
      const response = await axios.get(
        `${API_URL}/api/users/${id}`,
        getHeaders(),
      );
      setSelectedUser(response.data);
    } catch (error: any) {
      console.error("Error al buscar usuario", error.mensaje);
    } finally {
      setLoading(false);
    }
  };

  // == ACTUALIZAR DATOS DE USUARIO ==

  const updateUser = async (id: string, updates: Partial<User>) => {
    if (!id) return;

    setLoading(true);

    try {
      const response = await axios.put(
        `${API_URL}/api/users/${id}`,
        updates,
        getHeaders(),
      );

      const updatedUser = response.data.usuario || response.data;

      if (id === currentUser?.id) {
        updateUserLocal(updatedUser);
      }

      setSelectedUser(updatedUser);
    } catch (error: any) {
      console.error("Error al actualizar usuario", error.mensaje);
    } finally {
      setLoading(false);
    }
  };

  return (
    <UsersContext.Provider
      value={{
        loading,
        searchUsers,
        fetchUserById,
        userSearch,
        selectedUser,
        updateUser,
      }}
    >
      {children}
    </UsersContext.Provider>
  );
}

export const useUsers = () => {
  const context = useContext(UsersContext);
  if (!context) throw new Error("useUsers must be used within UsersProvider");
  return context;
};
