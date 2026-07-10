import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/store';
import { removeToast } from '../../app/slices/notificationSlice';
import { X, CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react';

export function ToastContainer() {
  const toasts = useAppSelector((state) => state.notifications.toasts);
  const dispatch = useAppDispatch();

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-md w-full">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={() => dispatch(removeToast(toast.id))} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onClose }: { toast: any; onClose: () => void }) {
  // Auto close after 4 seconds
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const icons = {
    success: <CheckCircle className="h-5 w-5 text-accent-success" />,
    error: <XCircle className="h-5 w-5 text-accent-danger" />,
    warning: <AlertCircle className="h-5 w-5 text-accent-warning" />,
    info: <Info className="h-5 w-5 text-accent-secondary" />,
  };

  const borders = {
    success: 'border-accent-success/20 bg-bg-surface/90 shadow-accent-success/5',
    error: 'border-accent-danger/20 bg-bg-surface/90 shadow-accent-danger/5',
    warning: 'border-accent-warning/20 bg-bg-surface/90 shadow-accent-warning/5',
    info: 'border-accent-secondary/20 bg-bg-surface/90 shadow-accent-secondary/5',
  };

  return (
    <div
      className={`flex items-start justify-between p-4 rounded-xl border backdrop-blur-md shadow-lg transition-all duration-300 transform translate-y-0 animate-slide-in ${borders[toast.type as keyof typeof borders]}`}
    >
      <div className="flex gap-3">
        <div className="flex-shrink-0 mt-0.5">{icons[toast.type as keyof typeof icons]}</div>
        <p className="text-sm font-medium text-text-primary">{toast.message}</p>
      </div>
      <button
        onClick={onClose}
        className="text-text-muted hover:text-text-primary transition-colors ml-4 focus:outline-none"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
