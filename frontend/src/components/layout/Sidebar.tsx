"use client";

import { MemberAvatarSmart } from "@/components/common/MemberAvatarSmart";
import { useAuth } from "@/contexts/AuthContext";
import { NAVBAR_ITEMS } from "@/lib/constants";
import { Kanban } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Sidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const isProjectPage = pathname.startsWith("/projects/");
  // Opcional: Extraer el ID para usarlo en links internos
  const projectId = isProjectPage ? pathname.split("/")[2] : null;

  return (
    <aside
      className="flex flex-col gap-6 fixed top-0 left-0 z-50 h-screen w-64 2xl:w-72 
    bg-white p-4 rounded-r-lg shadow-sm border-r border-gray-100"
    >
      <header className="flex items-center gap-2 border-b border-gray-200 pb-4">
        <button
          onClick={logout}
          title="Cerrar sesión"
          className="hover:opacity-80 transition-opacity"
        >
          <MemberAvatarSmart userId={user?.id || ""} rounded="lg" size="sm" />
        </button>
        <div className="flex flex-col gap-px overflow-hidden">
          <h4 className="text-sm font-semibold truncate">{user?.nombre}</h4>
          <h5 className="text-xs text-gray-500 truncate">{user?.email}</h5>
        </div>
      </header>

      <nav>
        <ul className="flex flex-col gap-2">
          {NAVBAR_ITEMS.map(({ label, href, icon: Icon }) => {
            const active = pathname === href;
            return (
              <li key={label}>
                <Link
                  href={href}
                  className={`flex items-center gap-2 px-3 py-3 rounded-lg transition-all ${
                    active
                      ? "bg-blue-500 text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {Icon && <Icon className="size-5" />}
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* 3. Apartado Dinámico: Solo aparece si hay un proyecto activo */}
        {isProjectPage && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="px-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
              Proyecto Activo
            </p>
            <ul>
              <li>
                <Link
                  href={`/projects/${projectId}`}
                  className={`flex items-center gap-2 px-3 py-3 rounded-lg transition-all ${
                    pathname === `/projects/${projectId}`
                      ? "bg-blue-100 text-blue-600 font-semibold"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <Kanban className="size-5" />
                  Tareas del Tablero
                </Link>
              </li>
            </ul>
          </div>
        )}
      </nav>
    </aside>
  );
}
