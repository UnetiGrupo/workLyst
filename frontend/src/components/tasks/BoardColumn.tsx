interface BoardColumnProps {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: React.ReactNode;
  value?: number;
  color?: string;
}

export function BoardColumn({
  title,
  icon: Icon,
  children,
  value = 0,
  color,
}: BoardColumnProps) {
  return (
    <section className="flex flex-col gap-8 max-w-full">
      <header className="flex items-center gap-4">
        <h2 className="flex items-center gap-2 text-base 2xl:text-lg">
          <Icon className={`${color} size-5`} /> {title}
        </h2>
        <span className="flex items-center justify-center text-sm text-gray-700 bg-gray-200 size-5 rounded-full">
          {value}
        </span>
      </header>
      {children}
    </section>
  );
}
