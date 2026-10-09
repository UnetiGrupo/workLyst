// Diálogo único de confirmación para archivar o eliminar (sin `confirm()` nativo).
import { useEffect, useRef } from "react";

import { Button } from "#/components/common/button";

interface ConfirmDialogProps {
	open: boolean;
	action: "archive" | "delete";
	projectName: string;
	pending: boolean;
	error: string | null;
	onConfirm: () => void;
	onClose: () => void;
}

const FOCUSABLE_SELECTOR =
	'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

// El rojo semántico de peligro no existe como variante del Button común.
const DANGER_BUTTON_CLASSES =
	"inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-medium text-white transition-all duration-300 hover:-translate-y-1 hover:bg-red-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 md:px-5 md:py-2";

export function ConfirmDialog({
	open,
	action,
	projectName,
	pending,
	error,
	onConfirm,
	onClose,
}: ConfirmDialogProps) {
	const panelRef = useRef<HTMLDivElement>(null);
	const triggerRef = useRef<HTMLElement | null>(null);
	const onCloseRef = useRef(onClose);
	onCloseRef.current = onClose;

	useEffect(() => {
		if (!open) return;

		triggerRef.current = document.activeElement as HTMLElement | null;
		const panel = panelRef.current;
		const focusable = panel?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
		// El botón de confirmación es el último del diálogo.
		focusable?.[focusable.length - 1]?.focus();

		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				event.preventDefault();
				onCloseRef.current();
				return;
			}
			if (event.key !== "Tab") return;

			const current = panelRef.current;
			if (!current) return;
			const elements = Array.from(
				current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
			);
			if (elements.length === 0) {
				event.preventDefault();
				current.focus();
				return;
			}

			const first = elements[0];
			const last = elements[elements.length - 1];
			const active = document.activeElement;

			if (event.shiftKey) {
				if (active === first || active === current) {
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

	const isDelete = action === "delete";
	const title = isDelete ? "Eliminar proyecto" : "Archivar proyecto";
	const message = isDelete
		? `"${projectName}" se eliminará permanentemente. Esta acción no se puede deshacer.`
		: `"${projectName}" se quitará de tu espacio de trabajo.`;
	const actionLabel = isDelete ? "Eliminar" : "Archivar";

	const handleConfirm = () => {
		if (pending) return;
		onConfirm();
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
			<button
				type="button"
				aria-label="Cerrar diálogo"
				tabIndex={-1}
				data-testid="confirm-dialog-overlay"
				onClick={onClose}
				className="absolute inset-0 cursor-default bg-slate-900/40"
			/>

			<div
				ref={panelRef}
				role="dialog"
				aria-modal="true"
				aria-label={title}
				tabIndex={-1}
				className="relative flex w-full max-w-md flex-col gap-4 rounded-xl border border-worklyst-border bg-worklyst-surface p-5 shadow-xl outline-none"
			>
				<h2 className="text-base font-bold text-worklyst-text">{title}</h2>
				<p className="text-sm text-worklyst-text-sub">{message}</p>

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
					{isDelete ? (
						<button
							type="button"
							onClick={handleConfirm}
							disabled={pending}
							className={DANGER_BUTTON_CLASSES}
						>
							{pending ? "Eliminando..." : actionLabel}
						</button>
					) : (
						<Button
							onClick={handleConfirm}
							disabled={pending}
							className="disabled:cursor-not-allowed disabled:opacity-60"
						>
							{pending ? "Archivando..." : actionLabel}
						</Button>
					)}
				</div>
			</div>
		</div>
	);
}
