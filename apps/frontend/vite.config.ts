import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";

import { tanstackStart } from "@tanstack/react-start/plugin/vite";

import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";

// Los plugins de la app (TanStack Start, nitro, devtools, tailwind) no aplican
// al runner de tests: levantan servidores Vite que impiden que Vitest cierre.
// Se excluyen cuando se ejecuta Vitest (`process.env.VITEST`).
const isTest = process.env.VITEST === "true";

const config = defineConfig({
	resolve: { tsconfigPaths: true },
	plugins: isTest
		? []
		: [
				devtools(),
				nitro({ rollupConfig: { external: [/^@sentry\//] } }),
				tailwindcss(),
				tanstackStart(),
				viteReact(),
			],
	test: {
		environment: "jsdom",
		globals: true,
		include: ["tests/**/*.test.{ts,tsx}"],
	},
});

export default config;
