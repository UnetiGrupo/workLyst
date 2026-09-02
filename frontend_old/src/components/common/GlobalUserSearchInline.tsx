"use client";

import { useState, useEffect, useMemo } from "react";
import { Search, X, UserPlus, Loader2 } from "lucide-react";
import { useUsers } from "@/contexts/UsersContext";
import { useAuth } from "@/contexts/AuthContext";
import { User } from "@/lib/types";
import { MemberAvatar } from "../common/MemberAvatar";
import { useDebounce } from "@/hooks/useDebounce";

interface GlobalUserSearchInlineProps {
  onSelect: (user: User) => void;
  excludeIds?: string[];
}

export function GlobalUserSearchInline({
  onSelect,
  excludeIds = [],
}: GlobalUserSearchInlineProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const { searchUsers, userSearch, loading } = useUsers();
  const { user: currentUser } = useAuth();
  const debouncedSearch = useDebounce(searchTerm, 400);

  useEffect(() => {
    if (debouncedSearch.trim().length >= 3) {
      searchUsers(debouncedSearch);
    } else {
      searchUsers("");
    }
  }, [debouncedSearch, searchUsers]);

  const results = useMemo(() => {
    if (searchTerm.length < 3) return [];
    return userSearch;
  }, [userSearch, searchTerm]);

  return (
    <div className="relative w-full">
      <div className="relative">
        <Search
          className={`absolute left-3 top-1/2 -translate-y-1/2 size-4 ${loading ? "text-blue-500 animate-pulse" : "text-gray-400"}`}
        />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar por nombre o email..."
          className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
        />
        {loading && searchTerm.length >= 3 && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2 className="size-4 animate-spin text-gray-400" />
          </div>
        )}
      </div>

      {results.length > 0 && (
        <ul className="absolute z-10 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-2xl max-h-48 overflow-y-auto p-1 animate-in fade-in slide-in-from-top-2">
          {results.map((user) => {
            const isCurrentUser = user.id === currentUser?.id;
            const isAlreadyAdded = excludeIds.includes(user.id!);

            return (
              <li key={user.id}>
                <button
                  type="button"
                  disabled={isCurrentUser || isAlreadyAdded}
                  onClick={() => {
                    onSelect(user);
                    setSearchTerm("");
                  }}
                  className={`w-full flex items-center justify-between p-2 rounded-lg transition-colors group ${
                    isCurrentUser || isAlreadyAdded
                      ? "opacity-50 cursor-not-allowed bg-gray-50"
                      : "hover:bg-blue-50"
                  }`}
                >
                  <div className="flex items-center gap-2 text-left min-w-0">
                    <MemberAvatar
                      name={user.nombre || user.usuario}
                      size="sm"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-gray-900 truncate">
                        {user.nombre || user.usuario}{" "}
                        {isCurrentUser && (
                          <span className="text-[10px] text-blue-500">
                            (Tú)
                          </span>
                        )}
                      </p>
                      <p className="text-[10px] text-gray-500 truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  {isCurrentUser ? (
                    <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-md uppercase">
                      Creador
                    </span>
                  ) : isAlreadyAdded ? (
                    <span className="text-[9px] font-bold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-md uppercase">
                      Ya añadido
                    </span>
                  ) : (
                    <UserPlus className="size-4 text-gray-300 group-hover:text-blue-600" />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {searchTerm.length >= 3 && results.length === 0 && !loading && (
        <div className="absolute z-10 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-lg p-4 text-center">
          <p className="text-xs text-gray-500">No se encontraron usuarios</p>
        </div>
      )}
    </div>
  );
}
