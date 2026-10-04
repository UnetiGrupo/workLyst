import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import {
	Folder,
	LayoutDashboard,
	LogOut,
	MessageSquare,
	Settings,
	Users,
} from "lucide-react";
import { motion } from "motion/react";
import { type ComponentType, type SVGProps, useState } from "react";
import { displayInitials, displayName } from "#/lib/auth/user-display";
import { useAuthStore } from "#/stores/auth-store";

interface NavItem {
	id: string;
	href: string;
	label: string;
	icon: ComponentType<SVGProps<SVGSVGElement>>;
}

export const NAV_ITEMS: NavItem[] = [
	{ id: "dashboard", href: "/", label: "Dashboard", icon: LayoutDashboard },
	{ id: "projects", href: "/projects", label: "Mis Proyectos", icon: Folder },
	{ id: "groups", href: "/groups", label: "Grupos", icon: Users },
	{ id: "messages", href: "/messages", label: "Mensajes", icon: MessageSquare },
	{ id: "settings", href: "/settings", label: "Ajustes", icon: Settings },
];

export function Sidebar() {
	const location = useLocation();
	const navigate = useNavigate();
	const logout = useAuthStore((state) => state.logout);
	const user = useAuthStore((state) => state.user);
	const [isLoggingOut, setIsLoggingOut] = useState(false);

	const name = displayName(user);
	const initials = displayInitials(name);

	const isActive = (href: string) => {
		if (href === "/") return location.pathname === "/";
		return location.pathname.startsWith(href);
	};

	const handleLogout = async () => {
		setIsLoggingOut(true);
		try {
			await logout();
			await navigate({ to: "/auth/signin" });
		} finally {
			setIsLoggingOut(false);
		}
	};

	return (
		<aside className="hidden md:flex flex-col h-dvh w-64 shrink-0 border-r border-worklyst-border bg-worklyst-surface select-none">
			<header className="flex items-center gap-3 px-5 py-5">
				<img
					className="w-8 h-8"
					src="/images/logo.svg"
					alt="Logo de Worklyst"
				/>
				<div className="flex flex-col">
					<h2 className="text-sm font-extrabold tracking-tight text-worklyst-text">
						Worklyst
					</h2>
					<span className="text-[10px] font-medium text-worklyst-text-sub uppercase tracking-widest">
						Gestor inteligente
					</span>
				</div>
			</header>

			<nav className="flex-1 flex flex-col gap-0.5 px-3 py-2">
				{NAV_ITEMS.map((item) => {
					const active = isActive(item.href);
					return (
						<Link
							key={item.id}
							to={item.href}
							className={`
                group relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                transition-all duration-200 ease-out overflow-hidden
                ${
									active
										? "text-white"
										: "text-worklyst-text-sub hover:bg-worklyst-tiza-bg hover:text-worklyst-text"
								}
              `}
						>
							{active && (
								<motion.span
									layoutId="nav-active"
									className="absolute inset-0 bg-primary-500 rounded-lg shadow-md shadow-primary-500/20"
									transition={{
										type: "spring",
										stiffness: 380,
										damping: 30,
									}}
								/>
							)}
							<span className="relative z-10 flex items-center justify-center size-4.5">
								<item.icon
									className={`size-4.5 transition-colors duration-200 ${
										active
											? "text-white"
											: "text-worklyst-text-sub group-hover:text-worklyst-text"
									}`}
								/>
							</span>
							<span className="relative z-10">{item.label}</span>
						</Link>
					);
				})}
			</nav>

			<div className="px-3 pb-4">
				<div className="flex items-center gap-3 px-3 py-3 rounded-lg bg-worklyst-tiza-bg">
					<div className="shrink-0 flex items-center justify-center w-9 h-9 rounded-lg bg-primary-500 text-white text-xs font-bold tracking-wide">
						{initials}
					</div>
					<div className="flex-1 min-w-0">
						<p className="text-sm font-semibold text-worklyst-text truncate leading-tight">
							{name}
						</p>
						{user?.email ? (
							<p className="text-[11px] text-worklyst-text-sub truncate">
								{user.email}
							</p>
						) : null}
					</div>
					<button
						type="button"
						onClick={handleLogout}
						disabled={isLoggingOut}
						className="shrink-0 flex items-center justify-center w-8 h-8 rounded-md text-worklyst-text-sub hover:bg-red-50 hover:text-red-500 transition-all duration-200 cursor-pointer active:scale-95"
						title="Cerrar sesión"
					>
						<LogOut className="w-4 h-4" />
					</button>
				</div>
			</div>
		</aside>
	);
}
