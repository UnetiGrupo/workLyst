// Tarjeta muda de proyecto: solo renderiza props y dispara callbacks.
import { MoreHorizontal, Star } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Tag } from "#/components/common/tag";
import { avatarColor, avatarInitials } from "#/lib/projects/project-display";
import type {
	Project,
	ProjectStatus,
	ProjectTemplate,
} from "#/lib/projects/types";

interface ProjectCardProps {
	project: Project;
	favoritePending?: boolean;
	onToggleFavorite: (project: Project) => void;
	onEdit: (project: Project) => void;
	onArchive: (project: Project) => void;
	onDelete: (project: Project) => void;
}

const TEMPLATE_LABELS: Record<ProjectTemplate, string> = {
	kanban: "Kanban",
	scrum: "Scrum",
};

const STATUS_LABELS: Record<ProjectStatus, string> = {
	activo: "Activo",
	"en riesgo": "En riesgo",
	completado: "Completado",
};

const STATUS_BADGE_CLASSES: Record<ProjectStatus, string> = {
	activo: "border-primary-200 bg-primary-50 text-primary-700",
	"en riesgo": "border-red-200 bg-red-50 text-red-600",
	completado: "border-emerald-200 bg-emerald-50 text-emerald-600",
};

const VISIBLE_MEMBERS = 3;

function progressBarColor(percent: number): string {
	if (percent >= 80) return "bg-emerald-500";
	if (percent >= 50) return "bg-primary-500";
	if (percent >= 25) return "bg-amber-500";
	return "bg-slate-400";
}

export function ProjectCard({
	project,
	favoritePending = false,
	onToggleFavorite,
	onEdit,
	onArchive,
	onDelete,
}: ProjectCardProps) {
	const [menuOpen, setMenuOpen] = useState(false);
	const menuRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!menuOpen) return;

		const handlePointerDown = (event: MouseEvent) => {
			if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
				setMenuOpen(false);
			}
		};
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				setMenuOpen(false);
			}
		};

		document.addEventListener("mousedown", handlePointerDown);
		document.addEventListener("keydown", handleKeyDown);
		return () => {
			document.removeEventListener("mousedown", handlePointerDown);
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, [menuOpen]);

	const runAction = (action: (project: Project) => void) => {
		setMenuOpen(false);
		action(project);
	};

	const visibleMembers = project.members.slice(0, VISIBLE_MEMBERS);
	const hiddenMembers = project.members.length - visibleMembers.length;

	return (
		<article className="flex flex-col gap-3 rounded-lg border border-worklyst-border bg-worklyst-surface p-4 shadow-xs transition-shadow hover:shadow-sm">
			<div className="flex items-start justify-between gap-2">
				<div className="flex flex-wrap items-center gap-2">
					<Tag>{TEMPLATE_LABELS[project.template]}</Tag>
					<span className="rounded-md bg-worklyst-tiza-bg px-2 py-0.5 text-[10px] font-bold text-worklyst-text-sub uppercase tracking-wide">
						{project.phase}
					</span>
				</div>

				<div className="flex items-center gap-1">
					<button
						type="button"
						aria-label={
							project.favorite ? "Quitar de favoritos" : "Añadir a favoritos"
						}
						aria-pressed={project.favorite}
						disabled={favoritePending}
						onClick={() => onToggleFavorite(project)}
						className="flex size-7 items-center justify-center rounded-md text-worklyst-text-sub transition-colors hover:bg-worklyst-tiza-bg disabled:cursor-not-allowed disabled:opacity-50"
					>
						<Star
							className={`size-4 ${
								project.favorite ? "fill-amber-400 text-amber-400" : ""
							}`}
						/>
					</button>

					<div ref={menuRef} className="relative">
						<button
							type="button"
							aria-label="Acciones del proyecto"
							aria-haspopup="menu"
							aria-expanded={menuOpen}
							onClick={() => setMenuOpen((open) => !open)}
							className="flex size-7 items-center justify-center rounded-md text-worklyst-text-sub transition-colors hover:bg-worklyst-tiza-bg"
						>
							<MoreHorizontal className="size-4" />
						</button>

						{menuOpen && (
							<div
								role="menu"
								className="absolute top-full right-0 z-10 mt-1 w-36 overflow-hidden rounded-lg border border-worklyst-border bg-worklyst-surface py-1 shadow-md"
							>
								<button
									type="button"
									role="menuitem"
									onClick={() => runAction(onEdit)}
									className="flex w-full items-center px-3 py-1.5 text-left text-sm text-worklyst-text transition-colors hover:bg-worklyst-tiza-bg"
								>
									Editar
								</button>
								<button
									type="button"
									role="menuitem"
									onClick={() => runAction(onArchive)}
									className="flex w-full items-center px-3 py-1.5 text-left text-sm text-worklyst-text transition-colors hover:bg-worklyst-tiza-bg"
								>
									Archivar
								</button>
								<button
									type="button"
									role="menuitem"
									onClick={() => runAction(onDelete)}
									className="flex w-full items-center px-3 py-1.5 text-left text-sm text-red-600 transition-colors hover:bg-red-50"
								>
									Eliminar
								</button>
							</div>
						)}
					</div>
				</div>
			</div>

			<span
				className={`inline-flex w-fit items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${
					STATUS_BADGE_CLASSES[project.status]
				}`}
			>
				{STATUS_LABELS[project.status]}
			</span>

			<div className="min-w-0">
				<h3 className="truncate text-[15px] font-bold text-worklyst-text">
					{project.name}
				</h3>
				{project.description && (
					<p
						data-testid="project-description"
						className="mt-1 line-clamp-2 text-xs text-worklyst-text-sub"
					>
						{project.description}
					</p>
				)}
			</div>

			<div className="space-y-2">
				<div className="flex items-center justify-between gap-2">
					<div className="flex -space-x-1.5">
						{visibleMembers.map((member, index) => (
							<div
								key={member}
								title={member}
								style={{ zIndex: VISIBLE_MEMBERS - index }}
								className={`flex size-6 items-center justify-center rounded-full border-2 border-worklyst-surface text-[9px] font-bold text-white ${avatarColor(
									member,
								)}`}
							>
								{avatarInitials(member)}
							</div>
						))}
						{hiddenMembers > 0 && (
							<div className="flex size-6 items-center justify-center rounded-full border-2 border-worklyst-surface bg-worklyst-tiza-bg text-[9px] font-bold text-worklyst-text-sub">
								+{hiddenMembers}
							</div>
						)}
					</div>
					<span className="font-mono text-xs font-bold text-worklyst-text-sub">
						{project.progress}%
					</span>
				</div>

				<div
					role="progressbar"
					aria-label={`Progreso: ${project.progress}%`}
					aria-valuenow={project.progress}
					aria-valuemin={0}
					aria-valuemax={100}
					className="h-1.5 w-full overflow-hidden rounded-full bg-worklyst-tiza-bg"
				>
					<div
						className={`h-full rounded-full transition-all ${progressBarColor(
							project.progress,
						)}`}
						style={{ width: `${project.progress}%` }}
					/>
				</div>
			</div>
		</article>
	);
}
