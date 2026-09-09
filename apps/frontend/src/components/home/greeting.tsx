interface GreetingProps {
  userName: string;
  criticalTasksCount: number;
}

export function Greeting({ userName, criticalTasksCount }: GreetingProps) {
  return (
    <section className="my-2 space-y-1">
      <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-worklyst-text">
        ¡Hola {userName} <span>Bienvenido</span>!
      </h2>
      <p className="font-mono text-sm text-worklyst-text-sub">
        Tienes {criticalTasksCount} tareas críticas para hoy
      </p>
    </section>
  );
}
