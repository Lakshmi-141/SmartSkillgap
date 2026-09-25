import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { getCareersApi, compareCareersApi, selectCareerApi } from '../services/api';
import { 
  BarChart3, 
  CheckCircle2, 
  AlertCircle, 
  Zap, 
  Check, 
  Sparkles, 
  RefreshCw, 
  ArrowRight,
  ShieldCheck,
  Target,
  Briefcase,
  Layers,
  Info
} from 'lucide-react';

const DEFAULT_SELECTIONS = ['Full Stack Developer', 'Data Analyst', 'Cloud Engineer'];

const CareerComparison = () => {
  const { user, updateUser } = useAuth();
  const [allCareers, setAllCareers] = useState([]);
  const [selectedTitles, setSelectedTitles] = useState(DEFAULT_SELECTIONS);
  const [comparisonResults, setComparisonResults] = useState([]);
  const [userSkillsCount, setUserSkillsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [comparing, setComparing] = useState(false);
  const [error, setError] = useState('');
  const [selectingId, setSelectingId] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  // Fetch available careers list on mount
  useEffect(() => {
    document.title = 'SmartSkillGap | Career Skill Comparison';
    loadCareers();
  }, []);

  // Run comparison whenever selectedTitles changes
  useEffect(() => {
    if (selectedTitles.length > 0) {
      runComparison(selectedTitles);
    } else {
      setComparisonResults([]);
    }
  }, [selectedTitles]);

  const loadCareers = async () => {
    try {
      setLoading(true);
      const res = await getCareersApi();
      if (res.success && res.careers) {
        setAllCareers(res.careers);
      }
    } catch (err) {
      console.error('Failed to load careers:', err);
      setError('Unable to load available career paths');
    } finally {
      setLoading(false);
    }
  };

  const runComparison = async (titles) => {
    try {
      setComparing(true);
      setError('');
      const res = await compareCareersApi(titles);
      if (res.success) {
        setComparisonResults(res.comparedCareers || []);
        setUserSkillsCount(res.userSkillsCount || 0);
      } else {
        setError(res.message || 'Failed to compare careers');
      }
    } catch (err) {
      console.error('Error running career comparison:', err);
      setError('Failed to fetch career comparison data');
    } finally {
      setComparing(false);
    }
  };

  const toggleCareerSelection = (title) => {
    if (selectedTitles.includes(title)) {
      if (selectedTitles.length <= 1) {
        setError('Please select at least 1 career to view comparison data.');
        return;
      }
      setSelectedTitles(selectedTitles.filter(t => t !== title));
    } else {
      if (selectedTitles.length >= 4) {
        setError('You can compare up to 4 careers simultaneously.');
        return;
      }
      setSelectedTitles([...selectedTitles, title]);
    }
  };

  const handleSelectTargetCareer = async (careerId, careerTitle) => {
    try {
      setSelectingId(careerId);
      setError('');
      const res = await selectCareerApi(careerId);
      if (res.success) {
        setSuccessMsg(`Target career updated to "${careerTitle}"!`);
        if (updateUser) {
          updateUser(res.user);
        }
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      console.error('Failed to set target career:', err);
      setError('Failed to set target career. Please try again.');
    } finally {
      setSelectingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FBFF] flex flex-col justify-between font-sans">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8 flex-1">
        
        {/* Header Section */}
        <div className="bg-[#FFFFFF] p-6 sm:p-8 rounded-3xl border border-[#DBEAFE] shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-[#EFF6FF] text-[#2563EB] border border-[#DBEAFE] flex items-center gap-1">
                <BarChart3 className="w-3.5 h-3.5 text-[#2563EB]" />
                Side-by-Side Analysis
              </span>
              <span className="text-xs font-semibold text-[#64748B]">Factual Skill Matrix</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E3A8A] mt-2">
              Career Skill Comparison
            </h1>
            <p className="text-sm text-[#475569] mt-1">
              Compare your current skills ({userSkillsCount} added) against multiple tech roles objectively.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <Link
              to="/skills"
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#1E3A8A] bg-[#EFF6FF] hover:bg-[#DBEAFE] border border-[#DBEAFE] transition-all flex items-center gap-1.5"
            >
              <span>Manage Skills</span>
            </Link>
            <Link
              to="/careers"
              className="px-4 py-2.5 rounded-xl text-xs font-extrabold text-white bg-[#2563EB] hover:bg-blue-700 shadow-md shadow-[#2563EB]/20 transition-all flex items-center gap-1.5"
            >
              <Briefcase className="w-4 h-4" />
              <span>Browse All Careers</span>
            </Link>
          </div>
        </div>

        {/* Factual Disclaimer Banner */}
        <div className="p-4 bg-[#FFFFFF] border border-[#DBEAFE] rounded-2xl flex items-start gap-3 shadow-2xs">
          <Info className="w-5 h-5 text-[#2563EB] shrink-0 mt-0.5" />
          <div className="text-xs text-[#334155] space-y-0.5">
            <p className="font-extrabold text-[#1E3A8A]">Factual Skill Comparison Guarantee</p>
            <p className="text-[#64748B]">
              This matrix provides objective skill matches based strictly on your profile data and official career requirements. No career is rated as "best" or "worst" — review the factual data to find the path that aligns with your goals.
            </p>
          </div>
        </div>

        {/* Feedback Messages */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
            <button onClick={() => setError('')} className="font-bold text-xs">Dismiss</button>
          </div>
        )}

        {successMsg && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span className="font-bold">{successMsg}</span>
            </div>
            <button onClick={() => setSuccessMsg('')} className="font-bold text-xs">Dismiss</button>
          </div>
        )}

        {/* Career Selection Checklist */}
        <div className="bg-[#FFFFFF] p-6 rounded-3xl border border-[#DBEAFE] shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-[#DBEAFE]">
            <div>
              <h2 className="text-base font-extrabold text-[#1E3A8A] flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#2563EB]" />
                <span>Select Careers to Compare (1 to 4 roles)</span>
              </h2>
              <p className="text-xs text-[#64748B]">Toggle roles below to dynamically compare skill requirements side-by-side</p>
            </div>
            <span className="text-xs font-bold text-[#2563EB] bg-[#EFF6FF] px-2.5 py-1 rounded-lg border border-[#DBEAFE]">
              {selectedTitles.length} Selected
            </span>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {allCareers.map((car) => {
              const isSelected = selectedTitles.includes(car.title);
              return (
                <button
                  key={car._id || car.title}
                  onClick={() => toggleCareerSelection(car.title)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 cursor-pointer ${
                    isSelected
                      ? 'bg-[#2563EB] text-white border-[#2563EB] shadow-xs'
                      : 'bg-[#F8FBFF] text-[#334155] border-[#DBEAFE] hover:bg-[#EFF6FF] hover:border-[#2563EB]'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ${
                    isSelected ? 'bg-white border-white text-[#2563EB]' : 'border-[#CBD5E1] bg-white'
                  }`}>
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <span>{car.title}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Comparison Results Grid */}
        {comparing ? (
          <div className="text-center py-16 bg-[#FFFFFF] rounded-3xl border border-[#DBEAFE] space-y-3">
            <RefreshCw className="w-8 h-8 text-[#2563EB] animate-spin mx-auto" />
            <p className="text-sm font-bold text-[#1E3A8A]">Calculating Factual Skill Comparisons...</p>
          </div>
        ) : (
          <div className={`grid grid-cols-1 ${
            comparisonResults.length === 1 
              ? 'max-w-2xl mx-auto' 
              : comparisonResults.length === 2 
              ? 'md:grid-cols-2' 
              : comparisonResults.length === 3 
              ? 'md:grid-cols-3' 
              : 'md:grid-cols-2 lg:grid-cols-4'
          } gap-6`}>
            
            {comparisonResults.map((result) => {
              const isUserTarget = user?.targetCareer?.toLowerCase() === result.title.toLowerCase();

              return (
                <div 
                  key={result.careerId || result.title}
                  className={`bg-[#FFFFFF] p-6 rounded-3xl border shadow-sm flex flex-col justify-between space-y-6 transition-all relative ${
                    isUserTarget ? 'border-[#2563EB] ring-2 ring-[#2563EB]/20' : 'border-[#DBEAFE]'
                  }`}
                >
                  {/* Career Header & Target Badge */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-start gap-2">
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider bg-[#EFF6FF] text-[#2563EB] border border-[#DBEAFE]">
                        Career Path
                      </span>
                      {isUserTarget && (
                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Current Target
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="text-xl font-extrabold text-[#1E3A8A]">{result.title}</h3>
                      <p className="text-xs text-[#64748B] mt-1 line-clamp-2">{result.description}</p>
                    </div>

                    {/* Skill Match % Card Meter */}
                    <div className="bg-[#F8FBFF] p-4 rounded-2xl border border-[#DBEAFE] space-y-2">
                      <div className="flex justify-between items-baseline">
                        <span className="text-xs font-bold text-[#1E3A8A]">Skill Match Score</span>
                        <span className="text-2xl font-black text-[#2563EB]">{result.matchPercentage}%</span>
                      </div>
                      <div className="w-full bg-[#EFF6FF] h-2.5 rounded-full overflow-hidden border border-[#DBEAFE]">
                        <div 
                          className="bg-[#2563EB] h-full rounded-full transition-all duration-500" 
                          style={{ width: `${result.matchPercentage}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-[11px] text-[#64748B] pt-0.5">
                        <span>{result.matchingSkillsCount} matching</span>
                        <span>{result.requiredSkillsCount} required total</span>
                      </div>
                    </div>

                    {/* Skill Categorization Breakdown */}
                    
                    {/* Matching Skills */}
                    <div className="space-y-2 pt-2">
                      <div className="flex justify-between items-center text-xs font-extrabold text-emerald-800">
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          Matching Skills ({result.matchingSkillsCount})
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {result.matchingSkills && result.matchingSkills.length > 0 ? (
                          result.matchingSkills.map((sk, idx) => (
                            <span key={idx} className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold rounded-lg">
                              {typeof sk === 'object' ? sk.name : sk}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-[#64748B] italic">No matching skills</span>
                        )}
                      </div>
                    </div>

                    {/* Skills to Improve */}
                    <div className="space-y-2 pt-2">
                      <div className="flex justify-between items-center text-xs font-extrabold text-amber-800">
                        <span className="flex items-center gap-1">
                          <AlertCircle className="w-4 h-4 text-amber-600" />
                          Skills To Improve ({result.skillsToImproveCount})
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {result.skillsToImprove && result.skillsToImprove.length > 0 ? (
                          result.skillsToImprove.map((sk, idx) => (
                            <span key={idx} className="px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold rounded-lg">
                              {typeof sk === 'object' ? sk.name : sk}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-[#64748B] italic">None to improve</span>
                        )}
                      </div>
                    </div>

                    {/* Missing Skills */}
                    <div className="space-y-2 pt-2">
                      <div className="flex justify-between items-center text-xs font-extrabold text-rose-800">
                        <span className="flex items-center gap-1">
                          <Zap className="w-4 h-4 text-rose-600" />
                          Missing Skills ({result.missingSkillsCount})
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {result.missingSkills && result.missingSkills.length > 0 ? (
                          result.missingSkills.map((sk, idx) => (
                            <span key={idx} className="px-2.5 py-1 bg-rose-50 text-rose-800 border border-rose-200 text-xs font-semibold rounded-lg">
                              {typeof sk === 'object' ? sk.name : sk}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-[#64748B] italic">No missing skills</span>
                        )}
                      </div>
                    </div>

                    {/* All Required Skills List */}
                    <div className="space-y-2 pt-3 border-t border-[#DBEAFE]">
                      <span className="text-[11px] font-extrabold text-[#1E3A8A] uppercase tracking-wider block">
                        All Required Skills ({result.requiredSkillsCount})
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {result.requiredSkills.map((req, i) => {
                          const name = typeof req === 'object' ? req.name : req;
                          const minProf = typeof req === 'object' ? req.minimumProficiency : 'Beginner';
                          return (
                            <span key={i} className="px-2 py-0.5 bg-[#F8FBFF] text-[#334155] border border-[#DBEAFE] text-[11px] rounded-md">
                              {name} <span className="text-[#64748B] font-medium">({minProf})</span>
                            </span>
                          );
                        })}
                      </div>
                    </div>

                  </div>

                  {/* Set as Target Career Action Button */}
                  <div className="pt-4 border-t border-[#DBEAFE]">
                    {isUserTarget ? (
                      <button 
                        disabled 
                        className="w-full py-2.5 px-4 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-xl border border-emerald-200 flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Selected Target Career
                      </button>
                    ) : (
                      <button
                        onClick={() => handleSelectTargetCareer(result.careerId, result.title)}
                        disabled={selectingId === result.careerId}
                        className="w-full py-2.5 px-4 bg-[#2563EB] hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        {selectingId === result.careerId ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Target className="w-4 h-4" />
                            <span>Select as Target Career</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>

                </div>
              );
            })}

          </div>
        )}

      </main>

      <Footer />
    </div>
  );
};

export default CareerComparison;
