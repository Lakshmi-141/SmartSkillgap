import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { getAssessmentsApi, getAssessmentByIdApi, submitAssessmentApi, getMyAssessmentResultsApi } from '../services/api';
import { 
  Award, 
  CheckCircle2, 
  HelpCircle, 
  Sparkles, 
  Clock, 
  ArrowRight, 
  AlertCircle, 
  RefreshCw,
  FileCheck,
  ChevronRight
} from 'lucide-react';

const Assessment = () => {
  const [assessments, setAssessments] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Active quiz state
  const [activeAssessment, setActiveAssessment] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const [resAss, resRes] = await Promise.all([
        getAssessmentsApi(),
        getMyAssessmentResultsApi()
      ]);

      if (resAss.success) setAssessments(resAss.assessments || []);
      if (resRes.success) setResults(resRes.results || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load assessments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = 'SmartSkillGap | Skill Assessments';
    fetchData();
  }, []);

  const handleStartAssessment = async (id) => {
    try {
      setLoading(true);
      setError('');
      const res = await getAssessmentByIdApi(id);
      if (res.success) {
        setActiveAssessment(res.assessment);
        setUserAnswers({});
        setEvaluationResult(null);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch assessment questions.');
    } finally {
      setLoading(false);
    }
  };

  const handleOptionSelect = (questionIndex, optionIndex) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionIndex]: optionIndex
    }));
  };

  const handleSubmitQuiz = async (e) => {
    e.preventDefault();
    if (!activeAssessment) return;

    try {
      setSubmitting(true);
      setError('');
      const res = await submitAssessmentApi(activeAssessment._id, userAnswers);
      if (res.success) {
        setEvaluationResult(res.result);
        // Refresh past results list
        const resRes = await getMyAssessmentResultsApi();
        if (resRes.success) setResults(resRes.results || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to evaluate assessment submission.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FBFF] flex flex-col justify-between font-sans">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8 flex-1">
        
        {/* Header Banner */}
        <div className="bg-[#FFFFFF] p-6 sm:p-8 rounded-3xl border border-[#DBEAFE] shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-[#EFF6FF] text-[#2563EB] text-xs font-extrabold rounded-full border border-[#DBEAFE]">
                Skill Proficiency Verification
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E3A8A] mt-1">
              Skill Assessments
            </h1>
            <p className="text-xs text-[#475569] mt-0.5">
              Take interactive skill evaluations to measure your true technical proficiency and earn readiness points.
            </p>
          </div>

          {activeAssessment && (
            <button
              onClick={() => {
                setActiveAssessment(null);
                setEvaluationResult(null);
              }}
              className="px-4 py-2 bg-[#EFF6FF] text-[#1E3A8A] border border-[#DBEAFE] font-bold text-xs rounded-xl hover:bg-[#DBEAFE] transition-all"
            >
              Exit Assessment
            </button>
          )}
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* MODE 1: Active Assessment Test / Quiz Execution */}
        {activeAssessment ? (
          <div className="space-y-8">
            
            {/* Quiz Result View */}
            {evaluationResult ? (
              <div className="bg-[#FFFFFF] p-8 rounded-3xl border border-[#DBEAFE] shadow-sm space-y-6 text-center max-w-2xl mx-auto">
                <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
                  <Award className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-full border border-emerald-200">
                    Evaluation Complete
                  </span>
                  <h2 className="text-3xl font-black text-[#1E3A8A]">{evaluationResult.skillName} Result</h2>
                  <p className="text-xs text-[#64748B]">Proficiency Level Calculated by Server</p>
                </div>

                <div className="grid grid-cols-3 gap-4 py-4 border-y border-[#DBEAFE]">
                  <div className="p-3 bg-[#F8FBFF] rounded-2xl border border-[#DBEAFE]">
                    <span className="text-2xl font-black text-[#1E3A8A] block">{evaluationResult.score}/{evaluationResult.totalQuestions}</span>
                    <span className="text-[10px] font-bold text-[#64748B] uppercase">Raw Score</span>
                  </div>
                  <div className="p-3 bg-[#EFF6FF] rounded-2xl border border-[#DBEAFE]">
                    <span className="text-2xl font-black text-[#2563EB] block">{evaluationResult.percentage}%</span>
                    <span className="text-[10px] font-bold text-[#2563EB] uppercase">Percentage</span>
                  </div>
                  <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200">
                    <span className="text-xl font-black text-emerald-800 block">{evaluationResult.proficiencyLevel}</span>
                    <span className="text-[10px] font-bold text-emerald-600 uppercase">Proficiency</span>
                  </div>
                </div>

                {evaluationResult.suggestions && evaluationResult.suggestions.length > 0 && (
                  <div className="text-left space-y-2 bg-[#F8FBFF] p-4 rounded-2xl border border-[#DBEAFE]">
                    <h4 className="text-xs font-extrabold text-[#1E3A8A] uppercase">Improvement Suggestions:</h4>
                    <ul className="space-y-1">
                      {evaluationResult.suggestions.map((sug, i) => (
                        <li key={i} className="text-xs text-[#334155] flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" />
                          <span>{sug}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <button
                  onClick={() => {
                    setActiveAssessment(null);
                    setEvaluationResult(null);
                  }}
                  className="w-full py-3 bg-[#2563EB] hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all"
                >
                  Return to Assessments Catalog
                </button>
              </div>
            ) : (
              /* Active Questions Form */
              <form onSubmit={handleSubmitQuiz} className="bg-[#FFFFFF] p-6 sm:p-8 rounded-3xl border border-[#DBEAFE] shadow-sm space-y-8 max-w-3xl mx-auto">
                <div>
                  <h2 className="text-2xl font-extrabold text-[#1E3A8A]">{activeAssessment.title}</h2>
                  <p className="text-xs text-[#64748B] mt-1">{activeAssessment.description}</p>
                </div>

                <div className="space-y-6">
                  {activeAssessment.questions && activeAssessment.questions.map((q, qIdx) => (
                    <div key={q._id || qIdx} className="p-5 bg-[#F8FBFF] rounded-2xl border border-[#DBEAFE] space-y-3">
                      <h3 className="font-extrabold text-[#1E3A8A] text-sm flex items-start gap-2">
                        <span className="px-2 py-0.5 bg-[#2563EB] text-white rounded-md text-xs">{qIdx + 1}</span>
                        <span>{q.questionText}</span>
                      </h3>

                      <div className="space-y-2 pt-1">
                        {q.options && q.options.map((opt, oIdx) => {
                          const isSelected = userAnswers[qIdx] === oIdx;
                          return (
                            <label
                              key={oIdx}
                              onClick={() => handleOptionSelect(qIdx, oIdx)}
                              className={`flex items-center gap-3 p-3 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                                isSelected
                                  ? 'bg-[#EFF6FF] border-[#2563EB] text-[#1E3A8A] shadow-2xs'
                                  : 'bg-white border-[#DBEAFE] text-[#334155] hover:border-[#2563EB]'
                              }`}
                            >
                              <input
                                type="radio"
                                name={`question_${qIdx}`}
                                checked={isSelected}
                                onChange={() => handleOptionSelect(qIdx, oIdx)}
                                className="w-4 h-4 text-[#2563EB]"
                              />
                              <span>{opt}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 bg-[#2563EB] hover:bg-blue-700 text-white font-extrabold text-sm rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{submitting ? 'Evaluating Submission...' : 'Submit Assessment Answers'}</span>
                </button>
              </form>
            )}

          </div>
        ) : (
          /* MODE 2: Assessments Catalog & Past Results */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column: Assessments Catalog (2 cols) */}
            <div className="lg:col-span-2 space-y-6">
              <h2 className="text-xl font-extrabold text-[#1E3A8A] flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-[#2563EB]" />
                <span>Available Assessments</span>
              </h2>

              {loading ? (
                <div className="py-12 text-center text-xs font-semibold text-[#1E3A8A]">Loading assessment catalog...</div>
              ) : assessments.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {assessments.map((ass) => (
                    <div key={ass._id} className="bg-[#FFFFFF] p-6 rounded-3xl border border-[#DBEAFE] shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="px-2.5 py-1 bg-[#EFF6FF] text-[#2563EB] text-[10px] font-extrabold rounded-lg border border-[#DBEAFE]">
                            {ass.category}
                          </span>
                          <span className="text-[10px] text-[#64748B] font-bold">{ass.difficulty}</span>
                        </div>
                        <h3 className="text-base font-extrabold text-[#1E3A8A]">{ass.title}</h3>
                        <p className="text-xs text-[#475569] line-clamp-2">{ass.description}</p>
                      </div>

                      <button
                        onClick={() => handleStartAssessment(ass._id)}
                        className="w-full py-2.5 bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <span>Start Assessment</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 bg-[#FFFFFF] rounded-3xl border border-[#DBEAFE] text-center text-xs text-[#64748B]">
                  No assessments currently available.
                </div>
              )}
            </div>

            {/* Right Column: Past Assessment Results (1 col) */}
            <div className="space-y-6">
              <h2 className="text-lg font-extrabold text-[#1E3A8A] flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-[#2563EB]" />
                <span>My Completed Results</span>
              </h2>

              <div className="bg-[#FFFFFF] p-6 rounded-3xl border border-[#DBEAFE] shadow-sm space-y-4 max-h-[500px] overflow-y-auto">
                {results.length > 0 ? (
                  results.map((res, idx) => (
                    <div key={idx} className="p-4 bg-[#F8FBFF] rounded-2xl border border-[#DBEAFE] space-y-2 text-xs">
                      <div className="flex justify-between items-center">
                        <h4 className="font-extrabold text-[#1E3A8A]">{res.assessment?.skillName || 'Skill Assessment'}</h4>
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded-md text-[10px]">
                          {res.proficiencyLevel}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-[#64748B]">
                        <span>Score: <strong className="text-[#1E3A8A]">{res.score}/{res.totalQuestions}</strong></span>
                        <span className="font-bold text-[#2563EB]">{res.percentage}%</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-xs text-[#64748B]">
                    No past assessment results found. Take a test to verify your skills!
                  </div>
                )}
              </div>
            </div>

          </div>
        )}

      </main>

      <Footer />
    </div>
  );
};

export default Assessment;
