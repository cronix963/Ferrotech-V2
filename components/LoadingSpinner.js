export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-200 border-t-primary" />
      <span className="ml-3 text-gray-500">Cargando...</span>
    </div>
  );
}
