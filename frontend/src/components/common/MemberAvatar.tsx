type AvatarSize = "sm" | "md" | "lg" | "xl";

interface MemberAvatarProps {
  name: string | null | undefined;
  size?: AvatarSize;
  color?: string;
  rounded?: "full" | "lg";
  className?: string;
}

export function MemberAvatar({
  name,
  size = "md",
  color,
  rounded = "full",
  className,
}: MemberAvatarProps) {
  const getInitials = (fullName: string) => {
    if (!fullName) return "?";
    return fullName
      .split(" ")
      .map((n: string) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  // Paleta de colores suaves y profesionales para el fondo
  const backgrounds = [
    {
      name: "blue",
      gradient: "from-blue-400 to-blue-600",
    },
    {
      name: "emerald",
      gradient: "from-emerald-400 to-emerald-600",
    },
    {
      name: "violet",
      gradient: "from-violet-400 to-violet-600",
    },
    {
      name: "rose",
      gradient: "from-rose-400 to-rose-600",
    },
    {
      name: "amber",
      gradient: "from-amber-400 to-amber-600",
    },
  ];

  // Elegir color basado en el nombre para consistencia
  const colorIndex = name ? name.length % backgrounds.length : 0;

  // O elegir manualmente con props
  const selectedColor = backgrounds.find((bg) => bg.name === color);
  const bgGradient = selectedColor
    ? selectedColor.gradient
    : color && color.includes("from-")
      ? color
      : backgrounds[colorIndex].gradient;

  // Tamaños preestablecidos
  const sizes = {
    sm: {
      size: "size-8",
      fontSize: "text-sm",
    },
    md: {
      size: "size-10",
      fontSize: "text-base",
    },
    lg: {
      size: "size-12",
      fontSize: "text-lg",
    },
    xl: {
      size: "size-14",
      fontSize: "text-xl",
    },
  };

  const roundedClass = rounded === "full" ? "rounded-full" : "rounded-lg";

  return (
    <div
      title={name || ""}
      className={`${sizes[size].size} flex items-center justify-center ${roundedClass} border-2 border-white bg-linear-to-br ${bgGradient} shadow-sm hover:scale-110 hover:z-20 transition-all duration-300 cursor-pointershrink-0 ring-1 ring-gray-100/50 ${className}`}
    >
      <span
        className={`${sizes[size as AvatarSize].fontSize} text-white font-black tracking-tighter`}
      >
        {getInitials(name || "")}
      </span>
    </div>
  );
}
