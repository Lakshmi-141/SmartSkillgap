import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import {
  TrendingUp,
  ShieldCheck,
  Award,
  Map,
  FolderGit2,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  BarChart3,
  PieChart as PieIcon,
  BookOpen
} from 'lucide-react';

const CareerReadiness = () => {
  const [readinessData, setReadinessData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProgress();
  }, []);

  const fetchProgress = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get('/progress');
      if (res.data.success) {
        setReadinessData(res.data);
      }
    } catch (err) {
      // Fallback try /readiness
      try {
        const fallbackRes = await axiosInstance.get('/readiness');
        if (fallbackRes.data.success) {
          setReadinessData(fallbackRes.data);
        }
      } catch (e) {
        setError(err.response?.data?.message || 'Failed to calculate career readiness progress');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner fullScreen message="Calculating server-side career readiness index..." />;
  if (error) return <Alert type="error" message={error} className="max-w-2xl mx-auto my-12" />;

  const {
    hasTargetCareer,
    career,
    readinessScore = 0,
    readinessLevel = 'Not Started',
    breakdown = {},
    disclaimer,
    stats = {}
  } = readinessData || {};

  if (!hasTargetCareer) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16 space-y-6 glass-panel p-8 rounded-3xl border border-slate-800">
        <div className="w-16 h-16 rounded-2xl bg-blue-500/10 text-blue-400 mx-auto flex items-center justify-center border border-blue-500/20">
          <TrendingUp className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-white">Target Career Required</h2>
        <p className="text-slate-400 text-sm max-w-md mx-auto leading-relaxed">
          Please select a target career to view your calculated career readiness percentage, skill progress, roadmap completion, and performance metrics.
        </p>
        <Link
          to="/careers"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-primary text-white font-bold text-sm shadow-lg shadow-blue-600/30 hover:opacity-95 transition-all"
        >
          Select Target Career <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  const careerTitle = career?.title || readinessData.careerTitle || 'Target Role';

  // Prepare Recharts Chart Data
  const breakdownChartData = [
    { name: 'Skill Completion (40%)', score: breakdown.skillCompletion || 0, color: '#3b82f6' },
    { name: 'Assessment Perf (20%)', score: breakdown.assessmentPerformance || 0, color: '#a855f7' },
    { name: 'Roadmap Progress (20%)', score: breakdown.roadmapCompletion || 0, color: '#f59e0b' },
    { name: 'Project Completion (20%)', score: breakdown.projectCompletion || 0, color: '#f43f5e' }
  ];

  const radarChartData = [
    { subject: 'Skills (40%)', A: breakdown.skillCompletion || 0, fullMark: 100 },
    { subject: 'Assessments (20%)', A: breakdown.assessmentPerformance || 0, fullMark: 100 },
    { subject: 'Roadmap (20%)', A: breakdown.roadmapCompletion || 0, fullMark: 100 },
    { subject: 'Projects (20%)', A: breakdown.projectCompletion || 0, fullMark: 100 }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Top Title Banner */}
      <div>
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
          Progress & Career Readiness
        </span>
        <h1 className="text-3xl font-black text-white tracking-tight mt-2">
          Career Readiness & Progress Dashboard
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Server-evaluated 4-component weighted readiness model for <strong className="text-white">{careerTitle}</strong>.
        </p>
      </div>

      {/* MANDATORY STATUTORY DISCLAIMER */}
      <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-sm flex items-start gap-3.5 shadow-xl">
        <ShieldCheck className="w-6 h-6 flex-shrink-0 text-amber-400 mt-0.5" />
        <div className="space-y-1">
          <h4 className="font-extrabold uppercase tracking-wider text-xs text-amber-400">Official Platform Notice</h4>
          <p className="font-semibold leading-relaxed text-amber-200">
            {disclaimer || "This is an indicative platform-generated readiness metric and does not guarantee employment."}
          </p>
        </div>
      </div>

      {/* Main Readiness Gauge & Level Hero */}
      <div className="glass-panel p-8 rounded-3xl border border-slate-800 text-center relative overflow-hidden bg-gradient-to-b from-blue-950/20 via-slate-900 to-purple-950/20">
        <span className="text-xs font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-3.5 py-1 rounded-full border border-blue-500/20">
          Target Role: {careerTitle}
        </span>

        <div className="my-8 inline-flex flex-col items-center justify-center w-52 h-52 rounded-full bg-slate-950 border-4 border-blue-500/40 shadow-2xl relative">
          <div className="text-6xl font-black text-amber-400">
            {readinessScore}%
          </div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Career Readiness</span>
        </div>

        <h2 className="text-2xl font-black text-white">{readinessLevel}</h2>
        <p className="text-xs text-slate-400 max-w-md mx-auto mt-2 leading-relaxed">
          Calculated strictly server-side using 4 weighted evaluation categories: Skill Completion (40%), Assessment Performance (20%), Roadmap Completion (20%), and Project Completion (20%).
        </p>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* 1. Skill Completion */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Award className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-blue-500/10 text-blue-400">
              Weight: 40%
            </span>
          </div>
          <div>
            <span className="text-xs text-slate-400 font-semibold block">Skill Completion</span>
            <div className="text-2xl font-black text-white mt-0.5">{breakdown.skillCompletion || 0}%</div>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${breakdown.skillCompletion || 0}%` }} />
          </div>
          <span className="text-[11px] text-slate-400 block font-medium">
            Completed: <strong>{stats.completedSkills || 0} / {stats.totalRequiredSkills || 0}</strong> Skills
          </span>
        </div>

        {/* 2. Assessment Performance */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-purple-500/10 text-purple-400">
              Weight: 20%
            </span>
          </div>
          <div>
            <span className="text-xs text-slate-400 font-semibold block">Assessment Performance</span>
            <div className="text-2xl font-black text-white mt-0.5">{breakdown.assessmentPerformance || 0}%</div>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
            <div className="h-full bg-purple-500 rounded-full" style={{ width: `${breakdown.assessmentPerformance || 0}%` }} />
          </div>
          <span className="text-[11px] text-slate-400 block font-medium">
            Taken: <strong>{stats.assessmentsTaken || 0}</strong> Assessments
          </span>
        </div>

        {/* 3. Roadmap Progress */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Map className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-amber-500/10 text-amber-400">
              Weight: 20%
            </span>
          </div>
          <div>
            <span className="text-xs text-slate-400 font-semibold block">Roadmap Progress</span>
            <div className="text-2xl font-black text-white mt-0.5">{breakdown.roadmapCompletion || 0}%</div>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
            <div className="h-full bg-amber-500 rounded-full" style={{ width: `${breakdown.roadmapCompletion || 0}%` }} />
          </div>
          <span className="text-[11px] text-slate-400 block font-medium">
            Milestones: <strong>{stats.roadmapStepsCompleted || 0} / {stats.totalRoadmapSteps || 0}</strong>
          </span>
        </div>

        {/* 4. Project Completion */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <FolderGit2 className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-rose-500/10 text-rose-400">
              Weight: 20%
            </span>
          </div>
          <div>
            <span className="text-xs text-slate-400 font-semibold block">Project Completion</span>
            <div className="text-2xl font-black text-white mt-0.5">{breakdown.projectCompletion || 0}%</div>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
            <div className="h-full bg-rose-500 rounded-full" style={{ width: `${breakdown.projectCompletion || 0}%` }} />
          </div>
          <span className="text-[11px] text-slate-400 block font-medium">
            Projects: <strong>{stats.projectsCompleted || 0} / {stats.totalProjects || 0}</strong>
          </span>
        </div>
      </div>

      {/* Recharts Visual Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Chart 1: Bar Chart Breakdown */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-bold text-white">Weighted Factor Comparison</h3>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={breakdownChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 10 }} interval={0} angle={-15} textAnchor="end" />
                <YAxis stroke="#64748b" domain={[0, 100]} tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                  formatter={(val) => [`${val}%`, 'Score']}
                />
                <Bar dataKey="score" radius={[8, 8, 0, 0]}>
                  {breakdownChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Radar Preparedness Chart */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-bold text-white">Competency Profile Radar</h3>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarChartData}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="subject" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#64748b" tick={{ fontSize: 10 }} />
                <Radar name="Readiness" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.4} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CareerReadiness;
