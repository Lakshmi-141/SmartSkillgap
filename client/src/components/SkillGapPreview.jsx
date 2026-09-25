import React, { useState } from 'react';
import { CheckCircle2, AlertCircle, ArrowUpRight, BarChart3, Target, Sparkles } from 'lucide-react';

const SkillGapPreview = () => {
  const [selectedRole, setSelectedRole] = useState('Full Stack Developer');

  const rolesData = {
    'Full Stack Developer': {
      matchPercentage: 65,
      acquired: [
        { name: 'JavaScript (ES6+)', level: 'Advanced' },
        { name: 'React.js', level: 'Intermediate' },
        { name: 'HTML5 & CSS3', level: 'Advanced' },
        { name: 'Node.js Basics', level: 'Intermediate' }
      ],
      missing: [
        { name: 'MongoDB / Mongoose', priority: 'High', effort: '2 weeks' },
        { name: 'Express.js REST APIs', priority: 'High', effort: '1 week' },
        { name: 'Docker & Containerization', priority: 'Medium', effort: '3 weeks' },
        { name: 'System Design Fundamentals', priority: 'Medium', effort: '4 weeks' }
      ]
    },
    'Data Scientist': {
      matchPercentage: 45,
      acquired: [
        { name: 'Python Fundamentals', level: 'Intermediate' },
        { name: 'SQL & Database Queries', level: 'Intermediate' }
      ],
      missing: [
        { name: 'Pandas & NumPy Data Cleaning', priority: 'High', effort: '2 weeks' },
        { name: 'Scikit-Learn Machine Learning', priority: 'High', effort: '4 weeks' },
        { name: 'Statistics & Probability', priority: 'High', effort: '3 weeks' },
        { name: 'Data Visualization (Seaborn)', priority: 'Medium', effort: '1 week' }
      ]
    },
    'DevOps Engineer': {
      matchPercentage: 30,
      acquired: [
        { name: 'Linux Command Line', level: 'Advanced' },
        { name: 'Git & GitHub Workflows', level: 'Advanced' }
      ],
      missing: [
        { name: 'Docker & Kubernetes', priority: 'High', effort: '4 weeks' },
        { name: 'CI/CD Pipelines (GitHub Actions)', priority: 'High', effort: '2 weeks' },
        { name: 'Terraform IaC', priority: 'Medium', effort: '3 weeks' },
        { name: 'AWS Cloud Architecture', priority: 'High', effort: '5 weeks' }
      ]
    }
  };

  const currentData = rolesData[selectedRole];

  return (
    <div className="bg-[#FFFFFF] rounded-2xl border border-[#DBEAFE] p-6 sm:p-8 shadow-xl shadow-[#2563EB]/5">
      {/* Header Selector */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-6 border-b border-[#DBEAFE]">
        <div>
          <div className="flex items-center gap-2 text-[#2563EB] text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Interactive Demo Preview</span>
          </div>
          <h3 className="text-xl font-bold text-[#1E3A8A]">Target Role Gap Analysis</h3>
        </div>
        
        {/* Role Selector Tabs */}
        <div className="flex flex-wrap gap-2 bg-[#F8FBFF] p-1.5 rounded-xl border border-[#DBEAFE]">
          {Object.keys(rolesData).map((role) => (
            <button
              key={role}
              onClick={() => setSelectedRole(role)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedRole === role
                  ? 'bg-[#2563EB] text-white shadow-sm'
                  : 'text-[#334155] hover:bg-[#EFF6FF]'
              }`}
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      {/* Progress Match Bar */}
      <div className="bg-[#F8FBFF] rounded-xl p-5 border border-[#DBEAFE] mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-bold text-[#1E3A8A] flex items-center gap-2">
            <Target className="w-4 h-4 text-[#2563EB]" />
            Role Preparedness Match
          </span>
          <span className="text-lg font-extrabold text-[#2563EB]">{currentData.matchPercentage}%</span>
        </div>
        <div className="w-full bg-[#EFF6FF] h-3.5 rounded-full overflow-hidden border border-[#DBEAFE]">
          <div
            className="bg-[#2563EB] h-full rounded-full transition-all duration-700 ease-out"
            style={{ width: `${currentData.matchPercentage}%` }}
          ></div>
        </div>
        <div className="flex justify-between items-center text-xs text-[#64748B] mt-2">
          <span>Current Skills: {currentData.acquired.length}</span>
          <span>Missing Skills to Bridge: {currentData.missing.length}</span>
        </div>
      </div>

      {/* Grid acquired vs missing */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Acquired Skills */}
        <div className="bg-[#EFF6FF]/60 rounded-xl p-5 border border-[#DBEAFE]">
          <h4 className="text-sm font-bold text-[#1E3A8A] flex items-center gap-2 mb-4">
            <CheckCircle2 className="w-4 h-4 text-[#2563EB]" />
            Acquired Skills ({currentData.acquired.length})
          </h4>
          <div className="space-y-3">
            {currentData.acquired.map((skill, idx) => (
              <div key={idx} className="bg-[#FFFFFF] p-3 rounded-lg border border-[#DBEAFE] flex justify-between items-center shadow-xs">
                <span className="text-sm font-semibold text-[#334155]">{skill.name}</span>
                <span className="text-xs px-2.5 py-1 rounded-md font-medium bg-[#EFF6FF] text-[#2563EB] border border-[#DBEAFE]">
                  {skill.level}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Missing Skills */}
        <div className="bg-[#FFFFFF] rounded-xl p-5 border border-[#DBEAFE]">
          <h4 className="text-sm font-bold text-[#1E3A8A] flex items-center gap-2 mb-4">
            <AlertCircle className="w-4 h-4 text-[#2563EB]" />
            Identified Skill Gaps ({currentData.missing.length})
          </h4>
          <div className="space-y-3">
            {currentData.missing.map((skill, idx) => (
              <div key={idx} className="bg-[#F8FBFF] p-3 rounded-lg border border-[#DBEAFE] flex justify-between items-center hover:border-[#2563EB] transition-colors">
                <div>
                  <span className="text-sm font-semibold text-[#334155] block">{skill.name}</span>
                  <span className="text-xs text-[#64748B]">Est. Effort: {skill.effort}</span>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-md font-bold ${
                  skill.priority === 'High' 
                    ? 'bg-[#EFF6FF] text-[#2563EB] border border-[#DBEAFE]' 
                    : 'bg-[#F8FBFF] text-[#64748B] border border-[#DBEAFE]'
                }`}>
                  {skill.priority} Priority
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default SkillGapPreview;
