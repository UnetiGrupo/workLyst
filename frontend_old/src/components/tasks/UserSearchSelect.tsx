"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { Search, X, Check, UserPlus } from "lucide-react";
import { useProjects } from "@/contexts/ProjectsContext";
import { User, ProjectMember } from "@/lib/types";
import { MemberAvatar } from "../common/MemberAvatar";

interface UserSearchSelectProps {
  selectedUser: User | null;
  onSelect: (user: User | null) => void;
}

export function UserSearchSelect({
  selectedUser,
  onSelect,
}: UserSearchSelectProps) {
  const { selectedProject } = useProjects();
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const miembros = selectedProject?.miembros || [];

  const filteredMembers = useMemo(() => {
    const query = searchTerm.toLowerCase().trim();
    if (!query) return miembros;

    return miembros.filter(
      (m) =>
        m.nombre?.toLowerCase().includes(query) ||
        m.email?.toLowerCase().includes(query),
    );
  }, [searchTerm, miembros]);

  // Manejador para cerrar al perder foco (con delay para capturar el click del li)
  const handleBlur = () => {
    setTimeout(() => setShowDropdown(false), 200);
  };

  return (
    <div className="relative flex flex-col gap-2" ref={dropdownRef}>
      <label className="text-sm font-semibold text-gray-700">Asignar a:</label>

      <div className="relative">
        {selectedUser ? (
          // CARD DEL USUARIO SELECCIONADO (Reemplaza al input)
          <div className="flex items-center justify-between w-full p-2 bg-blue-50 border border-blue-200 rounded-xl animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3">
              <MemberAvatar name={selectedUser?.nombre || ""} />
              <div className="flex flex-col">
                <p className="text-sm font-bold text-blue-900 leading-tight">
                  {selectedUser.nombre}
                </p>
                <p className="text-[11px] text-blue-600/80 italic">
                  Responsable asignado
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onSelect(null)}
              className="p-1.5 hover:bg-blue-100 rounded-full text-blue-400 hover:text-red-500 transition-colors"
            >
              <X className="size-4" />
            </button>
          </div>
        ) : (
          // INPUT DE BÚSQUEDA (Se muestra si no hay nadie seleccionado)
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
            <input
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-gray-50"
              type="text"
              autoComplete="off"
              value={searchTerm}
              placeholder="Buscar miembros del proyecto..."
              onFocus={() => setShowDropdown(true)}
              onBlur={handleBlur}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        )}

        {/* Dropdown de miembros (Ahora hacia ABAJO) */}
        {showDropdown && !selectedUser && (
          <ul className="absolute top-full mt-2 z-110 w-full bg-white border border-gray-100 rounded-xl shadow-2xl max-h-52 overflow-y-auto p-1 animate-in fade-in slide-in-from-top-2">
            {filteredMembers.length > 0 ? (
              filteredMembers.map((member) => (
                <li key={member.id}>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()} // Evita que el blur cierre el dropdown antes del click
                    onClick={() => {
                      // Casteo seguro para evitar el error de tipos de email: undefined
                      onSelect({
                        ...member,
                        email: member.email || "",
                        usuario: member.nombre || "",
                      } as User);
                      setSearchTerm("");
                      setShowDropdown(false);
                    }}
                    className="w-full flex items-center justify-between p-2 hover:bg-blue-50 rounded-lg transition-colors group"
                  >
                    <div className="flex items-center gap-2 text-left">
                      <MemberAvatar name={member?.nombre || ""} />
                      <div className="max-w-[180px] truncate">
                        <p className="text-xs font-bold text-gray-800 truncate">
                          {member.nombre}
                        </p>
                        <p className="text-[10px] text-gray-500 truncate">
                          {member.email || "Sin email"}
                        </p>
                      </div>
                    </div>
                    <UserPlus className="size-4 text-gray-300 group-hover:text-blue-600" />
                  </button>
                </li>
              ))
            ) : (
              <li className="p-4 text-center text-xs text-gray-400">
                No hay miembros que coincidan
              </li>
            )}
          </ul>
        )}
      </div>
    </div>
  );
}
