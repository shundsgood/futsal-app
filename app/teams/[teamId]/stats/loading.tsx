export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center gap-3">
          <div className="text-center min-w-[52px]">
            <div className="h-8 bg-gray-200 rounded w-10 mx-auto mb-1" />
            <div className="h-3 bg-gray-100 rounded w-8 mx-auto" />
          </div>
          <div className="flex-1 grid grid-cols-3 gap-1 text-center">
            {[...Array(3)].map((_, i) => (
              <div key={i}>
                <div className="h-6 bg-gray-200 rounded w-8 mx-auto mb-1" />
                <div className="h-3 bg-gray-100 rounded w-4 mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </div>
      {[...Array(2)].map((_, i) => (
        <div key={i}>
          <div className="h-4 bg-gray-200 rounded w-32 mb-2" />
          <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-50">
            {[...Array(4)].map((_, j) => (
              <div key={j} className="flex items-center gap-3 px-4 py-3">
                <div className="w-5 h-5 bg-gray-200 rounded" />
                <div className="w-7 h-7 rounded-full bg-gray-200" />
                <div className="flex-1 h-4 bg-gray-100 rounded" />
                <div className="h-4 bg-gray-100 rounded w-8" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
