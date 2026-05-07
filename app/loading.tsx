export default function Loading() {
  return (
    <div className="container-custom py-6 space-y-8">
      {/* Banner skeleton */}
      <div className="skeleton rounded-2xl" style={{ height: "300px" }} />

      {/* Category skeleton */}
      <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="skeleton rounded-xl h-20" />
        ))}
      </div>

      {/* Products skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl overflow-hidden shadow-sm">
            <div className="skeleton aspect-square" />
            <div className="p-3 space-y-2">
              <div className="skeleton h-4 rounded w-3/4" />
              <div className="skeleton h-3 rounded w-full" />
              <div className="skeleton h-3 rounded w-2/3" />
              <div className="skeleton h-5 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
