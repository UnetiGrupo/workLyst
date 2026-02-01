"use client";

import { Trash2, Loader2 } from "lucide-react";
import { useState } from "react";

export function ConfirmDeletion({
  isOpen,
  onClose,
  onSubmit,
  type,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => Promise<boolean | void>;
  type: "project" | "task";
}) {
  const [loading, setLoading] = useState(false);
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <article className="relative bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl flex flex-col items-center text-center gap-6 animate-in zoom-in-95 duration-200">
        <div className="size-16 rounded-full bg-red-50 flex items-center justify-center">
          <Trash2 className="size-8 text-red-500" />
        </div>

        <div>
          <h4 className="text-xl font-bold text-gray-900 mb-2">
            ¿Eliminar {type === "project" ? "proyecto" : "tarea"}?
          </h4>
          <p className="text-gray-500 text-sm">
            Esta acción no se puede deshacer. Todos los datos asociados se
            perderán permanentemente.
          </p>
        </div>

        <div className="flex flex-col w-full gap-3">
          <button
            onClick={async (e) => {
              e.stopPropagation();
              setLoading(true);
              try {
                const success = await onSubmit();
                if (success) onClose();
              } finally {
                setLoading(false);
              }
            }}
            disabled={loading}
            className={`w-full flex justify-center items-center py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-all shadow-lg shadow-red-500/25 active:scale-95 ${loading ? "opacity-70" : ""}`}
          >
            {loading ? (
              <Loader2 className="animate-spin" />
            ) : (
              "Eliminar permanentemente"
            )}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="w-full py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-all active:scale-95"
          >
            Cancelar
          </button>
        </div>
      </article>
    </div>
  );
}
