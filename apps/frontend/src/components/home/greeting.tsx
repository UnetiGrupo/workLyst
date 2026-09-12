interface GreetingProps {
	userName: string;
	criticalTasksCount: number;
	productivityPercent: number;
}

export function Greeting({
	userName,
	criticalTasksCount,
	productivityPercent,
}: GreetingProps) {
	return (
		<section className="space-y-1 mb-4 md:mb-6 md:mt-2">
			<div className="flex items-center gap-3">
				<h2 className="text-2xl font-extrabold text-worklyst-text md:text-3xl 2xl:text-4xl">
					¡Hola, {userName}!
				</h2>
				<span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600">
					<span className="size-1.5 rounded-full bg-emerald-500" />
					Activo
				</span>
			</div>
			<p className="text-sm text-worklyst-text-sub md:text-base">
				Tienes{" "}
				<span className="font-semibold text-worklyst-text">
					{criticalTasksCount} tareas críticas
				</span>{" "}
				para hoy. Tu productividad general aumentó un{" "}
				<span className="font-semibold text-emerald-600">
					+{productivityPercent}%
				</span>{" "}
				esta semana.
			</p>
		</section>
	);
}
