export function ProgressBar({
  totalTasks = 0,
  completedTasks = 0,
}: {
  totalTasks: number;
  completedTasks: number;
}) {
  if (totalTasks === 0) return null; // Si no hay tareas, no hay barra

  const progress = Math.round((completedTasks / totalTasks) * 100);

  return (
    <div className="flex flex-col gap-1.5 w-full my-2">
      <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-gray-400">
        <span>Progreso</span>
        <span className="text-blue-600 font-bold">{progress}%</span>
      </div>
      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden border border-gray-200/50">
        <div
          className="progress-bar-fill h-full bg-linear-to-r from-blue-400 to-blue-600"
          style={{ width: `${progress}%`, transition: "width 1s ease-in-out" }}
        />
      </div>
    </div>
  );
}
