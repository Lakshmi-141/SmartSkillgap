import React, { useState } from 'react';
import { Search, Code } from 'lucide-react';

const SkillSelector = ({ masterSkills = [], selectedSkillId, onSelectSkill }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSkills = masterSkills.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-3">
      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
        Select Skill
      </label>

      <div className="relative">
        <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Type to filter skills..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs"
        />
      </div>

      <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
        {filteredSkills.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-4">No matching skills found</p>
        ) : (
          filteredSkills.map((s) => {
            const isSelected = selectedSkillId === s._id;
            return (
              <button
                key={s._id}
                type="button"
                onClick={() => onSelectSkill(s._id)}
                className={`w-full p-2.5 rounded-xl text-left text-xs font-medium transition-all flex items-center justify-between border ${
                  isSelected
                    ? 'bg-blue-600/20 border-blue-500 text-white font-bold'
                    : 'bg-slate-900/50 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Code className="w-4 h-4 text-blue-400" />
                  <span>{s.name}</span>
                </div>
                <span className="text-[10px] uppercase font-semibold text-slate-500 px-2 py-0.5 rounded bg-slate-800">
                  {s.category}
                </span>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

export default SkillSelector;
