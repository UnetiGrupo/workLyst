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
          className="text-blue-500 hover:underline"
        >
          {item.label} {index < items.length - 1 && <ChevronRight />}
        </Link>
      ))}
    </nav>
  );
}
