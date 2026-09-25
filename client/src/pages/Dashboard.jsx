import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { getDashboardSummaryApi } from '../services/api';
import { 
  Target, 
  CheckCircle2, 
  Award, 
  BookOpen, 
  AlertCircle, 
  Clock, 
  ArrowRight, 
  Sparkles, 
  TrendingUp, 
  Layers, 
  RefreshCw, 
  PlusCircle, 
  Calendar,
  Briefcase,
  ChevronRight,
  ShieldCheck,
  Zap,
  Activity
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await getDashboardSummaryApi();
      if (res.data?.success) {
        setData(res.data);
      } else {
        setError(res.data?.message || 'Failed to fetch dashboard data');
      }
    } catch (err) {
      console.error('Error loading dashboard summary:', err);
      setError(err.response?.data?.message || 'Failed to load dashboard data from server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = user?.name ? `SmartSkillGap | ${user.name}'s Dashboard` : 'SmartSkillGap | Dashboard';
    fetchDashboardData();
  }, [user]);

  // Derived metrics from real API payload
  const skillGap = data?.skillGap || {
    matchPercentage: 0,
    matchingSkillsCount: 0,
    skillsToImproveCount: 0,
    missingSkillsCount: 0,
    matchingSkills: [],
    skillsToImprove: [],
    missingSkills: []
  };

  const roadmap = data?.roadmap || {
    progress: 0,
    totalPhases: 0,
    completedPhasesCount: 0,
    currentPhase: null,
    phases: []
  };

  const activities = data?.recentActivity || [];
  const targetCareer = data?.user?.targetCareer || user?.targetCareer || '';

  // Format relative timestamp for activities
  const formatTime = (ts) => {
    if (!ts) return 'Recently';
    const date = new Date(ts);
    const now = new Date();
    const diffInMs = now - date;
    const diffInMins = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMins < 2) return 'Just now';
    if (diffInMins < 60) return `${diffInMins} mins ago`;
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-[#F8FBFF] flex flex-col justify-between font-sans">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8 flex-1">
        
        {/* Top Header / Welcome Banner */}
        <div className="bg-[#FFFFFF] p-6 sm:p-8 rounded-3xl border border-[#DBEAFE] shadow-sm flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#2563EB] text-white flex items-center justify-center font-extrabold text-2xl shadow-lg shadow-[#2563EB]/25 shrink-0">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E3A8A]">
                  Welcome back, {user?.name || 'Student'} 👋
                </h1>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#EFF6FF] text-[#2563EB] border border-[#DBEAFE] flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#2563EB]" />
                  Active Student
                </span>
              </div>
              <p className="text-sm text-[#475569] mt-1 flex items-center gap-1.5 flex-wrap">
                <span>Target Career:</span>
                {targetCareer ? (
                  <strong className="text-[#1E3A8A] bg-[#F8FBFF] px-2.5 py-0.5 rounded-lg border border-[#DBEAFE] flex items-center gap-1">
                    <Briefcase className="w-3.5 h-3.5 text-[#2563EB]" />
                    {targetCareer}
                  </strong>
                ) : (
                  <span className="text-amber-600 font-medium">No target career selected</span>
                )}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <button
              onClick={fetchDashboardData}
              disabled={loading}
              className="p-3 rounded-xl text-xs font-bold text-[#1E3A8A] bg-[#F8FBFF] hover:bg-[#EFF6FF] border border-[#DBEAFE] transition-all flex items-center gap-2 cursor-pointer"
              title="Refresh dashboard data"
            >
              <RefreshCw className={`w-4 h-4 text-[#2563EB] ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <Link
              to="/skills"
              className="px-4 py-3 rounded-xl text-xs font-bold text-[#1E3A8A] bg-[#EFF6FF] hover:bg-[#DBEAFE] border border-[#DBEAFE] transition-all flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4 text-[#2563EB]" />
              <span>Update Skills</span>
            </Link>
            <Link
              to="/skill-gap"
              className="px-5 py-3 rounded-xl text-xs font-extrabold text-white bg-[#2563EB] hover:bg-blue-700 shadow-md shadow-[#2563EB]/20 transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" />
              <span>Skill Gap Analysis</span>
            </Link>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
            <button onClick={fetchDashboardData} className="font-bold underline text-xs">Retry</button>
          </div>
        )}

        {/* Missing Target Career Banner */}
        {!loading && !targetCareer && (
          <div className="p-6 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-amber-900 text-base">Target Career Not Selected</h3>
                <p className="text-xs text-amber-700 mt-0.5">Select your dream career to unlock full skill gap analysis and step-by-step learning roadmap.</p>
              </div>
            </div>
            <Link
              to="/careers"
              className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl transition-all shrink-0 flex items-center gap-1"
            >
              <span>Explore Careers</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Card 1: Skill Match % */}
          <div className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#DBEAFE] shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-extrabold text-[#475569] uppercase tracking-wider">Skill Match</span>
              <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center border border-[#DBEAFE]">
                <Target className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-[#1E3A8A]">{skillGap.matchPercentage}%</span>
              <span className="text-xs font-semibold text-[#2563EB]">match rate</span>
            </div>
            <div className="w-full bg-[#EFF6FF] h-2.5 rounded-full mt-3 overflow-hidden border border-[#DBEAFE]">
              <div 
                className="bg-[#2563EB] h-full rounded-full transition-all duration-500" 
                style={{ width: `${skillGap.matchPercentage}%` }}
              ></div>
            </div>
            <p className="text-xs text-[#64748B] mt-3 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>{skillGap.matchingSkillsCount} of {skillGap.matchingSkillsCount + skillGap.skillsToImproveCount + skillGap.missingSkillsCount} required skills</span>
            </p>
          </div>

          {/* Card 2: Roadmap Progress */}
          <div className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#DBEAFE] shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-extrabold text-[#475569] uppercase tracking-wider">Roadmap Progress</span>
              <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center border border-[#DBEAFE]">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-[#1E3A8A]">{roadmap.progress}%</span>
              <span className="text-xs font-semibold text-emerald-600">completed</span>
            </div>
            <div className="w-full bg-[#EFF6FF] h-2.5 rounded-full mt-3 overflow-hidden border border-[#DBEAFE]">
              <div 
                className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${roadmap.progress}%` }}
              ></div>
            </div>
            <p className="text-xs text-[#64748B] mt-3 font-medium flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5 text-[#2563EB]" />
              <span>{roadmap.completedPhasesCount} of {roadmap.totalPhases} learning phases</span>
            </p>
          </div>

          {/* Card 3: Current Learning Phase */}
          <div className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#DBEAFE] shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-extrabold text-[#475569] uppercase tracking-wider">Current Milestone</span>
              <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center border border-[#DBEAFE]">
                <Award className="w-5 h-5" />
              </div>
            </div>
            <div className="truncate">
              <span className="text-xs font-bold text-[#2563EB] bg-[#EFF6FF] px-2.5 py-1 rounded-md border border-[#DBEAFE] inline-block mb-1">
                {roadmap.currentPhase ? `Phase ${roadmap.currentPhase.phaseNumber}` : 'Phase 1'}
              </span>
              <h3 className="text-lg font-extrabold text-[#1E3A8A] truncate">
                {roadmap.currentPhase ? roadmap.currentPhase.title : (targetCareer ? 'Initial Phase' : 'Select Target Career')}
              </h3>
            </div>
            <p className="text-xs text-[#64748B] mt-3 font-medium flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#2563EB]" />
              <span>Status: <strong className="text-[#1E3A8A] font-bold">{roadmap.currentPhase?.status || 'In Progress'}</strong></span>
            </p>
          </div>

          {/* Card 4: Skill Distribution Breakdown */}
          <div className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#DBEAFE] shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-extrabold text-[#475569] uppercase tracking-wider">Skill Breakdown</span>
              <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center border border-[#DBEAFE]">
                <Layers className="w-5 h-5" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center mt-2">
              <div className="bg-emerald-50 p-2 rounded-xl border border-emerald-100">
                <span className="text-xl font-black text-emerald-700 block">{skillGap.matchingSkillsCount}</span>
                <span className="text-[10px] font-bold text-emerald-600 uppercase">Matching</span>
              </div>
              <div className="bg-amber-50 p-2 rounded-xl border border-amber-100">
                <span className="text-xl font-black text-amber-700 block">{skillGap.skillsToImproveCount}</span>
                <span className="text-[10px] font-bold text-amber-600 uppercase">Improve</span>
              </div>
              <div className="bg-rose-50 p-2 rounded-xl border border-rose-100">
                <span className="text-xl font-black text-rose-700 block">{skillGap.missingSkillsCount}</span>
                <span className="text-[10px] font-bold text-rose-600 uppercase">Missing</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid: 2 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column (2 cols wide on desktop) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Skill Gap Analysis Summary Card */}
            <div className="bg-[#FFFFFF] p-6 sm:p-8 rounded-3xl border border-[#DBEAFE] shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-[#DBEAFE]">
                <div>
                  <h2 className="text-xl font-extrabold text-[#1E3A8A] flex items-center gap-2">
                    <Target className="w-5 h-5 text-[#2563EB]" />
                    <span>Skill Gap Summary</span>
                  </h2>
                  <p className="text-xs text-[#64748B]">Real-time match comparison for <strong className="text-[#1E3A8A]">{targetCareer || 'Target Career'}</strong></p>
                </div>
                <Link
                  to="/skill-gap"
                  className="text-xs font-bold text-[#2563EB] hover:text-blue-800 flex items-center gap-1 group bg-[#EFF6FF] px-3 py-1.5 rounded-lg border border-[#DBEAFE]"
                >
                  <span>Full Analysis</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>

              {/* Progress Visual Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-[#1E3A8A]">
                  <span>Skill Compatibility Score</span>
                  <span>{skillGap.matchPercentage}%</span>
                </div>
                <div className="w-full bg-[#F8FBFF] h-4 rounded-xl border border-[#DBEAFE] p-0.5 flex overflow-hidden">
                  {skillGap.matchingSkillsCount > 0 && (
                    <div 
                      className="bg-emerald-500 h-full rounded-l-lg transition-all"
                      style={{ width: `${(skillGap.matchingSkillsCount / (skillGap.matchingSkillsCount + skillGap.skillsToImproveCount + skillGap.missingSkillsCount || 1)) * 100}%` }}
                      title={`Matching Skills (${skillGap.matchingSkillsCount})`}
                    ></div>
                  )}
                  {skillGap.skillsToImproveCount > 0 && (
                    <div 
                      className="bg-amber-500 h-full transition-all"
                      style={{ width: `${(skillGap.skillsToImproveCount / (skillGap.matchingSkillsCount + skillGap.skillsToImproveCount + skillGap.missingSkillsCount || 1)) * 100}%` }}
                      title={`Skills to Improve (${skillGap.skillsToImproveCount})`}
                    ></div>
                  )}
                  {skillGap.missingSkillsCount > 0 && (
                    <div 
                      className="bg-rose-500 h-full rounded-r-lg transition-all"
                      style={{ width: `${(skillGap.missingSkillsCount / (skillGap.matchingSkillsCount + skillGap.skillsToImproveCount + skillGap.missingSkillsCount || 1)) * 100}%` }}
                      title={`Missing Skills (${skillGap.missingSkillsCount})`}
                    ></div>
                  )}
                </div>
                <div className="flex items-center justify-between text-[11px] text-[#64748B] pt-1">
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span> Matching ({skillGap.matchingSkillsCount})</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span> Need Upgrade ({skillGap.skillsToImproveCount})</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span> Missing ({skillGap.missingSkillsCount})</span>
                </div>
              </div>

              {/* Categorized Skill Chips */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                {/* Matching */}
                <div className="bg-[#F8FBFF] p-4 rounded-2xl border border-[#DBEAFE] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Matching Skills
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-xs">
                      {skillGap.matchingSkillsCount}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {skillGap.matchingSkills && skillGap.matchingSkills.length > 0 ? (
                      skillGap.matchingSkills.slice(0, 5).map((sk, idx) => (
                        <span key={idx} className="px-2.5 py-1 bg-white text-emerald-800 border border-emerald-200 text-xs font-semibold rounded-lg shadow-2xs">
                          {typeof sk === 'object' ? sk.name : sk}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-[#64748B] italic">No matching skills yet</span>
                    )}
                    {skillGap.matchingSkills?.length > 5 && (
                      <span className="px-2 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg">
                        +{skillGap.matchingSkills.length - 5} more
                      </span>
                    )}
                  </div>
                </div>

                {/* To Improve */}
                <div className="bg-[#F8FBFF] p-4 rounded-2xl border border-[#DBEAFE] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-amber-700 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4 text-amber-600" />
                      Skills To Improve
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-bold text-xs">
                      {skillGap.skillsToImproveCount}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {skillGap.skillsToImprove && skillGap.skillsToImprove.length > 0 ? (
                      skillGap.skillsToImprove.slice(0, 5).map((sk, idx) => (
                        <span key={idx} className="px-2.5 py-1 bg-white text-amber-800 border border-amber-200 text-xs font-semibold rounded-lg shadow-2xs">
                          {typeof sk === 'object' ? sk.name : sk}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-[#64748B] italic">None to improve</span>
                    )}
                    {skillGap.skillsToImprove?.length > 5 && (
                      <span className="px-2 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-lg">
                        +{skillGap.skillsToImprove.length - 5} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Missing */}
                <div className="bg-[#F8FBFF] p-4 rounded-2xl border border-[#DBEAFE] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-rose-700 flex items-center gap-1">
                      <Zap className="w-4 h-4 text-rose-600" />
                      Missing Skills
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 font-bold text-xs">
                      {skillGap.missingSkillsCount}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {skillGap.missingSkills && skillGap.missingSkills.length > 0 ? (
                      skillGap.missingSkills.slice(0, 5).map((sk, idx) => (
                        <span key={idx} className="px-2.5 py-1 bg-white text-rose-800 border border-rose-200 text-xs font-semibold rounded-lg shadow-2xs">
                          {typeof sk === 'object' ? sk.name : sk}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-[#64748B] italic">No missing skills</span>
                    )}
                    {skillGap.missingSkills?.length > 5 && (
                      <span className="px-2 py-1 bg-rose-50 text-rose-700 text-xs font-bold rounded-lg">
                        +{skillGap.missingSkills.length - 5} more
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Active Learning Phase & Roadmap Overview */}
            <div className="bg-[#FFFFFF] p-6 sm:p-8 rounded-3xl border border-[#DBEAFE] shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-[#DBEAFE]">
                <div>
                  <h2 className="text-xl font-extrabold text-[#1E3A8A] flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-[#2563EB]" />
                    <span>Personalized Roadmap Progress</span>
                  </h2>
                  <p className="text-xs text-[#64748B]">Step-by-step curriculum generated for MongoDB persistence</p>
                </div>
                <Link
                  to="/roadmap"
                  className="text-xs font-bold text-[#2563EB] hover:text-blue-800 flex items-center gap-1 group bg-[#EFF6FF] px-3 py-1.5 rounded-lg border border-[#DBEAFE]"
                >
                  <span>Interactive Roadmap</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>

              {roadmap.currentPhase ? (
                <div className="bg-[#F8FBFF] p-6 rounded-2xl border border-[#DBEAFE] space-y-4">
                  <div className="flex justify-between items-center flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-[#2563EB] text-white text-xs font-extrabold rounded-lg">
                        Phase {roadmap.currentPhase.phaseNumber}
                      </span>
                      <span className="text-xs font-bold text-[#2563EB] bg-[#EFF6FF] px-2.5 py-1 rounded-lg border border-[#DBEAFE]">
                        {roadmap.currentPhase.status || 'In Progress'}
                      </span>
                    </div>
                    {roadmap.currentPhase.estimatedTime && (
                      <span className="text-xs text-[#64748B] flex items-center gap-1 font-medium">
                        <Clock className="w-3.5 h-3.5 text-[#2563EB]" />
                        {roadmap.currentPhase.estimatedTime}
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-[#1E3A8A]">{roadmap.currentPhase.title}</h3>
                    {roadmap.currentPhase.description && (
                      <p className="text-xs text-[#475569] mt-1">{roadmap.currentPhase.description}</p>
                    )}
                  </div>

                  {roadmap.currentPhase.learningObjectives && roadmap.currentPhase.learningObjectives.length > 0 && (
                    <div className="space-y-1.5 pt-2">
                      <span className="text-xs font-extrabold text-[#1E3A8A] uppercase tracking-wider block">Key Learning Objectives:</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {roadmap.currentPhase.learningObjectives.map((obj, i) => (
                          <div key={i} className="flex items-start gap-2 text-xs text-[#334155] bg-white p-2.5 rounded-xl border border-[#DBEAFE]">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#2563EB] shrink-0 mt-0.5" />
                            <span>{obj}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 bg-[#F8FBFF] rounded-2xl border border-[#DBEAFE]">
                  <BookOpen className="w-10 h-10 text-[#2563EB] mx-auto mb-2 opacity-60" />
                  <p className="text-sm font-bold text-[#1E3A8A]">No Active Roadmap Phase</p>
                  <p className="text-xs text-[#64748B] max-w-sm mx-auto mt-1 mb-4">Generate your personalized step-by-step career roadmap to track learning milestones.</p>
                  <Link
                    to="/roadmap"
                    className="px-4 py-2 bg-[#2563EB] text-white text-xs font-bold rounded-xl shadow-xs hover:bg-blue-700 transition-all inline-flex items-center gap-1"
                  >
                    <span>Generate Roadmap</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              )}
            </div>

          </div>

          {/* Right Column (1 col wide on desktop) */}
          <div className="space-y-8">
            
            {/* Career Summary Card */}
            <div className="bg-[#FFFFFF] p-6 rounded-3xl border border-[#DBEAFE] shadow-sm space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-[#DBEAFE]">
                <h2 className="text-lg font-extrabold text-[#1E3A8A] flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-[#2563EB]" />
                  <span>Target Career</span>
                </h2>
                <Link to="/careers" className="text-xs font-bold text-[#2563EB] hover:underline">
                  Change
                </Link>
              </div>

              {targetCareer ? (
                <div className="space-y-3">
                  <div className="bg-[#F8FBFF] p-4 rounded-2xl border border-[#DBEAFE]">
                    <span className="text-[10px] font-bold text-[#2563EB] uppercase tracking-wider block">Selected Target</span>
                    <h3 className="text-base font-extrabold text-[#1E3A8A] mt-0.5">{targetCareer}</h3>
                    <div className="mt-3 flex items-center justify-between text-xs text-[#64748B] pt-2 border-t border-[#DBEAFE]">
                      <span>User Skills:</span>
                      <strong className="text-[#1E3A8A]">{data?.user?.skillsCount || 0} skills added</strong>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-[#F8FBFF] rounded-xl border border-[#DBEAFE] text-xs">
                    <span className="text-[#64748B]">Experience Level</span>
                    <span className="font-bold text-[#1E3A8A]">{data?.user?.experienceLevel || 'Beginner'}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-[#F8FBFF] rounded-xl border border-[#DBEAFE] text-xs">
                    <span className="text-[#64748B]">Education</span>
                    <span className="font-bold text-[#1E3A8A]">{data?.user?.education || 'Not specified'}</span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 bg-[#F8FBFF] rounded-2xl border border-[#DBEAFE]">
                  <Target className="w-8 h-8 text-[#2563EB] mx-auto mb-2 opacity-50" />
                  <p className="text-xs font-bold text-[#1E3A8A]">No Target Career Selected</p>
                  <Link to="/careers" className="text-xs text-[#2563EB] font-bold underline mt-2 inline-block">
                    Select a target career now
                  </Link>
                </div>
              )}
            </div>

            {/* Recent Activity Timeline Card */}
            <div className="bg-[#FFFFFF] p-6 rounded-3xl border border-[#DBEAFE] shadow-sm space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-[#DBEAFE]">
                <h2 className="text-lg font-extrabold text-[#1E3A8A] flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#2563EB]" />
                  <span>Recent Activity</span>
                </h2>
                <span className="text-[11px] text-[#64748B] font-semibold">{activities.length} items</span>
              </div>

              <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                {activities && activities.length > 0 ? (
                  activities.map((act, index) => (
                    <div key={index} className="p-3 bg-[#F8FBFF] rounded-2xl border border-[#DBEAFE] flex items-start gap-3 text-xs">
                      <div className="w-8 h-8 rounded-xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center shrink-0 border border-[#DBEAFE]">
                        {act.type === 'CAREER_SELECTED' && <Briefcase className="w-4 h-4" />}
                        {act.type === 'SKILL_ADDED' && <PlusCircle className="w-4 h-4" />}
                        {act.type === 'ANALYSIS_RUN' && <Sparkles className="w-4 h-4" />}
                        {act.type === 'ROADMAP_UPDATED' && <BookOpen className="w-4 h-4" />}
                        {act.type === 'PROFILE_UPDATED' && <ShieldCheck className="w-4 h-4" />}
                        {act.type === 'ACCOUNT_CREATED' && <Calendar className="w-4 h-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                          <h4 className="font-extrabold text-[#1E3A8A] truncate">{act.title}</h4>
                          <span className="text-[10px] text-[#64748B] shrink-0 ml-1">{formatTime(act.timestamp)}</span>
                        </div>
                        <p className="text-[11px] text-[#475569] mt-0.5 line-clamp-2">{act.description}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-xs text-[#64748B]">
                    No activity recorded yet
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;
