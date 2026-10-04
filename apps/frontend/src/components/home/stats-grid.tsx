import {
	AlertTriangle,
	CheckCircle2,
	Clock,
	Folder,
	TrendingUp,
} from "lucide-react";
import type { StatItem } from "@/data/home-mocks";

const iconMap = {
	Folder,
	CheckCircle2,
	Clock,
	AlertTriangle,
};

interface StatsGridProps {
	stats: StatItem[];
}

const variantStyles = {
	default: {
		iconBg: "bg-primary-50",
		iconText: "text-primary-600",
		subtitleText: "text-worklyst-text-sub",
	},
	success: {
		iconBg: "bg-emerald-50",
		iconText: "text-emerald-600",
		subtitleText: "text-emerald-600",
	},
	warning: {
		iconBg: "bg-amber-50",
		iconText: "text-amber-600",
		subtitleText: "text-worklyst-text-sub",
	},
	danger: {
		iconBg: "bg-red-50",
		iconText: "text-red-500",
		subtitleText: "text-red-500",
	},
};

export function StatsGrid({ stats }: StatsGridProps) {
	return (
		<section className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
			{stats.map((stat) => {
				const IconComponent =
					iconMap[stat.iconName as keyof typeof iconMap] || Folder;
				const styles = variantStyles[stat.variant];

				return (
					<div
						key={stat.id}
						className="flex flex-col justify-between rounded-lg border border-worklyst-border bg-worklyst-surface p-4 shadow-xs"
					>
						<div className="mb-3 flex items-center justify-between">
							<div
								className={`flex size-9 items-center justify-center rounded-lg ${styles.iconBg}`}
							>
								<IconComponent
									className={`size-[18px] ${styles.iconText}`}
									strokeWidth={2}
								/>
							</div>
							{stat.variant === "success" && (
								<TrendingUp className="size-4 text-emerald-500" />
							)}
							{stat.variant === "danger" && (
								<AlertTriangle className="size-4 text-red-500" />
							)}
						</div>

						<div>
							<span className="block text-[10px] font-bold tracking-wider text-worklyst-text-sub uppercase md:text-[11px]">
								{stat.title}
							</span>
							<span className="font-mono text-xl font-extrabold text-worklyst-text md:text-2xl">
								{stat.count}
							</span>
						</div>

						{stat.barPercent !== undefined && (
							<div className="mt-2.5">
								<div className="h-1.5 w-full overflow-hidden rounded-full bg-primary-100">
									<div
										className="h-full rounded-full bg-primary-500"
										style={{ width: `${stat.barPercent}%` }}
									/>
								</div>
							</div>
						)}

						<p
							className={`mt-2 text-[11px] font-medium ${styles.subtitleText}`}
						>
							{stat.subtitle}
						</p>
					</div>
				);
			})}
		</section>
	);
}
