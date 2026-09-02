import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/auth/register")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<main className="flex flex-col items-center justify-center h-dvh max-w-md px-6"></main>
	);
}
