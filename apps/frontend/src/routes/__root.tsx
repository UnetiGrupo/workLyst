import { TanStackDevtools } from "@tanstack/react-devtools";
import {
	createRootRoute,
	HeadContent,
	Scripts,
	useLocation,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { AnimatePresence, motion } from "motion/react";
import { BottomNav } from "#/components/layout/bottom-nav";
import { Header } from "#/components/layout/header";
import { Sidebar } from "#/components/layout/sidebar";
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
				title: "TanStack Start Starter",
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

function RootDocument({ children }: { children: React.ReactNode }) {
	const location = useLocation();
	const showLayout = !location.pathname.includes("/auth");

	return (
		<html lang="en">
			<head>
				<HeadContent />
			</head>
			<body className="flex h-dvh">
				{showLayout && <Sidebar />}
				<div className="flex flex-1 flex-col overflow-y-auto">
					{showLayout && <Header />}
					<AnimatePresence mode="wait">
						<motion.main
							key={location.pathname}
							initial={{ opacity: 0, y: 8 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -8 }}
							transition={{ duration: 0.2, ease: "easeOut" }}
							className="flex-1"
						>
							{children}
						</motion.main>
					</AnimatePresence>
				</div>
				{showLayout && <BottomNav />}
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
