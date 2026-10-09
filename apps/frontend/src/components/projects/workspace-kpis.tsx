// Fila de KPIs del espacio de trabajo: valores con subtítulo fijo o skeleton.
import { AlertTriangle, CheckCircle2, Clock, Folder } from "lucide-react";

import type { WorkspaceStats } from "#/lib/projects/types";

interface WorkspaceKpisProps {
	stats: WorkspaceStats | null;
}

const SKELETON_KEYS = ["activos", "en-riesgo", "vencen-pronto", "completados"];

export function WorkspaceKpis({ stats }: WorkspaceKpisProps) {
	if (!stats) {
		return (
			<section
				aria-label="Cargando indicadores"
				aria-busy="true"
				className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4"
			>
				{SKELETON_KEYS.map((key) => (
					<div
						key={key}
						className="h-[104px] animate-pulse rounded-lg border border-worklyst-border bg-worklyst-surface"
					/>
				))}
			</section>
		);
	}

	const items = [
		{
			label: "Activos",
			value: stats.activos,
			subtitle: `de ${stats.total} proyectos totales`,
			icon: Folder,
			iconBg: "bg-primary-50",
			iconText: "text-primary-600",
			subtitleText: "text-worklyst-text-sub",
		},
		{
			label: "En riesgo",
			value: stats.enRiesgo,
			subtitle: "requieren atención",
			icon: AlertTriangle,
			iconBg: "bg-red-50",
			iconText: "text-red-500",
			subtitleText: "text-red-500",
		},
		{
			label: "Vencen pronto",
			value: stats.vencenPronto,
			subtitle: "plazo de 7 días o menos",
			icon: Clock,
			iconBg: "bg-amber-50",
			iconText: "text-amber-600",
			subtitleText: "text-worklyst-text-sub",
		},
		{
			label: "Completados",
			value: stats.completados,
			subtitle: "entregados con éxito",
			icon: CheckCircle2,
			iconBg: "bg-emerald-50",
			iconText: "text-emerald-600",
			subtitleText: "text-emerald-600",
		},
	];

	return (
		<section
			aria-label="Indicadores del espacio de trabajo"
			className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4"
		>
			{items.map((item) => {
				const Icon = item.icon;
				return (
					<div
						key={item.label}
						className="flex flex-col justify-between rounded-lg border border-worklyst-border bg-worklyst-surface p-4 shadow-xs"
					>
						<div className="mb-3 flex items-center justify-between">
							<div
								className={`flex size-9 items-center justify-center rounded-lg ${item.iconBg}`}
							>
								<Icon
									className={`size-[18px] ${item.iconText}`}
									strokeWidth={2}
								/>
							</div>
						</div>

						<div>
							<span className="block text-[10px] font-bold tracking-wider text-worklyst-text-sub uppercase md:text-[11px]">
								{item.label}
							</span>
							<span className="font-mono text-xl font-extrabold text-worklyst-text md:text-2xl">
								{item.value}
							</span>
						</div>

						<p className={`mt-2 text-[11px] font-medium ${item.subtitleText}`}>
							{item.subtitle}
						</p>
					</div>
				);
			})}
		</section>
	);
}
