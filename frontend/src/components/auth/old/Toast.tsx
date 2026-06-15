import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  text: string;
  type: 'success' | 'error' | 'info';
}

interface ToastProps {
  toast: ToastMessage | null;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        onClose();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast, onClose]);

  return (
    <AnimatePresence>
      {toast && (
        <div id="toast-container" className="fixed top-5 right-5 z-50 pointer-events-none flex flex-col items-end gap-2 max-w-sm w-full px-4 sm:px-0">
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`
              pointer-events-auto flex w-full items-start gap-3 rounded-lg border p-4 shadow-lg backdrop-blur-md
              ${toast.type === 'success' 
                ? 'border-emerald-100 bg-emerald-50/95 text-emerald-800' 
                : toast.type === 'error'
                ? 'border-red-100 bg-red-50/95 text-red-800'
                : 'border-blue-100 bg-blue-50/95 text-blue-800'
              }
            `}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 id="toast-success-icon" className="w-5 h-5 shrink-0 text-emerald-600 mt-0.5" />
            ) : (
              <AlertCircle id="toast-error-icon" className="w-5 h-5 shrink-0 text-red-600 mt-0.5" />
            )}
            
            <div className="flex-1 text-sm font-medium">
              {toast.text}
            </div>

            <button
              onClick={onClose}
              className="shrink-0 text-slate-400 hover:text-slate-600 transition-colors rounded-sm focus:outline-hidden"
            >
              <X id="toast-close-btn" className="w-4 h-4" />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
