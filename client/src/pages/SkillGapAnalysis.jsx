import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { BarChart3, CheckCircle2, AlertTriangle, ShieldAlert, Award, ArrowRight, Target } from 'lucide-react';

const SkillGapAnalysis = () => {
  const [gapData, setGapData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchGapAnalysis();
  }, []);

  const fetchGapAnalysis = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get('/gap-analysis');
      if (res.data.success) {
        setGapData(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to analyze skill gaps');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner fullScreen message="Computing skill gap analysis..." />;
  if (error) return <Alert type="error" message={error} className="max-w-2xl mx-auto my-12" />;

  if (!gapData?.hasTargetCareer) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16 space-y-6 glass-panel p-8 rounded-3xl border border-slate-800">
        <div className="w-16 h-16 rounded-2xl bg-purple-500/10 text-purple-400 mx-auto flex items-center justify-center">
          <Target className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white">No Target Career Selected</h2>
        <p className="text-slate-400 text-sm">
          Please select a target career path first to view your personalized skill gap matrix and priority recommendations.
        </p>
        <Link
          to="/careers"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-primary text-white font-bold text-sm shadow-lg shadow-blue-600/30 hover:opacity-95 transition-all"
        >
          Browse & Select Target Career <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  const gaps = gapData.skills || gapData.gaps || [];
  const { summary, career } = gapData;
  const overallSkillCoverage = gapData.overallSkillCoverage !== undefined 
    ? gapData.overallSkillCoverage 
    : (summary?.overallSkillCoverage || summary?.completionPercentage || 0);

  const filteredGaps = gaps.filter(item => {
    if (statusFilter === 'ALL') return true;
    return item.status === statusFilter;
  });

  const chartData = gaps.map(g => ({
    name: g.skill?.name || g.skillName || 'Skill',
    'Current Level': g.currentLevel || 0,
    'Required Level': g.requiredLevel || 0,
    Gap: g.gap || 0
  }));

  const statusBadges = {
    COMPLETED: { label: 'Completed', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', icon: CheckCircle2 },
    LOW_GAP: { label: 'Low Gap (1 Lvl)', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: Award },
    MEDIUM_GAP: { label: 'Medium Gap (2 Lvl)', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30', icon: AlertTriangle },
    HIGH_GAP: { label: 'High Gap (3+ Lvl)', color: 'bg-rose-500/20 text-rose-400 border-rose-500/30', icon: ShieldAlert }
  };

  const priorityBadges = {
    critical: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    high: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    medium: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    low: 'bg-slate-800 text-slate-400 border-slate-700'
  };

  const levelLabels = ['No Knowledge (0)', 'Beginner (1)', 'Intermediate (2)', 'Advanced (3)', 'Expert (4)'];

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Skill Gap Analysis</h1>
          <p className="text-slate-400 text-sm mt-1">
            Comparing your current proficiencies against target requirements for <strong className="text-white">{career?.title}</strong>
          </p>
        </div>

        <Link
          to="/careers"
          className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-300 transition-all self-start md:self-auto"
        >
          Change Target Goal
        </Link>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-2xl border border-blue-500/30 bg-blue-950/10">
          <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider block">Skill Coverage</span>
          <div className="text-3xl font-black text-blue-400 mt-2">{overallSkillCoverage}%</div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
            <div className="bg-gradient-primary h-full rounded-full" style={{ width: `${overallSkillCoverage}%` }} />
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-emerald-500/30 bg-emerald-950/10">
          <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">Completed Skills</span>
          <div className="text-3xl font-black text-emerald-400 mt-2">{summary?.completedCount || gaps.filter(g => g.status === 'COMPLETED').length}</div>
          <span className="text-xs text-emerald-300 mt-1 block">Proficiency Met</span>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-amber-500/30 bg-amber-950/10">
          <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">Low / Med Gap</span>
          <div className="text-3xl font-black text-amber-400 mt-2">
            {(summary?.lowGapCount || gaps.filter(g => g.status === 'LOW_GAP').length) + (summary?.mediumGapCount || gaps.filter(g => g.status === 'MEDIUM_GAP').length)}
          </div>
          <span className="text-xs text-amber-300 mt-1 block">1 to 2 Levels Needed</span>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-rose-500/30 bg-rose-950/10">
          <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider block">High Gap</span>
          <div className="text-3xl font-black text-rose-400 mt-2">{summary?.highGapCount || gaps.filter(g => g.status === 'HIGH_GAP').length}</div>
          <span className="text-xs text-rose-300 mt-1 block">3+ Levels Needed</span>
        </div>
      </div>

      {/* Recharts Graphical Chart */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-400" /> Current vs Required Skill Level Matrix
        </h3>

        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 11 }} angle={-15} textAnchor="end" />
              <YAxis stroke="#94a3b8" domain={[0, 4]} ticks={[0, 1, 2, 3, 4]} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#f8fafc' }}
              />
              <Legend wrapperStyle={{ paddingTop: '10px' }} />
              <Bar dataKey="Current Level" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              <Bar dataKey="Required Level" fill="#a855f7" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Status Filter Tabs & Cards */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {['ALL', 'HIGH_GAP', 'MEDIUM_GAP', 'LOW_GAP', 'COMPLETED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === st
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {st === 'ALL' ? 'All Skills' : st.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredGaps.map((item, idx) => {
            const BadgeObj = statusBadges[item.status] || statusBadges.COMPLETED;
            const Icon = BadgeObj.icon;
            const skillName = item.skill?.name || item.skillName || 'Skill';
            const category = item.skill?.category || item.category || 'Core Skill';
            const priority = item.priority || 'medium';

            return (
              <div
                key={item.skill?._id || item.skillId || idx}
                className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-400">{category}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${priorityBadges[priority.toLowerCase()] || priorityBadges.medium}`}>
                        {priority}
                      </span>
                    </div>

                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${BadgeObj.color}`}>
                      <Icon className="w-3.5 h-3.5" /> {BadgeObj.label}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-4">{skillName}</h3>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Current Level</span>
                      <span className="text-sm font-bold text-blue-400 mt-0.5 block">
                        Level {item.currentLevel} ({levelLabels[item.currentLevel]?.split(' ')[0] || 'Level ' + item.currentLevel})
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Required Level</span>
                      <span className="text-sm font-bold text-purple-400 mt-0.5 block">
                        Level {item.requiredLevel} ({levelLabels[item.requiredLevel]?.split(' ')[0] || 'Level ' + item.requiredLevel})
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <Link
                    to="/assessments"
                    className="text-emerald-400 font-semibold hover:underline"
                  >
                    Take Quiz &rarr;
                  </Link>

                  <Link
                    to="/resources"
                    className="text-purple-400 font-semibold hover:underline"
                  >
                    View Resources &rarr;
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SkillGapAnalysis;
