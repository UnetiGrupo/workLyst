import { Link, useLocation } from "@tanstack/react-router";
import {
	Folder,
	LayoutDashboard,
	MessageSquare,
	Settings,
	Users,
} from "lucide-react";
import type { ComponentType, SVGProps } from "react";

interface NavItem {
	href: string;
	label: string;
	icon: ComponentType<SVGProps<SVGSVGElement>>;
}

const NAV_ITEMS: NavItem[] = [
	{ href: "/", label: "Inicio", icon: LayoutDashboard },
	{ href: "/projects", label: "Proyectos", icon: Folder },
	{ href: "/groups", label: "Grupos", icon: Users },
	{ href: "/messages", label: "Mensajes", icon: MessageSquare },
	{ href: "/settings", label: "Ajustes", icon: Settings },
];

export function BottomNav() {
	const location = useLocation();

	const isActive = (href: string) => {
		if (href === "/") return location.pathname === "/";
		return location.pathname.startsWith(href);
	};

	return (
		<nav className="fixed bottom-0 left-0 z-50 flex w-full items-center justify-around border-t border-worklyst-border bg-worklyst-surface px-2 py-1.5 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] md:hidden">
			{NAV_ITEMS.map((item) => {
				const active = isActive(item.href);
				return (
					<Link
						key={item.href}
						to={item.href}
						className={`flex flex-col items-center gap-0.5 px-2 py-1 text-[10px] font-medium transition-colors ${
							active ? "text-primary-600" : "text-worklyst-text-sub"
						}`}
					>
						<item.icon
							className={`size-5 ${active ? "text-primary-600" : "text-worklyst-text-sub"}`}
							strokeWidth={active ? 2.25 : 1.75}
						/>
						<span>{item.label}</span>
					</Link>
				);
			})}
		</nav>
	);
}
