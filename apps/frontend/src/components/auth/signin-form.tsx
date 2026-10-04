import { useForm } from "@tanstack/react-form";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { useState } from "react";
import { Button } from "#/components/common/button";
import { GitHub, Google } from "#/components/common/icons";
import { Input } from "#/components/common/input";
import { AuthError } from "#/lib/auth/types";
import { useAuthStore } from "#/stores/auth-store";

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

const SOCIAL_BUTTONS = [
	{ icon: Google, text: "Google" },
	{ icon: GitHub, text: "GitHub" },
] as const;

const LOGIN_ERROR_MESSAGE =
	"Correo o contraseña incorrectos. Verifica tus datos e inténtalo de nuevo.";

// El rate limit y los fallos de red/desconocidos muestran el mensaje del backend;
// credenciales y API Key comparten el mensaje genérico (no se filtra detalle).
function toLoginErrorMessage(error: unknown): string {
	if (
		error instanceof AuthError &&
		(error.code === "rate_limited" ||
			error.code === "network" ||
			error.code === "unknown")
	) {
		return error.message;
	}
	return LOGIN_ERROR_MESSAGE;
}

export function SigninForm() {
	const [showPassword, setShowPassword] = useState(false);
	const [bannerError, setBannerError] = useState<string | null>(null);

	const form = useForm({
		defaultValues: {
			email: "",
			password: "",
		},
		onSubmit: async ({ value }) => {
			setBannerError(null);
			try {
				await useAuthStore.getState().login(value);
			} catch (error) {
				setBannerError(toLoginErrorMessage(error));
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
					O INICIA SESIÓN CON TU CORREO
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
								type={
									field.name === "password" && showPassword
										? "text"
										: field.type
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
					<label className="flex items-center gap-2.5 cursor-pointer group">
						<div className="relative">
							<input type="checkbox" className="peer sr-only" />
							<div className="h-5 w-9 rounded-full bg-worklyst-border/50 transition-colors duration-200 peer-checked:bg-primary-500 peer-focus-visible:ring-2 peer-focus-visible:ring-primary-500/40 peer-focus-visible:ring-offset-2" />
							<div className="absolute left-0.5 top-0.5 size-4 rounded-full bg-white shadow-sm transition-all duration-200 peer-checked:translate-x-4 peer-checked:bg-white" />
						</div>
						<span className="text-sm text-worklyst-text-sub transition-colors duration-200 group-hover:text-worklyst-text">
							Recuérdame
						</span>
					</label>
					<span className="text-sm text-primary-500 font-medium">
						¿Olvidaste tu contraseña?
					</span>
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
