// Modal único de crear/editar: formulario del proyecto con foco y trap propios.
import { type FormEvent, useEffect, useRef, useState } from "react";

import { Button } from "#/components/common/button";
import { Input } from "#/components/common/input";
import {
	canSubmitProjectForm,
	initialProjectFormValues,
} from "#/lib/projects/project-form";
import type {
	Project,
	ProjectFormValues,
	ProjectTemplate,
} from "#/lib/projects/types";

interface ProjectFormModalProps {
	open: boolean;
	mode: "create" | "edit";
	project?: Project | null;
	pending: boolean;
	error: string | null;
	onSubmit: (values: ProjectFormValues) => void;
	onClose: () => void;
}

const TEMPLATE_OPTIONS: { value: ProjectTemplate; label: string }[] = [
	{ value: "kanban", label: "Kanban" },
	{ value: "scrum", label: "Scrum" },
];

const FOCUSABLE_SELECTOR =
	'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

const NAME_ERROR_MESSAGE = "El nombre es obligatorio";

export function ProjectFormModal({
	open,
	mode,
	project,
	pending,
	error,
	onSubmit,
	onClose,
}: ProjectFormModalProps) {
	const panelRef = useRef<HTMLDivElement>(null);
	const triggerRef = useRef<HTMLElement | null>(null);
	const onCloseRef = useRef(onClose);
	onCloseRef.current = onClose;

	const [values, setValues] = useState<ProjectFormValues>(() =>
		initialProjectFormValues(project ?? undefined),
	);
	const [nameTouched, setNameTouched] = useState(false);

	useEffect(() => {
		if (!open) return;
		setValues(initialProjectFormValues(project ?? undefined));
		setNameTouched(false);
	}, [open, project]);

	useEffect(() => {
		if (!open) return;

		triggerRef.current = document.activeElement as HTMLElement | null;
		panelRef.current?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR)?.focus();

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

	const nameInvalid = nameTouched && !canSubmitProjectForm(values.name);
	const canSubmit = canSubmitProjectForm(values.name) && !pending;
	const title = mode === "create" ? "Nuevo proyecto" : "Editar proyecto";
	const submitLabel = mode === "create" ? "Crear proyecto" : "Guardar cambios";

	const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (pending || !canSubmitProjectForm(values.name)) return;
		onSubmit(values);
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
			<button
				type="button"
				aria-label="Cerrar modal"
				tabIndex={-1}
				data-testid="project-form-overlay"
				onClick={onClose}
				className="absolute inset-0 cursor-default bg-slate-900/40"
			/>

			<div
				ref={panelRef}
				role="dialog"
				aria-modal="true"
				aria-label={title}
				tabIndex={-1}
				className="relative flex max-h-[90vh] w-full max-w-lg flex-col overflow-y-auto rounded-xl border border-worklyst-border bg-worklyst-surface shadow-xl outline-none"
			>
				<header className="border-b border-worklyst-border px-5 py-4">
					<h2 className="text-base font-bold text-worklyst-text">{title}</h2>
				</header>

				<form onSubmit={handleSubmit} className="flex flex-col gap-5 p-5">
					<Input
						label="Nombre"
						value={values.name}
						placeholder="Nombre del proyecto"
						aria-invalid={nameInvalid || undefined}
						error={nameInvalid ? NAME_ERROR_MESSAGE : undefined}
						onChange={(event) => {
							setNameTouched(true);
							setValues((current) => ({
								...current,
								name: event.target.value,
							}));
						}}
						onBlur={() => setNameTouched(true)}
					/>

					<div className="flex flex-col gap-1.5">
						<label
							htmlFor="project-description"
							className="text-xs font-semibold text-worklyst-text uppercase tracking-wide"
						>
							Descripción
						</label>
						<textarea
							id="project-description"
							rows={3}
							value={values.description}
							placeholder="Descripción del proyecto (opcional)"
							onChange={(event) =>
								setValues((current) => ({
									...current,
									description: event.target.value,
								}))
							}
							className="w-full resize-none rounded-lg border border-worklyst-border bg-white px-3 py-3 text-sm text-worklyst-text placeholder:text-worklyst-text-sub transition-all focus:border-transparent focus:ring-2 focus:ring-primary-500 focus:outline-none md:py-2"
						/>
					</div>

					<fieldset className="space-y-1">
						<legend className="mb-1 text-xs font-semibold text-worklyst-text uppercase tracking-wide">
							Plantilla
						</legend>
						{TEMPLATE_OPTIONS.map((option) => (
							<label
								key={option.value}
								className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-1.5 text-sm text-worklyst-text transition-colors hover:bg-worklyst-tiza-bg"
							>
								<input
									type="radio"
									name="project-template"
									value={option.value}
									checked={values.template === option.value}
									onChange={() =>
										setValues((current) => ({
											...current,
											template: option.value,
										}))
									}
									className="size-4 accent-primary-600"
								/>
								{option.label}
							</label>
						))}
					</fieldset>

					{error && (
						<div
							role="alert"
							className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
						>
							{error}
						</div>
					)}

					<div className="flex justify-end gap-3">
						<Button
							variant="brand"
							onClick={onClose}
							className="disabled:cursor-not-allowed disabled:opacity-60"
						>
							Cancelar
						</Button>
						<Button
							type="submit"
							disabled={!canSubmit}
							className="disabled:cursor-not-allowed disabled:opacity-60"
						>
							{pending ? "Guardando..." : submitLabel}
						</Button>
					</div>
				</form>
			</div>
		</div>
	);
}
