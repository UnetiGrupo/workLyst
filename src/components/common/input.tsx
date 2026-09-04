import type { InputHTMLAttributes, ReactNode } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
	label: string;
	error?: string;
	icon?: ReactNode;
};

export function Input({
	label,
	error,
	id,
	icon,
	className = "",
	...props
}: InputProps) {
	const inputId = id || label.toLowerCase().replace(/\s+/g, "-");

	return (
		<div className="flex flex-col gap-1.5">
			<label
				htmlFor={inputId}
				className="text-xs font-semibold text-worklyst-text uppercase tracking-wide"
			>
				{label}
			</label>
			<div className="relative">
				<input
					id={inputId}
					className={`w-full px-3 py-2.5 rounded-lg border border-worklyst-border bg-white text-worklyst-text placeholder:text-worklyst-text-sub focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all ${
						icon ? "pr-10" : ""
					} ${error ? "border-red-500 focus:ring-red-500" : ""} ${className}`}
					{...props}
				/>
				{icon && (
					<span className="absolute right-3 top-1/2 -translate-y-1/2 text-worklyst-text-sub">
						{icon}
					</span>
				)}
			</div>
			{error && <span className="text-xs text-red-500">{error}</span>}
		</div>
	);
}
