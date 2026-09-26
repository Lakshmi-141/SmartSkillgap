import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { getCareerByIdApi, selectCareerApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Briefcase, 
  CheckCircle2, 
  ArrowLeft, 
  Sparkles, 
  BookOpen, 
  Award, 
  Layers, 
  ChevronRight,
  AlertCircle
} from 'lucide-react';

const CareerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [career, setCareer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selecting, setSelecting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const fetchCareer = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await getCareerByIdApi(id);
        if (res.success) {
          setCareer(res.career);
          document.title = `SmartSkillGap | ${res.career.title}`;
        } else {
          setError(res.message || 'Failed to load career path details.');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Error loading career details.');
      } finally {
        setLoading(false);
      }
    };

    fetchCareer();
  }, [id]);

  const handleSelectCareer = async () => {
    try {
      setSelecting(true);
      setSuccessMsg('');
      const res = await selectCareerApi(career._id || career.title);
      if (res.success) {
        setSuccessMsg(`Target career successfully set to ${career.title}!`);
        setTimeout(() => {
          navigate('/skill-gap');
        }, 1500);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to select target career.');
    } finally {
      setSelecting(false);
    }
  };

  const isCurrentTarget = user?.targetCareer?.toLowerCase() === career?.title?.toLowerCase();

  return (
    <div className="min-h-screen bg-[#F8FBFF] flex flex-col justify-between font-sans">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8 flex-1">
        
        {/* Back link */}
        <Link
          to="/careers"
          className="inline-flex items-center gap-2 text-xs font-bold text-[#2563EB] hover:text-blue-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Careers</span>
        </Link>

        {loading && (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <div className="w-10 h-10 border-4 border-[#2563EB] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-semibold text-[#1E3A8A]">Loading career requirements...</p>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
          </div>
        )}

        {!loading && career && (
          <div className="space-y-8">
            
            {/* Header Banner */}
            <div className="bg-[#FFFFFF] p-8 rounded-3xl border border-[#DBEAFE] shadow-sm space-y-6">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-[#EFF6FF] text-[#2563EB] text-xs font-extrabold rounded-full border border-[#DBEAFE]">
                      {career.category || 'Software Engineering'}
                    </span>
                    {isCurrentTarget && (
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full">
                        Current Target Career
                      </span>
                    )}
                  </div>
                  <h1 className="text-3xl sm:text-4xl font-black text-[#1E3A8A]">
                    {career.title}
                  </h1>
                  <p className="text-sm text-[#475569] max-w-3xl">
                    {career.description}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
                  <button
                    onClick={handleSelectCareer}
                    disabled={selecting || isCurrentTarget}
                    className={`w-full sm:w-auto px-6 py-3.5 rounded-xl font-extrabold text-xs transition-all flex items-center justify-center gap-2 shadow-md ${
                      isCurrentTarget 
                        ? 'bg-emerald-600 text-white cursor-default'
                        : 'bg-[#2563EB] hover:bg-blue-700 text-white shadow-[#2563EB]/20 cursor-pointer'
                    }`}
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>{selecting ? 'Setting Target...' : isCurrentTarget ? 'Selected as Target' : 'Select as My Target Career'}</span>
                  </button>
                  <Link
                    to="/skill-gap"
                    className="w-full sm:w-auto px-6 py-3.5 bg-[#EFF6FF] hover:bg-[#DBEAFE] text-[#1E3A8A] font-bold text-xs rounded-xl border border-[#DBEAFE] transition-all flex items-center justify-center gap-1.5"
                  >
                    <span>Analyze My Gap</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {successMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{successMsg}</span>
                </div>
              )}
            </div>

            {/* Grid 2 Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Required Skills Column (2 cols) */}
              <div className="lg:col-span-2 space-y-6">
                
                <div className="bg-[#FFFFFF] p-6 sm:p-8 rounded-3xl border border-[#DBEAFE] shadow-sm space-y-6">
                  <h2 className="text-xl font-extrabold text-[#1E3A8A] flex items-center gap-2">
                    <Layers className="w-5 h-5 text-[#2563EB]" />
                    <span>Required Competencies & Skills</span>
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {career.requiredSkills && career.requiredSkills.length > 0 ? (
                      career.requiredSkills.map((req, idx) => (
                        <div key={idx} className="p-4 bg-[#F8FBFF] rounded-2xl border border-[#DBEAFE] space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-[#2563EB] bg-[#EFF6FF] px-2 py-0.5 rounded-md border border-[#DBEAFE]">
                              {req.importance || 'Required'}
                            </span>
                            <span className="text-[10px] text-[#64748B] font-semibold">{req.category || 'Technical'}</span>
                          </div>
                          <h3 className="font-extrabold text-[#1E3A8A] text-base">{req.name}</h3>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-[#64748B] italic">No required skills listed.</p>
                    )}
                  </div>

                  {career.recommendedSkills && career.recommendedSkills.length > 0 && (
                    <div className="pt-4 border-t border-[#DBEAFE] space-y-3">
                      <h3 className="text-xs font-extrabold text-[#1E3A8A] uppercase tracking-wider">Recommended Supplementary Skills:</h3>
                      <div className="flex flex-wrap gap-2">
                        {career.recommendedSkills.map((rec, idx) => (
                          <span key={idx} className="px-3 py-1.5 bg-[#EFF6FF] text-[#1E3A8A] border border-[#DBEAFE] text-xs font-semibold rounded-xl">
                            {rec}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

              </div>

              {/* Learning Roadmap Syllabus (1 col) */}
              <div className="space-y-6">
                <div className="bg-[#FFFFFF] p-6 rounded-3xl border border-[#DBEAFE] shadow-sm space-y-4">
                  <h2 className="text-lg font-extrabold text-[#1E3A8A] flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-[#2563EB]" />
                    <span>Learning Roadmap Syllabus</span>
                  </h2>

                  <div className="space-y-3">
                    {career.roadmap && career.roadmap.length > 0 ? (
                      career.roadmap.map((step, idx) => (
                        <div key={idx} className="p-3.5 bg-[#F8FBFF] rounded-2xl border border-[#DBEAFE] space-y-1 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-[#2563EB] text-white flex items-center justify-center font-bold text-[10px]">
                              {step.step || idx + 1}
                            </span>
                            <h4 className="font-extrabold text-[#1E3A8A]">{step.title}</h4>
                          </div>
                          {step.description && <p className="text-[11px] text-[#475569] pl-7">{step.description}</p>}
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-[#64748B] italic">Standard curriculum generated upon roadmap generation.</p>
                    )}
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

      </main>

      <Footer />
    </div>
  );
};

export default CareerDetail;
