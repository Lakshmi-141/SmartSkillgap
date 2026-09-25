import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { analyzeSkillGapApi, getSkillGapApi, addSkillApi } from '../services/api';
import { 
  Target, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  TrendingUp, 
  RefreshCw, 
  Plus, 
  ArrowRight, 
  Check, 
  Sparkles,
  BarChart3,
  HelpCircle,
  Compass
} from 'lucide-react';

const SkillGap = () => {
  const { user } = useAuth();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [addingSkillName, setAddingSkillName] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    document.title = 'SmartSkillGap | Skill Gap Analysis';
    fetchAnalysis();
  }, []);

  const fetchAnalysis = async () => {
    try {
      const data = await getSkillGapApi('me');
      if (data.success && data.analysis) {
        setAnalysis(data.analysis);
      }
    } catch (err) {
      console.error('Failed to load skill gap analysis:', err);
      setMessage({ type: 'error', text: 'Failed to load skill gap report.' });
    } finally {
      setLoading(false);
    }
  };

  const handleReanalyze = async () => {
    setIsAnalyzing(true);
    setMessage({ type: '', text: '' });
    try {
      const data = await analyzeSkillGapApi();
      if (data.success && data.analysis) {
        setAnalysis(data.analysis);
        setMessage({ type: 'success', text: 'Skill gap report re-analyzed with latest MongoDB profile data!' });
      }
    } catch (err) {
      console.error('Re-analysis error:', err);
      setMessage({ type: 'error', text: 'Error re-analyzing skill gap.' });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleQuickAddSkill = async (skillName) => {
    setAddingSkillName(skillName);
    try {
      const data = await addSkillApi({
        name: skillName,
        proficiency: 'Beginner',
        category: 'Technical'
      });
      if (data.success) {
        setMessage({ type: 'success', text: `Added "${skillName}" to your skills! Re-analyzing...` });
        // Automatically re-run analysis to reflect new skill
        await handleReanalyze();
      }
    } catch (err) {
      console.error('Failed to quick add skill:', err);
      setMessage({ type: 'error', text: `Failed to add "${skillName}".` });
    } finally {
      setAddingSkillName(null);
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

  const matchPercentage = analysis?.matchPercentage || 0;
  const matchingSkills = analysis?.matchingSkills || [];
  const skillsToImprove = analysis?.skillsToImprove || [];
  const missingSkills = analysis?.missingSkills || [];
  const totalRequiredCount = analysis?.totalRequiredSkillsCount || (matchingSkills.length + skillsToImprove.length + missingSkills.length);

  return (
    <div className="min-h-screen bg-[#F8FBFF] flex flex-col justify-between font-sans text-[#334155]">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
        
        {/* Header & Target Career Banner */}
        <div className="bg-[#FFFFFF] p-6 sm:p-8 rounded-2xl border border-[#DBEAFE] shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#2563EB] uppercase tracking-wider mb-1">
              <BarChart3 className="w-4 h-4" />
              <span>Deterministic Competency Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E3A8A]">
              Skill Gap Analysis Report
            </h1>
            <p className="text-xs text-[#64748B] mt-1">
              Target Career Goal: <strong className="text-[#1E3A8A] font-bold">{analysis?.targetCareer}</strong>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/careers"
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#1E3A8A] bg-[#EFF6FF] border border-[#DBEAFE] hover:bg-[#DBEAFE] transition-all flex items-center gap-1.5"
            >
              <Compass className="w-4 h-4 text-[#2563EB]" />
              <span>Change Target Career</span>
            </Link>

            <button
              onClick={handleReanalyze}
              disabled={isAnalyzing}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#2563EB] hover:bg-[#1E3A8A] shadow-md shadow-[#2563EB]/25 transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
              <span>{isAnalyzing ? 'Analyzing...' : 'Re-Run Analysis'}</span>
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
            <CheckCircle2 className="w-4 h-4 text-[#2563EB]" />
            <span>{message.text}</span>
          </div>
        )}

        {/* Overall Match Progress Banner */}
        <div className="bg-[#FFFFFF] p-6 sm:p-8 rounded-2xl border border-[#DBEAFE] shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider block">Overall Readiness Score</span>
              <h2 className="text-xl font-extrabold text-[#1E3A8A] mt-0.5">
                {matchPercentage}% Prepared for {analysis?.targetCareer}
              </h2>
            </div>
            <span className="text-2xl font-black text-[#2563EB] bg-[#EFF6FF] px-4 py-1.5 rounded-xl border border-[#DBEAFE]">
              {matchPercentage}%
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-[#EFF6FF] h-4 rounded-full overflow-hidden border border-[#DBEAFE]">
            <div
              className="bg-[#2563EB] h-full rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${matchPercentage}%` }}
            ></div>
          </div>

          <div className="flex justify-between items-center text-xs text-[#64748B]">
            <span>0% (Not Started)</span>
            <span>50% (Intermediate Match)</span>
            <span>100% (Job Ready)</span>
          </div>
        </div>

        {/* Summary Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Matching Card (Blue / Green) */}
          <div className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#DBEAFE] shadow-xs">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-bold text-[#64748B] uppercase">Matching Skills</span>
              <div className="w-9 h-9 rounded-lg bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-[#059669]" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-[#1E3A8A]">{matchingSkills.length}</div>
            <p className="text-xs text-[#059669] font-bold mt-2">Strong / Fully Acquired</p>
          </div>

          {/* Improve Card (Amber) */}
          <div className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#DBEAFE] shadow-xs">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-bold text-[#64748B] uppercase">Skills To Improve</span>
              <div className="w-9 h-9 rounded-lg bg-[#FEF3C7] text-[#D97706] flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-[#1E3A8A]">{skillsToImprove.length}</div>
            <p className="text-xs text-[#D97706] font-bold mt-2">Beginner Level (Needs Upgrade)</p>
          </div>

          {/* Missing Card (Soft Red) */}
          <div className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#DBEAFE] shadow-xs">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-bold text-[#64748B] uppercase">Missing Skills</span>
              <div className="w-9 h-9 rounded-lg bg-[#FEE2E2] text-[#DC2626] flex items-center justify-center">
                <XCircle className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-[#1E3A8A]">{missingSkills.length}</div>
            <p className="text-xs text-[#DC2626] font-bold mt-2">Action Required to Learn</p>
          </div>

          {/* Total Card */}
          <div className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#DBEAFE] shadow-xs">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-bold text-[#64748B] uppercase">Total Required</span>
              <div className="w-9 h-9 rounded-lg bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center">
                <Target className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-[#1E3A8A]">{totalRequiredCount}</div>
            <p className="text-xs text-[#64748B] font-medium mt-2">Industry Standard Skills</p>
          </div>

        </div>

        {/* Categorized Detailed Breakdown Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Column 1: Matching Skills (Blue / Green Status) */}
          <div className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#DBEAFE] shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#DBEAFE]">
              <h3 className="text-base font-bold text-[#1E3A8A] flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#059669]" />
                Matching Skills ({matchingSkills.length})
              </h3>
              <span className="text-xs font-extrabold bg-[#EFF6FF] text-[#2563EB] px-2.5 py-1 rounded-full border border-[#DBEAFE]">
                Strong
              </span>
            </div>

            {matchingSkills.length === 0 ? (
              <p className="text-xs text-[#64748B] italic py-4 text-center">
                No matching core skills identified yet.
              </p>
            ) : (
              <div className="space-y-3">
                {matchingSkills.map((skill, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-[#EFF6FF]/60 rounded-xl border border-[#DBEAFE] flex justify-between items-center"
                  >
                    <div>
                      <span className="text-xs font-bold text-[#1E3A8A] block">{skill.name}</span>
                      <span className="text-[10px] text-[#64748B]">{skill.category}</span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-1 rounded bg-[#FFFFFF] text-[#059669] border border-[#DBEAFE]">
                      {skill.proficiency}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Column 2: Skills To Improve (Amber Status) */}
          <div className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#DBEAFE] shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#DBEAFE]">
              <h3 className="text-base font-bold text-[#1E3A8A] flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-[#D97706]" />
                Skills To Improve ({skillsToImprove.length})
              </h3>
              <span className="text-xs font-extrabold bg-[#FEF3C7] text-[#D97706] px-2.5 py-1 rounded-full border border-amber-200">
                Level Up
              </span>
            </div>

            {skillsToImprove.length === 0 ? (
              <p className="text-xs text-[#64748B] italic py-4 text-center">
                No skills flagged for improvement.
              </p>
            ) : (
              <div className="space-y-3">
                {skillsToImprove.map((skill, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-[#FEF3C7]/40 rounded-xl border border-amber-200 flex justify-between items-center"
                  >
                    <div>
                      <span className="text-xs font-bold text-[#1E3A8A] block">{skill.name}</span>
                      <span className="text-[10px] text-[#64748B]">Needs upgrade to Intermediate+</span>
                    </div>
                    <Link
                      to="/skills"
                      className="text-[10px] font-bold px-2 py-1 rounded bg-[#FFFFFF] text-[#D97706] border border-amber-200 hover:bg-[#FEF3C7]"
                    >
                      {skill.proficiency}
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Column 3: Missing Skills (Soft Red Status with Quick Add Action) */}
          <div className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#DBEAFE] shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#DBEAFE]">
              <h3 className="text-base font-bold text-[#1E3A8A] flex items-center gap-2">
                <XCircle className="w-5 h-5 text-[#DC2626]" />
                Missing Skills ({missingSkills.length})
              </h3>
              <span className="text-xs font-extrabold bg-[#FEE2E2] text-[#DC2626] px-2.5 py-1 rounded-full border border-rose-200">
                Action Required
              </span>
            </div>

            {missingSkills.length === 0 ? (
              <p className="text-xs text-[#059669] font-bold py-4 text-center">
                🎉 Congratulations! You have acquired all required skills!
              </p>
            ) : (
              <div className="space-y-3">
                {missingSkills.map((skill, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-[#FEE2E2]/30 rounded-xl border border-rose-200 flex justify-between items-center hover:border-[#2563EB] transition-colors"
                  >
                    <div>
                      <span className="text-xs font-bold text-[#1E3A8A] block">{skill.name}</span>
                      <span className="text-[10px] text-[#64748B]">{skill.importance} Skill</span>
                    </div>
                    
                    <button
                      onClick={() => handleQuickAddSkill(skill.name)}
                      disabled={addingSkillName === skill.name}
                      aria-label={`Add ${skill.name} to skills`}
                      className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-[#2563EB] text-white hover:bg-[#1E3A8A] shadow-xs flex items-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      <Plus className="w-3 h-3" />
                      <span>{addingSkillName === skill.name ? 'Adding...' : 'Add Skill'}</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
};

export default SkillGap;
