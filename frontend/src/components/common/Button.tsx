import Link from "next/link";

type ButtonStyle = "primary" | "secondary";
type ButtonType = "button" | "submit" | "reset";

interface ButtonProps {
  children: React.ReactNode;
  className?: string;
  href?: string; // Ahora es opcional
  onClick?: () => void; // Nueva prop para funciones
  style?: ButtonStyle;
  type?: ButtonType;
  disabled?: boolean;
  form?: string;
  isLoading?: boolean;
}

export function Button({
  children,
  className = "",
  href,
  onClick,
  style = "primary",
  type = "button",
  disabled = false,
  form,
}: ButtonProps) {
  // Clases base y estilos compartidos
  const baseStyles = `flex items-center justify-center gap-2 text-sm 2xl:text-base 
    px-4 2xl:px-6 py-3 rounded-lg font-medium hover:-translate-y-1 transition-all 
    duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${className}`;

  const styles = {
    primary:
      "bg-blue-500 shadow-lg shadow-blue-500/20 hover:bg-blue-600 hover:shadow-blue-500/50 text-white",
    secondary:
      "bg-gray-200 shadow-lg shadow-gray-500/20 hover:bg-gray-300 text-gray-700 hover:bg-gray-600 hover:shadow-gray-500/50 hover:text-white",
  };

  const combinedClassName = `${baseStyles} ${styles[style]}`;

  // Si hay un href, renderizamos el Link de Next.js
  if (href) {
    return (
      <Link href={href} className={combinedClassName}>
        {children}
      </Link>
    );
  }

  // Si no hay href, renderizamos un botón estándar
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={combinedClassName}
      form={form}
    >
      {children}
    </button>
  );
}
