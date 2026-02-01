"use client";

import { useState, useMemo, useEffect } from "react";
import { Search, UserPlus, X, Loader2 } from "lucide-react";
import { useUsers } from "@/contexts/UsersContext";
import { useProjects } from "@/contexts/ProjectsContext";
import { MemberAvatar } from "../common/MemberAvatar";
import { User } from "@/lib/types";

interface UserSearchSelectProps {
  selectedUser: User | null;
  onSelect: (user: User | null) => void;
}

export function UserSearchSelect({
  selectedUser,
  onSelect,
}: UserSearchSelectProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLocalLoading, setIsLocalLoading] = useState(false);

  const { usersMap, fetchUserById } = useUsers();
  const { selectedProject } = useProjects();

  // --- EL FIX CRÍTICO: Cargar los miembros si no están en el mapa ---
  useEffect(() => {
    const loadMembers = async () => {
      if (!selectedProject?.miembros) return;
      setIsLocalLoading(true);

      const promises = selectedProject.miembros.map((m: any) => {
        const id = typeof m === "string" ? m : m.id;
        // Solo llamamos a la API si el usuario NO está ya en el mapa
        if (!usersMap[id]) return fetchUserById(id);
        return null;
      });

      await Promise.all(promises);
      setIsLocalLoading(false);
    };

    loadMembers();
  }, [selectedProject?.miembros, fetchUserById]); // Solo corre cuando cambia el proyecto o faltan datos

  const searchResults = useMemo(() => {
    const cleanSearch = searchTerm.toLowerCase().trim();
    if (!selectedProject?.miembros) return [];

    // Mapeamos los IDs a objetos reales usando el usersMap actualizado
    const projectMembers = selectedProject.miembros
      .map((m: any) => {
        const id = typeof m === "string" ? m : m.id;
        return usersMap[id];
      })
      .filter(Boolean) as User[];

    return projectMembers.filter((user) => {
      const matchesSearch =
        cleanSearch === "" ||
        user.nombre?.toLowerCase().includes(cleanSearch) ||
        user.usuario?.toLowerCase().includes(cleanSearch) ||
        user.email?.toLowerCase().includes(cleanSearch);

      return matchesSearch && selectedUser?.id !== user.id;
    });
  }, [usersMap, searchTerm, selectedProject, selectedUser]);

  return (
    <div className="relative flex flex-col gap-2">
      <label className="text-sm font-semibold text-gray-700">Asignar a:</label>

      {selectedUser ? (
        <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-xl">
          <div className="flex items-center gap-3">
            <MemberAvatar
              name={selectedUser.nombre || selectedUser.usuario}
              size="sm"
            />
            <div className="flex flex-col">
              <span className="text-sm font-bold text-gray-800 leading-none">
                {selectedUser.nombre || selectedUser.usuario}
              </span>
              <span className="text-xs text-gray-500">
                {selectedUser.email}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onSelect(null)}
            className="text-blue-500 hover:bg-blue-200 p-1 rounded-full transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>
      ) : (
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2">
            {isLocalLoading ? (
              <Loader2 className="size-4 animate-spin text-blue-500" />
            ) : (
              <Search className="size-4 text-gray-400" />
            )}
          </div>
          <input
            type="text"
            value={searchTerm}
            onFocus={() => setIsDropdownOpen(true)}
            onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={
              isLocalLoading ? "Cargando miembros..." : "Escribe para buscar..."
            }
            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500 transition-all"
          />

          {isDropdownOpen && searchResults.length > 0 && (
            <ul className="absolute z-100 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-2xl max-h-52 overflow-y-auto p-1">
              {searchResults.map((user) => (
                <li key={user.id}>
                  <button
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      onSelect(user);
                      setIsDropdownOpen(false);
                    }}
                    className="w-full flex items-center justify-between p-2.5 hover:bg-blue-50 rounded-lg transition-colors group text-left"
                  >
                    <div className="flex items-center gap-2">
                      <MemberAvatar
                        name={user.nombre || user.usuario}
                        size="sm"
                        className="size-8"
                      />
                      <div>
                        <p className="text-xs font-bold text-gray-800">
                          {user.nombre || user.usuario}
                        </p>
                        <p className="text-[10px] text-gray-500">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <UserPlus className="size-4 text-gray-400 group-hover:text-blue-500" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
