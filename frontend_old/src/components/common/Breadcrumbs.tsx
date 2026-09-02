import { ChevronRight } from "lucide-react";
import Link from "next/link";

interface BreadcrumbsProps {
  items: {
    label: string;
    href: string;
  }[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-2">
      {items.map((item, index) => (
        <Link
          key={index}
          href={item.href}
          className={`flex items-center gap-0 md:gap-2 font-medium text-xs md:text-base 2xl:text-lg  hover:text-blue-500 transition-colors ${index === items.length - 1 ? "text-gray-700 font-semibold" : "text-gray-500"}`}
        >
          {item.label} {index < items.length - 1 && <ChevronRight />}
        </Link>
      ))}
    </nav>
  );
}
