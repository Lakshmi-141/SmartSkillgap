import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

const ErrorMessage = ({ message = 'An unexpected error occurred.', onRetry }) => {
  return (
    <div className="p-6 rounded-2xl bg-rose-950/40 border border-rose-500/30 text-rose-200 flex flex-col items-center text-center max-w-lg mx-auto my-8">
      <div className="p-3 bg-rose-500/10 rounded-xl mb-3 text-rose-400">
        <AlertCircle className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-bold text-white mb-1">Operation Failed</h3>
      <p className="text-xs text-rose-300 mb-4 leading-relaxed">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-900/30 transition-all flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Retry Request
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
