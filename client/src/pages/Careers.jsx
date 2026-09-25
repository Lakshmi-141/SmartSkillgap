import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { getCareersApi, selectCareerApi } from '../services/api';
import { 
  Compass, 
  Search, 
  Target, 
  CheckCircle2, 
  Map, 
  ArrowRight, 
  Sparkles, 
  X, 
  Check, 
  AlertCircle,
  BookOpen,
  Layers,
  ChevronRight
} from 'lucide-react';

const Careers = () => {
  const { user, login } = useAuth(); // for context sync if needed
  const [careers, setCareers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedCareer, setSelectedCareer] = useState(null); // modal view
  const [activeUserTarget, setActiveUserTarget] = useState(user?.targetCareer || 'Full Stack Web Developer');
  const [isSelecting, setIsSelecting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    document.title = 'SmartSkillGap | Career Paths & Required Skills';
    fetchCareers();
  }, []);

  useEffect(() => {
    if (user?.targetCareer) {
      setActiveUserTarget(user.targetCareer);
    }
  }, [user]);

  const fetchCareers = async (search = '') => {
    try {
      const data = await getCareersApi(search);
      if (data.success) {
        setCareers(data.careers || []);
      }
    } catch (err) {
      console.error('Failed to fetch careers:', err);
      setMessage({ type: 'error', text: 'Failed to load career paths.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    fetchCareers(value);
  };

  const handleSelectTargetCareer = async (career) => {
    setMessage({ type: '', text: '' });
    setIsSelecting(true);

    try {
      const data = await selectCareerApi(career._id);
      if (data.success) {
        setActiveUserTarget(career.title);
        setMessage({
          type: 'success',
          text: `"${career.title}" set as your active Target Career Goal!`
        });
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to select career.' });
      }
    } catch (err) {
      console.error('Error selecting career:', err);
      setMessage({ type: 'error', text: 'Error selecting career path.' });
    } finally {
      setIsSelecting(false);
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

  return (
    <div className="min-h-screen bg-[#F8FBFF] flex flex-col justify-between font-sans text-[#334155]">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
        
        {/* Header Banner */}
        <div className="bg-[#FFFFFF] p-6 sm:p-8 rounded-2xl border border-[#DBEAFE] shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#2563EB] uppercase tracking-wider mb-1">
              <Compass className="w-4 h-4" />
              <span>Career Database & Industry Standards</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E3A8A]">
              Explore Career Paths ({careers.length})
            </h1>
            <p className="text-xs text-[#64748B] mt-1">
              Discover in-demand roles, required technical skills, and structured learning roadmaps.
            </p>
          </div>

          {/* Active Target Banner */}
          <div className="bg-[#EFF6FF] p-4 rounded-xl border border-[#DBEAFE] flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-lg bg-[#2563EB] text-white flex items-center justify-center">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-[#64748B] uppercase block">Active Target Goal</span>
              <span className="text-sm font-extrabold text-[#1E3A8A]">{activeUserTarget}</span>
            </div>
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

        {/* Search Bar & Filter */}
        <div className="bg-[#FFFFFF] p-4 sm:p-6 rounded-2xl border border-[#DBEAFE] shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative w-full">
            <Search className="w-5 h-5 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search careers by title, skills (e.g. React, DevOps, Python, AWS)..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full pl-11 pr-4 py-3 bg-[#F8FBFF] border border-[#DBEAFE] rounded-xl text-sm text-[#334155] focus:outline-none focus:border-[#2563EB]"
            />
          </div>
        </div>

        {/* Career Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {careers.map((career) => {
            const isSelected = activeUserTarget === career.title;

            return (
              <div
                key={career._id}
                className={`bg-[#FFFFFF] p-6 rounded-2xl border transition-all flex flex-col justify-between space-y-6 ${
                  isSelected
                    ? 'border-[#2563EB] ring-2 ring-[#2563EB]/20 shadow-lg'
                    : 'border-[#DBEAFE] hover:border-[#2563EB] shadow-sm hover:shadow-md'
                }`}
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="text-xl font-extrabold text-[#1E3A8A]">{career.title}</h3>
                    {isSelected && (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-[#2563EB] text-white flex items-center gap-1 shrink-0">
                        <Check className="w-3 h-3" />
                        Target Goal
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-[#64748B] leading-relaxed line-clamp-3">
                    {career.description}
                  </p>

                  {/* Required Skills Badges */}
                  <div>
                    <span className="text-[11px] font-bold text-[#1E3A8A] uppercase tracking-wider block mb-2">
                      Required Skills ({career.requiredSkills?.length || 0}):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {career.requiredSkills?.slice(0, 5).map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-[#EFF6FF] text-[#2563EB] border border-[#DBEAFE]"
                        >
                          {skill.name}
                        </span>
                      ))}
                      {career.requiredSkills?.length > 5 && (
                        <span className="px-2 py-1 rounded-md text-[10px] font-bold bg-[#F8FBFF] text-[#64748B] border border-[#DBEAFE]">
                          +{career.requiredSkills.length - 5} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#DBEAFE] flex items-center justify-between gap-3">
                  <button
                    onClick={() => setSelectedCareer(career)}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#1E3A8A] bg-[#EFF6FF] hover:bg-[#DBEAFE] transition-all flex items-center gap-1.5"
                  >
                    <span>View Details</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleSelectTargetCareer(career)}
                    disabled={isSelecting || isSelected}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-[#EFF6FF] text-[#2563EB] border border-[#DBEAFE] cursor-default'
                        : 'bg-[#2563EB] text-white hover:bg-[#1E3A8A] shadow-md shadow-[#2563EB]/25 cursor-pointer'
                    }`}
                  >
                    {isSelected ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Selected</span>
                      </>
                    ) : (
                      <span>Select Goal</span>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Career Details Modal */}
        {selectedCareer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#334155]/40 backdrop-blur-xs">
            <div className="bg-[#FFFFFF] rounded-2xl border border-[#DBEAFE] shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in duration-200">
              
              {/* Modal Header */}
              <div className="flex justify-between items-start pb-4 border-b border-[#DBEAFE]">
                <div>
                  <span className="text-xs font-bold text-[#2563EB] uppercase tracking-wider bg-[#EFF6FF] px-3 py-1 rounded-full border border-[#DBEAFE]">
                    Career Blueprint & Roadmap
                  </span>
                  <h2 className="text-2xl font-extrabold text-[#1E3A8A] mt-2">
                    {selectedCareer.title}
                  </h2>
                </div>
                <button
                  onClick={() => setSelectedCareer(null)}
                  className="p-2 rounded-xl text-[#64748B] hover:bg-[#EFF6FF] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Description */}
              <p className="text-sm text-[#64748B] leading-relaxed">
                {selectedCareer.description}
              </p>

              {/* Required Skills Section */}
              <div className="bg-[#F8FBFF] p-5 rounded-xl border border-[#DBEAFE]">
                <h3 className="text-sm font-bold text-[#1E3A8A] mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#2563EB]" />
                  Required Core Technical Skills ({selectedCareer.requiredSkills?.length})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedCareer.requiredSkills?.map((skill, idx) => (
                    <div key={idx} className="bg-[#FFFFFF] p-3 rounded-lg border border-[#DBEAFE] flex justify-between items-center">
                      <span className="text-xs font-semibold text-[#334155]">{skill.name}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#EFF6FF] text-[#2563EB] border border-[#DBEAFE]">
                        {skill.importance || 'Required'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended Skills Section */}
              {selectedCareer.recommendedSkills?.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-[#1E3A8A] mb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#2563EB]" />
                    Recommended Secondary Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedCareer.recommendedSkills.map((rec, i) => (
                      <span key={i} className="px-3 py-1 bg-[#FFFFFF] border border-[#DBEAFE] rounded-lg text-xs font-semibold text-[#334155]">
                        {rec}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Learning Roadmap Steps */}
              {selectedCareer.roadmap?.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-[#1E3A8A] mb-4 flex items-center gap-2">
                    <Map className="w-4 h-4 text-[#2563EB]" />
                    Learning Roadmap Progression
                  </h3>
                  <div className="space-y-4">
                    {selectedCareer.roadmap.map((step) => (
                      <div key={step.step} className="p-4 bg-[#FFFFFF] rounded-xl border border-[#DBEAFE] flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-[#2563EB] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                          {step.step}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-[#1E3A8A]">{step.title}</h4>
                          <p className="text-xs text-[#64748B] mt-1">{step.description}</p>
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {step.skills?.map((s, i) => (
                              <span key={i} className="text-[10px] font-semibold bg-[#EFF6FF] text-[#2563EB] px-2 py-0.5 rounded border border-[#DBEAFE]">
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Modal Footer Actions */}
              <div className="pt-4 border-t border-[#DBEAFE] flex justify-end gap-3">
                <button
                  onClick={() => setSelectedCareer(null)}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-[#334155] bg-[#F8FBFF] border border-[#DBEAFE] hover:bg-[#EFF6FF]"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    handleSelectTargetCareer(selectedCareer);
                    setSelectedCareer(null);
                  }}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-[#2563EB] hover:bg-[#1E3A8A] shadow-md shadow-[#2563EB]/25 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Target className="w-4 h-4" />
                  <span>Select as Target Career Goal</span>
                </button>
              </div>

            </div>
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
};

export default Careers;
