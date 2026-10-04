import { validatePasswordRules } from "#/lib/auth/password";
import type { Credentials, RegisterData } from "#/lib/auth/types";

/** El mínimo visible del correo es que contenga una arroba. */
function emailLooksValid(email: string): boolean {
	return email.trim().includes("@");
}

/** Registro listo: campos llenos (con recorte), correo con `@` y las 4 reglas. */
export function canSubmitRegister(data: RegisterData): boolean {
	if (!data.fullName.trim() || !data.email.trim() || !data.password) {
		return false;
	}
	if (!emailLooksValid(data.email)) {
		return false;
	}

	const rules = validatePasswordRules(data.password);
	return (
		rules.minLength && rules.upperAndLower && rules.number && rules.special
	);
}

/** Login listo: campos llenos, correo con `@` y contraseña no vacía (sin reglas). */
export function canSubmitLogin(credentials: Credentials): boolean {
	if (!credentials.email.trim() || !credentials.password) {
		return false;
	}
	return emailLooksValid(credentials.email);
}
