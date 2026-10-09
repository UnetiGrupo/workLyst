import {
	RouterProvider,
	createMemoryHistory,
	createRootRoute,
	createRoute,
	createRouter,
} from "@tanstack/react-router";
import {
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
} from "@testing-library/react";
import { type ReactNode, useState } from "react";
import { afterEach, describe, expect, it } from "vitest";

import { Button } from "#/components/common/button";
import { SearchBar } from "#/components/common/search-bar";
import {
	Header,
	HeaderActionsProvider,
	HeaderSlot,
} from "#/components/layout/header";

function renderShell(ui: ReactNode) {
	const rootRoute = createRootRoute({ component: () => <>{ui}</> });
	const indexPath = createRoute({
		getParentRoute: () => rootRoute,
		path: "/",
		component: () => null,
	});
	const projectsPath = createRoute({
		getParentRoute: () => rootRoute,
		path: "/projects",
		component: () => null,
	});
	const routeTree = rootRoute.addChildren([indexPath, projectsPath]);
	const router = createRouter({
		routeTree,
		history: createMemoryHistory({ initialEntries: ["/"] }),
	});

	render(<RouterProvider router={router} />);
	return router;
}

function Actions() {
	return (
		<HeaderSlot>
			<SearchBar
				searchQuery=""
				setSearchQuery={() => {}}
				placeholder="Buscar proyectos..."
			/>
			<Button>Nuevo proyecto</Button>
		</HeaderSlot>
	);
}

afterEach(() => {
	cleanup();
});

describe("Header action slot", () => {
	it("shows no search or primary action without a registration", () => {
		renderShell(
			<HeaderActionsProvider>
				<Header />
			</HeaderActionsProvider>,
		);

		expect(screen.queryByPlaceholderText("Buscar proyectos...")).toBeNull();
		expect(screen.queryByText("Nuevo proyecto")).toBeNull();
	});

	it("renders the controls registered through HeaderSlot", async () => {
		renderShell(
			<HeaderActionsProvider>
				<Header />
				<Actions />
			</HeaderActionsProvider>,
		);

		expect(
			await screen.findByPlaceholderText("Buscar proyectos..."),
		).toBeTruthy();
		expect(screen.getByText("Nuevo proyecto")).toBeTruthy();
	});

	it("clears the controls when the HeaderSlot unmounts", async () => {
		function Harness() {
			const [visible, setVisible] = useState(true);
			return (
				<HeaderActionsProvider>
					<Header />
					{visible ? <Actions /> : null}
					<button type="button" onClick={() => setVisible(false)}>
						ocultar
					</button>
				</HeaderActionsProvider>
			);
		}

		renderShell(<Harness />);

		expect(
			await screen.findByPlaceholderText("Buscar proyectos..."),
		).toBeTruthy();

		fireEvent.click(screen.getByText("ocultar"));

		await waitFor(() => {
			expect(screen.queryByPlaceholderText("Buscar proyectos...")).toBeNull();
		});
		expect(screen.queryByText("Nuevo proyecto")).toBeNull();
	});
});
