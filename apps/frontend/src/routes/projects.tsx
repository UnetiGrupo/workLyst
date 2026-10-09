import { createFileRoute, Navigate } from "@tanstack/react-router";
import {
	AlertTriangle,
	FolderOpen,
	SearchX,
	SlidersHorizontal,
	X,
} from "lucide-react";
import { useEffect, useRef } from "react";

import { Button } from "#/components/common/button";
import { SearchBar } from "#/components/common/search-bar";
import { HeaderSlot } from "#/components/layout/header";
import { ConfirmDialog } from "#/components/projects/confirm-dialog";
import { FiltersDrawer } from "#/components/projects/filters-drawer";
import { ProjectCard } from "#/components/projects/project-card";
import { ProjectFormModal } from "#/components/projects/project-form-modal";
import { WorkspaceKpis } from "#/components/projects/workspace-kpis";
import { useProjects } from "#/hooks/use-projects";
import type { Project, ProjectChip } from "#/lib/projects/types";
import { useAuthStore } from "#/stores/auth-store";

export const Route = createFileRoute("/projects")({ component: ProjectsView });

const CHIPS: { value: ProjectChip; label: string }[] = [
	{ value: "todos", label: "Todos" },
	{ value: "favoritos", label: "Favoritos" },
	{ value: "nuevos", label: "Nuevos" },
	{ value: "en_riesgo", label: "En riesgo" },
];

const GRID_SKELETON_KEYS = ["a", "b", "c", "d", "e", "f"];

const CHIP_ACTIVE_CLASSES =
	"border border-primary-600 bg-primary-600 text-white";
const CHIP_INACTIVE_CLASSES =
	"border border-worklyst-border bg-worklyst-surface text-worklyst-text-sub hover:bg-worklyst-tiza-bg";

function GridSkeleton() {
	return (
		<section
			aria-label="Cargando proyectos"
			aria-busy="true"
			className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3"
		>
			{GRID_SKELETON_KEYS.map((key) => (
				<div
					key={key}
					className="h-[188px] animate-pulse rounded-lg border border-worklyst-border bg-worklyst-surface"
				/>
			))}
		</section>
	);
}

function EmptyWorkspace({ onCreate }: { onCreate: () => void }) {
	return (
		<div
			data-testid="empty-workspace"
			className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-worklyst-border bg-worklyst-surface px-6 py-12 text-center"
		>
			<FolderOpen className="size-8 text-worklyst-text-sub" strokeWidth={1.5} />
			<p className="text-sm font-medium text-worklyst-text">
				Aún no hay proyectos
			</p>
			<Button onClick={onCreate}>Nuevo proyecto</Button>
		</div>
	);
}

function EmptyResults({ onClear }: { onClear: () => void }) {
	return (
		<div
			data-testid="empty-results"
			className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-worklyst-border bg-worklyst-surface px-6 py-12 text-center"
		>
			<SearchX className="size-8 text-worklyst-text-sub" strokeWidth={1.5} />
			<p className="text-sm font-medium text-worklyst-text">
				No se encontraron proyectos
			</p>
			<Button variant="brand" onClick={onClear}>
				Limpiar filtros
			</Button>
		</div>
	);
}

function ListError({
	message,
	onRetry,
}: {
	message: string | null;
	onRetry: () => void;
}) {
	return (
		<div
			role="alert"
			className="flex flex-col items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-6 py-10 text-center"
		>
			<AlertTriangle className="size-8 text-red-500" strokeWidth={1.5} />
			<p className="text-sm font-medium text-red-600">
				{message ?? "No pudimos cargar los proyectos."}
			</p>
			<Button onClick={onRetry}>Reintentar</Button>
		</div>
	);
}

export function ProjectsView() {
	const isGuest = useAuthStore((state) => state.status === "guest");
	const {
		listStatus,
		listError,
		load,
		visibleProjects,
		kpis,
		isEmpty,
		hasNoResults,
		filters,
		setSearch,
		setChip,
		setType,
		setStatus,
		activeRefinementCount,
		clearFilters,
		drawerOpen,
		openDrawer,
		closeDrawer,
		modal,
		openCreateModal,
		openEditModal,
		closeModal,
		confirm,
		openArchiveConfirm,
		openDeleteConfirm,
		closeConfirm,
		favoritePendingId,
		actionError,
		dismissActionError,
		toggleFavorite,
		formPending,
		formError,
		submitForm,
		confirmPending,
		confirmError,
		confirmAction,
	} = useProjects();

	const gridRef = useRef<HTMLDivElement>(null);
	const focusOriginRef = useRef<{
		element: HTMLElement | null;
		projectId: string | null;
	}>({ element: null, projectId: null });

	const overlayOpen = drawerOpen || modal !== null || confirm !== null;

	// Tras una mutación o el cierre de un overlay devuelve el foco al disparador
	// si sigue en el DOM; si la tarjeta desapareció o dejó de cumplir los
	// filtros, al contenedor del grid para no perderlo.
	useEffect(() => {
		const { element, projectId } = focusOriginRef.current;
		if (!element || overlayOpen) {
			return;
		}
		focusOriginRef.current = { element: null, projectId: null };
		const stillVisible =
			projectId === null ||
			visibleProjects.some((project) => project.id === projectId);
		if (!element.isConnected || !stillVisible) {
			gridRef.current?.focus();
		}
	}, [overlayOpen, visibleProjects]);

	const rememberFocusOrigin = (projectId: string | null = null) => {
		focusOriginRef.current = {
			element: document.activeElement as HTMLElement | null,
			projectId,
		};
	};

	const handleOpenCreate = () => {
		rememberFocusOrigin();
		openCreateModal();
	};

	const handleOpenDrawer = () => {
		rememberFocusOrigin();
		openDrawer();
	};

	const handleOpenEdit = (project: Project) => {
		rememberFocusOrigin(project.id);
		openEditModal(project);
	};

	const handleOpenArchive = (project: Project) => {
		rememberFocusOrigin(project.id);
		openArchiveConfirm(project);
	};

	const handleOpenDelete = (project: Project) => {
		rememberFocusOrigin(project.id);
		openDeleteConfirm(project);
	};

	const handleToggleFavorite = (project: Project) => {
		rememberFocusOrigin(project.id);
		void toggleFavorite(project);
	};

	if (isGuest) {
		return <Navigate to="/auth/signin" />;
	}

	return (
		<div className="mx-auto w-full max-w-7xl px-4 py-4 font-display text-worklyst-text md:px-6 lg:px-8">
			<HeaderSlot>
				<div className="min-w-0 flex-1">
					<SearchBar
						searchQuery={filters.search}
						setSearchQuery={setSearch}
						placeholder="Buscar proyectos..."
					/>
				</div>
				<Button onClick={handleOpenCreate}>Nuevo proyecto</Button>
			</HeaderSlot>

			<header className="flex flex-col gap-1">
				<h1 className="text-2xl font-extrabold text-worklyst-text md:text-3xl 2xl:text-4xl">
					Proyectos
				</h1>
			</header>

			{actionError && (
				<div
					role="alert"
					className="mt-4 flex items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
				>
					<span>{actionError}</span>
					<button
						type="button"
						aria-label="Descartar aviso"
						onClick={dismissActionError}
						className="flex size-6 shrink-0 items-center justify-center rounded-md transition-colors hover:bg-red-100"
					>
						<X className="size-4" />
					</button>
				</div>
			)}

			<section className="mt-5 flex flex-col gap-4">
				<div className="flex flex-wrap items-center justify-between gap-3">
					<h2 className="text-base font-bold text-worklyst-text md:text-lg">
						Espacio de trabajo
					</h2>
				</div>

				<div className="flex items-center gap-2 overflow-x-auto pb-1">
					<div className="flex items-center gap-2">
						{CHIPS.map((chip) => {
							const active = filters.chip === chip.value;
							return (
								<button
									key={chip.value}
									type="button"
									aria-pressed={active}
									onClick={() => setChip(chip.value)}
									className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
										active ? CHIP_ACTIVE_CLASSES : CHIP_INACTIVE_CLASSES
									}`}
								>
									{chip.label}
								</button>
							);
						})}
					</div>

					<button
						type="button"
						aria-label="Filtros"
						onClick={handleOpenDrawer}
						className="ml-auto flex shrink-0 items-center gap-2 rounded-full border border-worklyst-border bg-worklyst-surface px-3 py-1.5 text-xs font-medium text-worklyst-text transition-colors hover:bg-worklyst-tiza-bg"
					>
						<SlidersHorizontal className="size-4" />
						<span>Filtros</span>
						{activeRefinementCount > 0 && (
							<span
								data-testid="filters-badge"
								className="flex size-4 items-center justify-center rounded-full bg-primary-600 text-[10px] font-bold text-white"
							>
								{activeRefinementCount}
							</span>
						)}
					</button>
				</div>
			</section>

			<div className="mt-4">
				<WorkspaceKpis stats={listStatus === "ready" ? kpis : null} />
			</div>

			<div
				ref={gridRef}
				data-testid="projects-grid"
				tabIndex={-1}
				className="mt-5 outline-none"
			>
				{listStatus === "loading" && <GridSkeleton />}

				{listStatus === "error" && (
					<ListError message={listError} onRetry={load} />
				)}

				{listStatus === "ready" && isEmpty && (
					<EmptyWorkspace onCreate={handleOpenCreate} />
				)}

				{listStatus === "ready" && hasNoResults && (
					<EmptyResults onClear={clearFilters} />
				)}

				{listStatus === "ready" && !isEmpty && !hasNoResults && (
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
						{visibleProjects.map((project) => (
							<ProjectCard
								key={project.id}
								project={project}
								favoritePending={favoritePendingId === project.id}
								onToggleFavorite={handleToggleFavorite}
								onEdit={handleOpenEdit}
								onArchive={handleOpenArchive}
								onDelete={handleOpenDelete}
							/>
						))}
					</div>
				)}
			</div>

			<FiltersDrawer
				open={drawerOpen}
				type={filters.type}
				status={filters.status}
				onTypeChange={setType}
				onStatusChange={setStatus}
				onClear={clearFilters}
				onClose={closeDrawer}
			/>

			<ProjectFormModal
				open={modal !== null}
				mode={modal?.mode ?? "create"}
				project={modal?.project ?? null}
				pending={formPending}
				error={formError}
				onSubmit={submitForm}
				onClose={closeModal}
			/>

			<ConfirmDialog
				open={confirm !== null}
				action={confirm?.action ?? "archive"}
				projectName={confirm?.project.name ?? ""}
				pending={confirmPending}
				error={confirmError}
				onConfirm={confirmAction}
				onClose={closeConfirm}
			/>
		</div>
	);
}
