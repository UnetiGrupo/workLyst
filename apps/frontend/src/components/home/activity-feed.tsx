import type { ActivityItem } from "@/data/home-mocks";

interface ActivityFeedProps {
	activities: ActivityItem[];
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
	return (
		<div className="rounded-lg border border-worklyst-border bg-worklyst-surface p-4 shadow-xs md:p-5">
			<div className="mb-4 flex items-center justify-between">
				<h3 className="text-sm font-bold text-worklyst-text md:text-base">
					Actividad Reciente
				</h3>
				<button
					type="button"
					className="text-xs font-medium text-worklyst-text-sub transition-colors hover:text-worklyst-text"
				>
					···
				</button>
			</div>

			<div className="relative space-y-0">
				<div className="absolute left-[15px] top-2 bottom-2 w-px bg-worklyst-border" />

				{activities.map((activity) => (
					<div key={activity.id} className="relative flex gap-3 py-2.5">
						<div
							className={`relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white ${activity.userColor}`}
						>
							{activity.userInitial}
						</div>

						<div className="min-w-0 flex-1">
							<p className="text-xs leading-relaxed text-worklyst-text-sub">
								<span className="font-semibold text-worklyst-text">
									{activity.user}
								</span>{" "}
								{activity.action}
							</p>
							<span className="mt-0.5 block text-[10px] text-worklyst-text-sub/70">
								{activity.timeAgo}
							</span>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
