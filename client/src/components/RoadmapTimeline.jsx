import React, { useState } from 'react';
import {
  CheckCircle2,
  Circle,
  PlayCircle,
  Clock,
  Award,
  Sparkles,
  ChevronRight,
  Flame,
  BookOpen
} from 'lucide-react';

const PRIORITY_STYLES = {
  CRITICAL: {
    bg: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    label: 'Critical Priority',
    icon: Flame
  },
  HIGH: {
    bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    label: 'High Priority',
    icon: Sparkles
  },
  MEDIUM: {
    bg: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    label: 'Medium Priority',
    icon: Award
  },
  LOW: {
    bg: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
    label: 'Low Priority',
    icon: Clock
  }
};

const STATUS_STYLES = {
  COMPLETED: {
    bg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    label: 'Completed'
  },
  IN_PROGRESS: {
    bg: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    label: 'In Progress'
  },
  NOT_STARTED: {
    bg: 'bg-slate-800 text-slate-400 border-slate-700',
    label: 'Not Started'
  }
};

const RoadmapTimeline = ({ steps = [], onUpdateProgress, onUpdateStatus, togglingStepId }) => {
  const [editingStepId, setEditingStepId] = useState(null);
  const [tempProgress, setTempProgress] = useState({});

  if (!steps || steps.length === 0) {
    return (
      <div className="text-center py-12 text-slate-400 glass-panel p-8 rounded-3xl border border-slate-800">
        <BookOpen className="w-12 h-12 mx-auto text-slate-600 mb-3" />
        <p className="font-semibold text-lg">No roadmap steps found</p>
        <p className="text-xs text-slate-500 mt-1">Select or generate a career roadmap to get started.</p>
      </div>
    );
  }

  const handleSliderChange = (stepId, value) => {
    setTempProgress(prev => ({ ...prev, [stepId]: Number(value) }));
  };

  const handleApplyProgress = (stepId) => {
    const val = tempProgress[stepId];
    if (val !== undefined) {
      onUpdateProgress(stepId, val);
      setEditingStepId(null);
    }
  };

  return (
    <div className="relative border-l-2 border-slate-800 ml-4 md:ml-8 pl-6 md:pl-10 space-y-8">
      {steps.map((step) => {
        const normStatus = (step.status || 'NOT_STARTED').toUpperCase();
        const normPriority = (step.priority || 'MEDIUM').toUpperCase();
        const priorityConfig = PRIORITY_STYLES[normPriority] || PRIORITY_STYLES.MEDIUM;
        const statusConfig = STATUS_STYLES[normStatus] || STATUS_STYLES.NOT_STARTED;
        const PriorityIcon = priorityConfig.icon;

        const isCompleted = normStatus === 'COMPLETED';
        const isInProgress = normStatus === 'IN_PROGRESS';
        const isNotStarted = normStatus === 'NOT_STARTED';

        const isLoading = togglingStepId === step._id;
        const currentStepProgress = tempProgress[step._id] !== undefined ? tempProgress[step._id] : (step.progress || 0);

        return (
          <div key={step._id} className="relative group">
            {/* Timeline Connector Node */}
            <div
              className={`absolute -left-[37px] md:-left-[53px] top-3 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                isCompleted
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 ring-4 ring-slate-950'
                  : isInProgress
                  ? 'bg-blue-600 text-white ring-4 ring-slate-950 shadow-lg shadow-blue-500/30'
                  : 'bg-slate-900 border-2 border-slate-700 text-slate-500 ring-4 ring-slate-950'
              }`}
            >
              {isCompleted ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : isInProgress ? (
                <PlayCircle className="w-5 h-5" />
              ) : (
                <Circle className="w-4 h-4" />
              )}
            </div>

            {/* Step Content Card */}
            <div
              className={`glass-panel p-6 rounded-3xl border transition-all ${
                isCompleted
                  ? 'border-emerald-500/30 bg-emerald-950/10'
                  : isInProgress
                  ? 'border-blue-500/40 bg-blue-950/10 shadow-lg shadow-blue-950/20'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Header section with step number, title, priority & status badges */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
                <div className="flex items-start gap-3">
                  <span className="w-7 h-7 rounded-xl bg-blue-600/20 text-blue-400 text-xs font-black flex items-center justify-center border border-blue-500/30 shrink-0 mt-0.5">
                    #{step.order}
                  </span>
                  <div>
                    <h3 className="text-xl font-bold text-white tracking-tight">{step.title}</h3>
                    <p className="text-sm text-slate-300 mt-1 leading-relaxed">{step.description}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {/* Priority Label */}
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${priorityConfig.bg}`}
                  >
                    <PriorityIcon className="w-3.5 h-3.5" />
                    {priorityConfig.label}
                  </span>

                  {/* Status Badge */}
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${statusConfig.bg}`}
                  >
                    {statusConfig.label}
                  </span>
                </div>
              </div>

              {/* Associated Skill Card */}
              {step.skill && (
                <div className="glass-card p-4 rounded-2xl border border-slate-800/80 bg-slate-900/40 mb-5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold border border-purple-500/20">
                      {step.skill.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-400">
                        {step.skill.category || 'Core Skill'}
                      </span>
                      <h4 className="text-sm font-bold text-white">{step.skill.name}</h4>
                    </div>
                  </div>
                  {step.skill.description && (
                    <p className="text-xs text-slate-400 max-w-sm hidden md:block line-clamp-1">
                      {step.skill.description}
                    </p>
                  )}
                </div>
              )}

              {/* Progress Bar & Slider */}
              <div className="space-y-2 mb-5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-400">Learning Progress</span>
                  <span className="font-black text-amber-400">{step.progress || 0}%</span>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden p-0.5 border border-slate-700/50">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isCompleted
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-sm shadow-emerald-500'
                        : isInProgress
                        ? 'bg-gradient-to-r from-blue-500 to-cyan-400 shadow-sm shadow-blue-500'
                        : 'bg-slate-600'
                    }`}
                    style={{ width: `${Math.min(100, Math.max(0, step.progress || 0))}%` }}
                  />
                </div>

                {/* Inline Progress Adjuster */}
                {editingStepId === step._id ? (
                  <div className="pt-3 glass-card p-3 rounded-xl border border-slate-700 space-y-3">
                    <div className="flex items-center justify-between text-xs text-slate-300">
                      <span>Adjust Progress Percentage:</span>
                      <strong className="text-amber-400 font-bold">{currentStepProgress}%</strong>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={currentStepProgress}
                      onChange={(e) => handleSliderChange(step._id, e.target.value)}
                      className="w-full accent-blue-500 cursor-pointer"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setEditingStepId(null)}
                        className="px-3 py-1 text-xs rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleApplyProgress(step._id)}
                        disabled={isLoading}
                        className="px-4 py-1 text-xs rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-500"
                      >
                        Save Progress
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Footer Interactive Actions & Completion Timestamp */}
              <div className="pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                {/* Timestamp if completed */}
                <div>
                  {isCompleted && step.completedAt ? (
                    <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      Completed on {new Date(step.completedAt).toLocaleDateString()}
                    </span>
                  ) : (
                    <span className="text-slate-500 font-medium">
                      {isNotStarted ? 'Ready to start learning' : 'Active milestone target'}
                    </span>
                  )}
                </div>

                {/* Step Actions */}
                <div className="flex items-center gap-2">
                  {/* Start Step Button */}
                  {isNotStarted && (
                    <button
                      onClick={() => onUpdateStatus(step._id, 'IN_PROGRESS')}
                      disabled={isLoading}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-500 transition-all shadow-md shadow-blue-600/20"
                    >
                      <PlayCircle className="w-4 h-4" /> Start Step
                    </button>
                  )}

                  {/* Update Progress Button */}
                  {!isCompleted && editingStepId !== step._id && (
                    <button
                      onClick={() => {
                        setEditingStepId(step._id);
                        setTempProgress(prev => ({ ...prev, [step._id]: step.progress || 0 }));
                      }}
                      disabled={isLoading}
                      className="px-3 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700 transition-all border border-slate-700"
                    >
                      Update Progress
                    </button>
                  )}

                  {/* Mark Completed Button */}
                  {!isCompleted ? (
                    <button
                      onClick={() => onUpdateStatus(step._id, 'COMPLETED')}
                      disabled={isLoading}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-500 transition-all shadow-md shadow-emerald-600/20"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Mark Completed
                    </button>
                  ) : (
                    <button
                      onClick={() => onUpdateStatus(step._id, 'NOT_STARTED')}
                      disabled={isLoading}
                      className="px-3 py-2 rounded-xl bg-slate-800 text-slate-400 font-bold hover:bg-slate-700 hover:text-white transition-all border border-slate-700"
                    >
                      Mark as Incomplete
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default RoadmapTimeline;
