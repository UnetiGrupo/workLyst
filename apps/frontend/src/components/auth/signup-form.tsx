import { useForm } from "@tanstack/react-form";
import { ArrowRight, Check, Eye, EyeOff, Mail, User, X } from "lucide-react";
import { useState } from "react";
import { Button } from "#/components/common/button";
import { GitHub, Google } from "#/components/common/icons";
import { Input } from "#/components/common/input";
import { validatePasswordRules } from "#/lib/auth/password";
import { AuthError } from "#/lib/auth/types";
import { useAuthStore } from "#/stores/auth-store";

const FORM_FIELDS = [
	{
		name: "fullName",
		label: "Nombre Completo",
		type: "text",
		placeholder: "ej. Orlando Rivera",
		icon: <User className="size-4" />,
	},
	{
		name: "email",
		label: "Correo Electrónico de Trabajo",
		type: "email",
		placeholder: "ej. orlando@acme.io",
		icon: <Mail className="size-4" />,
	},
] as const;

const SOCIAL_BUTTONS = [
	{ icon: Google, text: "Google" },
	{ icon: GitHub, text: "GitHub" },
] as const;

const PASSWORD_RULES = [
	{ key: "minLength", label: "Mínimo 8 caracteres" },
	{ key: "upperAndLower", label: "Mayúscula y minúscula" },
	{ key: "number", label: "Al menos un número (0-9)" },
	{ key: "special", label: "Carácter especial (!@#$%^&*)" },
] as const;

const SECURITY_LEVELS = [
	{ label: "SIN INGRESAR", color: "bg-worklyst-border" },
	{ label: "DEBIL", color: "bg-red-500" },
	{ label: "MEDIA", color: "bg-orange-500" },
	{ label: "FUERTE", color: "bg-emerald-500" },
] as const;

const REGISTER_ERROR_MESSAGE =
	"No pudimos crear tu cuenta. Inténtalo de nuevo.";

function isPasswordStrong(password: string): boolean {
	const rules = validatePasswordRules(password);
	return (
		rules.minLength && rules.upperAndLower && rules.number && rules.special
	);
}

// El `missing_fields`, el rate limit y los fallos de red muestran el mensaje
// (en español) del adaptador; el resto usa un mensaje genérico.
function toRegisterErrorMessage(error: unknown): string {
	return error instanceof AuthError ? error.message : REGISTER_ERROR_MESSAGE;
}

export function SignupForm() {
	const [showPassword, setShowPassword] = useState(false);
	const [bannerError, setBannerError] = useState<string | null>(null);
	const [emailError, setEmailError] = useState<string | null>(null);

	const form = useForm({
		defaultValues: {
			fullName: "",
			email: "",
			password: "",
		},
		onSubmit: async ({ value }) => {
			setBannerError(null);
			setEmailError(null);
			if (!isPasswordStrong(value.password)) return;

			try {
				await useAuthStore.getState().register(value);
			} catch (error) {
				if (error instanceof AuthError && error.code === "duplicate_email") {
					setEmailError(error.message);
					return;
				}
				setBannerError(toRegisterErrorMessage(error));
			}
		},
	});

	return (
		<div className="flex flex-col gap-6 md:gap-4 2xl:gap-6 w-full max-w-lg">
			<div className="flex flex-col gap-2 w-full">
				<div className="flex gap-3 w-full">
					{SOCIAL_BUTTONS.map((btn) => (
						<Button
							key={btn.text}
							variant="brand"
							disabled
							title="Próximamente"
							className="flex-1 disabled:opacity-60 disabled:cursor-not-allowed"
						>
							<btn.icon className="size-4" />
							<span>{btn.text}</span>
						</Button>
					))}
				</div>
				<p className="text-xs text-worklyst-text-sub text-center">
					Próximamente
				</p>
			</div>

			<div className="flex items-center gap-4 w-full">
				<div className="flex-1 h-px bg-worklyst-border" />
				<span className="text-xs text-worklyst-text-sub font-mono font-medium whitespace-nowrap">
					O REGÍSTRATE CON TU CORREO
				</span>
				<div className="flex-1 h-px bg-worklyst-border" />
			</div>

			{bannerError && (
				<div
					role="alert"
					className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
				>
					{bannerError}
				</div>
			)}

			<form
				onSubmit={(e) => {
					e.preventDefault();
					e.stopPropagation();
					form.handleSubmit();
				}}
				className="flex flex-col gap-5 md:gap-3 2xl:gap-5"
			>
				{FORM_FIELDS.map((field) => (
					<form.Field
						key={field.name}
						name={field.name}
						validators={{
							onChange: ({ value }) => {
								if (!value) return "Este campo es requerido";
								return undefined;
							},
						}}
					>
						{(fieldApi) => (
							<Input
								label={field.label}
								type={field.type}
								placeholder={field.placeholder}
								icon={field.icon}
								value={fieldApi.state.value}
								onChange={(e) => {
									if (field.name === "email") setEmailError(null);
									fieldApi.handleChange(e.target.value);
								}}
								onBlur={() => fieldApi.handleBlur()}
								error={
									(field.name === "email" ? emailError : null) ??
									fieldApi.state.meta.errors[0]
								}
							/>
						)}
					</form.Field>
				))}

				<form.Field
					name="password"
					validators={{
						onChange: ({ value }) => {
							if (!value) return "Este campo es requerido";
							return undefined;
						},
					}}
				>
					{(fieldApi) => {
						const rules = validatePasswordRules(fieldApi.state.value);
						const securityInfo = SECURITY_LEVELS[rules.level];

						return (
							<div className="flex flex-col gap-3">
								<Input
									label="Contraseña Segura"
									type={showPassword ? "text" : "password"}
									placeholder="Crea una contraseña robusta"
									icon={
										<button
											type="button"
											onClick={() => setShowPassword(!showPassword)}
											className="text-worklyst-text-sub hover:text-worklyst-text transition-colors"
										>
											{showPassword ? (
												<EyeOff className="size-4" />
											) : (
												<Eye className="size-4" />
											)}
										</button>
									}
									value={fieldApi.state.value}
									onChange={(e) => fieldApi.handleChange(e.target.value)}
									onBlur={() => fieldApi.handleBlur()}
									error={fieldApi.state.meta.errors[0]}
								/>

								<div className="bg-worklyst-tiza-bg rounded-lg p-2 md:p-2 2xl:p-4">
									<div className="flex items-center justify-between mb-2">
										<span className="text-xs font-medium text-worklyst-text">
											Nivel de seguridad:
										</span>
										<span className="text-xs font-semibold text-worklyst-text-sub">
											{securityInfo.label}
										</span>
									</div>

									<div className="flex gap-1 mb-1 md:mb-1 2xl:mb-4">
										{SECURITY_LEVELS.map((level, index) => (
											<div
												key={level.label}
												className={`h-1 flex-1 rounded-full transition-colors ${
													index <= rules.level
														? securityInfo.color
														: "bg-worklyst-border"
												}`}
											/>
										))}
									</div>

									<p className="md:hidden text-xs text-worklyst-text-sub">
										Mín. 8 caracteres · A-z · 0-9 · !@#$
									</p>

									<div className="hidden md:grid grid-cols-2 gap-1.5 2xl:gap-2">
										{PASSWORD_RULES.map((rule) => {
											const isValid = rules[rule.key];
											return (
												<div key={rule.key} className="flex items-center gap-2">
													<div
														className={`size-4 rounded-full flex items-center justify-center ${
															isValid ? "bg-emerald-500" : "bg-worklyst-border"
														}`}
													>
														{isValid ? (
															<Check
																className="size-2.5 text-white"
																strokeWidth={3}
															/>
														) : (
															<X
																className="size-2.5 text-worklyst-text-sub"
																strokeWidth={3}
															/>
														)}
													</div>
													<span
														className={`text-xs ${
															isValid
																? "text-emerald-600"
																: "text-worklyst-text-sub"
														}`}
													>
														{rule.label}
													</span>
												</div>
											);
										})}
									</div>
								</div>
							</div>
						);
					}}
				</form.Field>

				<form.Subscribe
					selector={(state) =>
						[
							state.canSubmit,
							state.isSubmitting,
							state.values.password,
						] as const
					}
				>
					{([canSubmit, isSubmitting, password]) => (
						<Button
							type="submit"
							disabled={
								!canSubmit || isSubmitting || !isPasswordStrong(password)
							}
							className="w-full flex items-center justify-center gap-2"
						>
							{isSubmitting ? (
								"Creando cuenta..."
							) : (
								<>
									Crear cuenta de Worklyst
									<ArrowRight className="size-4" />
								</>
							)}
						</Button>
					)}
				</form.Subscribe>
			</form>

			<p className="text-sm text-worklyst-text-sub text-center">
				¿Ya tienes una cuenta?{" "}
				<a
					href="/auth/signin"
					className="text-primary-500 hover:text-primary-600 font-medium"
				>
					Inicia sesión
				</a>
			</p>
		</div>
	);
}
