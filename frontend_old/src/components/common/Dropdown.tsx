import { LucideIcon } from "lucide-react";
import { useEffect, useRef } from "react";

export interface DropdownItem {
  label: string;
  icon: LucideIcon;
  onClick?: () => void;
  variant?: "default" | "danger";
}

interface DropdownProps {
  isOpen: boolean;
  onClose: () => void;
  items: DropdownItem[];
}

export function Dropdown({ isOpen, onClose, items }: DropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 top-12 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in zoom-in duration-200"
    >
      <div className="flex flex-col">
        {items.map((item, index) => (
          <button
            key={index}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              item.onClick?.();
              onClose();
            }}
            className={`flex items-center gap-3 px-4 py-2 text-sm transition-colors duration-200 ${
              item.variant === "danger"
                ? "text-red-500 hover:bg-red-100"
                : "text-gray-700 hover:bg-gray-200"
            }`}
          >
            <item.icon className="size-4" />
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}
