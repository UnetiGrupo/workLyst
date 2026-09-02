export function BoardColumnSkeleton() {
  return (
    // Renderizamos 3 columnas (Pendiente, Progreso, Completado)
    <>
      {[1, 2, 3].map((col) => (
        <div
          key={col}
          className="flex flex-col gap-4 rounded-2xl p-4 bg-gray-100/50 border-2 border-transparent min-h-[500px] w-[85vw] md:w-auto shrink-0 animate-pulse"
        >
          {/* Header del Skeleton */}
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <div className="size-8 bg-gray-200 rounded-lg" />
              <div className="h-4 w-24 bg-gray-200 rounded" />
            </div>
            <div className="size-6 bg-gray-200 rounded-full" />
          </div>

          {/* Lista de Task Cards Skeletons */}
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((task) => (
              <div
                key={task}
                className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col gap-3"
              >
                {/* Título */}
                <div className="h-4 w-3/4 bg-gray-100 rounded" />
                {/* Descripción corta */}
                <div className="space-y-2">
                  <div className="h-2 w-full bg-gray-50 rounded" />
                  <div className="h-2 w-5/6 bg-gray-50 rounded" />
                </div>
                {/* Footer del card */}
                <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-50">
                  <div className="size-6 bg-gray-100 rounded-full" />
                  <div className="h-3 w-12 bg-gray-50 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </>
  );
}
