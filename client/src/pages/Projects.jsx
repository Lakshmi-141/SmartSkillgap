import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';
import SafeLink from '../components/SafeLink';
import {
  FolderGit2,
  Globe,
  ExternalLink,
  CheckCircle2,
  Clock,
  Code2,
  Sparkles,
  Search,
  Star
} from 'lucide-react';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [skills, setSkills] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [loading, setLoading] = useState(true);

  const [activeModalProject, setActiveModalProject] = useState(null);
  const [repoLink, setRepoLink] = useState('');
  const [demoLink, setDemoLink] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState('in_progress');
  const [saving, setSaving] = useState(false);
  const [alertInfo, setAlertInfo] = useState(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [selectedSkill, selectedDifficulty, search]);

  const fetchInitialData = async () => {
    try {
      const [skillRes, recRes] = await Promise.all([
        axiosInstance.get('/skills'),
        axiosInstance.get('/recommendations').catch(() => ({ data: { success: false } }))
      ]);

      if (skillRes.data.success) {
        setSkills(skillRes.data.skills);
      }
      if (recRes.data.success && Array.isArray(recRes.data.recommendedProjects)) {
        setRecommendations(recRes.data.recommendedProjects);
      }
    } catch (err) {
      console.error('Error fetching initial data:', err);
    }
  };

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedSkill) params.skill = selectedSkill;
      if (selectedDifficulty) params.difficulty = selectedDifficulty;
      if (search) params.search = search;

      const res = await axiosInstance.get('/projects', { params });
      if (res.data.success) {
        setProjects(res.data.projects);
      }
    } catch (err) {
      setAlertInfo({ type: 'error', message: 'Failed to load project recommendations' });
    } finally {
      setLoading(false);
    }
  };

  const openUpdateModal = (project) => {
    setActiveModalProject(project);
    setRepoLink(project.userProgress?.repoLink || '');
    setDemoLink(project.userProgress?.demoLink || '');
    setNotes(project.userProgress?.notes || '');
    setStatus(project.userProgress?.status || 'in_progress');
  };

  const handleSaveProgress = async (e) => {
    e.preventDefault();
    if (!activeModalProject) return;

    try {
      setSaving(true);
      const res = await axiosInstance.post('/projects/progress', {
        projectId: activeModalProject._id,
        status,
        repoLink,
        demoLink,
        notes
      });

      if (res.data.success) {
        await fetchProjects();
        setActiveModalProject(null);
        setAlertInfo({ type: 'success', message: 'Project submission updated successfully!' });
      }
    } catch (err) {
      setAlertInfo({ type: 'error', message: err.response?.data?.message || 'Failed to update project progress' });
    } finally {
      setSaving(false);
    }
  };

  const difficultyColors = {
    beginner: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    intermediate: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    advanced: 'bg-purple-500/20 text-purple-400 border-purple-500/30'
  };

  return (
    <div className="space-y-10 pb-16">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight">Recommended Portfolio Projects</h1>
        <p className="text-slate-400 text-sm mt-1">
          Build real-world working web applications to prove your practical capability and bridge your target career skill gaps.
        </p>
      </div>

      {alertInfo && <Alert type={alertInfo.type} message={alertInfo.message} onClose={() => setAlertInfo(null)} />}

      {/* Recommended Projects Prominent Section */}
      {recommendations.length > 0 && (
        <div className="glass-panel p-6 rounded-3xl border border-blue-500/30 bg-gradient-to-r from-blue-950/20 via-slate-900 to-purple-950/20 space-y-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Recommended for You</h2>
              <p className="text-xs text-slate-400">Tailored practical projects to close your active career skill gaps.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recommendations.slice(0, 4).map((rec, idx) => {
              const project = rec.project;
              if (!project) return null;

              return (
                <div key={project._id || idx} className="glass-card p-6 rounded-2xl border border-slate-800 bg-slate-900/60 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-1">
                        <Star className="w-3 h-3 text-amber-400" /> Recommended Project
                      </span>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md border ${difficultyColors[project.difficulty] || 'bg-slate-800 text-slate-400'}`}>
                        {project.difficulty || 'intermediate'}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-white mb-1.5">{project.title}</h3>
                    <p className="text-xs text-blue-300 font-medium mb-3 italic">
                      "{rec.reason}"
                    </p>
                    <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed mb-4">{project.description}</p>

                    {/* Required / Gained Skills */}
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {(project.skillsGained || []).map(s => (
                        <span key={s._id} className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
                          +{s.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                      <Clock className="w-3.5 h-3.5 text-amber-400" /> {project.estimatedDuration || '10-15 hrs'}
                    </span>

                    <button
                      onClick={() => openUpdateModal(project)}
                      className="px-4 py-2 rounded-xl bg-gradient-primary text-white text-xs font-bold shadow-md hover:opacity-95 transition-all"
                    >
                      Start Project
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Filter & Search Toolbar */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Search */}
        <div className="relative">
          <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Search Projects</label>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search title, description..."
              className="w-full pl-9 pr-3 py-2 rounded-xl glass-input text-xs font-semibold"
            />
          </div>
        </div>

        {/* Skill Filter */}
        <div>
          <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Filter by Skill</label>
          <select
            value={selectedSkill}
            onChange={(e) => setSelectedSkill(e.target.value)}
            className="w-full px-3 py-2 rounded-xl glass-input text-xs font-semibold"
          >
            <option value="">All Skills</option>
            {skills.map(s => (
              <option key={s._id} value={s._id}>{s.name}</option>
            ))}
          </select>
        </div>

        {/* Difficulty Filter */}
        <div>
          <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Difficulty</label>
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="w-full px-3 py-2 rounded-xl glass-input text-xs font-semibold"
          >
            <option value="">All Difficulties</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
      </div>

      {/* Main Projects Grid */}
      {loading ? (
        <LoadingSpinner message="Fetching projects..." />
      ) : projects.length === 0 ? (
        <div className="text-center py-12 glass-panel p-8 rounded-3xl border border-slate-800 text-slate-400">
          <FolderGit2 className="w-12 h-12 mx-auto text-slate-600 mb-3" />
          <p className="font-bold text-lg">No projects found</p>
          <p className="text-xs text-slate-500 mt-1">Try clearing filters or adjusting your search term.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {projects.map((project) => {
            const userProg = project.userProgress || {};
            const isCompleted = userProg.status === 'completed';
            const isInProgress = userProg.status === 'in_progress';

            return (
              <div
                key={project._id}
                className={`glass-panel p-8 rounded-3xl border transition-all flex flex-col justify-between ${
                  isCompleted
                    ? 'border-emerald-500/40 bg-emerald-950/10'
                    : isInProgress
                    ? 'border-blue-500/40 bg-blue-950/10'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-bold border uppercase ${difficultyColors[project.difficulty] || 'bg-slate-800 text-slate-400'}`}>
                      {project.difficulty}
                    </span>
                    <span className={`text-xs font-bold ${
                      isCompleted ? 'text-emerald-400' : isInProgress ? 'text-blue-400' : 'text-slate-500'
                    }`}>
                      {isCompleted ? '✓ Completed' : isInProgress ? '⏳ In Progress' : 'Not Started'}
                    </span>
                  </div>

                  <h2 className="text-2xl font-bold text-white mb-2">{project.title}</h2>
                  <p className="text-sm text-slate-300 leading-relaxed mb-6">{project.description}</p>

                  {/* External starter links if available */}
                  {(project.githubUrl || project.demoUrl) && (
                    <div className="flex flex-wrap gap-2 mb-6">
                      {project.githubUrl && (
                        <SafeLink
                          href={project.githubUrl}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-300 hover:text-white font-semibold"
                        >
                          <FolderGit2 className="w-3.5 h-3.5 text-purple-400" /> Starter Repo <ExternalLink className="w-3 h-3 text-slate-500" />
                        </SafeLink>
                      )}
                      {project.demoUrl && (
                        <SafeLink
                          href={project.demoUrl}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-300 hover:text-white font-semibold"
                        >
                          <Globe className="w-3.5 h-3.5 text-blue-400" /> Live Specs <ExternalLink className="w-3 h-3 text-slate-500" />
                        </SafeLink>
                      )}
                    </div>
                  )}

                  {/* Skills Gained Tags */}
                  {project.skillsGained && project.skillsGained.length > 0 && (
                    <div className="mb-6">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Skills You Will Gain</span>
                      <div className="flex flex-wrap gap-1.5">
                        {project.skillsGained.map((s) => (
                          <span key={s._id} className="px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/20 text-xs text-purple-300 font-semibold">
                            {s.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-6 border-t border-slate-800/80 space-y-4">
                  {/* User Progress Links */}
                  {(userProg.repoLink || userProg.demoLink) && (
                    <div className="flex gap-3 text-xs">
                      {userProg.repoLink && (
                        <SafeLink
                          href={userProg.repoLink}
                          className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white flex items-center gap-1.5"
                        >
                          <FolderGit2 className="w-3.5 h-3.5 text-slate-400" /> My Repo
                        </SafeLink>
                      )}
                      {userProg.demoLink && (
                        <SafeLink
                          href={userProg.demoLink}
                          className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white flex items-center gap-1.5"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-blue-400" /> My Live Demo
                        </SafeLink>
                      )}
                    </div>
                  )}

                  <button
                    onClick={() => openUpdateModal(project)}
                    className="w-full py-3 rounded-xl bg-gradient-primary text-white font-bold text-xs shadow-lg shadow-blue-600/20 hover:opacity-95 transition-all"
                  >
                    {isCompleted || isInProgress ? 'Update Project Submission & Links' : 'Start This Project'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal for submission / links update */}
      {activeModalProject && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700/60 rounded-3xl p-8 max-w-lg w-full shadow-2xl space-y-6">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">Update Submission</span>
              <h3 className="text-xl font-bold text-white mt-1">{activeModalProject.title}</h3>
            </div>

            <form onSubmit={handleSaveProgress} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Completion Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl glass-input text-sm"
                >
                  <option value="not_started">Not Started</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  GitHub Repository Link
                </label>
                <input
                  type="url"
                  value={repoLink}
                  onChange={(e) => setRepoLink(e.target.value)}
                  placeholder="https://github.com/your-username/project-repo"
                  className="w-full px-4 py-3 rounded-xl glass-input text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Live Demo Link (Optional)
                </label>
                <input
                  type="url"
                  value={demoLink}
                  onChange={(e) => setDemoLink(e.target.value)}
                  placeholder="https://your-project.vercel.app"
                  className="w-full px-4 py-3 rounded-xl glass-input text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Notes / Implementation Details
                </label>
                <textarea
                  rows="2"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Mention key algorithms or architecture highlights..."
                  className="w-full px-4 py-3 rounded-xl glass-input text-sm resize-none"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveModalProject(null)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-gradient-primary text-white font-bold text-xs shadow-lg shadow-blue-600/30 hover:opacity-95"
                >
                  {saving ? 'Saving...' : 'Save Submission'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
