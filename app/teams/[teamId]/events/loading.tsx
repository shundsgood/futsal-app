export default function Loading() {
  return (
    <div className="animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="h-6 bg-gray-200 rounded w-28" />
        <div className="h-8 bg-gray-200 rounded w-20" />
      </div>
      <ul className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <li key={i} className="bg-white rounded-xl border border-gray-200 px-4 py-4">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="h-5 bg-gray-200 rounded w-40" />
              <div className="h-5 bg-gray-200 rounded w-12" />
            </div>
            <div className="h-3 bg-gray-100 rounded w-48" />
          </li>
        ))}
      </ul>
    </div>
  );
}
