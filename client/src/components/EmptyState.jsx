import React from 'react';
import { Inbox, ArrowRight } from 'lucide-react';

const EmptyState = ({ title = 'No Data Available', message = 'There are no items to display right now.', actionText, onAction }) => {
  return (
    <div className="py-16 px-6 glass-panel rounded-3xl border border-slate-800 flex flex-col items-center text-center max-w-md mx-auto my-8">
      <div className="w-16 h-16 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-4">
        <Inbox className="w-8 h-8" />
      </div>
      <h3 className="text-xl font-bold text-white mb-1.5">{title}</h3>
      <p className="text-xs text-slate-400 mb-6 leading-relaxed">{message}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="px-5 py-2.5 rounded-xl bg-gradient-primary text-white font-bold text-xs shadow-lg shadow-blue-600/30 hover:opacity-95 transition-all flex items-center gap-1.5"
        >
          {actionText} <ArrowRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default EmptyState;
