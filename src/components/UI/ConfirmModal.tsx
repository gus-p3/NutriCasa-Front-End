import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  isDestructive = false
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className={`p-3 rounded-full ${isDestructive ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'}`}>
              <AlertTriangle size={24} />
            </div>
            <button 
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          
          <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-600 mb-6 leading-relaxed">
            {message}
          </p>
          
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors w-full sm:w-auto"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className={`px-4 py-2 rounded-xl text-white font-medium transition-colors w-full sm:w-auto ${
                isDestructive 
                  ? 'bg-red-600 hover:bg-red-700' 
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
