"use client";

// Hooks
import { useState, useEffect, useMemo } from "react";
import { useDebounce } from "@/hooks/useDebounce";
// Contexts
import { useUsers } from "@/contexts/UsersContext";
import { useAuth } from "@/contexts/AuthContext";
// Types
import type { User, ProjectMember } from "@/lib/types";
// Icons
import { Search, X, UserPlus, Loader2 } from "lucide-react";
// Components
import { MemberAvatar } from "@/components/common/MemberAvatar";

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMember: (user: User) => Promise<boolean>;
  currentMembers?: ProjectMember[];
}

export function AddMemberModal({
  isOpen,
  onClose,
  onAddMember,
  currentMembers = [],
}: AddMemberModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [addingId, setAddingId] = useState<string | null>(null);

  const { searchUsers, userSearch, loading } = useUsers();
  const { user: currentUser } = useAuth();

  const debouncedSearch = useDebounce(searchTerm, 500);

  // Función auxiliar para normalizar texto (quitar acentos y minúsculas)
  const normalizeText = (text: string) =>
    text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

  // Búsqueda con Debounce
  useEffect(() => {
    // Solo disparamos la búsqueda a la API si hay al menos 3 caracteres
    if (debouncedSearch.trim().length >= 3) {
      searchUsers(debouncedSearch);
    }
  }, [debouncedSearch, searchUsers]);

  const filteredResults = useMemo(() => {
    const query = normalizeText(searchTerm.trim());
    if (query.length < 3) return [];

    return userSearch.filter((user) => {
      if (!user || !user.id) return false;

      // Normalizamos los campos del usuario para comparar
      const userName = normalizeText(user.nombre || "");
      const userNick = normalizeText(user.usuario || "");
      const userEmail = normalizeText(user.email || "");

      const matchesSearch =
        userName.includes(query) ||
        userNick.includes(query) ||
        userEmail.includes(query);

      // No mostrar si ya es miembro (excepto si es el usuario actual para indicar que es el creador/ya está)
      // The filtering logic now includes users who are already members.
      // The UI will handle disabling the add button for them.
      return matchesSearch;
    });
  }, [userSearch, searchTerm, currentMembers]);

  // Limpiar el buscador cuando se cierra el modal
  useEffect(() => {
    if (!isOpen) setSearchTerm("");
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-110 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-gray-950/40 backdrop-blur-md"
        onClick={onClose}
      />

      <article className="relative bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <header className="px-6 py-4 border-b flex items-center justify-between bg-gray-50/50">
          <h4 className="text-lg font-bold text-gray-900">Añadir Miembro</h4>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          >
            <X className="size-5 text-gray-500" />
          </button>
        </header>

        <div className="p-6">
          <div className="relative mb-6">
            <Search
              className={`absolute left-3 top-1/2 -translate-y-1/2 size-5 transition-colors ${
                loading ? "text-blue-500 animate-pulse" : "text-gray-400"
              }`}
            />
            <input
              type="text"
              placeholder="Buscar por nombre o email..."
              className="w-full pl-11 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          <ul className="max-h-60 overflow-y-auto space-y-2 custom-scrollbar px-1">
            {filteredResults.map((user) => {
              const isCurrentUser = user.id === currentUser?.id;
              const isAlreadyMember = currentMembers.some(
                (m) => m.id === user.id,
              );

              return (
                <li key={user.id}>
                  <button
                    disabled={!!addingId || isCurrentUser || isAlreadyMember}
                    onClick={async (e) => {
                      e.preventDefault();
                      setAddingId(user.id!);
                      const success = await onAddMember(user);
                      if (success) onClose();
                      setAddingId(null);
                    }}
                    className={`w-full flex items-center gap-3 p-3 hover:bg-blue-50 rounded-xl group transition-all border border-transparent hover:border-blue-100 ${
                      addingId || isCurrentUser || isAlreadyMember
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                  >
                    <MemberAvatar name={user.usuario} size="xl" />
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-sm text-gray-800 group-hover:text-blue-700 truncate">
                        {user.nombre || user.usuario}{" "}
                        {isCurrentUser && (
                          <span className="text-[10px] text-blue-500">
                            (Tú)
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {user.email}
                      </p>
                    </div>
                    {addingId === user.id ? (
                      <Loader2 className="size-5 text-blue-600 animate-spin" />
                    ) : isCurrentUser ? (
                      <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
                        CREADOR
                      </span>
                    ) : isAlreadyMember ? (
                      <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded-md">
                        MIEMBRO
                      </span>
                    ) : (
                      <UserPlus className="size-5 text-gray-300 group-hover:text-blue-600" />
                    )}
                  </button>
                </li>
              );
            })}

            {/* Mensajes de estado */}
            {searchTerm.trim().length >= 3 &&
              filteredResults.length === 0 &&
              !loading && (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-500 font-medium">
                    No se encontraron resultados
                  </p>
                  <p className="text-xs text-gray-400">
                    Prueba con otros términos
                  </p>
                </div>
              )}

            {searchTerm.length > 0 && searchTerm.length < 3 && (
              <p className="text-center py-6 text-xs text-gray-400 italic">
                Sigue escribiendo para buscar...
              </p>
            )}
          </ul>
        </div>
      </article>
    </div>
  );
}
