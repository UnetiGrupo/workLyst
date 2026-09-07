import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { Button } from "#/components/common/button";
import { Input } from "#/components/common/input";

const FORM_FIELDS = [
	{
		name: "email",
		label: "Correo Electrónico",
		type: "email",
		placeholder: "tu@email.com",
		icon: <Mail className="size-4" />,
	},
	{
		name: "password",
		label: "Contraseña",
		type: "password",
		placeholder: "••••••••",
		icon: <Lock className="size-4" />,
	},
] as const;

export function SigninForm() {
	const [showPassword, setShowPassword] = useState(false);

	const form = useForm({
		defaultValues: {
			email: "",
			password: "",
		},
		onSubmit: async ({ value }) => {
			console.log("Login submitted:", value);
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
								type={
									field.name === "password" && showPassword ? "text" : field.type
								}
								placeholder={field.placeholder}
								icon={
									field.name === "password" ? (
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
									) : (
										field.icon
									)
								}
								value={fieldApi.state.value}
								onChange={(e) => fieldApi.handleChange(e.target.value)}
								onBlur={() => fieldApi.handleBlur()}
								error={fieldApi.state.meta.errors[0]}
							/>
						)}
					</form.Field>
				))}

				<div className="flex items-center justify-between">
					<label className="flex items-center gap-2 cursor-pointer">
						<input
							type="checkbox"
							className="size-4 rounded border-worklyst-border text-primary-500 focus:ring-primary-500"
						/>
						<span className="text-sm text-worklyst-text-sub">
							Recuérdame
						</span>
					</label>
					<a
						forgot-password
						href="/auth/forgot-password"
						className="text-sm text-primary-500 hover:text-primary-600 font-medium"
					>
						¿Olvidaste tu contraseña?
					</a>
				</div>

				<form.Subscribe
					selector={(state) => [state.canSubmit, state.isSubmitting]}
				>
					{([canSubmit, isSubmitting]) => (
						<Button
							type="submit"
							disabled={!canSubmit || isSubmitting}
							className="w-full"
						>
							{isSubmitting ? "Iniciando sesión..." : "Iniciar sesión"}
						</Button>
					)}
				</form.Subscribe>
			</form>

			<p className="text-sm text-worklyst-text-sub text-center">
				¿No tienes una cuenta?{" "}
				<a
					href="/auth/signup"
					className="text-primary-500 hover:text-primary-600 font-medium"
				>
					Regístrate
				</a>
			</p>
		</div>
	);
}
