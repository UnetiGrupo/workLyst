import type { ReactNode } from "react";

type TagProps = {
	children: ReactNode;
	showDot?: boolean;
};

export function Tag({ children, showDot = false }: TagProps) {
	return (
		<span className="flex items-center gap-2 px-3 py-1 border border-primary-700 bg-primary-600/20 rounded-full text-xs font-medium">
			{showDot && <span className="size-1.5 rounded-full bg-emerald-400" />}
			{children}
		</span>
	);
}
