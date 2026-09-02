export function ProjectCardSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mt-4 2xl:mt-0">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="col-span-1 md:col-span-2 h-[280px] p-6 rounded-xl border border-gray-100 bg-white shadow-sm animate-pulse flex flex-col gap-4"
        >
          {/* Header */}
          <div className="flex justify-between items-center border-b border-gray-100 pb-2">
            <div className="h-6 w-1/2 bg-gray-200 rounded" />
            <div className="size-8 bg-gray-100 rounded-full" />
          </div>
          {/* Body */}
          <div className="flex flex-col gap-3 flex-1 border-b border-gray-100 pb-4">
            <div className="h-3 w-1/3 bg-gray-100 rounded" />
            <div className="space-y-2">
              <div className="h-3 w-full bg-gray-100 rounded" />
              <div className="h-3 w-5/6 bg-gray-100 rounded" />
            </div>
            <div className="h-6 w-24 bg-blue-50 rounded-full" />
          </div>
          {/* Footer */}
          <div className="flex justify-between items-center">
            <div className="flex -space-x-2">
              {[1, 2, 3].map((a) => (
                <div
                  key={a}
                  className="size-10 rounded-full bg-gray-200 border-2 border-white"
                />
              ))}
            </div>
            <div className="h-3 w-24 bg-gray-100 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
