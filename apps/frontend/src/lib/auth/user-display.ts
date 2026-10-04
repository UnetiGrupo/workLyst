import type { AuthUser } from "#/lib/auth/types";

/**
 * Nombre visible del miembro: usa `nombre` si lo trae la sesión; si falta o
 * está vacío, deriva la parte local del correo con la inicial en mayúscula;
 * sin sesión devuelve «Invitado».
 */
export function displayName(user: AuthUser | null): string {
	if (!user) {
		return "Invitado";
	}

	const nombre = user.nombre?.trim();
	if (nombre) {
		return nombre;
	}

	const localPart = user.email.split("@")[0]?.trim() ?? "";
	if (localPart === "") {
		return "Invitado";
	}

	return localPart.charAt(0).toUpperCase() + localPart.slice(1);
}

/**
 * Iniciales de las dos primeras palabras del nombre, en mayúsculas. Con una
 * sola palabra devuelve únicamente su inicial.
 */
export function displayInitials(name: string): string {
	const words = name.trim().split(/\s+/).filter(Boolean);
	if (words.length === 0) {
		return "";
	}

	const first = words[0].charAt(0).toUpperCase();
	const second = words[1]?.charAt(0).toUpperCase() ?? "";
	return `${first}${second}`;
}
