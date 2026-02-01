interface FormInputProps {
  label: string;
  name: string;
  type: string;
  placeholder: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function FormInput({
  label,
  name,
  type,
  placeholder,
  onChange,
}: FormInputProps) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-sm 2xl:text-base">{label}</span>
      <input
        className="py-2 2xl:py-2.5 px-4 border border-gray-200 bg-gray-100 rounded-lg
        text-sm 2xl:text-base placeholder:text-gray-700 focus:outline-none focus:ring-blue-500 focus:ring-2 transition-all"
        type={type}
        placeholder={placeholder}
        name={name}
        onChange={onChange}
      />
    </label>
  );
}
