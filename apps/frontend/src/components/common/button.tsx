import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

type ButtonProps = {
	children: ReactNode;
	variant?: "primary" | "brand";
	href?: string;
	onClick?: () => void;
	type?: "button" | "submit" | "reset";
	disabled?: boolean;
	className?: string;
};

const BASE_CLASSES =
	"inline-flex items-center justify-center gap-2 px-6 py-2 rounded-lg font-medium hover:-translate-y-1 active:scale-95 transition-all duration-300 cursor-pointer";

const VARIANT_CLASSES = {
	primary: "bg-primary-500 text-white hover:bg-primary-600",
	brand: "border border-worklyst-border bg-white hover:-translate-y-0.5",
} as const;

export function Button({
	children,
	variant = "primary",
	href,
	onClick,
	type = "button",
	disabled = false,
	className = "",
}: ButtonProps) {
	const classes = `${BASE_CLASSES} ${VARIANT_CLASSES[variant]} ${className}`;

	if (href) {
		return (
			<Link to={href} className={classes}>
				{children}
			</Link>
		);
	}

	return (
		<button
			type={type}
			onClick={onClick}
			disabled={disabled}
			className={classes}
		>
			{children}
		</button>
	);
}
