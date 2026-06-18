export default function Loading() {
  return (
    <div className="space-y-5 animate-pulse">
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="h-6 bg-gray-200 rounded w-48 mb-3" />
        <div className="space-y-2">
          <div className="h-4 bg-gray-100 rounded w-64" />
          <div className="h-4 bg-gray-100 rounded w-32" />
        </div>
        <div className="mt-4 flex gap-4">
          <div className="h-4 bg-gray-100 rounded w-16" />
          <div className="h-4 bg-gray-100 rounded w-16" />
          <div className="h-4 bg-gray-100 rounded w-16" />
        </div>
      </div>
      <div>
        <div className="h-4 bg-gray-200 rounded w-20 mb-2" />
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-50">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3">
              <div className="w-8 h-8 rounded-full bg-gray-200" />
              <div className="flex-1 h-4 bg-gray-100 rounded w-24" />
              <div className="h-4 bg-gray-100 rounded w-10" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
