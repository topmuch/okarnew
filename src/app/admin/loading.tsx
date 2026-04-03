export default function AdminLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-gray-200 rounded-lg animate-pulse" />
          <div className="h-4 w-64 bg-gray-100 rounded animate-pulse" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-white rounded-xl border border-gray-100 shadow-sm animate-pulse" />
        ))}
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="h-80 bg-white rounded-xl border border-gray-100 shadow-sm animate-pulse" />
        <div className="h-80 bg-white rounded-xl border border-gray-100 shadow-sm animate-pulse" />
      </div>
      <div className="h-64 bg-white rounded-xl border border-gray-100 shadow-sm animate-pulse" />
    </div>
  )
}
