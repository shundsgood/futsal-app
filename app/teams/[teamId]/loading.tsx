export default function Loading() {
  return (
    <div className="space-y-4 animate-pulse">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-white rounded-xl border border-gray-200 px-5 py-4">
          <div className="h-3 bg-gray-200 rounded w-16 mb-2" />
          <div className="h-5 bg-gray-200 rounded w-32" />
        </div>
      ))}
    </div>
  );
}
