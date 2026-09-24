import React from 'react';
import SkillProgressBar from './SkillProgressBar';
import ProficiencySelector from './ProficiencySelector';
import { Trash2, ShieldAlert } from 'lucide-react';

const LEVEL_NAMES = ['No Knowledge', 'Beginner', 'Intermediate', 'Advanced', 'Expert'];

const SkillCard = ({ skill, userSkill, onUpdateProficiency, onDelete }) => {
  const currentLevel = userSkill ? userSkill.proficiency : 0;
  const isAdded = !!userSkill;

  return (
    <div
      className={`glass-panel p-6 rounded-2xl border transition-all flex flex-col justify-between ${
        isAdded ? 'border-blue-500/40 bg-blue-950/15' : 'border-slate-800'
      }`}
    >
      <div>
        <div className="flex items-start justify-between gap-2 mb-3">
          <div>
            <span className="text-[10px] uppercase tracking-wider font-bold text-blue-400 px-2.5 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20">
              {skill.category}
            </span>
            <h3 className="text-lg font-bold text-white mt-1.5">{skill.name}</h3>
          </div>

          {isAdded && onDelete && (
            <button
              onClick={() => onDelete(userSkill._id || skill._id)}
              className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all"
              title="Remove Skill"
              aria-label="Delete skill"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        <p className="text-xs text-slate-400 mb-5 line-clamp-2 leading-relaxed">
          {skill.description || 'No description provided.'}
        </p>

        <div className="mb-5">
          <SkillProgressBar
            level={currentLevel}
            label={`Current Proficiency: ${LEVEL_NAMES[currentLevel]}`}
          />
        </div>
      </div>

      <div className="pt-4 border-t border-slate-800/80">
        <ProficiencySelector
          currentLevel={currentLevel}
          onChange={(newLevel) => onUpdateProficiency(skill._id, newLevel)}
        />
        {userSkill?.source && (
          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
            <span>Source: <strong className="text-slate-400 capitalize">{userSkill.source}</strong></span>
            {userSkill.updatedAt && (
              <span>Updated: {new Date(userSkill.updatedAt).toLocaleDateString()}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SkillCard;
