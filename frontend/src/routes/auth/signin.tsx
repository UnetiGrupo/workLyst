import { createFileRoute } from "@tanstack/react-router";
import { AuthBackground } from "#/components/auth/auth-background";
import { AuthFooter } from "#/components/auth/auth-footer";
import { AuthHeader } from "#/components/auth/auth-header";
import { AuthHero } from "#/components/auth/auth-hero";
import { SigninForm } from "#/components/auth/signin-form";
import { Button } from "#/components/common/button";
import { GitHub, Google } from "#/components/common/icons";

const SOCIAL_BUTTONS = [
	{ icon: Google, text: "Google" },
	{ icon: GitHub, text: "GitHub" },
] as const;

export const Route = createFileRoute("/auth/signin")({
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
								Orquesta proyectos y <br /> equipos de alto <br />
								<span className="text-transparent bg-clip-text bg-linear-to-r from-primary-300 to-primary-500">
									impacto con IA.
								</span>
							</>
						}
						description="La suite ágil creada para optimizar entregas y potenciar a equipos de productos modernos."
						tags={[
							{ text: "Sprints inteligentes", showDot: true },
							{ text: "Flujo continuo", showDot: false },
						]}
					/>
					<AuthFooter />
				</div>
			</AuthBackground>
			<section className="flex flex-col items-center justify-center flex-1 w-full h-full px-12 overflow-y-auto">
				<div className="flex flex-col items-center gap-6 w-full max-w-lg py-8">
					<header className="flex flex-col gap-1 text-center">
						<h2 className="text-3xl font-black">Bienvenido de nuevo</h2>
						<p className="text-sm text-worklyst-text-sub">
							Ingresa tus credenciales para acceder a tu espacio de trabajo.
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
							O INICIA SESIÓN CON TU CORREO
						</span>
						<div className="flex-1 h-px bg-worklyst-border" />
					</div>

					<SigninForm />
				</div>
			</section>
		</main>
	);
}
