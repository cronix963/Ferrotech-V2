import { useState, useEffect } from 'react';

export default function ConfirmModal({
  show,
  onClose,
  onConfirm,
  title = 'Confirmar',
  message = '¿Estás seguro?',
  details = '',
  confirmText = 'Eliminar',
  confirmLoadingText = 'Eliminando...',
  secondTitle = '¿Estás completamente seguro?',
  secondMessage = 'Esta acción eliminará permanentemente los datos. No se puede deshacer.',
  secondConfirmText = 'Sí, eliminar definitivamente',
  loading = false,
}) {
  const [step, setStep] = useState(1);

  useEffect(() => {
    if (show) setStep(1);
  }, [show]);

  if (!show) return null;

  const handleCancel = () => {
    setStep(1);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
        {step === 1 ? (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-danger">{title}</h2>
              <button
                onClick={handleCancel}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
              >
                &times;
              </button>
            </div>

            <div className="mb-6">
              <p className="text-gray-700 text-sm">{message}</p>
              {details && (
                <p className="text-gray-500 text-xs mt-3 bg-red-50 p-3 rounded-md border border-red-100">
                  {details}
                </p>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded text-sm"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-4 py-2 bg-danger text-white rounded hover:bg-red-700 text-sm font-medium"
              >
                Siguiente
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-danger">{secondTitle}</h2>
              <button
                onClick={handleCancel}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
              >
                &times;
              </button>
            </div>

            <div className="mb-6">
              <p className="text-gray-700 text-sm">{secondMessage}</p>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <button
                type="button"
                onClick={handleCancel}
                disabled={loading}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded text-sm disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={loading}
                className="px-4 py-2 bg-danger text-white rounded hover:bg-red-700 text-sm font-medium disabled:opacity-50 inline-flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    {confirmLoadingText}
                  </>
                ) : (
                  secondConfirmText
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
