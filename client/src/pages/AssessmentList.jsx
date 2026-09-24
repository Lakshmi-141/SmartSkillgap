import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';
import { Award, Clock, HelpCircle, CheckCircle2, ArrowRight, History } from 'lucide-react';

const AssessmentList = () => {
  const [assessments, setAssessments] = useState([]);
  const [userResults, setUserResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alertInfo, setAlertInfo] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [assRes, resRes] = await Promise.all([
        axiosInstance.get('/assessments'),
        axiosInstance.get('/assessments/my-results')
      ]);

      if (assRes.data.success) {
        setAssessments(assRes.data.assessments);
      }
      if (resRes.data.success) {
        setUserResults(resRes.data.results);
      }
    } catch (err) {
      setAlertInfo({ type: 'error', message: 'Failed to load skill assessments' });
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner fullScreen message="Loading skill assessments..." />;

  const levelBadges = ['No Knowledge', 'Beginner', 'Intermediate', 'Advanced', 'Expert'];

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight">Skill Assessments & Quizzes</h1>
        <p className="text-slate-400 text-sm mt-1">Take interactive multiple-choice tests to evaluate and automatically certify your skill proficiency levels.</p>
      </div>

      {alertInfo && <Alert type={alertInfo.type} message={alertInfo.message} onClose={() => setAlertInfo(null)} />}

      {/* Assessment Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assessments.map((assessment) => {
          const userBest = userResults.find(r => r.assessment?._id === assessment._id || r.assessment === assessment._id);

          return (
            <div
              key={assessment._id}
              className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-all"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    {assessment.skill?.name || 'General Skill'}
                  </span>
                  <span className="text-xs font-semibold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-md">
                    {assessment.difficulty}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-white mb-2">{assessment.title}</h3>
                <p className="text-xs text-slate-400 mb-6 leading-relaxed line-clamp-3">{assessment.description}</p>

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 mb-6">
                  <div className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-900/60 border border-slate-800">
                    <Clock className="w-4 h-4 text-amber-400" />
                    <span>{assessment.timeLimitMinutes || 15} Mins</span>
                  </div>
                  <div className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-900/60 border border-slate-800">
                    <HelpCircle className="w-4 h-4 text-emerald-400" />
                    <span>{assessment.questions?.length || 5} Questions</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                {userBest ? (
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Best Attempt</span>
                    <span className="text-xs font-extrabold text-emerald-400">
                      {userBest.scorePercentage}% ({levelBadges[userBest.assignedProficiencyLevel]})
                    </span>
                  </div>
                ) : (
                  <span className="text-xs text-slate-500 italic">Not taken yet</span>
                )}

                <Link
                  to={`/assessments/${assessment._id}`}
                  className="px-5 py-2.5 rounded-xl bg-gradient-primary text-white text-xs font-bold shadow-lg shadow-blue-600/30 hover:opacity-95 transition-all flex items-center gap-1.5"
                >
                  {userBest ? 'Retake Quiz' : 'Start Assessment'}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Past Submissions History */}
      {userResults.length > 0 && (
        <div className="pt-8">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <History className="w-5 h-5 text-purple-400" /> Assessment Submission History
          </h2>

          <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/80 text-slate-400 uppercase font-semibold border-b border-slate-800">
                  <tr>
                    <th className="px-6 py-4">Assessment Title</th>
                    <th className="px-6 py-4">Skill</th>
                    <th className="px-6 py-4">Score</th>
                    <th className="px-6 py-4">Assigned Level</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 text-slate-200">
                  {userResults.map((result) => (
                    <tr key={result._id} className="hover:bg-slate-800/40">
                      <td className="px-6 py-4 font-bold text-white">{result.assessment?.title || 'Assessment'}</td>
                      <td className="px-6 py-4 text-blue-400">{result.skill?.name || 'Skill'}</td>
                      <td className="px-6 py-4 font-black text-emerald-400">{result.scorePercentage}%</td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          Level {result.assignedProficiencyLevel} ({levelBadges[result.assignedProficiencyLevel]})
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-400">
                        {new Date(result.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          to={`/assessments/results/${result._id}`}
                          className="text-xs font-semibold text-purple-400 hover:underline"
                        >
                          View Breakdown &rarr;
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssessmentList;
