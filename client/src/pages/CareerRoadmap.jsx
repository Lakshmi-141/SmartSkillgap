import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';
import RoadmapTimeline from '../components/RoadmapTimeline';
import { Map, ArrowRight, RefreshCw, Trophy, CheckCircle, Target } from 'lucide-react';

const CareerRoadmap = () => {
  const [roadmap, setRoadmap] = useState(null);
  const [hasTargetCareer, setHasTargetCareer] = useState(true);
  const [careerInfo, setCareerInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [togglingStepId, setTogglingStepId] = useState(null);
  const [alertInfo, setAlertInfo] = useState(null);

  useEffect(() => {
    fetchRoadmap();
  }, []);

  const fetchRoadmap = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get('/roadmaps/my-roadmap');
      if (res.data.success) {
        if (!res.data.hasTargetCareer || !res.data.roadmap) {
          setHasTargetCareer(false);
          setRoadmap(null);
        } else {
          setHasTargetCareer(true);
          setRoadmap(res.data.roadmap);
          setCareerInfo(res.data.roadmap.career);
        }
      }
    } catch (err) {
      // Fallback try legacy route if needed
      try {
        const legacyRes = await axiosInstance.get('/roadmap');
        if (legacyRes.data.success && legacyRes.data.hasTargetCareer) {
          setHasTargetCareer(true);
          setRoadmap(legacyRes.data.roadmap);
        } else {
          setHasTargetCareer(false);
        }
      } catch (e) {
        setAlertInfo({ type: 'error', message: 'Failed to load career roadmap' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateRoadmap = async () => {
    try {
      setGenerating(true);
      const res = await axiosInstance.post('/roadmaps/generate', {});
      if (res.data.success) {
        setRoadmap(res.data.roadmap);
        setCareerInfo(res.data.roadmap.career);
        setHasTargetCareer(true);
        setAlertInfo({ type: 'success', message: 'Personalized career roadmap generated successfully!' });
      }
    } catch (err) {
      setAlertInfo({ type: 'error', message: err.response?.data?.message || 'Failed to generate roadmap' });
    } finally {
      setGenerating(false);
    }
  };

  const handleUpdateProgress = async (stepId, progress) => {
    try {
      setTogglingStepId(stepId);
      const res = await axiosInstance.put(`/roadmaps/${stepId}`, { progress });
      if (res.data.success) {
        setRoadmap(res.data.roadmap);
      }
    } catch (err) {
      setAlertInfo({ type: 'error', message: err.response?.data?.message || 'Failed to update step progress' });
    } finally {
      setTogglingStepId(null);
    }
  };

  const handleUpdateStatus = async (stepId, status) => {
    try {
      setTogglingStepId(stepId);
      const res = await axiosInstance.put(`/roadmaps/${stepId}`, { status });
      if (res.data.success) {
        setRoadmap(res.data.roadmap);
      }
    } catch (err) {
      setAlertInfo({ type: 'error', message: err.response?.data?.message || 'Failed to update step status' });
    } finally {
      setTogglingStepId(null);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen message="Building your personalized career roadmap..." />;
  }

  if (!hasTargetCareer) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16 space-y-6 glass-panel p-8 rounded-3xl border border-slate-800">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-400 mx-auto flex items-center justify-center border border-amber-500/20">
          <Map className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-white">No Target Career Selected</h2>
        <p className="text-slate-400 text-sm max-w-md mx-auto leading-relaxed">
          Please select a target career path to unlock your step-by-step personalized learning milestone roadmap.
        </p>
        <Link
          to="/careers"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-primary text-white font-bold text-sm shadow-lg shadow-blue-600/30 hover:opacity-95 transition-all"
        >
          Browse Target Careers <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  const steps = roadmap?.steps || [];
  const totalSteps = steps.length;
  const completedSteps = steps.filter(s => (s.status || '').toUpperCase() === 'COMPLETED').length;
  const inProgressSteps = steps.filter(s => (s.status || '').toUpperCase() === 'IN_PROGRESS').length;
  const overallProgressPercentage = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
  const targetCareerTitle = careerInfo?.title || roadmap?.career?.title || 'Target Career';

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Top Banner */}
      <div className="glass-panel p-8 rounded-3xl border border-slate-800 bg-gradient-to-r from-amber-950/20 via-slate-900 to-purple-950/20 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
              Personalized Career Plan
            </span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight mt-2">
            Your Personalized Career Roadmap
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Tailored learning path for <strong className="text-amber-300">{targetCareerTitle}</strong> based on your skill gaps.
          </p>
        </div>

        {/* Action button & Gauge */}
        <div className="flex items-center gap-4">
          <div className="glass-card p-4 rounded-2xl border border-slate-800 text-center min-w-[170px]">
            <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">
              Overall Progress
            </span>
            <div className="text-3xl font-black text-amber-400 mt-1">{overallProgressPercentage}%</div>
            <span className="text-xs text-slate-500 mt-0.5 block font-medium">
              {completedSteps} of {totalSteps} Steps Done
            </span>
          </div>

          <button
            onClick={handleGenerateRoadmap}
            disabled={generating}
            className="p-3.5 rounded-2xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-all border border-slate-700"
            title="Regenerate Roadmap"
          >
            <RefreshCw className={`w-5 h-5 ${generating ? 'animate-spin text-amber-400' : ''}`} />
          </button>
        </div>
      </div>

      {alertInfo && <Alert type={alertInfo.type} message={alertInfo.message} onClose={() => setAlertInfo(null)} />}

      {/* Overview Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-semibold block">Total Milestones</span>
            <span className="text-lg font-black text-white">{totalSteps} Steps</span>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-semibold block">In Progress</span>
            <span className="text-lg font-black text-white">{inProgressSteps} Steps</span>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-semibold block">Completed</span>
            <span className="text-lg font-black text-white">{completedSteps} Steps</span>
          </div>
        </div>
      </div>

      {/* Main Roadmap Timeline Component */}
      <RoadmapTimeline
        steps={steps}
        onUpdateProgress={handleUpdateProgress}
        onUpdateStatus={handleUpdateStatus}
        togglingStepId={togglingStepId}
      />
    </div>
  );
};

export default CareerRoadmap;
