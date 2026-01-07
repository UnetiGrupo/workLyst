export function FormInput({ label, name, type, placeholder, onChange }) {
  return (
    <label className="flex flex-col gap-1">
      <span>{label}</span>
      <input
        className="py-2.5 px-4 border border-gray-200 bg-gray-100 rounded-lg placeholder:text-gray-700 focus:outline-none focus:ring-blue-500 focus:ring-2 transition-all"
        type={type}
        placeholder={placeholder}
        name={name}
        onChange={onChange}
      />
    </label>
  );
}
