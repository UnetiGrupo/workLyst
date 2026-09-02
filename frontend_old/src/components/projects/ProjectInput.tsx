export interface ProjectInputProps {
  label?: string;
  name: string;
  placeholder?: string;
  defaultValue?: string;
  icon?: React.ComponentType<{ className?: string }>;
  required?: boolean;
  type?: "text" | "textarea" | "select";
  options?: { label: string; value: string }[];
}

export function ProjectInput({
  label,
  name,
  placeholder,
  defaultValue,
  icon: Icon,
  required = false,
  type = "text",
  options = [],
}: ProjectInputProps) {
  const isDescription = name === "descripcion" || type === "textarea";
  const isSelect = type === "select";
  const commonClasses =
    "w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 bg-white";

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
      ) : isSelect ? (
        <div className="relative">
          <select
            className={`${commonClasses} appearance-none text-sm 2xl:text-base`}
            name={name}
            id={name}
            defaultValue={defaultValue}
            required={required}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg
              className="w-4 h-4 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </div>
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
