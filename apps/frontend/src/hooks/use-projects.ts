import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
	countWorkspaceStats,
	filterProjects,
	todayString,
} from "#/lib/projects/project-filters";
import { canSubmitProjectForm } from "#/lib/projects/project-form";
import {
	type ProjectsService,
	projectsService,
	toProjectsError,
} from "#/lib/projects/projects-api";
import type {
	Project,
	ProjectChip,
	ProjectFilters,
	ProjectFormValues,
	ProjectStatusFilter,
	ProjectTypeFilter,
	WorkspaceStats,
} from "#/lib/projects/types";
import { useAuthStore } from "#/stores/auth-store";

// Único punto de orquestación de la vista: carga, filtros, overlays y mutaciones.

export type ProjectListStatus = "loading" | "ready" | "error";

export interface ProjectModalState {
	mode: "create" | "edit";
	project: Project | null;
}

export interface ProjectConfirmState {
	action: "archive" | "delete";
	project: Project;
}

export interface UseProjectsResult {
	listStatus: ProjectListStatus;
	listError: string | null;
	load: () => Promise<void>;

	projects: Project[];
	visibleProjects: Project[];
	kpis: WorkspaceStats;
	isEmpty: boolean;
	hasNoResults: boolean;

	filters: ProjectFilters;
	setSearch: (search: string) => void;
	setChip: (chip: ProjectChip) => void;
	setType: (type: ProjectTypeFilter) => void;
	setStatus: (status: ProjectStatusFilter) => void;
	activeRefinementCount: number;
	clearFilters: () => void;

	drawerOpen: boolean;
	openDrawer: () => void;
	closeDrawer: () => void;

	modal: ProjectModalState | null;
	openCreateModal: () => void;
	openEditModal: (project: Project) => void;
	closeModal: () => void;

	confirm: ProjectConfirmState | null;
	openArchiveConfirm: (project: Project) => void;
	openDeleteConfirm: (project: Project) => void;
	closeConfirm: () => void;

	favoritePendingId: string | null;
	actionError: string | null;
	dismissActionError: () => void;
	toggleFavorite: (project: Project) => Promise<void>;

	formPending: boolean;
	formError: string | null;
	submitForm: (values: ProjectFormValues) => Promise<void>;

	confirmPending: boolean;
	confirmError: string | null;
	confirmAction: () => Promise<void>;
}

const INITIAL_FILTERS: ProjectFilters = {
	search: "",
	chip: "todos",
	type: "todos",
	status: "todos",
};

export function useProjects(
	service: ProjectsService = projectsService,
): UseProjectsResult {
	const user = useAuthStore((state) => state.user);
	const memberName = user?.nombre?.trim() || user?.email || "Invitado";

	const [projects, setProjects] = useState<Project[]>([]);
	const [listStatus, setListStatus] = useState<ProjectListStatus>("loading");
	const [listError, setListError] = useState<string | null>(null);

	const [filters, setFilters] = useState<ProjectFilters>(INITIAL_FILTERS);

	const [drawerOpen, setDrawerOpen] = useState(false);
	const [modal, setModal] = useState<ProjectModalState | null>(null);
	const [confirm, setConfirm] = useState<ProjectConfirmState | null>(null);

	const [favoritePendingId, setFavoritePendingId] = useState<string | null>(
		null,
	);
	const [actionError, setActionError] = useState<string | null>(null);
	const [formPending, setFormPending] = useState(false);
	const [formError, setFormError] = useState<string | null>(null);
	const [confirmPending, setConfirmPending] = useState(false);
	const [confirmError, setConfirmError] = useState<string | null>(null);

	const requestIdRef = useRef(0);
	const loadedRef = useRef(false);

	const load = useCallback(async () => {
		const requestId = requestIdRef.current + 1;
		requestIdRef.current = requestId;
		setListStatus("loading");
		setListError(null);
		try {
			const data = await service.list();
			if (requestId !== requestIdRef.current) {
				return;
			}
			setProjects(data);
			setListStatus("ready");
		} catch (error) {
			if (requestId !== requestIdRef.current) {
				return;
			}
			setListError(toProjectsError(error).message);
			setListStatus("error");
		}
	}, [service]);

	useEffect(() => {
		if (loadedRef.current) {
			return;
		}
		loadedRef.current = true;
		void load();
	}, [load]);

	const today = todayString(new Date());
	const visibleProjects = useMemo(
		() => filterProjects(projects, filters, today),
		[projects, filters, today],
	);
	const kpis = useMemo(
		() => countWorkspaceStats(projects, today),
		[projects, today],
	);

	const setSearch = useCallback(
		(search: string) => setFilters((current) => ({ ...current, search })),
		[],
	);
	const setChip = useCallback(
		(chip: ProjectChip) => setFilters((current) => ({ ...current, chip })),
		[],
	);
	const setType = useCallback(
		(type: ProjectTypeFilter) =>
			setFilters((current) => ({ ...current, type })),
		[],
	);
	const setStatus = useCallback(
		(status: ProjectStatusFilter) =>
			setFilters((current) => ({ ...current, status })),
		[],
	);
	const clearFilters = useCallback(() => setFilters(INITIAL_FILTERS), []);

	const activeRefinementCount =
		(filters.type === "todos" ? 0 : 1) + (filters.status === "todos" ? 0 : 1);

	const openDrawer = useCallback(() => setDrawerOpen(true), []);
	const closeDrawer = useCallback(() => setDrawerOpen(false), []);

	const openCreateModal = useCallback(() => {
		setFormError(null);
		setModal({ mode: "create", project: null });
	}, []);
	const openEditModal = useCallback((project: Project) => {
		setFormError(null);
		setModal({ mode: "edit", project });
	}, []);
	const closeModal = useCallback(() => {
		setModal(null);
		setFormError(null);
	}, []);

	const openArchiveConfirm = useCallback((project: Project) => {
		setConfirmError(null);
		setConfirm({ action: "archive", project });
	}, []);
	const openDeleteConfirm = useCallback((project: Project) => {
		setConfirmError(null);
		setConfirm({ action: "delete", project });
	}, []);
	const closeConfirm = useCallback(() => {
		setConfirm(null);
		setConfirmError(null);
	}, []);

	const toggleFavorite = useCallback(
		async (project: Project) => {
			setFavoritePendingId(project.id);
			setActionError(null);
			try {
				const updated = await service.setFavorite(
					project.id,
					!project.favorite,
				);
				setProjects((current) =>
					current.map((item) => (item.id === updated.id ? updated : item)),
				);
			} catch (error) {
				setActionError(toProjectsError(error).message);
			} finally {
				setFavoritePendingId(null);
			}
		},
		[service],
	);
	const dismissActionError = useCallback(() => setActionError(null), []);

	const submitForm = useCallback(
		async (values: ProjectFormValues) => {
			if (!canSubmitProjectForm(values.name)) {
				return;
			}
			const target = modal;
			setFormPending(true);
			setFormError(null);
			try {
				if (target?.mode === "edit" && target.project) {
					const updated = await service.update(target.project.id, {
						name: values.name,
						description: values.description,
						template: values.template,
					});
					setProjects((current) =>
						current.map((item) => (item.id === updated.id ? updated : item)),
					);
				} else {
					const created = await service.create({
						name: values.name,
						description: values.description,
						template: values.template,
						memberName,
					});
					setProjects((current) => [...current, created]);
				}
				setModal(null);
			} catch (error) {
				setFormError(toProjectsError(error).message);
			} finally {
				setFormPending(false);
			}
		},
		[service, modal, memberName],
	);

	const confirmAction = useCallback(async () => {
		const target = confirm;
		if (!target) {
			return;
		}
		setConfirmPending(true);
		setConfirmError(null);
		try {
			if (target.action === "archive") {
				const archived = await service.archive(target.project.id);
				setProjects((current) =>
					current.filter((item) => item.id !== archived.id),
				);
			} else {
				await service.remove(target.project.id);
				setProjects((current) =>
					current.filter((item) => item.id !== target.project.id),
				);
			}
			setConfirm(null);
		} catch (error) {
			setConfirmError(toProjectsError(error).message);
		} finally {
			setConfirmPending(false);
		}
	}, [service, confirm]);

	const isEmpty = projects.length === 0;
	const hasNoResults = !isEmpty && visibleProjects.length === 0;

	return {
		listStatus,
		listError,
		load,
		projects,
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
	};
}
