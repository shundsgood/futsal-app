export default function Loading() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-6 bg-gray-200 rounded w-24" />
        <div className="h-8 bg-gray-200 rounded w-24" />
      </div>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 border-b border-gray-100 px-3 py-2.5 flex gap-8">
          {["活動", "結果", "スコア", "対戦相手", "得点者"].map((h) => (
            <div key={h} className="h-3 bg-gray-200 rounded w-10" />
          ))}
        </div>
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex gap-8 px-3 py-3 border-b border-gray-50 last:border-0">
            <div className="h-4 bg-gray-100 rounded w-24" />
            <div className="h-4 bg-gray-100 rounded w-8" />
            <div className="h-4 bg-gray-100 rounded w-12" />
            <div className="h-4 bg-gray-100 rounded w-20" />
            <div className="h-4 bg-gray-100 rounded w-28" />
          </div>
        ))}
      </div>
    </div>
  );
}
