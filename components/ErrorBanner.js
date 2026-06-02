export default function ErrorBanner({ message = 'Error al cargar datos', onRetry }) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="text-danger text-lg">⚠</span>
        <p className="text-red-700">{message}</p>
      </div>
      {onRetry && (
        <button onClick={onRetry} className="px-3 py-1.5 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm">
          Reintentar
        </button>
      )}
    </div>
  );
}
