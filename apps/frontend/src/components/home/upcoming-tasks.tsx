import { Calendar, ChevronRight } from "lucide-react";
import { useState } from "react";
import type { TaskItem } from "@/data/home-mocks";

interface UpcomingTasksProps {
	tasks: TaskItem[];
}

const FILTERS = ["Todas", "Urgentes", "Frontend", "UI"] as const;

const priorityStyles: Record<string, string> = {
	URGENTE: "bg-red-100 text-red-600",
	ALTA: "bg-orange-100 text-orange-600",
	MEDIA: "bg-blue-100 text-blue-600",
	BAJA: "bg-slate-100 text-slate-500",
};

export function UpcomingTasks({ tasks }: UpcomingTasksProps) {
	const [activeFilter, setActiveFilter] = useState<string>("Todas");

	const urgentCount = tasks.filter((t) => t.priority === "URGENTE").length;

	return (
		<section className="rounded-lg border border-worklyst-border bg-worklyst-surface p-4 shadow-xs md:p-5">
			<div className="mb-4 flex items-center justify-between">
				<div className="flex items-center gap-2.5">
					<h3 className="text-base font-bold text-worklyst-text md:text-lg">
						Tareas Próximas
					</h3>
					{urgentCount > 0 && (
						<span className="rounded-md bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-600 uppercase tracking-wide">
							{urgentCount} urgentes
						</span>
					)}
				</div>
				<button
					type="button"
					className="flex items-center gap-1 text-sm font-semibold text-primary-600 transition-opacity hover:text-primary-700 active:opacity-70"
				>
					Ver todas
					<ChevronRight className="size-4" />
				</button>
			</div>

			<div className="mb-4 flex gap-2 overflow-x-auto pb-1">
				{FILTERS.map((filter) => (
					<button
						key={filter}
						type="button"
						onClick={() => setActiveFilter(filter)}
						className={`shrink-0 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
							activeFilter === filter
								? "bg-primary-500 text-white shadow-sm"
								: "bg-worklyst-tiza-bg text-worklyst-text-sub hover:bg-worklyst-border/60"
						}`}
					>
						{filter}
					</button>
				))}
			</div>

			<div className="space-y-2">
				{tasks.map((task) => (
					<div
						key={task.id}
						className="flex items-center justify-between rounded-lg border border-worklyst-border/60 bg-worklyst-bg p-3 transition-colors hover:border-worklyst-border hover:bg-worklyst-tiza-bg md:p-3.5"
					>
						<div className="flex items-center gap-3">
							<div className="space-y-0.5">
								<h4 className="text-sm font-semibold text-worklyst-text">
									{task.title}
								</h4>
								<div className="flex items-center gap-1.5 text-xs text-worklyst-text-sub">
									<Calendar className="size-3.5" />
									<span>{task.dueDate}</span>
								</div>
							</div>
						</div>

						<div className="flex items-center gap-2.5">
							<span
								className={`rounded-md px-2 py-0.5 font-mono text-[10px] font-bold tracking-wider ${
									priorityStyles[task.priority] || priorityStyles.MEDIA
								}`}
							>
								{task.priority}
							</span>
							<div
								className={`flex size-7 items-center justify-center rounded-full text-[10px] font-bold text-white ${task.assigneeColor}`}
							>
								{task.assignee}
							</div>
						</div>
					</div>
				))}
			</div>
		</section>
	);
}
