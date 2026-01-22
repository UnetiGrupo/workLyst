export function TaskItem({ title, project, priority, date }) {
  const priorityStyles = {
    Alto: "bg-red-200 text-red-600",
    Medio: "bg-yellow-200 text-yellow-700",
    Bajo: "bg-green-200 text-green-700",
  };

  return (
    <>
      <div
        className="flex justify-between items-center py-5 border-b border-gray-50
hover:bg-gray-50/50 transition-colors px-2 rounded-2xl"
      >
        <div className="pr-4">
          <h4
            className="font-bold text-gray-800 text-sm md:text-base
        leading-tight"
          >
            {title}
          </h4>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-[10px] md:text-xs text-gray-400 font-medium">
              {project}
            </span>
            <span
              className={`${priorityStyles[priority]} text-[9px] px-2 py-0.5 rounded-lg font-black uppercase tracking-wider`}
            >
              {priority}
            </span>
          </div>
        </div>
        <span className="text-xs md:text-sm font-bold text-gray-400 whitespace-nowrap">
          {date}
        </span>
      </div>
    </>
  );
}
