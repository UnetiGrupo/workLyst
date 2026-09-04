import { createFileRoute } from "@tanstack/react-router";
import { AuthBackground } from "#/components/auth/auth-background";
import { AuthFooter } from "#/components/auth/auth-footer";
import { AuthHeader } from "#/components/auth/auth-header";
import { AuthHero } from "#/components/auth/auth-hero";
import { SignupForm } from "#/components/auth/signup-form";
import { Button } from "#/components/common/button";
import { GitHub, Google } from "#/components/common/icons";

const SOCIAL_BUTTONS = [
	{ icon: Google, text: "Google" },
	{ icon: GitHub, text: "GitHub" },
] as const;

export const Route = createFileRoute("/auth/signup")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<main className="flex h-dvh w-full">
			<AuthBackground>
				<div className="flex flex-col gap-8 p-12 w-full h-full">
					<AuthHeader />
					<AuthHero
						title={
							<>
								Construye más <br /> rápido. <br />
								<span className="text-transparent bg-clip-text bg-linear-to-r from-primary-300 to-primary-500">
									Gestiona mejor con <br />
									IA.
								</span>
							</>
						}
						description="La plataforma centralizada para equipos de ingeniería que automatiza estimaciones, sincroniza sprints y agiliza la toma de decisiones técnicas en tiempo real."
						tags={[
							{ text: "Scrum & Kanban", showDot: false },
							{ text: "Copiloto AI", showDot: true },
						]}
					/>
					<AuthFooter />
				</div>
			</AuthBackground>
			<section className="flex flex-col items-center justify-center flex-1 w-full h-full px-12 overflow-y-auto">
				<div className="flex flex-col items-center gap-6 w-full max-w-lg py-8">
					<header className="flex flex-col gap-1 text-center">
						<h2 className="text-3xl font-black">Crear tu cuenta</h2>
						<p className="text-sm text-worklyst-text-sub">
							Únete a más de 10,000 equipos que gestionan con Worklyst.
						</p>
					</header>

					<div className="flex gap-3 w-full">
						{SOCIAL_BUTTONS.map((btn) => (
							<Button key={btn.text} variant="brand" className="flex-1">
								<btn.icon className="size-4" />
								<span>{btn.text}</span>
							</Button>
						))}
					</div>

					<div className="flex items-center gap-4 w-full">
						<div className="flex-1 h-px bg-worklyst-border" />
						<span className="text-xs text-worklyst-text-sub font-mono font-medium whitespace-nowrap">
							O REGÍSTRATE CON TU CORREO
						</span>
						<div className="flex-1 h-px bg-worklyst-border" />
					</div>

					<SignupForm />
				</div>
			</section>
		</main>
	);
}
