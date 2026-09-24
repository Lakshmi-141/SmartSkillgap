import React from 'react';

const SkillProgressBar = ({ level = 0, maxLevel = 4, showLabel = true, label = '' }) => {
  const percentage = Math.min(100, Math.max(0, (level / maxLevel) * 100));

  const getGradient = (lvl) => {
    if (lvl === 4) return 'from-amber-500 to-yellow-400 shadow-amber-500/30';
    if (lvl === 3) return 'from-purple-600 to-indigo-400 shadow-purple-500/30';
    if (lvl === 2) return 'from-emerald-500 to-teal-400 shadow-emerald-500/30';
    if (lvl === 1) return 'from-blue-600 to-cyan-400 shadow-blue-500/30';
    return 'from-slate-600 to-slate-700';
  };

  return (
    <div className="w-full space-y-1.5">
      {showLabel && (
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-300 font-medium">{label || `Level ${level} / ${maxLevel}`}</span>
          <span className="font-bold text-slate-400">{Math.round(percentage)}%</span>
        </div>
      )}
      <div className="w-full h-2.5 rounded-full bg-slate-900 border border-slate-800 overflow-hidden p-0.5">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${getGradient(level)} transition-all duration-500 ease-out shadow-sm`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default SkillProgressBar;
