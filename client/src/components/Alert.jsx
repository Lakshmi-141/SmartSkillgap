import React from 'react';
import { AlertCircle, CheckCircle2, Info, XCircle } from 'lucide-react';

const Alert = ({ type = 'info', message, onClose, className = '' }) => {
  if (!message) return null;

  const styles = {
    info: 'bg-blue-950/60 border-blue-500/40 text-blue-200 icon-blue-400',
    success: 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200 icon-emerald-400',
    warning: 'bg-amber-950/60 border-amber-500/40 text-amber-200 icon-amber-400',
    error: 'bg-rose-950/60 border-rose-500/40 text-rose-200 icon-rose-400'
  };

  const icons = {
    info: <Info className="w-5 h-5 text-blue-400 flex-shrink-0" />,
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />,
    warning: <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0" />,
    error: <XCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
  };

  return (
    <div className={`p-4 rounded-xl border backdrop-blur-md flex items-start gap-3 text-sm ${styles[type]} ${className}`}>
      {icons[type]}
      <div className="flex-1 font-medium">{message}</div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white transition-colors"
          aria-label="Close alert"
        >
          &times;
        </button>
      )}
    </div>
  );
};

export default Alert;
