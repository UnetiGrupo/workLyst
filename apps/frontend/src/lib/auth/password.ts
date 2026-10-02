/**
 * RF-02: reglas de contraseña y nivel de seguridad (solo cliente, solo registro).
 * Funciones puras: sin IO y sin React.
 */

/** Conjunto exacto de caracteres especiales aceptados por la spec. */
const SPECIAL_CHARACTERS = "!@#$%^&*";

/** Nivel de seguridad de la contraseña, de 0 (vacía) a 3 (fuerte). */
export type PasswordLevel = 0 | 1 | 2 | 3;

/** Resultado de evaluar las 4 reglas y el nivel de seguridad. */
export interface PasswordRulesResult {
	minLength: boolean;
	upperAndLower: boolean;
	number: boolean;
	special: boolean;
	level: PasswordLevel;
}

/**
 * Evalúa las 4 reglas de contraseña y calcula el nivel de seguridad.
 * `passed` es el número de reglas booleanas cumplidas.
 */
export function validatePasswordRules(password: string): PasswordRulesResult {
	const minLength = password.length >= 8;
	// Se exige al menos una mayúscula y una minúscula.
	const upperAndLower = /[A-Z]/.test(password) && /[a-z]/.test(password);
	const number = /[0-9]/.test(password);
	// `special` solo acepta el conjunto exacto, no otros símbolos.
	const special = [...password].some((character) =>
		SPECIAL_CHARACTERS.includes(character),
	);

	const passed = [minLength, upperAndLower, number, special].filter(
		Boolean,
	).length;

	let level: PasswordLevel;
	if (password.length === 0) {
		level = 0;
	} else if (passed <= 1) {
		level = 1;
	} else if (passed === 2) {
		level = 2;
	} else {
		level = 3;
	}

	return { minLength, upperAndLower, number, special, level };
}
