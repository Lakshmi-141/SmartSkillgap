import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../api/axiosInstance';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';
import {
  Target,
  BarChart3,
  Award,
  Map,
  BookOpen,
  FolderGit2,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [readinessData, setReadinessData] = useState(null);
  const [gapSummary, setGapSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [readinessRes, gapRes] = await Promise.all([
          axiosInstance.get('/readiness'),
          axiosInstance.get('/gap-analysis')
        ]);

        if (readinessRes.data.success) {
          setReadinessData(readinessRes.data);
        }
        if (gapRes.data.success) {
          setGapSummary(gapRes.data);
        }
      } catch (err) {
        console.error('Error loading dashboard:', err);
        setError('Failed to load dashboard metrics. Please refresh.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return <LoadingSpinner fullScreen message="Gathering your career metrics..." />;

  const hasTargetCareer = gapSummary?.hasTargetCareer;

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner */}
      <div className="relative overflow-hidden glass-panel p-8 rounded-3xl border border-slate-800 bg-gradient-to-r from-blue-950/40 via-slate-900 to-purple-950/30">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-3">
            <span>Welcome Back</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Hello, <span className="text-gradient">{user?.name}</span> 👋
          </h1>
          <p className="mt-2 text-slate-300 text-sm leading-relaxed">
            {hasTargetCareer
              ? `Targeting your career goal as ${gapSummary.career?.title}. Keep completing skills and projects to boost your readiness percentage!`
              : 'Select a target career path to unlock your personalized skill gap analysis, roadmap, and career readiness index.'}
          </p>

          {!hasTargetCareer && (
            <Link
              to="/careers"
              className="mt-5 inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-primary text-white font-bold text-sm shadow-lg shadow-blue-600/30 hover:opacity-95 transition-all"
            >
              <Target className="w-4 h-4" />
              Select Target Career Now
            </Link>
          )}
        </div>
      </div>

      {error && <Alert type="error" message={error} />}

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Readiness % */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800 relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Career Readiness</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>

          <div className="my-4">
            <div className="text-4xl font-black text-white">
              {readinessData?.readinessScore || 0}%
            </div>
            <p className="text-xs font-medium text-blue-400 mt-1">
              {readinessData?.readinessLevel || 'Not Evaluated'}
            </p>
          </div>

          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-full rounded-full transition-all duration-1000"
              style={{ width: `${readinessData?.readinessScore || 0}%` }}
            />
          </div>
        </div>

        {/* Card 2: Required Skills Met */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Skill Gaps Met</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

          <div className="my-4">
            <div className="text-4xl font-black text-white">
              {gapSummary?.summary?.completedCount || 0}{' '}
              <span className="text-lg font-normal text-slate-500">/ {gapSummary?.summary?.totalRequired || 0}</span>
            </div>
            <p className="text-xs font-medium text-emerald-400 mt-1">
              {gapSummary?.summary?.completionPercentage || 0}% Skills Met
            </p>
          </div>

          <div className="text-xs text-slate-400">
            High Gaps remaining: <span className="text-rose-400 font-bold">{gapSummary?.summary?.highGapCount || 0}</span>
          </div>
        </div>

        {/* Card 3: Target Career */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Target Role</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <Target className="w-5 h-5" />
            </div>
          </div>

          <div className="my-4">
            <div className="text-lg font-bold text-white truncate">
              {gapSummary?.career?.title || 'None Selected'}
            </div>
            <p className="text-xs text-slate-400 mt-1 truncate">
              {gapSummary?.career?.jobDemand || 'Choose target path'}
            </p>
          </div>

          <Link
            to="/careers"
            className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1"
          >
            Change Goal <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Card 4: Roadmap Progress */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Roadmap Progress</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Map className="w-5 h-5" />
            </div>
          </div>

          <div className="my-4">
            <div className="text-4xl font-black text-white">
              {readinessData?.breakdown?.roadmapScore || 0}%
            </div>
            <p className="text-xs font-medium text-amber-400 mt-1">
              Milestones Achieved: {readinessData?.stats?.roadmapCompleted || '0 / 0'}
            </p>
          </div>

          <Link
            to="/roadmap"
            className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1"
          >
            View Roadmap <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Mandatory Disclaimer Callout */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center gap-3">
        <ShieldCheck className="w-5 h-5 flex-shrink-0 text-amber-400" />
        <div>
          <span className="font-bold uppercase tracking-wider mr-2">Platform Disclaimer:</span>
          {readinessData?.disclaimer || "This is an indicative platform-generated readiness metric and does not guarantee employment."}
        </div>
      </div>

      {/* Quick Action Hub Grid */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">Quick Platform Tools</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            to="/skills"
            className="glass-card p-5 rounded-2xl border border-slate-800 hover:border-blue-500/50 hover:bg-slate-800/50 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 group-hover:scale-110 transition-transform">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Skill Self-Assessment</h3>
                <p className="text-xs text-slate-400">Add & update current skill proficiencies (0 to 4)</p>
              </div>
            </div>
          </Link>

          <Link
            to="/gap-analysis"
            className="glass-card p-5 rounded-2xl border border-slate-800 hover:border-purple-500/50 hover:bg-slate-800/50 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Skill Gap Analysis</h3>
                <p className="text-xs text-slate-400">Inspect Low, Medium & High skill gaps</p>
              </div>
            </div>
          </Link>

          <Link
            to="/assessments"
            className="glass-card p-5 rounded-2xl border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-800/50 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Take Skill Quizzes</h3>
                <p className="text-xs text-slate-400">Verify skill levels via MCQ tests</p>
              </div>
            </div>
          </Link>

          <Link
            to="/roadmap"
            className="glass-card p-5 rounded-2xl border border-slate-800 hover:border-amber-500/50 hover:bg-slate-800/50 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 group-hover:scale-110 transition-transform">
                <Map className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Career Roadmap</h3>
                <p className="text-xs text-slate-400">Step-by-step milestones tailored to target career</p>
              </div>
            </div>
          </Link>

          <Link
            to="/resources"
            className="glass-card p-5 rounded-2xl border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-800/50 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 group-hover:scale-110 transition-transform">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Learning Resources</h3>
                <p className="text-xs text-slate-400">Curated documentation, courses, and tutorials</p>
              </div>
            </div>
          </Link>

          <Link
            to="/projects"
            className="glass-card p-5 rounded-2xl border border-slate-800 hover:border-rose-500/50 hover:bg-slate-800/50 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400 group-hover:scale-110 transition-transform">
                <FolderGit2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Recommended Projects</h3>
                <p className="text-xs text-slate-400">Submit repo & demo links for hands-on projects</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
