import { Link, useLocation } from "@tanstack/react-router";
import {
	Folder,
	LayoutDashboard,
	LogOut,
	MessageSquare,
	Settings,
	Users,
} from "lucide-react";
import { motion } from "motion/react";
import type { ComponentType, SVGProps } from "react";

interface NavItem {
	href: string;
	label: string;
	icon: ComponentType<SVGProps<SVGSVGElement>>;
}

const NAV_ITEMS: NavItem[] = [
	{ href: "/", label: "Dashboard", icon: LayoutDashboard },
	{ href: "/projects", label: "Mis Proyectos", icon: Folder },
	{ href: "/groups", label: "Grupos", icon: Users },
	{ href: "/messages", label: "Mensajes", icon: MessageSquare },
	{ href: "/settings", label: "Ajustes", icon: Settings },
];

export function Sidebar() {
	const location = useLocation();

	const isActive = (href: string) => {
		if (href === "/") return location.pathname === "/";
		return location.pathname.startsWith(href);
	};

	return (
		<aside className="hidden md:flex flex-col h-dvh w-64 border-r border-worklyst-border bg-worklyst-surface select-none">
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
							key={item.href}
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
							<span className="relative z-10 flex items-center justify-center w-[18px] h-[18px]">
								<item.icon
									className={`w-[18px] h-[18px] transition-colors duration-200 ${
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
					<div className="flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-lg bg-primary-500 text-white text-xs font-bold tracking-wide">
						OL
					</div>
					<div className="flex-1 min-w-0">
						<p className="text-sm font-semibold text-worklyst-text truncate leading-tight">
							Orlando Lopez
						</p>
						<p className="text-[11px] text-worklyst-text-sub truncate">
							orlando@worklyst.com
						</p>
					</div>
					<button
						type="button"
						className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-md text-worklyst-text-sub hover:bg-red-50 hover:text-red-500 transition-all duration-200 cursor-pointer active:scale-95"
						title="Cerrar sesión"
					>
						<LogOut className="w-4 h-4" />
					</button>
				</div>
			</div>
		</aside>
	);
}
