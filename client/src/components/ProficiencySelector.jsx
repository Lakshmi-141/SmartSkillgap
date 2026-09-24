import React from 'react';

const PROFICIENCY_LEVELS = [
  { level: 0, label: 'No Knowledge', color: 'text-slate-400', bg: 'bg-slate-800' },
  { level: 1, label: 'Beginner', color: 'text-blue-400', bg: 'bg-blue-900/40 border-blue-500/30' },
  { level: 2, label: 'Intermediate', color: 'text-emerald-400', bg: 'bg-emerald-900/40 border-emerald-500/30' },
  { level: 3, label: 'Advanced', color: 'text-purple-400', bg: 'bg-purple-900/40 border-purple-500/30' },
  { level: 4, label: 'Expert', color: 'text-amber-400', bg: 'bg-amber-900/40 border-amber-500/30' }
];

const ProficiencySelector = ({ currentLevel = 0, onChange, disabled = false }) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-400 font-semibold">Selected Proficiency:</span>
        <span className={`font-extrabold ${PROFICIENCY_LEVELS[currentLevel]?.color || 'text-white'}`}>
          Level {currentLevel}: {PROFICIENCY_LEVELS[currentLevel]?.label}
        </span>
      </div>

      <div className="grid grid-cols-5 gap-1.5">
        {PROFICIENCY_LEVELS.map(({ level, label }) => {
          const isSelected = currentLevel === level;
          return (
            <button
              key={level}
              type="button"
              disabled={disabled}
              onClick={() => onChange(level)}
              className={`py-2.5 rounded-xl text-xs font-bold transition-all border flex flex-col items-center justify-center gap-0.5 ${
                isSelected
                  ? 'bg-gradient-primary text-white border-blue-400 shadow-lg shadow-blue-600/30 scale-105'
                  : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-white'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span className="text-sm font-black">{level}</span>
              <span className="text-[10px] opacity-80 hidden sm:inline">{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ProficiencySelector;
