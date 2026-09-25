import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { getRoadmapApi, generateRoadmapApi, updateRoadmapProgressApi } from '../services/api';
import { 
  Map, 
  CheckCircle2, 
  Clock, 
  BookOpen, 
  Award, 
  RefreshCw, 
  ExternalLink, 
  Layers, 
  Check, 
  PlayCircle, 
  Circle,
  Compass,
  AlertCircle
} from 'lucide-react';

const Roadmap = () => {
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [updatingPhaseNum, setUpdatingPhaseNum] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    document.title = 'SmartSkillGap | Personalized Career Roadmap';
    fetchRoadmap();
  }, []);

  const fetchRoadmap = async () => {
    try {
      const data = await getRoadmapApi('me');
      if (data.success && data.roadmap) {
        setRoadmap(data.roadmap);
      }
    } catch (err) {
      console.error('Failed to load roadmap:', err);
      setMessage({ type: 'error', text: 'Failed to load career roadmap.' });
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerateRoadmap = async () => {
    setIsGenerating(true);
    setMessage({ type: '', text: '' });
    try {
      const data = await generateRoadmapApi();
      if (data.success && data.roadmap) {
        setRoadmap(data.roadmap);
        setMessage({ type: 'success', text: 'Personalized roadmap regenerated with latest profile skills!' });
      }
    } catch (err) {
      console.error('Error generating roadmap:', err);
      setMessage({ type: 'error', text: 'Error regenerating roadmap.' });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStatusChange = async (phaseNumber, newStatus) => {
    if (!roadmap) return;
    setUpdatingPhaseNum(phaseNumber);
    setMessage({ type: '', text: '' });

    try {
      const data = await updateRoadmapProgressApi(roadmap._id, phaseNumber, newStatus);
      if (data.success && data.roadmap) {
        setRoadmap(data.roadmap);
        setMessage({ type: 'success', text: `Phase status updated to "${newStatus}"!` });
      }
    } catch (err) {
      console.error('Error updating status:', err);
      setMessage({ type: 'error', text: 'Failed to update phase status.' });
    } finally {
      setUpdatingPhaseNum(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FBFF] flex flex-col justify-between font-sans">
        <Navbar />
        <div className="flex justify-center items-center py-24">
          <div className="w-10 h-10 border-4 border-[#2563EB] border-t-transparent rounded-full animate-spin"></div>
        </div>
        <Footer />
      </div>
    );
  }

  const phases = roadmap?.phases || [];
  const overallProgress = roadmap?.overallProgress || 0;
  const targetCareer = roadmap?.targetCareer || 'Full Stack Developer';

  return (
    <div className="min-h-screen bg-[#F8FBFF] flex flex-col justify-between font-sans text-[#334155]">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
        
        {/* Header & Target Career Banner */}
        <div className="bg-[#FFFFFF] p-6 sm:p-8 rounded-2xl border border-[#DBEAFE] shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#2563EB] uppercase tracking-wider mb-1">
              <Map className="w-4 h-4" />
              <span>Personalized Learning Pathway</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E3A8A]">
              Career Roadmap: {targetCareer}
            </h1>
            <p className="text-xs text-[#64748B] mt-1">
              Step-by-step milestones tailored to bridge your skill gap and achieve career readiness.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/careers"
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#1E3A8A] bg-[#EFF6FF] border border-[#DBEAFE] hover:bg-[#DBEAFE] transition-all flex items-center gap-1.5"
            >
              <Compass className="w-4 h-4 text-[#2563EB]" />
              <span>Change Career</span>
            </Link>

            <button
              onClick={handleRegenerateRoadmap}
              disabled={isGenerating}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#2563EB] hover:bg-[#1E3A8A] shadow-md shadow-[#2563EB]/25 transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>{isGenerating ? 'Generating...' : 'Regenerate Roadmap'}</span>
            </button>
          </div>
        </div>

        {/* Message Banner */}
        {message.text && (
          <div
            className={`p-4 rounded-xl border flex items-center gap-3 text-xs font-medium ${
              message.type === 'success'
                ? 'bg-[#EFF6FF] border-[#DBEAFE] text-[#1E3A8A]'
                : 'bg-rose-50 border-rose-200 text-rose-700'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-[#2563EB]" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* Overall Completion Meter */}
        <div className="bg-[#FFFFFF] p-6 sm:p-8 rounded-2xl border border-[#DBEAFE] shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider block">Roadmap Completion</span>
              <h2 className="text-xl font-extrabold text-[#1E3A8A] mt-0.5">
                {overallProgress}% Overall Progress Completed
              </h2>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs text-[#64748B] font-semibold">
                {phases.filter(p => p.status === 'Completed').length} of {phases.length} Phases Completed
              </span>
              <span className="text-2xl font-black text-[#2563EB] bg-[#EFF6FF] px-4 py-1 rounded-xl border border-[#DBEAFE]">
                {overallProgress}%
              </span>
            </div>
          </div>

          <div className="w-full bg-[#EFF6FF] h-4 rounded-full overflow-hidden border border-[#DBEAFE]">
            <div
              className="bg-[#2563EB] h-full rounded-full transition-all duration-700 ease-out"
              style={{ width: `${overallProgress}%` }}
            ></div>
          </div>
        </div>

        {/* Timeline Phases Container */}
        <div className="space-y-6">
          {phases.map((phase) => {
            const isCompleted = phase.status === 'Completed';
            const isInProgress = phase.status === 'In Progress';
            const isNotStarted = phase.status === 'Not Started';

            // Card Border & Status Accents
            let cardClasses = 'bg-[#FFFFFF] border-[#DBEAFE] shadow-sm';
            let badgeClasses = 'bg-[#F8FBFF] text-[#64748B] border-[#DBEAFE]';
            let iconColor = 'text-[#64748B]';

            if (isCompleted) {
              cardClasses = 'bg-[#FFFFFF] border-emerald-300 shadow-sm ring-1 ring-emerald-400/20';
              badgeClasses = 'bg-emerald-50 text-[#059669] border-emerald-200';
              iconColor = 'text-[#059669]';
            } else if (isInProgress) {
              cardClasses = 'bg-[#FFFFFF] border-[#2563EB] shadow-md ring-1 ring-[#2563EB]/20';
              badgeClasses = 'bg-[#EFF6FF] text-[#2563EB] border-[#DBEAFE]';
              iconColor = 'text-[#2563EB]';
            }

            return (
              <div
                key={phase._id || phase.phaseNumber}
                className={`p-6 sm:p-8 rounded-2xl border transition-all ${cardClasses}`}
              >
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 pb-6 mb-6 border-b border-[#DBEAFE]">
                  <div className="flex items-start gap-4">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-extrabold text-base shrink-0 shadow-xs ${
                      isCompleted ? 'bg-[#059669] text-white' : isInProgress ? 'bg-[#2563EB] text-white' : 'bg-[#EFF6FF] text-[#1E3A8A] border border-[#DBEAFE]'
                    }`}>
                      {phase.phaseNumber}
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className={`px-3 py-0.5 rounded-full text-xs font-bold border flex items-center gap-1 ${badgeClasses}`}>
                          {isCompleted && <CheckCircle2 className="w-3.5 h-3.5 text-[#059669]" />}
                          {isInProgress && <PlayCircle className="w-3.5 h-3.5 text-[#2563EB]" />}
                          {isNotStarted && <Circle className="w-3.5 h-3.5 text-[#64748B]" />}
                          <span>{phase.status}</span>
                        </span>
                        <span className="text-xs text-[#64748B] flex items-center gap-1 font-medium">
                          <Clock className="w-3.5 h-3.5" />
                          Est. Time: {phase.estimatedTime || '1 Week'}
                        </span>
                      </div>

                      <h3 className="text-xl font-extrabold text-[#1E3A8A]">{phase.title}</h3>
                      <p className="text-xs text-[#64748B] mt-1">{phase.description}</p>
                    </div>
                  </div>

                  {/* Interactive Status Selector Buttons */}
                  <div className="flex items-center gap-1.5 bg-[#F8FBFF] p-1.5 rounded-xl border border-[#DBEAFE] shrink-0">
                    <button
                      onClick={() => handleStatusChange(phase.phaseNumber, 'Not Started')}
                      disabled={updatingPhaseNum === phase.phaseNumber}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        isNotStarted ? 'bg-[#FFFFFF] text-[#1E3A8A] shadow-xs' : 'text-[#64748B] hover:bg-[#EFF6FF]'
                      }`}
                    >
                      Not Started
                    </button>
                    <button
                      onClick={() => handleStatusChange(phase.phaseNumber, 'In Progress')}
                      disabled={updatingPhaseNum === phase.phaseNumber}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        isInProgress ? 'bg-[#2563EB] text-white shadow-xs' : 'text-[#64748B] hover:bg-[#EFF6FF]'
                      }`}
                    >
                      In Progress
                    </button>
                    <button
                      onClick={() => handleStatusChange(phase.phaseNumber, 'Completed')}
                      disabled={updatingPhaseNum === phase.phaseNumber}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        isCompleted ? 'bg-[#059669] text-white shadow-xs' : 'text-[#64748B] hover:bg-[#EFF6FF]'
                      }`}
                    >
                      Completed
                    </button>
                  </div>
                </div>

                {/* Content Details: Objectives, Prerequisites, Resources */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
                  
                  {/* Objectives */}
                  <div>
                    <span className="font-bold text-[#1E3A8A] uppercase tracking-wider block mb-2">
                      Learning Objectives:
                    </span>
                    <ul className="space-y-1.5">
                      {phase.learningObjectives?.map((obj, i) => (
                        <li key={i} className="flex items-start gap-2 text-[#334155]">
                          <Check className="w-3.5 h-3.5 text-[#2563EB] shrink-0 mt-0.5" />
                          <span>{obj}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Prerequisites */}
                  <div>
                    <span className="font-bold text-[#1E3A8A] uppercase tracking-wider block mb-2">
                      Prerequisites:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {phase.prerequisites?.map((pre, i) => (
                        <span key={i} className="px-2.5 py-1 rounded bg-[#EFF6FF] text-[#1E3A8A] border border-[#DBEAFE] font-medium">
                          {pre}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Curated Resources */}
                  <div>
                    <span className="font-bold text-[#1E3A8A] uppercase tracking-wider block mb-2">
                      Curated Resources:
                    </span>
                    <div className="space-y-1.5">
                      {phase.resources?.map((res, i) => (
                        <a
                          key={i}
                          href={res.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 bg-[#F8FBFF] border border-[#DBEAFE] rounded-lg flex items-center justify-between text-[#2563EB] font-bold hover:bg-[#EFF6FF] transition-colors group"
                        >
                          <span className="truncate">{res.title}</span>
                          <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform shrink-0 ml-1" />
                        </a>
                      ))}
                    </div>
                  </div>

                </div>
              </div>
            );
          })}
        </div>

      </main>

      <Footer />
    </div>
  );
};

export default Roadmap;
