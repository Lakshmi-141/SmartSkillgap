import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';
import { Award, CheckCircle2, XCircle, ArrowLeft, RefreshCw, BarChart3 } from 'lucide-react';

const AssessmentResult = () => {
  const { resultId } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchResult();
  }, [resultId]);

  const fetchResult = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(`/assessments/results/${resultId}`);
      if (res.data.success) {
        setResult(res.data.result);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load assessment result');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner fullScreen message="Loading test results..." />;
  if (error) return <Alert type="error" message={error} className="max-w-2xl mx-auto my-12" />;

  const levelBadges = ['No Knowledge', 'Beginner', 'Intermediate', 'Advanced', 'Expert'];

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Result Hero Header */}
      <div className="glass-panel p-8 rounded-3xl border border-slate-800 text-center relative overflow-hidden bg-gradient-to-b from-blue-950/30 to-slate-900">
        <div className="w-16 h-16 rounded-2xl bg-gradient-primary mx-auto flex items-center justify-center shadow-xl shadow-blue-500/25 mb-4">
          <Award className="w-8 h-8 text-white" />
        </div>

        <h1 className="text-3xl font-black text-white tracking-tight">Assessment Certified</h1>
        <p className="text-slate-400 text-sm mt-1">{result?.assessment?.title}</p>

        <div className="my-6 inline-flex flex-col items-center p-6 rounded-2xl bg-slate-950/80 border border-slate-800 shadow-2xl">
          <div className="text-5xl font-black text-gradient">
            {result?.scorePercentage}%
          </div>
          <span className="text-xs font-semibold text-slate-400 mt-1">
            {result?.correctAnswersCount} / {result?.totalQuestions} Correct Answers
          </span>

          <div className="mt-4 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold uppercase tracking-wider">
            Certified Level {result?.assignedProficiencyLevel}: {levelBadges[result?.assignedProficiencyLevel]}
          </div>
        </div>

        <p className="text-xs text-slate-400 max-w-lg mx-auto leading-relaxed">
          Your skill level in <strong className="text-white">{result?.skill?.name}</strong> has been automatically updated on your profile!
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/gap-analysis"
            className="px-5 py-2.5 rounded-xl bg-gradient-primary text-white text-xs font-bold shadow-lg shadow-blue-600/30 hover:opacity-95 transition-all flex items-center gap-2"
          >
            <BarChart3 className="w-4 h-4" /> View Updated Skill Gap
          </Link>
          <Link
            to="/assessments"
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Quizzes
          </Link>
        </div>
      </div>

      {/* Detailed Question Review Breakdown */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white mb-4">Question Breakdown & Explanations</h2>

        {result?.userAnswers?.map((ans, idx) => (
          <div
            key={idx}
            className={`glass-panel p-6 rounded-2xl border transition-all ${
              ans.isCorrect ? 'border-emerald-500/30 bg-emerald-950/10' : 'border-rose-500/30 bg-rose-950/10'
            }`}
          >
            <div className="flex items-start gap-3">
              {ans.isCorrect ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-6 h-6 text-rose-400 flex-shrink-0 mt-0.5" />
              )}
              <div className="space-y-3 flex-1">
                <h3 className="font-bold text-white text-base">
                  {idx + 1}. {ans.questionText}
                </h3>

                <div className="text-xs space-y-1.5 font-medium">
                  <p className={ans.isCorrect ? 'text-emerald-300' : 'text-rose-300'}>
                    Your Choice: {ans.selectedOption >= 0 ? `Option ${String.fromCharCode(65 + ans.selectedOption)}` : 'Not Answered'}
                  </p>
                  {!ans.isCorrect && (
                    <p className="text-emerald-400">
                      Correct Answer: Option {String.fromCharCode(65 + ans.correctOption)}
                    </p>
                  )}
                </div>

                {ans.explanation && (
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                    <strong className="text-slate-400 block mb-0.5 uppercase tracking-wider text-[10px]">Explanation:</strong>
                    {ans.explanation}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AssessmentResult;
