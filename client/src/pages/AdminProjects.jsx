import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { getProjectsApi, createProjectApi, deleteProjectApi } from '../services/api';
import { 
  ShieldCheck, 
  FolderGit2, 
  Plus, 
  Trash2, 
  AlertCircle, 
  CheckCircle2, 
  ArrowLeft 
} from 'lucide-react';

const AdminProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form states
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState('Intermediate');
  const [requiredSkillsStr, setRequiredSkillsStr] = useState('');
  const [skillsGainedStr, setSkillsGainedStr] = useState('');
  const [estimatedDuration, setEstimatedDuration] = useState('1-2 Weeks');
  const [githubUrl, setGithubUrl] = useState('');
  const [demoUrl, setDemoUrl] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await getProjectsApi();
      if (res.success) {
        setProjects(res.projects || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load projects.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = 'SmartSkillGap Admin | Manage Projects';
    fetchProjects();
  }, []);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setError('Title and description are required.');
      return;
    }

    try {
      setSaving(true);
      setError('');
      setSuccessMsg('');

      const requiredSkills = requiredSkillsStr.split(',').map(s => s.trim()).filter(Boolean);
      const skillsGained = skillsGainedStr.split(',').map(s => s.trim()).filter(Boolean);

      const res = await createProjectApi({
        title: title.trim(),
        description: description.trim(),
        difficulty,
        requiredSkills,
        skillsGained,
        estimatedDuration: estimatedDuration.trim(),
        githubUrl: githubUrl.trim(),
        demoUrl: demoUrl.trim()
      });

      if (res.success) {
        setSuccessMsg(`Project "${title}" created successfully!`);
        setShowModal(false);
        setTitle('');
        setDescription('');
        setRequiredSkillsStr('');
        setSkillsGainedStr('');
        fetchProjects();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create project.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete project "${name}"?`)) return;

    try {
      setError('');
      const res = await deleteProjectApi(id);
      if (res.success) {
        setSuccessMsg(`Deleted project "${name}".`);
        fetchProjects();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete project.');
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
              Manage Recommended Projects
            </h1>
            <p className="text-xs text-[#475569] mt-0.5">
              Add and manage recommended portfolio capstones for student career goals.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2.5 bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Project</span>
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

        {/* Modal for creating project */}
        {showModal && (
          <div className="fixed inset-0 bg-[#334155]/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white max-w-lg w-full p-6 sm:p-8 rounded-3xl border border-[#DBEAFE] shadow-xl space-y-6 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-extrabold text-[#1E3A8A]">Add Project Recommendation</h3>
                <button onClick={() => setShowModal(false)} className="text-xs font-bold text-[#64748B]">Close</button>
              </div>

              <form onSubmit={handleCreateProject} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-[#1E3A8A] block mb-1">Project Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SmartSkill Gap Platform"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F8FBFF] border border-[#DBEAFE] rounded-xl text-xs text-[#1E3A8A] font-semibold"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#1E3A8A] block mb-1">Description</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Project overview and features..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F8FBFF] border border-[#DBEAFE] rounded-xl text-xs text-[#1E3A8A]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
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
                    <label className="font-bold text-[#1E3A8A] block mb-1">Estimated Duration</label>
                    <input
                      type="text"
                      placeholder="e.g. 2 Weeks"
                      value={estimatedDuration}
                      onChange={(e) => setEstimatedDuration(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F8FBFF] border border-[#DBEAFE] rounded-xl text-xs text-[#1E3A8A]"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-[#1E3A8A] block mb-1">Required Skills (Comma-separated)</label>
                  <input
                    type="text"
                    placeholder="React.js, Node.js, Express.js"
                    value={requiredSkillsStr}
                    onChange={(e) => setRequiredSkillsStr(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F8FBFF] border border-[#DBEAFE] rounded-xl text-xs text-[#1E3A8A]"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#1E3A8A] block mb-1">Skills Gained (Comma-separated)</label>
                  <input
                    type="text"
                    placeholder="JWT Auth, MERN Stack, REST APIs"
                    value={skillsGainedStr}
                    onChange={(e) => setSkillsGainedStr(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F8FBFF] border border-[#DBEAFE] rounded-xl text-xs text-[#1E3A8A]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-[#1E3A8A] block mb-1">GitHub Template URL</label>
                    <input
                      type="url"
                      placeholder="https://github.com/..."
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F8FBFF] border border-[#DBEAFE] rounded-xl text-xs text-[#1E3A8A]"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-[#1E3A8A] block mb-1">Live Demo URL</label>
                    <input
                      type="url"
                      placeholder="https://demo.app"
                      value={demoUrl}
                      onChange={(e) => setDemoUrl(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F8FBFF] border border-[#DBEAFE] rounded-xl text-xs text-[#1E3A8A]"
                    />
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 py-3 bg-[#2563EB] text-white font-extrabold text-xs rounded-xl shadow-sm"
                  >
                    {saving ? 'Creating...' : 'Save Project'}
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

        {/* Project Grid */}
        {loading ? (
          <div className="py-16 text-center text-xs font-semibold text-[#1E3A8A]">Loading project recommendations...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((p) => (
              <div key={p._id} className="bg-[#FFFFFF] p-6 rounded-3xl border border-[#DBEAFE] shadow-sm flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="px-2.5 py-1 bg-[#EFF6FF] text-[#2563EB] text-[10px] font-extrabold rounded-lg border border-[#DBEAFE]">
                      {p.difficulty}
                    </span>
                    <span className="text-[10px] font-bold text-[#64748B]">{p.estimatedDuration}</span>
                  </div>
                  <h3 className="text-base font-extrabold text-[#1E3A8A]">{p.title}</h3>
                  <p className="text-xs text-[#475569] line-clamp-3">{p.description}</p>
                </div>

                <div className="pt-3 border-t border-[#DBEAFE] flex items-center justify-between">
                  <span className="text-[10px] text-[#64748B]">Skills: {(p.skillsGained || []).length}</span>
                  <button
                    onClick={() => handleDelete(p._id, p.title)}
                    className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                    title="Delete project"
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

export default AdminProjects;
