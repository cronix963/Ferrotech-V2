export default function EmptyState({ message = 'No hay registros', onCreate }) {
  return (
    <div className="text-center py-12 text-gray-400">
      <p className="text-lg mb-2">{message}</p>
      {onCreate && (
        <button onClick={onCreate} className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-light">
          + Nuevo
        </button>
      )}
    </div>
  );
}
