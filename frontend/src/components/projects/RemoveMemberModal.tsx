"use client";

import { X, UserMinus, Loader2 } from "lucide-react";
import { useState } from "react";
import { useUsers } from "@/contexts/UsersContext";
import type { ProjectMember } from "@/lib/types";

interface RemoveMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRemoveMember: (userId: string) => Promise<boolean>;
  members: ProjectMember[];
}

export function RemoveMemberModal({
  isOpen,
  onClose,
  onRemoveMember,
  members,
}: RemoveMemberModalProps) {
  const [removingId, setRemovingId] = useState<string | null>(null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <article className="relative bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
        <header className="flex items-center justify-between mb-6">
          <h4 className="text-xl font-bold text-gray-900">Eliminar Miembros</h4>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="size-5" />
          </button>
        </header>

        <ul className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
          {members.length === 0 ? (
            <p className="text-center py-4 text-gray-500 text-sm">
              No hay miembros para eliminar.
            </p>
          ) : (
            members.map((member) => {
              return (
                <li
                  key={member.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100"
                >
                  <div className="flex flex-col">
                    <p className="font-semibold text-gray-800 text-sm">
                      {member.nombre}
                    </p>
                    <p className="text-xs text-gray-500">{member.email}</p>
                  </div>
                  <button
                    disabled={!!removingId}
                    onClick={async () => {
                      setRemovingId(member.id);
                      try {
                        const success = await onRemoveMember(member.id);
                        if (success && members.length <= 1) onClose();
                      } finally {
                        setRemovingId(null);
                      }
                    }}
                    className={`p-2 rounded-lg transition-colors ${
                      removingId
                        ? "text-gray-400 bg-gray-100 cursor-not-allowed"
                        : "text-red-400 hover:text-red-600 hover:bg-red-50"
                    }`}
                    title="Eliminar del proyecto"
                  >
                    {removingId === member.id ? (
                      <Loader2 className="size-5 animate-spin" />
                    ) : (
                      <UserMinus className="size-5" />
                    )}
                  </button>
                </li>
              );
            })
          )}
        </ul>
      </article>
    </div>
  );
}
