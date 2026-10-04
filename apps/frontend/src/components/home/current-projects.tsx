import { Database, FileText, ShoppingBag } from "lucide-react";
import type { ProjectItem } from "@/data/home-mocks";

interface CurrentProjectsProps {
	projects: ProjectItem[];
}

const PROJECT_ICONS = [
	<FileText key="1" className="size-5 text-primary-600" />,
	<ShoppingBag key="2" className="size-5 text-rose-400" />,
	<Database key="3" className="size-5 text-slate-500" />,
];

const MEMBER_COLORS = [
	"bg-primary-500",
	"bg-emerald-500",
	"bg-amber-500",
	"bg-rose-500",
];

const progressColor = (percent: number) => {
	if (percent >= 80) return "bg-emerald-500";
	if (percent >= 50) return "bg-primary-500";
	if (percent >= 25) return "bg-amber-500";
	return "bg-slate-400";
};

export function CurrentProjects({ projects }: CurrentProjectsProps) {
	return (
		<section>
			<div className="mb-4 flex items-center justify-between">
				<h3 className="text-base font-bold text-worklyst-text md:text-lg">
					Proyectos Actuales
				</h3>
				<span className="text-xs font-medium text-worklyst-text-sub">
					{projects.length} activos
				</span>
			</div>

			<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
				{projects.map((project, index) => (
					<article
						key={project.id}
						className="flex flex-col justify-between rounded-lg border border-worklyst-border bg-worklyst-surface p-4 shadow-xs transition-all hover:shadow-sm"
					>
						<div className="mb-3 flex items-start justify-between">
							<div className="flex size-10 items-center justify-center rounded-lg bg-primary-50">
								{PROJECT_ICONS[index % PROJECT_ICONS.length]}
							</div>
							{project.sprintLabel && (
								<span className="rounded-md bg-worklyst-tiza-bg px-2 py-0.5 text-[10px] font-bold text-worklyst-text-sub uppercase tracking-wide">
									{project.sprintLabel}
								</span>
							)}
						</div>

						<div className="mb-3">
							<h4 className="text-[15px] font-bold text-worklyst-text">
								{project.title}
							</h4>
							<p className="mt-0.5 text-xs text-worklyst-text-sub">
								{project.statusText}
							</p>
						</div>

						<div className="space-y-2">
							<div className="h-1.5 w-full overflow-hidden rounded-full bg-worklyst-tiza-bg">
								<div
									className={`h-full rounded-full transition-all ${progressColor(project.progress)}`}
									style={{ width: `${project.progress}%` }}
								/>
							</div>

							<div className="flex items-center justify-between">
								<div className="flex -space-x-1.5">
									{MEMBER_COLORS.slice(
										0,
										Math.min(project.membersCount, 3),
									).map((color, i) => (
										<div
											key={`${project.id}-${color}`}
											className={`flex size-6 items-center justify-center rounded-full border-2 border-worklyst-surface text-[9px] font-bold text-white ${color}`}
											style={{ zIndex: 3 - i }}
										>
											{String.fromCharCode(65 + i)}
										</div>
									))}
									{project.membersCount > 3 && (
										<div className="flex size-6 items-center justify-center rounded-full border-2 border-worklyst-surface bg-worklyst-tiza-bg text-[9px] font-bold text-worklyst-text-sub">
											+{project.membersCount - 3}
										</div>
									)}
								</div>
								<span className="font-mono text-xs font-bold text-worklyst-text-sub">
									{project.progress}%
								</span>
							</div>
						</div>
					</article>
				))}
			</div>
		</section>
	);
}
