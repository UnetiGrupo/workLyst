import { useForm } from "@tanstack/react-form";
import { ArrowRight, Check, Eye, EyeOff, Mail, User, X } from "lucide-react";
import { useState } from "react";
import { Button } from "#/components/common/button";
import { Input } from "#/components/common/input";

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

const PASSWORD_RULES = [
	{
		key: "minLength",
		label: "Mínimo 8 caracteres",
		test: (v: string) => v.length >= 8,
	},
	{
		key: "uppercase",
		label: "Mayúscula y minúscula",
		test: (v: string) => /[A-Z]/.test(v) && /[a-z]/.test(v),
	},
	{
		key: "number",
		label: "Al menos un número (0-9)",
		test: (v: string) => /\d/.test(v),
	},
	{
		key: "special",
		label: "Carácter especial (!@#$%^&*)",
		test: (v: string) => /[!@#$%^&*]/.test(v),
	},
] as const;

const SECURITY_LEVELS = [
	{ label: "SIN INGRESAR", color: "bg-worklyst-border" },
	{ label: "DEBIL", color: "bg-red-500" },
	{ label: "MEDIA", color: "bg-orange-500" },
	{ label: "FUERTE", color: "bg-emerald-500" },
] as const;

function getSecurityLevel(password: string): number {
	if (!password) return 0;
	const passedRules = PASSWORD_RULES.filter((rule) =>
		rule.test(password),
	).length;
	if (passedRules <= 1) return 1;
	if (passedRules <= 2) return 2;
	return 3;
}

export function SignupForm() {
	const [showPassword, setShowPassword] = useState(false);

	const form = useForm({
		defaultValues: {
			fullName: "",
			email: "",
			password: "",
		},
		onSubmit: async ({ value }) => {
			console.log("Form submitted:", value);
		},
	});

	return (
		<div className="flex flex-col gap-6 w-full max-w-lg">
			<form
				onSubmit={(e) => {
					e.preventDefault();
					e.stopPropagation();
					form.handleSubmit();
				}}
				className="flex flex-col gap-5"
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
								onChange={(e) => fieldApi.handleChange(e.target.value)}
								onBlur={() => fieldApi.handleBlur()}
								error={fieldApi.state.meta.errors[0]}
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
						const securityLevel = getSecurityLevel(fieldApi.state.value);
						const securityInfo = SECURITY_LEVELS[securityLevel];

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

								<div className="bg-worklyst-tiza-bg rounded-lg p-4">
									<div className="flex items-center justify-between mb-2">
										<span className="text-xs font-medium text-worklyst-text">
											Nivel de seguridad:
										</span>
										<span className="text-xs font-semibold text-worklyst-text-sub">
											{securityInfo.label}
										</span>
									</div>

									<div className="flex gap-1 mb-4">
										{SECURITY_LEVELS.map((level, index) => (
											<div
												key={level.label}
												className={`h-1 flex-1 rounded-full transition-colors ${
													index <= securityLevel
														? securityInfo.color
														: "bg-worklyst-border"
												}`}
											/>
										))}
									</div>

									<div className="grid grid-cols-2 gap-2">
										{PASSWORD_RULES.map((rule) => {
											const isValid = rule.test(fieldApi.state.value);
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
					selector={(state) => [state.canSubmit, state.isSubmitting]}
				>
					{([canSubmit, isSubmitting]) => (
						<Button
							type="submit"
							disabled={!canSubmit || isSubmitting}
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
