"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

const PROTECTED_ROUTES = ["/projects", "/community", "/user"];

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, mounted } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Verifica si la ruta actual es una ruta protegida
  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route),
  );

  useEffect(() => {
    // Si la ruta es protegida, ya cargó la sesión (mounted) y no hay usuario, redirigir
    if (mounted && !user && isProtectedRoute) {
      router.push("/login");
    }
  }, [user, mounted, router, isProtectedRoute]);

  // Si es una ruta protegida y aún no sabemos el estado de la sesión o no hay usuario,
  // no renderizamos nada (o podríamos renderizar un loading)
  if (isProtectedRoute && (!mounted || !user)) {
    return (
      <div className="min-h-screen bg-white transition-all duration-300" />
    );
  }

  return <>{children}</>;
}
