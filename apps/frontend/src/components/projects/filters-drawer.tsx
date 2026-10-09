// Panel lateral de refinamientos: grupos de selección única y limpieza.
import { X } from "lucide-react";
import { useEffect, useRef } from "react";

import type {
	ProjectStatusFilter,
	ProjectTypeFilter,
} from "#/lib/projects/types";

interface FiltersDrawerProps {
	open: boolean;
	type: ProjectTypeFilter;
	status: ProjectStatusFilter;
	onTypeChange: (type: ProjectTypeFilter) => void;
	onStatusChange: (status: ProjectStatusFilter) => void;
	onClear: () => void;
	onClose: () => void;
}

const TYPE_OPTIONS: { value: ProjectTypeFilter; label: string }[] = [
	{ value: "todos", label: "Todos" },
	{ value: "kanban", label: "Kanban" },
	{ value: "scrum", label: "Scrum" },
];

const STATUS_OPTIONS: { value: ProjectStatusFilter; label: string }[] = [
	{ value: "todos", label: "Todos" },
	{ value: "activo", label: "Activo" },
	{ value: "en riesgo", label: "En riesgo" },
	{ value: "completado", label: "Completado" },
];

const FOCUSABLE_SELECTOR =
	'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function FiltersDrawer({
	open,
	type,
	status,
	onTypeChange,
	onStatusChange,
	onClear,
	onClose,
}: FiltersDrawerProps) {
	const panelRef = useRef<HTMLDivElement>(null);
	const triggerRef = useRef<HTMLElement | null>(null);
	const onCloseRef = useRef(onClose);

	useEffect(() => {
		onCloseRef.current = onClose;
	}, [onClose]);

	useEffect(() => {
		if (!open) return;

		triggerRef.current = document.activeElement as HTMLElement | null;
		panelRef.current?.focus();

		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				event.preventDefault();
				onCloseRef.current();
				return;
			}
			if (event.key !== "Tab") return;

			const panel = panelRef.current;
			if (!panel) return;
			const focusable = Array.from(
				panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
			);
			if (focusable.length === 0) {
				event.preventDefault();
				panel.focus();
				return;
			}

			const first = focusable[0];
			const last = focusable[focusable.length - 1];
			const active = document.activeElement;

			if (event.shiftKey) {
				if (active === first || active === panel) {
					event.preventDefault();
					last.focus();
				}
			} else if (active === last) {
				event.preventDefault();
				first.focus();
			}
		};

		document.addEventListener("keydown", handleKeyDown);
		return () => {
			document.removeEventListener("keydown", handleKeyDown);
			const trigger = triggerRef.current;
			if (trigger?.isConnected) {
				trigger.focus();
			}
			triggerRef.current = null;
		};
	}, [open]);

	if (!open) return null;

	return (
		<div className="fixed inset-0 z-50">
			<button
				type="button"
				aria-label="Cerrar filtros"
				tabIndex={-1}
				data-testid="filters-overlay"
				onClick={onClose}
				className="absolute inset-0 cursor-default bg-slate-900/40"
			/>

			<div
				ref={panelRef}
				role="dialog"
				aria-modal="true"
				aria-label="Filtros"
				tabIndex={-1}
				className="absolute inset-y-0 right-0 flex w-full flex-col overflow-y-auto border-l border-worklyst-border bg-worklyst-surface shadow-xl outline-none md:w-80"
			>
				<header className="flex items-center justify-between border-b border-worklyst-border px-5 py-4">
					<h2 className="text-base font-bold text-worklyst-text">Filtros</h2>
					<button
						type="button"
						aria-label="Cerrar panel de filtros"
						onClick={onClose}
						className="flex size-8 items-center justify-center rounded-md text-worklyst-text-sub transition-colors hover:bg-worklyst-tiza-bg"
					>
						<X className="size-4" />
					</button>
				</header>

				<div className="flex flex-1 flex-col gap-6 p-5">
					<fieldset className="space-y-1">
						<legend className="mb-1 text-[11px] font-bold tracking-wider text-worklyst-text-sub uppercase">
							Tipo
						</legend>
						{TYPE_OPTIONS.map((option) => (
							<label
								key={option.value}
								className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-1.5 text-sm text-worklyst-text transition-colors hover:bg-worklyst-tiza-bg"
							>
								<input
									type="radio"
									name="project-type"
									value={option.value}
									checked={type === option.value}
									onChange={() => onTypeChange(option.value)}
									className="size-4 accent-primary-600"
								/>
								{option.label}
							</label>
						))}
					</fieldset>

					<fieldset className="space-y-1">
						<legend className="mb-1 text-[11px] font-bold tracking-wider text-worklyst-text-sub uppercase">
							Estado
						</legend>
						{STATUS_OPTIONS.map((option) => (
							<label
								key={option.value}
								className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-1.5 text-sm text-worklyst-text transition-colors hover:bg-worklyst-tiza-bg"
							>
								<input
									type="radio"
									name="project-status"
									value={option.value}
									checked={status === option.value}
									onChange={() => onStatusChange(option.value)}
									className="size-4 accent-primary-600"
								/>
								{option.label}
							</label>
						))}
					</fieldset>
				</div>

				<footer className="border-t border-worklyst-border p-5">
					<button
						type="button"
						onClick={onClear}
						className="w-full rounded-lg border border-worklyst-border bg-white px-4 py-2 text-sm font-medium text-worklyst-text transition-colors hover:bg-worklyst-tiza-bg"
					>
						Limpiar filtros
					</button>
				</footer>
			</div>
		</div>
	);
}
