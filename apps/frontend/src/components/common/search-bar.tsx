import { Search } from "lucide-react";

interface SearchBarProps {
	searchQuery: string;
	setSearchQuery: (query: string) => void;
	placeholder?: string;
	className?: string;
}

export function SearchBar({
	searchQuery,
	setSearchQuery,
	placeholder,
	className,
}: SearchBarProps) {
	return (
		<div className="relative w-full">
			<Search
				className="absolute left-3.5 top-1/2 -translate-y-1/2 text-worklyst-text-sub"
				size={18}
			/>
			<input
				type="text"
				value={searchQuery}
				onChange={(e) => setSearchQuery(e.target.value)}
				placeholder={placeholder}
				className={`w-full bg-worklyst-surface border border-worklyst-border rounded-lg pl-10 pr-4 py-3 text-sm text-worklyst-text placeholder:text-worklyst-text-sub placeholder:font-mono focus:outline-none focus:border-primary-500 shadow-sm transition-colors ${className || ""}`}
			/>
		</div>
	);
}
