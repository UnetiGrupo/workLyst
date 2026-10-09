import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { WorkspaceKpis } from "#/components/projects/workspace-kpis";
import type { WorkspaceStats } from "#/lib/projects/types";

const STATS: WorkspaceStats = {
	total: 12,
	activos: 5,
	enRiesgo: 3,
	vencenPronto: 2,
	completados: 4,
};

afterEach(() => {
	cleanup();
});

describe("WorkspaceKpis", () => {
	it("renders the four KPIs with their values and fixed subtitles", () => {
		render(<WorkspaceKpis stats={STATS} />);

		expect(screen.getByText("Activos")).toBeTruthy();
		expect(screen.getByText("5")).toBeTruthy();
		expect(screen.getByText("de 12 proyectos totales")).toBeTruthy();

		expect(screen.getByText("En riesgo")).toBeTruthy();
		expect(screen.getByText("3")).toBeTruthy();
		expect(screen.getByText("requieren atención")).toBeTruthy();

		expect(screen.getByText("Vencen pronto")).toBeTruthy();
		expect(screen.getByText("2")).toBeTruthy();
		expect(screen.getByText("plazo de 7 días o menos")).toBeTruthy();

		expect(screen.getByText("Completados")).toBeTruthy();
		expect(screen.getByText("4")).toBeTruthy();
		expect(screen.getByText("entregados con éxito")).toBeTruthy();
	});

	it("lays the KPIs out in two columns on mobile and four on desktop", () => {
		render(<WorkspaceKpis stats={STATS} />);

		const section = screen.getByLabelText("Indicadores del espacio de trabajo");
		expect(section.className).toContain("grid-cols-2");
		expect(section.className).toContain("md:grid-cols-4");
	});

	it("shows pulsing skeletons while the stats are loading", () => {
		render(<WorkspaceKpis stats={null} />);

		const loading = screen.getByLabelText("Cargando indicadores");
		expect(loading.querySelectorAll(".animate-pulse")).toHaveLength(4);
		expect(screen.queryByText("Activos")).toBeNull();
		expect(screen.queryByText("de 12 proyectos totales")).toBeNull();
	});
});
