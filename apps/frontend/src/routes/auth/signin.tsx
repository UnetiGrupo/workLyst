import { createFileRoute, Navigate } from "@tanstack/react-router";
import { AuthBackground } from "#/components/auth/auth-background";
import { AuthFooter } from "#/components/auth/auth-footer";
import { AuthHeader } from "#/components/auth/auth-header";
import { AuthHero } from "#/components/auth/auth-hero";
import { SigninForm } from "#/components/auth/signin-form";
import { useAuthStore } from "#/stores/auth-store";

export const Route = createFileRoute("/auth/signin")({
	component: RouteComponent,
});

function RouteComponent() {
	const isAuthenticated = useAuthStore(
		(state) => state.status === "authenticated",
	);

	if (isAuthenticated) {
		return <Navigate to="/" />;
	}

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
			<section className="flex flex-col items-center justify-center flex-1 w-full h-full px-4 md:px-8 2xl:px-12 overflow-y-auto">
				<div className="flex flex-col items-center gap-5 md:gap-4 2xl:gap-6 w-full max-w-lg py-6 md:py-3 2xl:py-8">
					<header className="flex flex-col items-center gap-3 md:gap-2 2xl:gap-3 text-center">
						<img
							src="/images/logo.svg"
							alt="Logo de Worklyst"
							className="xl:hidden w-10 h-10"
						/>
						<div className="flex flex-col gap-1">
							<h2 className="text-xl md:text-2xl 2xl:text-3xl font-black">
								Bienvenido de nuevo
							</h2>
							<p className="text-xs md:text-sm 2xl:text-base text-worklyst-text-sub">
								Ingresa tus credenciales para acceder a tu espacio de trabajo.
							</p>
						</div>
					</header>

					<SigninForm />
				</div>
			</section>
		</main>
	);
}
