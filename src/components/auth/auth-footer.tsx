export function AuthFooter() {
	return (
		<footer className="mt-auto flex items-center justify-between">
			<div className="flex items-center gap-3">
				<div className="flex -space-x-1">
					<span className="w-2 h-2 rounded-full bg-primary-400" />
					<span className="w-2 h-2 rounded-full bg-primary-500" />
					<span className="w-2 h-2 rounded-full bg-primary-600" />
				</div>
				<span className="text-xs text-gray-500">
					Flujo automatizado · Sprints inteligentes · Entregas predictivas
				</span>
			</div>
		</footer>
	);
}
