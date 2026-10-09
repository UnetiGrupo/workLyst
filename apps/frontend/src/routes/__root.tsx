import { TanStackDevtools } from "@tanstack/react-devtools";
import {
	createRootRoute,
	HeadContent,
	Scripts,
	useLocation,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { useEffect, useRef, useState } from "react";
import { BottomNav } from "#/components/layout/bottom-nav";
import { Header, HeaderActionsProvider } from "#/components/layout/header";
import { Sidebar } from "#/components/layout/sidebar";
import { useAuthStore } from "#/stores/auth-store";
import appCss from "../styles.css?url";

export const Route = createRootRoute({
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				title: "Worklyst",
			},
		],
		links: [
			{
				rel: "icon",
				type: "image/svg+xml",
				href: "/images/logo.svg",
			},
			{
				rel: "stylesheet",
				href: appCss,
			},
		],
	}),
	shellComponent: RootDocument,
});

function LoadingScreen() {
	return (
		<div className="flex h-dvh w-full items-center justify-center bg-worklyst-bg">
			<div className="size-8 animate-spin rounded-full border-2 border-worklyst-border border-t-primary-600" />
		</div>
	);
}

function RootDocument({ children }: { children: React.ReactNode }) {
	const location = useLocation();
	const restoreSession = useAuthStore((state) => state.restoreSession);
	const [isBooted, setIsBooted] = useState(false);
	const hasRestored = useRef(false);

	useEffect(() => {
		if (hasRestored.current) {
			return;
		}
		hasRestored.current = true;
		restoreSession().finally(() => setIsBooted(true));
	}, [restoreSession]);

	const showLayout = !location.pathname.includes("/auth");

	return (
		<html lang="es">
			<head>
				<HeadContent />
			</head>
			<body className="flex h-dvh">
				{isBooted ? (
					<HeaderActionsProvider>
						{showLayout && <Sidebar />}
						<div className="flex flex-1 flex-col overflow-y-auto">
							{showLayout && <Header />}
							<main className="flex-1">{children}</main>
						</div>
						{showLayout && <BottomNav />}
					</HeaderActionsProvider>
				) : (
					<LoadingScreen />
				)}
				<TanStackDevtools
					config={{
						position: "bottom-right",
					}}
					plugins={[
						{
							name: "Tanstack Router",
							render: <TanStackRouterDevtoolsPanel />,
						},
					]}
				/>
				<Scripts />
			</body>
		</html>
	);
}
