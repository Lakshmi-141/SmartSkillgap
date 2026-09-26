import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { getAssessmentsApi, createAssessmentApi, deleteAssessmentApi } from '../services/api';
import { 
  ShieldCheck, 
  HelpCircle, 
  Plus, 
  Trash2, 
  AlertCircle, 
  CheckCircle2, 
  ArrowLeft 
} from 'lucide-react';

const AdminAssessments = () => {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form states
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Frontend');
  const [skillName, setSkillName] = useState('');
  const [difficulty, setDifficulty] = useState('Intermediate');
  const [saving, setSaving] = useState(false);

  // Single question form helper
  const [qText, setQText] = useState('');
  const [opt0, setOpt0] = useState('');
  const [opt1, setOpt1] = useState('');
  const [opt2, setOpt2] = useState('');
  const [opt3, setOpt3] = useState('');
  const [correctIdx, setCorrectIdx] = useState(0);

  const fetchAssessments = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await getAssessmentsApi();
      if (res.success) {
        setAssessments(res.assessments || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load assessments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = 'SmartSkillGap Admin | Manage Assessments';
    fetchAssessments();
  }, []);

  const handleCreateAssessment = async (e) => {
    e.preventDefault();
    if (!title.trim() || !skillName.trim() || !qText.trim() || !opt0 || !opt1) {
      setError('Title, skillName, and at least 2 question options are required.');
      return;
    }

    try {
      setSaving(true);
      setError('');
      setSuccessMsg('');

      const questions = [
        {
          questionText: qText.trim(),
          options: [opt0.trim(), opt1.trim(), opt2.trim(), opt3.trim()].filter(Boolean),
          correctOptionIndex: Number(correctIdx)
        }
      ];

      const res = await createAssessmentApi({
        title: title.trim(),
        description: description.trim(),
        category,
        skillName: skillName.trim(),
        difficulty,
        questions
      });

      if (res.success) {
        setSuccessMsg(`Assessment "${title}" created successfully!`);
        setShowModal(false);
        setTitle('');
        setDescription('');
        setSkillName('');
        setQText('');
        setOpt0('');
        setOpt1('');
        setOpt2('');
        setOpt3('');
        fetchAssessments();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create assessment.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete assessment "${name}"?`)) return;

    try {
      setError('');
      const res = await deleteAssessmentApi(id);
      if (res.success) {
        setSuccessMsg(`Deleted assessment "${name}".`);
        fetchAssessments();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete assessment.');
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
              <span className="px-3 py-1 bg-red-100 text-red-800 text-xs font-black uppercase rounded-full">
                Admin Console
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E3A8A] mt-1">
              Manage Skill Assessments
            </h1>
            <p className="text-xs text-[#475569] mt-0.5">
              Create, update, and manage interactive evaluation quizzes for students.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2.5 bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Assessment</span>
            </button>
            <Link
              to="/admin"
              className="px-4 py-2.5 bg-[#EFF6FF] text-[#1E3A8A] border border-[#DBEAFE] font-bold text-xs rounded-xl hover:bg-[#DBEAFE] transition-all flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Admin Dashboard</span>
            </Link>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-sm flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Modal for creating assessment */}
        {showModal && (
          <div className="fixed inset-0 bg-[#334155]/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white max-w-xl w-full p-6 sm:p-8 rounded-3xl border border-[#DBEAFE] shadow-xl space-y-6 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-extrabold text-[#1E3A8A]">Create New Assessment</h3>
                <button onClick={() => setShowModal(false)} className="text-xs font-bold text-[#64748B]">Close</button>
              </div>

              <form onSubmit={handleCreateAssessment} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-[#1E3A8A] block mb-1">Assessment Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. React Hooks Proficiency Test"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F8FBFF] border border-[#DBEAFE] rounded-xl text-xs text-[#1E3A8A] font-semibold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-[#1E3A8A] block mb-1">Target Skill Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. React.js"
                      value={skillName}
                      onChange={(e) => setSkillName(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F8FBFF] border border-[#DBEAFE] rounded-xl text-xs text-[#1E3A8A] font-semibold"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-[#1E3A8A] block mb-1">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F8FBFF] border border-[#DBEAFE] rounded-xl text-xs text-[#1E3A8A] font-semibold"
                    >
                      <option value="Frontend">Frontend</option>
                      <option value="Backend">Backend</option>
                      <option value="Database">Database</option>
                      <option value="DevOps">DevOps</option>
                      <option value="General">General</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-[#1E3A8A] block mb-1">Description</label>
                  <textarea
                    rows={2}
                    placeholder="Assessment overview..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F8FBFF] border border-[#DBEAFE] rounded-xl text-xs text-[#1E3A8A]"
                  />
                </div>

                <div className="pt-2 border-t border-[#DBEAFE] space-y-3">
                  <h4 className="font-extrabold text-[#1E3A8A]">Initial Question Setup:</h4>
                  <div>
                    <label className="font-bold text-[#1E3A8A] block mb-1">Question Text</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Which hook manages side effects?"
                      value={qText}
                      onChange={(e) => setQText(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F8FBFF] border border-[#DBEAFE] rounded-xl text-xs text-[#1E3A8A]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <input type="text" placeholder="Option 0" value={opt0} onChange={(e) => setOpt0(e.target.value)} className="px-3 py-1.5 bg-[#F8FBFF] border rounded-lg text-xs" />
                    <input type="text" placeholder="Option 1" value={opt1} onChange={(e) => setOpt1(e.target.value)} className="px-3 py-1.5 bg-[#F8FBFF] border rounded-lg text-xs" />
                    <input type="text" placeholder="Option 2" value={opt2} onChange={(e) => setOpt2(e.target.value)} className="px-3 py-1.5 bg-[#F8FBFF] border rounded-lg text-xs" />
                    <input type="text" placeholder="Option 3" value={opt3} onChange={(e) => setOpt3(e.target.value)} className="px-3 py-1.5 bg-[#F8FBFF] border rounded-lg text-xs" />
                  </div>

                  <div>
                    <label className="font-bold text-[#1E3A8A] block mb-1">Correct Option Index (0 - 3)</label>
                    <select
                      value={correctIdx}
                      onChange={(e) => setCorrectIdx(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-[#F8FBFF] border border-[#DBEAFE] rounded-xl text-xs font-bold"
                    >
                      <option value={0}>Option 0 is Correct</option>
                      <option value={1}>Option 1 is Correct</option>
                      <option value={2}>Option 2 is Correct</option>
                      <option value={3}>Option 3 is Correct</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 py-3 bg-[#2563EB] text-white font-extrabold text-xs rounded-xl shadow-sm"
                  >
                    {saving ? 'Creating...' : 'Create Assessment'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-5 py-3 bg-[#F8FBFF] text-[#1E3A8A] border font-bold text-xs rounded-xl"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Assessment Cards Grid */}
        {loading ? (
          <div className="py-16 text-center text-xs font-semibold text-[#1E3A8A]">Loading assessments...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assessments.map((a) => (
              <div key={a._id} className="bg-[#FFFFFF] p-6 rounded-3xl border border-[#DBEAFE] shadow-sm flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="px-2.5 py-1 bg-[#EFF6FF] text-[#2563EB] text-[10px] font-extrabold rounded-lg border border-[#DBEAFE]">
                      {a.category}
                    </span>
                    <span className="text-[10px] text-[#64748B] font-bold">{a.skillName}</span>
                  </div>
                  <h3 className="text-base font-extrabold text-[#1E3A8A]">{a.title}</h3>
                  <p className="text-xs text-[#475569] line-clamp-2">{a.description}</p>
                </div>

                <div className="pt-3 border-t border-[#DBEAFE] flex items-center justify-between">
                  <span className="text-xs text-[#64748B]">Questions: <strong className="text-[#1E3A8A]">{(a.questions || []).length}</strong></span>
                  <button
                    onClick={() => handleDelete(a._id, a.title)}
                    className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                    title="Delete assessment"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
};

export default AdminAssessments;
