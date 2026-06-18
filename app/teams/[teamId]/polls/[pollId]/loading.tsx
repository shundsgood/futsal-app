export default function Loading() {
  return (
    <div className="space-y-5 animate-pulse">
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="h-6 bg-gray-200 rounded w-48" />
          <div className="h-5 bg-gray-200 rounded w-16" />
        </div>
        <div className="h-4 bg-gray-100 rounded w-32" />
      </div>
      <div>
        <div className="h-4 bg-gray-200 rounded w-20 mb-2" />
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 px-4 py-3">
              <div className="flex justify-between items-center">
                <div className="h-4 bg-gray-200 rounded w-32" />
                <div className="flex gap-2">
                  <div className="h-6 bg-gray-100 rounded w-10" />
                  <div className="h-6 bg-gray-100 rounded w-10" />
                  <div className="h-6 bg-gray-100 rounded w-10" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
