const pulse = "animate-pulse bg-gray-200";

export const StatCardSkeleton = () => (
  <div className="bg-white rounded-xl shadow-xl p-6 flex items-center space-x-4" aria-hidden="true">
    <div className={`h-12 w-12 rounded-lg ${pulse}`} />
    <div className="space-y-2 flex-1">
      <div className={`h-3 w-24 rounded ${pulse}`} />
      <div className={`h-6 w-16 rounded ${pulse}`} />
    </div>
  </div>
);

export const ChartSkeleton = ({ height = 300 }: { height?: number }) => (
  <div className="space-y-4" aria-hidden="true">
    <div className={`h-4 w-40 mx-auto rounded ${pulse}`} />
    <div className="rounded-lg animate-pulse bg-gray-100" style={{ height: height - 32 }} />
  </div>
);

export const UpdatesSkeleton = () => (
  <div className="space-y-4" aria-hidden="true">
    {[0, 1, 2, 3, 4].map((i) => (
      <div key={i} className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0">
        <div className="space-y-2">
          <div className={`h-3.5 w-36 rounded ${pulse}`} />
          <div className={`h-3 w-20 rounded ${pulse}`} />
        </div>
        <div className={`h-3 w-14 rounded ${pulse}`} />
      </div>
    ))}
  </div>
);
