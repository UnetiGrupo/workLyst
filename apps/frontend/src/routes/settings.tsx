import { createFileRoute } from "@tanstack/react-router";
import {
	Bell,
	ChevronRight,
	HelpCircle,
	LogOut,
	Palette,
	Shield,
	User,
} from "lucide-react";

export const Route = createFileRoute("/settings")({
	component: RouteComponent,
});

const MENU_OPTIONS = [
	{
		id: 1,
		title: "Cuenta",
		icon: User,
		bg: "bg-primary-100",
		color: "text-primary-600",
	},
	{
		id: 2,
		title: "Notificaciones",
		icon: Bell,
		bg: "bg-orange-100",
		color: "text-orange-600",
	},
	{
		id: 3,
		title: "Seguridad",
		icon: Shield,
		bg: "bg-emerald-100",
		color: "text-emerald-600",
	},
	{
		id: 4,
		title: "Apariencia",
		icon: Palette,
		bg: "bg-slate-100",
		color: "text-slate-600",
	},
	{
		id: 5,
		title: "Ayuda y Soporte",
		icon: HelpCircle,
		bg: "bg-rose-100",
		color: "text-rose-600",
	},
];

function RouteComponent() {
	return (
		<main className="min-h-screen pb-4 px-4 pt-6 flex flex-col gap-6 font-display">
			<header className="flex items-center gap-3">
				<h1 className="text-2xl font-extrabold text-worklyst-text md:text-3xl 2xl:text-4xl">
					Ajustes
				</h1>
			</header>

			<section className="bg-worklyst-surface rounded-2xl p-6 flex flex-col items-center border border-worklyst-border shadow-sm">
				<div className="w-16 h-16 rounded-full bg-primary-600 text-white flex items-center justify-center text-2xl font-bold mb-3">
					O
				</div>
				<h2 className="text-lg font-bold text-worklyst-text">Pedro Castro</h2>
				<p className="text-worklyst-text-sub text-sm font-mono mb-4">
					PedroCastro@gmail.com
				</p>
				<button
					type="button"
					className="bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white px-6 py-2 rounded-lg font-mono text-sm font-medium transition-colors"
				>
					Completar Perfil
				</button>
			</section>

			<section className="bg-worklyst-surface rounded-2xl border border-worklyst-border shadow-sm overflow-hidden">
				<div className="flex flex-col divide-y divide-worklyst-border">
					{MENU_OPTIONS.map((option) => {
						const Icon = option.icon;
						return (
							<button
								type="button"
								key={option.id}
								className="flex items-center justify-between w-full p-4 active:bg-worklyst-tiza-bg transition-colors"
							>
								<div className="flex items-center gap-4">
									<div
										className={`w-10 h-10 rounded-lg flex items-center justify-center ${option.bg} ${option.color}`}
									>
										<Icon size={20} strokeWidth={2.5} />
									</div>
									<span className="font-medium text-worklyst-text text-[15px]">
										{option.title}
									</span>
								</div>
								<ChevronRight size={20} className="text-worklyst-text-sub" />
							</button>
						);
					})}
				</div>
			</section>

			<button
				type="button"
				className="w-full bg-rose-50 border border-rose-100 active:bg-rose-100 text-rose-600 py-4 rounded-2xl flex items-center justify-center gap-2 font-medium transition-colors mt-2"
			>
				<LogOut size={20} strokeWidth={2.5} />
				Cerrar Sesión
			</button>

			<div className="text-center mt-4">
				<span className="text-worklyst-text-sub text-xs font-mono">
					Worklyst v2.0.0 (Stable)
				</span>
			</div>
		</main>
	);
}
