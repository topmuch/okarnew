/**
 * CleanCheck - Loading UI pour les pages dashboard
 */

export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="relative inline-block">
          <div className="w-16 h-16 border-4 border-emerald-200 rounded-full" />
          <div className="absolute inset-0 w-16 h-16 border-4 border-emerald-500 rounded-full border-t-transparent animate-spin" />
        </div>
        <p className="text-gray-500 mt-4">Chargement...</p>
      </div>
    </div>
  )
}
