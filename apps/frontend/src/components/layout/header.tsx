import { useLocation } from "@tanstack/react-router";
import { Bell, ChevronRight, User } from "lucide-react";
import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";

const ROUTE_LABELS: Record<string, string> = {
	"/": "Dashboard",
	"/projects": "Proyectos",
	"/groups": "Grupos",
	"/messages": "Mensajes",
	"/settings": "Ajustes",
};

interface HeaderActionsValue {
	actions: ReactNode;
	register: (node: ReactNode) => void;
	deregister: () => void;
}

const HeaderActionsContext = createContext<HeaderActionsValue | null>(null);

export function HeaderActionsProvider({ children }: { children: ReactNode }) {
	const [actions, setActions] = useState<ReactNode>(null);
	const register = useCallback((node: ReactNode) => setActions(node), []);
	const deregister = useCallback(() => setActions(null), []);
	const value = useMemo(
		() => ({ actions, register, deregister }),
		[actions, register, deregister],
	);

	return (
		<HeaderActionsContext.Provider value={value}>
			{children}
		</HeaderActionsContext.Provider>
	);
}

export function HeaderSlot({ children }: { children: ReactNode }) {
	const context = useContext(HeaderActionsContext);
	const register = context?.register;
	const deregister = context?.deregister;

	// Registro al montar y limpieza al desmontar en el mismo efecto
	useEffect(() => {
		if (!register || !deregister) {
			return;
		}
		register(children);
		return () => deregister();
	}, [register, deregister, children]);

	return null;
}

export function Header() {
	const location = useLocation();
	const actions = useContext(HeaderActionsContext)?.actions ?? null;

	const segments = location.pathname.split("/").filter(Boolean);

	const breadcrumbs =
		segments.length === 0
			? [{ label: "Dashboard", path: "/" }]
			: segments.map((segment, index) => {
					const path = `/${segments.slice(0, index + 1).join("/")}`;
					const label = ROUTE_LABELS[path] || segment;
					return { label, path };
				});

	return (
		<header className="sticky top-0 z-30 flex flex-wrap items-center justify-between gap-x-4 gap-y-3 border-b border-worklyst-border bg-worklyst-bg/80 px-4 py-3 backdrop-blur-md md:px-4 2xl:px-6">
			<nav className="flex items-center gap-1.5 text-sm">
				{breadcrumbs.map((crumb, index) => (
					<span key={crumb.path} className="flex items-center gap-1.5">
						{index > 0 && (
							<ChevronRight className="size-3.5 text-worklyst-text-sub" />
						)}
						<span
							className={
								index === breadcrumbs.length - 1
									? "font-semibold text-worklyst-text"
									: "text-worklyst-text-sub"
							}
						>
							{crumb.label}
						</span>
					</span>
				))}
			</nav>

			{actions ? (
				<div className="order-2 flex w-full min-w-0 items-center gap-3 md:order-none md:w-auto md:flex-1">
					{actions}
				</div>
			) : null}

			<div className="order-1 ml-auto flex items-center gap-2 md:order-none md:ml-0">
				<button
					type="button"
					className="relative flex size-9 items-center justify-center rounded-lg text-worklyst-text-sub transition-colors hover:bg-worklyst-tiza-bg hover:text-worklyst-text"
				>
					<Bell className="size-4.5" />
					<span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
						3
					</span>
				</button>
				<button
					type="button"
					className="flex size-9 items-center justify-center rounded-lg text-worklyst-text-sub transition-colors hover:bg-worklyst-tiza-bg hover:text-worklyst-text"
				>
					<User className="size-[18px]" />
				</button>
			</div>
		</header>
	);
}
