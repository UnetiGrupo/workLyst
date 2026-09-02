export function ProjectStateSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-2 2xl:mt-0">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="h-24 w-full bg-gray-100 rounde-xl border border-gray-200 animate-pulse"
        >
          <div className="p-4 flex flex-col gap-2">
            <div className="h-4 w-20 bg-gray-200 rounded"></div>
            <div className="h-8 w-12 bg-gray-300 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  );
}
