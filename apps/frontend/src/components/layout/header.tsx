import { useLocation } from "@tanstack/react-router";
import { Bell, ChevronRight, User } from "lucide-react";

const ROUTE_LABELS: Record<string, string> = {
	"/": "Dashboard",
	"/projects": "Proyectos",
	"/groups": "Grupos",
	"/messages": "Mensajes",
	"/settings": "Ajustes",
};

export function Header() {
	const location = useLocation();
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
		<header className="sticky top-0 z-30 flex items-center justify-between border-b border-worklyst-border bg-worklyst-bg/80 px-4 py-3 backdrop-blur-md md:px-6">
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

			<div className="flex items-center gap-2">
				<button
					type="button"
					className="relative flex size-9 items-center justify-center rounded-lg text-worklyst-text-sub transition-colors hover:bg-worklyst-tiza-bg hover:text-worklyst-text"
				>
					<Bell className="size-[18px]" />
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
