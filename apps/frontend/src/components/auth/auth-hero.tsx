import type { ReactNode } from "react";
import { Tag } from "#/components/common/tag";

type TagItem = {
	text: string;
	showDot?: boolean;
};

type AuthHeroProps = {
	title: ReactNode;
	description: string;
	tags?: TagItem[];
};

export function AuthHero({ title, description, tags = [] }: AuthHeroProps) {
	return (
		<div className="flex flex-col gap-4">
			<h1 className="text-6xl font-black">{title}</h1>
			<p className="text-gray-300 font-light max-w-xl">{description}</p>
			{tags.length > 0 && (
				<div className="flex items-center gap-3 mt-2">
					{tags.map((tag) => (
						<Tag key={tag.text} showDot={tag.showDot}>
							{tag.text}
						</Tag>
					))}
				</div>
			)}
		</div>
	);
}
