import {
	RouterProvider,
	createMemoryHistory,
	createRootRoute,
	createRoute,
	createRouter,
} from "@tanstack/react-router";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { Sidebar } from "#/components/layout/sidebar";
import { useAuthStore } from "#/stores/auth-store";

function renderSidebar() {
	const rootRoute = createRootRoute({ component: Sidebar });
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
	const groupsPath = createRoute({
		getParentRoute: () => rootRoute,
		path: "/groups",
		component: () => null,
	});
	const messagesPath = createRoute({
		getParentRoute: () => rootRoute,
		path: "/messages",
		component: () => null,
	});
	const settingsPath = createRoute({
		getParentRoute: () => rootRoute,
		path: "/settings",
		component: () => null,
	});
	const signinPath = createRoute({
		getParentRoute: () => rootRoute,
		path: "/auth/signin",
		component: () => null,
	});
	const routeTree = rootRoute.addChildren([
		indexPath,
		projectsPath,
		groupsPath,
		messagesPath,
		settingsPath,
		signinPath,
	]);
	const router = createRouter({
		routeTree,
		history: createMemoryHistory({ initialEntries: ["/"] }),
	});

	render(<RouterProvider router={router} />);
	return router;
}

beforeEach(() => {
	localStorage.clear();
	useAuthStore.setState({ token: null, user: null, status: "guest" });
});

afterEach(() => {
	cleanup();
});

describe("Sidebar identity", () => {
	it("shows the name, email and initials from the session", async () => {
		useAuthStore.setState({
			token: "token-1",
			user: { id: "1", email: "ada@worklyst.com", nombre: "Ada Lovelace" },
			status: "authenticated",
		});

		renderSidebar();

		expect(await screen.findByText("Ada Lovelace")).toBeTruthy();
		expect(screen.getByText("ada@worklyst.com")).toBeTruthy();
		expect(screen.getByText("AL")).toBeTruthy();
	});

	it("derives the visible name from the email when the name is missing", async () => {
		useAuthStore.setState({
			token: "token-1",
			user: { id: "1", email: "ada@worklyst.com" },
			status: "authenticated",
		});

		renderSidebar();

		expect(await screen.findByText("Ada")).toBeTruthy();
		expect(screen.getByText("ada@worklyst.com")).toBeTruthy();
		expect(screen.getByText("A")).toBeTruthy();
	});

	it("falls back to Guest without a session and hides the email line", async () => {
		renderSidebar();

		expect(await screen.findByText("Invitado")).toBeTruthy();
		expect(screen.queryByText(/@/)).toBeNull();
		expect(screen.getByText("I")).toBeTruthy();
	});
});
