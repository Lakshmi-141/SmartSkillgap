import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';
import { Clock, HelpCircle, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';

const AssessmentTake = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [assessment, setAssessment] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({}); // { questionId: selectedOptionIndex }
  const [timeLeft, setTimeLeft] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAssessment();
  }, [id]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitAnswers(); // Auto submit on timer end
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const fetchAssessment = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(`/assessments/${id}`);
      if (res.data.success) {
        setAssessment(res.data.assessment);
        setTimeLeft((res.data.assessment.timeLimitMinutes || 15) * 60);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load assessment');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (questionId, optionIndex) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  const handleSubmitAnswers = async () => {
    if (submitting || !assessment) return;
    try {
      setSubmitting(true);

      const formattedAnswers = assessment.questions.map(q => ({
        questionId: q._id,
        selectedOption: selectedAnswers[q._id] !== undefined ? selectedAnswers[q._id] : -1
      }));

      const res = await axiosInstance.post(`/assessments/${id}/submit`, {
        answers: formattedAnswers
      });

      if (res.data.success) {
        navigate(`/assessments/results/${res.data.resultId}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error submitting assessment answers');
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner fullScreen message="Preparing quiz questions..." />;
  if (error) return <Alert type="error" message={error} className="max-w-2xl mx-auto my-12" />;
  if (!assessment || !assessment.questions || assessment.questions.length === 0) {
    return <Alert type="warning" message="No questions available for this assessment." className="max-w-2xl mx-auto my-12" />;
  }

  const currentQuestion = assessment.questions[currentQuestionIndex];
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const totalQuestions = assessment.questions.length;
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;
  const answeredCount = Object.keys(selectedAnswers).length;

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-16">
      {/* Top Quiz Header */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-md border border-blue-500/20">
            {assessment.skill?.name} Assessment
          </span>
          <h1 className="text-xl font-bold text-white mt-1">{assessment.title}</h1>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono font-bold text-sm">
          <Clock className="w-4 h-4 text-amber-400" />
          <span>{formatTime(timeLeft)}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
          <span>Question {currentQuestionIndex + 1} of {totalQuestions}</span>
          <span>{answeredCount} of {totalQuestions} Answered</span>
        </div>
        <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
          <div
            className="bg-gradient-primary h-full rounded-full transition-all duration-300"
            style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="glass-panel p-8 rounded-3xl border border-slate-800 space-y-6">
        <h2 className="text-xl font-bold text-white leading-relaxed">
          {currentQuestion.questionText}
        </h2>

        {/* Options */}
        <div className="space-y-3">
          {currentQuestion.options.map((optionText, optIdx) => {
            const isSelected = selectedAnswers[currentQuestion._id] === optIdx;

            return (
              <button
                key={optIdx}
                onClick={() => handleSelectOption(currentQuestion._id, optIdx)}
                className={`w-full p-4 rounded-2xl text-left text-sm font-medium transition-all flex items-center justify-between border ${
                  isSelected
                    ? 'bg-blue-600/20 text-white border-blue-500 shadow-md shadow-blue-600/20'
                    : 'bg-slate-900/60 text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs ${
                    isSelected ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {String.fromCharCode(65 + optIdx)}
                  </div>
                  <span>{optionText}</span>
                </div>
                {isSelected && <CheckCircle2 className="w-5 h-5 text-blue-400 flex-shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-4">
        <button
          onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
          disabled={currentQuestionIndex === 0}
          className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-all flex items-center gap-1.5 disabled:opacity-40"
        >
          <ArrowLeft className="w-4 h-4" /> Previous
        </button>

        {isLastQuestion ? (
          <button
            onClick={handleSubmitAnswers}
            disabled={submitting}
            className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {submitting ? 'Evaluating Score...' : 'Submit Assessment'}
          </button>
        ) : (
          <button
            onClick={() => setCurrentQuestionIndex(prev => Math.min(totalQuestions - 1, prev + 1))}
            className="px-6 py-2.5 rounded-xl bg-gradient-primary text-white font-bold text-xs shadow-lg shadow-blue-600/30 hover:opacity-95 transition-all flex items-center gap-1.5"
          >
            Next Question <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default AssessmentTake;
