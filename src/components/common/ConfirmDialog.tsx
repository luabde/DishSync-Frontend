import type { ReactNode } from 'react';

type ConfirmDialogProps = {
  title: string;
  description: string;
  isOpen: boolean;
  isLoading?: boolean;
  errorMessage?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  children?: ReactNode;
};

export function ConfirmDialog({
  title,
  description,
  isOpen,
  isLoading = false,
  errorMessage,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  onConfirm,
  onCancel,
  children,
}: ConfirmDialogProps) {
  // Evita montar el modal cuando no toca y simplifica el árbol del DOM.
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-ds-lg bg-ds-bg-elevated p-6 shadow-ds-table">
        <h3 className="font-ds-display text-2xl font-bold text-ds-brand-wine">{title}</h3>
        <p className="mt-3 font-ds-sans text-sm text-ds-wine-70">{description}</p>
        {errorMessage ? (
          // Permite mostrar mensajes del backend con saltos de línea.
          <p className="mt-3 whitespace-pre-line font-ds-sans text-xs text-red-500">{errorMessage}</p>
        ) : null}
        {/* Slot opcional para acciones extra (ej: "Desactivar restaurante"). */}
        {children ? <div className="mt-4">{children}</div> : null}
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => {
              if (isLoading) return;
              onCancel();
            }}
            className="rounded-ds-sm border border-ds-pagination-border px-4 py-2 font-ds-sans text-xs font-semibold text-ds-brand-wine"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`rounded-ds-sm px-4 py-2 font-ds-sans text-xs font-semibold text-white ${isLoading ? 'bg-red-300 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600'}`}
          >
            {isLoading ? 'Procesando...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
