// Identidad visible pura de los miembros: iniciales y color determinista.

// Paleta de avatares existente en el proyecto (home/current-projects.tsx).
const AVATAR_COLORS = [
	"bg-primary-500",
	"bg-emerald-500",
	"bg-amber-500",
	"bg-rose-500",
] as const;

/** Iniciales de las dos primeras palabras del nombre, en mayúsculas. */
export function avatarInitials(name: string): string {
	const words = name.trim().split(/\s+/).filter(Boolean);
	if (words.length === 0) {
		return "";
	}

	const first = words[0].charAt(0).toUpperCase();
	const second = words[1]?.charAt(0).toUpperCase() ?? "";
	return `${first}${second}`;
}

/** Clase de color determinista del nombre, dentro de la paleta existente. */
export function avatarColor(name: string): string {
	let hash = 0;
	for (const character of name) {
		hash += character.charCodeAt(0);
	}
	return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}
