import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { getResourcesApi, createResourceApi, deleteResourceApi } from '../services/api';
import { 
  ShieldCheck, 
  BookOpen, 
  Plus, 
  Trash2, 
  ExternalLink, 
  AlertCircle, 
  CheckCircle2, 
  ArrowLeft 
} from 'lucide-react';

const AdminResources = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form states
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [type, setType] = useState('Documentation');
  const [skill, setSkill] = useState('');
  const [difficulty, setDifficulty] = useState('Beginner');
  const [saving, setSaving] = useState(false);

  const fetchResources = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await getResourcesApi();
      if (res.success) {
        setResources(res.resources || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load resources.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = 'SmartSkillGap Admin | Manage Resources';
    fetchResources();
  }, []);

  const handleCreateResource = async (e) => {
    e.preventDefault();
    if (!title.trim() || !url.trim() || !skill.trim()) {
      setError('Title, valid HTTP/HTTPS URL, and skill are required.');
      return;
    }

    if (!/^(http:\/\/|https:\/\/)/i.test(url.trim())) {
      setError('URL must start with http:// or https://');
      return;
    }

    try {
      setSaving(true);
      setError('');
      setSuccessMsg('');

      const res = await createResourceApi({
        title: title.trim(),
        description: description.trim(),
        url: url.trim(),
        type,
        skill: skill.trim(),
        difficulty
      });

      if (res.success) {
        setSuccessMsg(`Learning resource "${title}" created successfully!`);
        setShowModal(false);
        setTitle('');
        setDescription('');
        setUrl('');
        setSkill('');
        fetchResources();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create resource.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete resource "${name}"?`)) return;

    try {
      setError('');
      const res = await deleteResourceApi(id);
      if (res.success) {
        setSuccessMsg(`Deleted resource "${name}".`);
        fetchResources();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete resource.');
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
              Manage Learning Resources
            </h1>
            <p className="text-xs text-[#475569] mt-0.5">
              Add and curate high-quality documentation links, courses, and tutorials for students.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2.5 bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Resource</span>
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

        {/* Modal for creating resource */}
        {showModal && (
          <div className="fixed inset-0 bg-[#334155]/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white max-w-lg w-full p-6 sm:p-8 rounded-3xl border border-[#DBEAFE] shadow-xl space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-extrabold text-[#1E3A8A]">Add Learning Resource</h3>
                <button onClick={() => setShowModal(false)} className="text-xs font-bold text-[#64748B]">Close</button>
              </div>

              <form onSubmit={handleCreateResource} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-[#1E3A8A] block mb-1">Resource Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MDN Web Docs: Modern JavaScript"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F8FBFF] border border-[#DBEAFE] rounded-xl text-xs text-[#1E3A8A] font-semibold"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#1E3A8A] block mb-1">External Resource URL (http:// or https://)</label>
                  <input
                    type="url"
                    required
                    placeholder="https://developer.mozilla.org"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F8FBFF] border border-[#DBEAFE] rounded-xl text-xs text-[#1E3A8A] font-semibold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-[#1E3A8A] block mb-1">Target Skill</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. JavaScript (ES6+)"
                      value={skill}
                      onChange={(e) => setSkill(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F8FBFF] border border-[#DBEAFE] rounded-xl text-xs text-[#1E3A8A] font-semibold"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-[#1E3A8A] block mb-1">Type</label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F8FBFF] border border-[#DBEAFE] rounded-xl text-xs text-[#1E3A8A] font-semibold"
                    >
                      <option value="Documentation">Documentation</option>
                      <option value="Course">Course</option>
                      <option value="Tutorial">Tutorial</option>
                      <option value="Video">Video</option>
                      <option value="Article">Article</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-[#1E3A8A] block mb-1">Difficulty</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F8FBFF] border border-[#DBEAFE] rounded-xl text-xs font-bold"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-[#1E3A8A] block mb-1">Description</label>
                  <textarea
                    rows={2}
                    placeholder="Short resource summary..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F8FBFF] border border-[#DBEAFE] rounded-xl text-xs text-[#1E3A8A]"
                  />
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 py-3 bg-[#2563EB] text-white font-extrabold text-xs rounded-xl shadow-sm"
                  >
                    {saving ? 'Creating...' : 'Save Resource'}
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

        {/* Resource List Grid */}
        {loading ? (
          <div className="py-16 text-center text-xs font-semibold text-[#1E3A8A]">Loading learning resources...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources.map((r) => (
              <div key={r._id} className="bg-[#FFFFFF] p-6 rounded-3xl border border-[#DBEAFE] shadow-sm flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="px-2.5 py-1 bg-[#EFF6FF] text-[#2563EB] text-[10px] font-extrabold rounded-lg border border-[#DBEAFE]">
                      {r.skill}
                    </span>
                    <span className="text-[10px] font-bold text-[#64748B]">{r.difficulty}</span>
                  </div>
                  <h3 className="text-base font-extrabold text-[#1E3A8A]">{r.title}</h3>
                  <p className="text-xs text-[#475569] line-clamp-2">{r.description}</p>
                </div>

                <div className="pt-3 border-t border-[#DBEAFE] flex items-center justify-between">
                  <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-[#2563EB] flex items-center gap-1">
                    <span>{r.type}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <button
                    onClick={() => handleDelete(r._id, r.title)}
                    className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                    title="Delete resource"
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

export default AdminResources;
