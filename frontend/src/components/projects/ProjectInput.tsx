export interface ProjectInputProps {
  label?: string;
  name: string;
  placeholder?: string;
  defaultValue?: string;
  icon?: React.ComponentType<{ className?: string }>;
  required?: boolean;
  type?: string;
}

export function ProjectInput({
  label,
  name,
  placeholder,
  defaultValue,
  icon: Icon,
  required = false,
  type = "text",
}: ProjectInputProps) {
  const isDescription = name === "descripcion";
  const commonClasses =
    "w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300";

  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm 2xl:text-base font-medium">{label}</span>
      {isDescription ? (
        <textarea
          className={`${commonClasses} h-24 2xl:h-32 resize-none text-sm 2xl:text-base`}
          name={name}
          id={name}
          placeholder={placeholder}
          defaultValue={defaultValue}
        />
      ) : (
        <div className="relative">
          {Icon && (
            <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          )}
          <input
            className={`${commonClasses} ${Icon ? "pl-10" : ""} text-sm 2xl:text-base`}
            type="text"
            name={name}
            id={name}
            placeholder={placeholder}
            defaultValue={defaultValue}
            required={required}
          />
        </div>
      )}
    </label>
  );
}
