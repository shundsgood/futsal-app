export default function Loading() {
  return (
    <div className="animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="h-6 bg-gray-200 rounded w-28" />
      </div>
      <ul className="space-y-2">
        {[...Array(6)].map((_, i) => (
          <li key={i} className="bg-white rounded-xl border border-gray-200 px-4 py-3.5 flex items-center gap-3 min-h-[56px]">
            <div className="w-10 h-10 rounded-full bg-gray-200 shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="h-4 bg-gray-200 rounded w-28 mb-1" />
              <div className="h-3 bg-gray-100 rounded w-20" />
            </div>
            <div className="h-5 bg-gray-100 rounded w-12" />
          </li>
        ))}
      </ul>
    </div>
  );
}
