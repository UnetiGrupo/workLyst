"use client";

import { useEffect, useState } from "react";
import { useUsers } from "@/contexts/UsersContext";
import { MemberAvatar } from "./MemberAvatar"; // Tu componente visual
import { User } from "@/lib/types";

interface MemberAvatarSmartProps {
  userId: string;
  size?: "sm" | "md" | "lg" | "xl";
  rounded?: "full" | "lg";
  className?: string;
}

export function MemberAvatarSmart({
  userId,
  size,
  rounded = "full",
  className,
}: MemberAvatarSmartProps) {
  const { fetchUserById } = useUsers();
  const [user, setUser] = useState<User | undefined>(undefined);

  useEffect(() => {
    if (!user) {
      // Si no lo tenemos en el mapa local, lo buscamos en la API
      fetchUserById(userId).then((res) => {
        if (res) setUser(res);
      });
    }
  }, [userId, user, fetchUserById]);

  // Mientras carga o si no se encuentra, usamos un nombre genérico o vacío
  const displayName = user ? user.nombre || user.usuario : "...";

  return (
    <MemberAvatar
      rounded={rounded}
      name={displayName}
      size={size}
      className={className}
      color={!user ? "gray" : undefined} // Color neutro mientras carga
    />
  );
}
