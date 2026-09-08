import { Calendar } from "lucide-react";
import type { TaskItem } from "../../data/home-mocks";

interface UpcomingTasksProps {
  tasks: TaskItem[];
}

export function UpcomingTasks({ tasks }: UpcomingTasksProps) {
  return (
    <section className="my-5 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-worklyst-text">
          Tareas Próximas
        </h3>
        <button className="text-sm font-semibold text-primary-600 active:opacity-70">
          Ver Todas
        </button>
      </div>

      <div className="space-y-2.5">
        {tasks.map((task) => {
          const isUrgent = task.priority === "URGENTE";

          return (
            <div
              key={task.id}
              className="flex items-center justify-between rounded-xl border border-worklyst-border bg-worklyst-surface p-3.5 shadow-xs"
            >
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-worklyst-text">
                  {task.title}
                </h4>
                <div className="flex items-center gap-1.5 font-mono text-xs text-worklyst-text-sub">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{task.dueDate}</span>
                </div>
              </div>

              <span
                className={`rounded-md px-2.5 py-1 font-mono text-[10px] font-extrabold tracking-wider ${
                  isUrgent
                    ? "bg-red-100 text-red-600"
                    : "bg-blue-100 text-blue-600"
                }`}
              >
                {task.priority}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
