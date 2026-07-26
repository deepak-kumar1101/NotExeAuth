import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastProps {
  id: string;
  type?: 'success' | 'error' | 'info';
  title: string;
  message?: string;
  onClose: (id: string) => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({
  id,
  type = 'info',
  title,
  message,
  onClose,
  duration = 4000
}) => {
  useEffect(() => {
    const timer = setTimeout(() => onClose(id), duration);
    return () => clearTimeout(timer);
  }, [id, onClose, duration]);

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />,
    info: <Info className="w-5 h-5 text-indigo-400 shrink-0" />
  };

  const borders = {
    success: 'border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.15)]',
    error: 'border-rose-500/30 shadow-[0_0_20px_rgba(244,63,94,0.15)]',
    info: 'border-indigo-500/30 shadow-[0_0_20px_rgba(99,102,241,0.15)]'
  };

  return (
    <div className={`flex items-start gap-3 p-4 rounded-2xl bg-slate-900/90 backdrop-blur-2xl border ${borders[type]} text-white min-w-[300px] max-w-md animate-slide-up shadow-2xl glass-reflection`}>
      {icons[type]}
      <div className="flex-1 space-y-1 pr-2">
        <h4 className="text-sm font-bold tracking-tight">{title}</h4>
        {message && <p className="text-xs text-slate-300 leading-relaxed">{message}</p>}
      </div>
      <button
        onClick={() => onClose(id)}
        className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export const ToastContainer: React.FC<{ toasts: ToastProps[]; onClose: (id: string) => void }> = ({ toasts, onClose }) => {
  return (
    <div className="fixed bottom-6 right-6 z-[99999] flex flex-col gap-3 pointer-events-auto">
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} onClose={onClose} />
      ))}
    </div>
  );
};
