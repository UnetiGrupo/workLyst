import { Bot, Sparkles } from "lucide-react";

export function AiAssistantCard() {
	return (
		<div className="rounded-xl border border-worklyst-border bg-worklyst-surface p-4 shadow-xs md:p-5">
			<div className="mb-4 flex items-center justify-between">
				<div className="flex items-center gap-2">
					<div className="flex size-8 items-center justify-center rounded-lg bg-primary-50">
						<Bot className="size-[18px] text-primary-600" />
					</div>
					<h3 className="text-sm font-bold text-worklyst-text md:text-base">
						Asistente IA
					</h3>
				</div>
				<span className="flex items-center gap-1 rounded-full bg-primary-50 px-2 py-0.5 text-[10px] font-bold text-primary-600">
					<Sparkles className="size-3" />
					Live
				</span>
			</div>

			<div className="mb-4 rounded-lg bg-primary-50/50 p-3">
				<span className="mb-1.5 block text-[10px] font-bold text-primary-700 uppercase tracking-wider">
					Resumen de Sprint
				</span>
				<p className="text-xs leading-relaxed text-worklyst-text-sub">
					El <span className="font-semibold text-worklyst-text">Sprint 4</span>{" "}
					tiene 4 días restantes con 24 de 42 puntos completados (57%). Te
					recomiendo priorizar la revisión de la{" "}
					<span className="font-semibold text-worklyst-text">
						arquitectura API
					</span>{" "}
					para evitar cuellos de botella en frontend.
				</p>
			</div>

			<button
				type="button"
				className="flex w-full items-center justify-center gap-2 rounded-lg border border-worklyst-border bg-worklyst-bg py-2.5 text-sm font-semibold text-worklyst-text transition-all hover:bg-worklyst-tiza-bg active:scale-[0.98]"
			>
				<Bot className="size-4 text-primary-500" />
				Consultar al Agente IA
			</button>
		</div>
	);
}
