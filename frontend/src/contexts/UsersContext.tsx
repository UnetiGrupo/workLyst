"use client";

import { createContext, useContext, useState, useCallback } from "react";
import axios from "axios";
import type { User } from "@/lib/types";
import { useAuth } from "./AuthContext";

interface UsersContextType {
  usersMap: Record<string, User>; // Diccionario id -> usuario
  loading: boolean;
  searchUsers: (query: string) => Promise<void>;
  fetchAllUsers: () => Promise<void>;
  fetchUserById: (id: string) => Promise<User | null>;
}

const UsersContext = createContext<UsersContextType | null>(null);

export function UsersProvider({ children }: { children: React.ReactNode }) {
  const [usersMap, setUsersMap] = useState<Record<string, User>>({});
  const [loading, setLoading] = useState(false);

  const { mounted, token } = useAuth();
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

  // Función para guardar usuarios en el mapa sin borrar los que ya están
  const saveToCache = useCallback((users: User[]) => {
    setUsersMap((prev) => {
      const newEntries: Record<string, User> = {};
      users.forEach((u) => {
        if (u.id) {
          newEntries[u.id] = u;
        }
      });
      return { ...prev, ...newEntries }; // Mezclamos lo viejo con lo nuevo
    });
  }, []);

  // -- BUSCAR POR NOMBRE O EMAIL --
  const searchUsers = useCallback(
    async (query: string) => {
      if (!query || !mounted || !token) return;
      setLoading(true);
      try {
        const res = await axios.get(
          `${API_URL}/api/users?nombre=${query}`,
          getHeaders(),
        );
        saveToCache(res.data);
      } catch (err) {
        console.error("Error buscando usuarios:", err);
      } finally {
        setLoading(false);
      }
    },
    [API_URL, mounted, APP_API_KEY, getHeaders, saveToCache],
  );

  // -- TRAER TODOS LOS USUARIOS --
  const fetchAllUsers = useCallback(async () => {
    if (!mounted || !token) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/users`, getHeaders());
      saveToCache(res.data);
    } catch (err: any) {
      console.error(
        "Error al traer todos los usuarios",
        err.response?.data?.mensaje,
      );
    } finally {
      setLoading(false);
    }
  }, [API_URL, mounted, APP_API_KEY, getHeaders, saveToCache]);

  // -- TRAER UN USUARIO POR ID --
  const fetchUserById = useCallback(
    async (id: string) => {
      // Si ya está en el mapa, no hacemos nada
      if (usersMap[id]) return usersMap[id];

      try {
        const res = await axios.get(`${API_URL}/api/users/${id}`, getHeaders());
        const userData = res.data;

        // Guardamos en el mapa (caché)
        setUsersMap((prev) => ({ ...prev, [id]: userData }));
        return userData;
      } catch (err) {
        console.error(`Error al obtener usuario ${id}:`, err);
        return null;
      }
    },
    [usersMap, API_URL, getHeaders],
  );

  return (
    <UsersContext.Provider
      value={{ usersMap, loading, searchUsers, fetchAllUsers, fetchUserById }}
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
