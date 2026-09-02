import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/auth/login")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<main className="flex flex-col items-center justify-center gap-6 h-dvh max-w-md mx-auto w-full px-6">
			<header className="flex flex-col items-center gap-3">
				<img src="/images/logo.svg" alt="Logo de Worklyst" className="w-16" />
				<h1 className="text-2xl font-black">Bienvenido a Worklyst</h1>
			</header>
      <div className="flex flex-col gap-2">
				<button>
        Continuar con Google
      	</button>
      	<button> Continuar con GitHub</button>
			</div>
		</main>
	);
}
