import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';
import SafeLink from '../components/SafeLink';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell
} from 'recharts';
import {
  ShieldAlert,
  Users,
  Award,
  Target,
  HelpCircle,
  BookOpen,
  FolderGit2,
  Plus,
  Search,
  Trash2,
  Edit,
  ExternalLink,
  Map,
  Link as LinkIcon,
  CheckCircle,
  FileText
} from 'lucide-react';

const AdminDashboard = ({ tab: defaultTab = 'overview' }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Determine active tab from URL path
  const getActiveTabFromPath = () => {
    const path = location.pathname;
    if (path.includes('/admin/users')) return 'users';
    if (path.includes('/admin/skills')) return 'skills';
    if (path.includes('/admin/careers')) return 'careers';
    if (path.includes('/admin/career-skills')) return 'career-skills';
    if (path.includes('/admin/roadmaps')) return 'roadmaps';
    if (path.includes('/admin/resources')) return 'resources';
    if (path.includes('/admin/assessments')) return 'assessments';
    if (path.includes('/admin/projects')) return 'projects';
    return 'overview';
  };

  const activeTab = getActiveTabFromPath();

  // State definitions
  const [stats, setStats] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alertInfo, setAlertInfo] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Data collections for tabs
  const [users, setUsers] = useState([]);
  const [skills, setSkills] = useState([]);
  const [careers, setCareers] = useState([]);
  const [careerSkills, setCareerSkills] = useState([]);
  const [roadmaps, setRoadmaps] = useState([]);
  const [resources, setResources] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [projects, setProjects] = useState([]);

  // Modals state
  const [activeModal, setActiveModal] = useState(null); // 'skill', 'career', 'careerSkill', 'resource', 'assessment', 'project', 'editUser'
  const [editItem, setEditItem] = useState(null);

  // Form states
  const [skillForm, setSkillForm] = useState({ name: '', category: 'Frontend', description: '', icon: 'Code' });
  const [careerForm, setCareerForm] = useState({ title: '', description: '', category: 'Software Engineering', demand: 'High', salaryRange: '$80,000 - $130,000 / year' });
  const [careerSkillForm, setCareerSkillForm] = useState({ career: '', skill: '', requiredLevel: 2, priority: 'medium' });
  const [resourceForm, setResourceForm] = useState({ title: '', description: '', url: '', type: 'course', skill: '', difficulty: 'beginner', provider: 'Web' });
  const [projectForm, setProjectForm] = useState({ title: '', description: '', difficulty: 'intermediate', estimatedDuration: '10-15 hours', githubUrl: '', demoUrl: '' });
  const [userRoleForm, setUserRoleForm] = useState({ role: 'student', name: '' });

  useEffect(() => {
    fetchTabData(activeTab);
  }, [activeTab]);

  const fetchTabData = async (tab) => {
    try {
      setLoading(true);
      if (tab === 'overview') {
        const res = await axiosInstance.get('/admin/stats');
        if (res.data.success) {
          setStats(res.data.stats);
          setRecentUsers(res.data.recentUsers);
        }
      } else if (tab === 'users') {
        const res = await axiosInstance.get('/admin/users');
        if (res.data.success) setUsers(res.data.users);
      } else if (tab === 'skills') {
        const res = await axiosInstance.get('/admin/skills');
        if (res.data.success) setSkills(res.data.skills);
      } else if (tab === 'careers') {
        const res = await axiosInstance.get('/admin/careers');
        if (res.data.success) setCareers(res.data.careers);
      } else if (tab === 'career-skills') {
        const res = await axiosInstance.get('/admin/career-skills');
        if (res.data.success) setCareerSkills(res.data.careerSkills);
      } else if (tab === 'roadmaps') {
        const res = await axiosInstance.get('/admin/roadmaps');
        if (res.data.success) setRoadmaps(res.data.roadmaps);
      } else if (tab === 'resources') {
        const res = await axiosInstance.get('/resources');
        if (res.data.success) setResources(res.data.resources);
      } else if (tab === 'assessments') {
        const res = await axiosInstance.get('/assessments');
        if (res.data.success) setAssessments(res.data.assessments);
      } else if (tab === 'projects') {
        const res = await axiosInstance.get('/projects');
        if (res.data.success) setProjects(res.data.projects);
      }
    } catch (err) {
      setAlertInfo({ type: 'error', message: err.response?.data?.message || 'Failed to fetch admin data' });
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (newTab) => {
    const route = newTab === 'overview' ? '/admin' : `/admin/${newTab}`;
    navigate(route);
  };

  // -------------------------------------------------------------
  // HANDLERS FOR CREATION & DELETION
  // -------------------------------------------------------------
  const handleSaveSkill = async (e) => {
    e.preventDefault();
    try {
      if (editItem) {
        await axiosInstance.put(`/admin/skills/${editItem._id}`, skillForm);
        setAlertInfo({ type: 'success', message: 'Skill updated successfully' });
      } else {
        await axiosInstance.post('/admin/skills', skillForm);
        setAlertInfo({ type: 'success', message: 'New master skill created successfully' });
      }
      setActiveModal(null);
      setEditItem(null);
      fetchTabData('skills');
    } catch (err) {
      setAlertInfo({ type: 'error', message: err.response?.data?.message || 'Failed to save skill' });
    }
  };

  const handleDeleteSkill = async (id) => {
    if (!window.confirm('Are you sure you want to delete this skill?')) return;
    try {
      await axiosInstance.delete(`/admin/skills/${id}`);
      setAlertInfo({ type: 'success', message: 'Skill deleted successfully' });
      fetchTabData('skills');
    } catch (err) {
      setAlertInfo({ type: 'error', message: err.response?.data?.message || 'Failed to delete skill' });
    }
  };

  const handleSaveCareer = async (e) => {
    e.preventDefault();
    try {
      if (editItem) {
        await axiosInstance.put(`/admin/careers/${editItem._id}`, careerForm);
        setAlertInfo({ type: 'success', message: 'Career path updated successfully' });
      } else {
        await axiosInstance.post('/admin/careers', careerForm);
        setAlertInfo({ type: 'success', message: 'New career path created successfully' });
      }
      setActiveModal(null);
      setEditItem(null);
      fetchTabData('careers');
    } catch (err) {
      setAlertInfo({ type: 'error', message: err.response?.data?.message || 'Failed to save career' });
    }
  };

  const handleDeleteCareer = async (id) => {
    if (!window.confirm('Are you sure you want to delete this career path?')) return;
    try {
      await axiosInstance.delete(`/admin/careers/${id}`);
      setAlertInfo({ type: 'success', message: 'Career deleted successfully' });
      fetchTabData('careers');
    } catch (err) {
      setAlertInfo({ type: 'error', message: err.response?.data?.message || 'Failed to delete career' });
    }
  };

  const handleSaveResource = async (e) => {
    e.preventDefault();
    try {
      if (editItem) {
        await axiosInstance.put(`/admin/resources/${editItem._id}`, resourceForm);
        setAlertInfo({ type: 'success', message: 'Resource updated successfully' });
      } else {
        await axiosInstance.post('/admin/resources', resourceForm);
        setAlertInfo({ type: 'success', message: 'New learning resource created successfully' });
      }
      setActiveModal(null);
      setEditItem(null);
      fetchTabData('resources');
    } catch (err) {
      setAlertInfo({ type: 'error', message: err.response?.data?.message || 'Failed to save resource' });
    }
  };

  const handleDeleteResource = async (id) => {
    if (!window.confirm('Are you sure you want to delete this resource?')) return;
    try {
      await axiosInstance.delete(`/admin/resources/${id}`);
      setAlertInfo({ type: 'success', message: 'Resource deleted successfully' });
      fetchTabData('resources');
    } catch (err) {
      setAlertInfo({ type: 'error', message: err.response?.data?.message || 'Failed to delete resource' });
    }
  };

  const handleSaveProject = async (e) => {
    e.preventDefault();
    try {
      if (editItem) {
        await axiosInstance.put(`/admin/projects/${editItem._id}`, projectForm);
        setAlertInfo({ type: 'success', message: 'Project updated successfully' });
      } else {
        await axiosInstance.post('/admin/projects', projectForm);
        setAlertInfo({ type: 'success', message: 'New portfolio project created successfully' });
      }
      setActiveModal(null);
      setEditItem(null);
      fetchTabData('projects');
    } catch (err) {
      setAlertInfo({ type: 'error', message: err.response?.data?.message || 'Failed to save project' });
    }
  };

  const handleDeleteProject = async (id) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    try {
      await axiosInstance.delete(`/admin/projects/${id}`);
      setAlertInfo({ type: 'success', message: 'Project deleted successfully' });
      fetchTabData('projects');
    } catch (err) {
      setAlertInfo({ type: 'error', message: err.response?.data?.message || 'Failed to delete project' });
    }
  };

  const handleUpdateUserRole = async (e) => {
    e.preventDefault();
    if (!editItem) return;
    try {
      await axiosInstance.put(`/admin/users/${editItem._id}`, userRoleForm);
      setAlertInfo({ type: 'success', message: 'User role updated successfully' });
      setActiveModal(null);
      setEditItem(null);
      fetchTabData('users');
    } catch (err) {
      setAlertInfo({ type: 'error', message: err.response?.data?.message || 'Failed to update user role' });
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user account?')) return;
    try {
      await axiosInstance.delete(`/admin/users/${id}`);
      setAlertInfo({ type: 'success', message: 'User deleted successfully' });
      fetchTabData('users');
    } catch (err) {
      setAlertInfo({ type: 'error', message: err.response?.data?.message || 'Failed to delete user' });
    }
  };

  // Admin Entities Chart Data
  const statsChartData = stats ? [
    { name: 'Users', count: stats.totalUsers, color: '#3b82f6' },
    { name: 'Students', count: stats.totalStudents, color: '#06b6d4' },
    { name: 'Skills', count: stats.totalSkills, color: '#10b981' },
    { name: 'Careers', count: stats.totalCareers, color: '#a855f7' },
    { name: 'Tests', count: stats.totalAssessments, color: '#f59e0b' },
    { name: 'Resources', count: stats.totalResources, color: '#ec4899' },
    { name: 'Projects', count: stats.totalProjects, color: '#f43f5e' }
  ] : [];

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
            System Administration
          </span>
          <h1 className="text-3xl font-black text-white tracking-tight mt-2">Admin Command Center</h1>
          <p className="text-slate-400 text-sm mt-1">Full system governance across users, master skills, careers, learning resources, and portfolio projects.</p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              setSkillForm({ name: '', category: 'Frontend', description: '', icon: 'Code' });
              setEditItem(null);
              setActiveModal('skill');
            }}
            className="px-3.5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-blue-600/20"
          >
            <Plus className="w-4 h-4" /> Add Skill
          </button>
          <button
            onClick={() => {
              setCareerForm({ title: '', description: '', category: 'Software Engineering', demand: 'High', salaryRange: '$80,000 - $130,000 / year' });
              setEditItem(null);
              setActiveModal('career');
            }}
            className="px-3.5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-purple-600/20"
          >
            <Plus className="w-4 h-4" /> Add Career
          </button>
        </div>
      </div>

      {alertInfo && <Alert type={alertInfo.type} message={alertInfo.message} onClose={() => setAlertInfo(null)} />}

      {/* Admin Navigation Bar Tabs */}
      <div className="glass-panel p-2 rounded-2xl border border-slate-800 flex flex-wrap gap-1 overflow-x-auto">
        {[
          { id: 'overview', label: 'Overview', icon: BarChart },
          { id: 'users', label: 'Users', icon: Users },
          { id: 'skills', label: 'Skills', icon: Award },
          { id: 'careers', label: 'Careers', icon: Target },
          { id: 'career-skills', label: 'Career-Skills', icon: LinkIcon },
          { id: 'roadmaps', label: 'Roadmaps', icon: Map },
          { id: 'resources', label: 'Resources', icon: BookOpen },
          { id: 'assessments', label: 'Assessments', icon: HelpCircle },
          { id: 'projects', label: 'Projects', icon: FolderGit2 }
        ].map(tabItem => {
          const TabIcon = tabItem.icon;
          const isActive = activeTab === tabItem.id;

          return (
            <button
              key={tabItem.id}
              onClick={() => handleTabChange(tabItem.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <TabIcon className="w-4 h-4" />
              {tabItem.label}
            </button>
          );
        })}
      </div>

      {/* Main Tab Content Display */}
      {loading ? (
        <LoadingSpinner message="Fetching administrative record data..." />
      ) : (
        <>
          {/* 1. OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* 7 Stat Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
                <div className="glass-card p-4 rounded-2xl border border-slate-800 text-center">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Total Users</span>
                  <div className="text-2xl font-black text-white mt-1">{stats?.totalUsers || 0}</div>
                </div>
                <div className="glass-card p-4 rounded-2xl border border-slate-800 text-center">
                  <span className="text-[10px] font-bold uppercase text-cyan-400 block">Students</span>
                  <div className="text-2xl font-black text-cyan-400 mt-1">{stats?.totalStudents || 0}</div>
                </div>
                <div className="glass-card p-4 rounded-2xl border border-slate-800 text-center">
                  <span className="text-[10px] font-bold uppercase text-emerald-400 block">Skills</span>
                  <div className="text-2xl font-black text-emerald-400 mt-1">{stats?.totalSkills || 0}</div>
                </div>
                <div className="glass-card p-4 rounded-2xl border border-slate-800 text-center">
                  <span className="text-[10px] font-bold uppercase text-purple-400 block">Careers</span>
                  <div className="text-2xl font-black text-purple-400 mt-1">{stats?.totalCareers || 0}</div>
                </div>
                <div className="glass-card p-4 rounded-2xl border border-slate-800 text-center">
                  <span className="text-[10px] font-bold uppercase text-amber-400 block">Tests</span>
                  <div className="text-2xl font-black text-amber-400 mt-1">{stats?.totalAssessments || 0}</div>
                </div>
                <div className="glass-card p-4 rounded-2xl border border-slate-800 text-center">
                  <span className="text-[10px] font-bold uppercase text-pink-400 block">Resources</span>
                  <div className="text-2xl font-black text-pink-400 mt-1">{stats?.totalResources || 0}</div>
                </div>
                <div className="glass-card p-4 rounded-2xl border border-slate-800 text-center">
                  <span className="text-[10px] font-bold uppercase text-rose-400 block">Projects</span>
                  <div className="text-2xl font-black text-rose-400 mt-1">{stats?.totalProjects || 0}</div>
                </div>
              </div>

              {/* Recharts System Metrics Overview Chart */}
              <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <BarChart className="w-5 h-5 text-blue-400" /> Platform Entity Distribution
                </h2>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={statsChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 11 }} />
                      <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                      />
                      <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                        {statsChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Recent Registered Users */}
              <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-400" /> Recent Student Registrations
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900/80 text-slate-400 uppercase font-semibold border-b border-slate-800">
                      <tr>
                        <th className="px-6 py-4">Student Name</th>
                        <th className="px-6 py-4">Email</th>
                        <th className="px-6 py-4">Target Career</th>
                        <th className="px-6 py-4">Joined Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80 text-slate-200">
                      {recentUsers.map((u) => (
                        <tr key={u._id} className="hover:bg-slate-800/40">
                          <td className="px-6 py-4 font-bold text-white">{u.name}</td>
                          <td className="px-6 py-4 text-slate-400">{u.email}</td>
                          <td className="px-6 py-4 text-purple-400 font-semibold">{u.targetCareer?.title || 'None Selected'}</td>
                          <td className="px-6 py-4 text-slate-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 2. USERS TAB */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-400" /> User Accounts Management
                  </h2>
                  <span className="text-xs text-slate-400 font-semibold">Total: {users.length} Users</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900/80 text-slate-400 uppercase font-semibold border-b border-slate-800">
                      <tr>
                        <th className="px-6 py-4">Name</th>
                        <th className="px-6 py-4">Email</th>
                        <th className="px-6 py-4">Role</th>
                        <th className="px-6 py-4">Target Career</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80 text-slate-200">
                      {users.map((u) => (
                        <tr key={u._id} className="hover:bg-slate-800/40">
                          <td className="px-6 py-4 font-bold text-white">{u.name}</td>
                          <td className="px-6 py-4 text-slate-400">{u.email}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase border ${
                              u.role === 'admin' ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                            }`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-slate-300">{u.targetCareer?.title || 'Not Selected'}</td>
                          <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                setEditItem(u);
                                setUserRoleForm({ role: u.role, name: u.name });
                                setActiveModal('editUser');
                              }}
                              className="p-1.5 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all"
                              title="Edit User Role"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(u._id)}
                              className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
                              title="Delete Account"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 3. SKILLS TAB */}
          {activeTab === 'skills' && (
            <div className="space-y-6">
              <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Award className="w-5 h-5 text-emerald-400" /> Master Skills Library
                  </h2>
                  <button
                    onClick={() => {
                      setSkillForm({ name: '', category: 'Frontend', description: '', icon: 'Code' });
                      setEditItem(null);
                      setActiveModal('skill');
                    }}
                    className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 transition-all flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" /> Add Master Skill
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900/80 text-slate-400 uppercase font-semibold border-b border-slate-800">
                      <tr>
                        <th className="px-6 py-4">Skill Name</th>
                        <th className="px-6 py-4">Category</th>
                        <th className="px-6 py-4">Description</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80 text-slate-200">
                      {skills.map((s) => (
                        <tr key={s._id} className="hover:bg-slate-800/40">
                          <td className="px-6 py-4 font-bold text-white">{s.name}</td>
                          <td className="px-6 py-4">
                            <span className="px-2.5 py-0.5 rounded bg-blue-500/10 text-blue-300 font-semibold border border-blue-500/20">
                              {s.category}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-slate-400 max-w-sm truncate">{s.description}</td>
                          <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                setEditItem(s);
                                setSkillForm({ name: s.name, category: s.category, description: s.description || '', icon: s.icon || 'Code' });
                                setActiveModal('skill');
                              }}
                              className="p-1.5 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteSkill(s._id)}
                              className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 4. CAREERS TAB */}
          {activeTab === 'careers' && (
            <div className="space-y-6">
              <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Target className="w-5 h-5 text-purple-400" /> Target Career Paths
                  </h2>
                  <button
                    onClick={() => {
                      setCareerForm({ title: '', description: '', category: 'Software Engineering', demand: 'High', salaryRange: '$80,000 - $130,000 / year' });
                      setEditItem(null);
                      setActiveModal('career');
                    }}
                    className="px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-500 transition-all flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" /> Add Career Path
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {careers.map((c) => (
                    <div key={c._id} className="glass-card p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="text-[10px] uppercase tracking-wider font-extrabold text-purple-400 px-2.5 py-0.5 rounded bg-purple-500/10 border border-purple-500/20">
                            {c.category}
                          </span>
                          <span className="text-xs text-amber-400 font-bold">{c.demand} Demand</span>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">{c.title}</h3>
                        <p className="text-xs text-slate-400 mb-4 line-clamp-3 leading-relaxed">{c.description}</p>
                      </div>

                      <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                        <span className="text-xs text-emerald-400 font-bold">{c.salaryRange}</span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditItem(c);
                              setCareerForm({ title: c.title, description: c.description, category: c.category, demand: c.demand, salaryRange: c.salaryRange });
                              setActiveModal('career');
                            }}
                            className="p-1.5 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteCareer(c._id)}
                            className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 5. CAREER-SKILLS TAB */}
          {activeTab === 'career-skills' && (
            <div className="space-y-6">
              <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <LinkIcon className="w-5 h-5 text-cyan-400" /> Career Skill Requirement Links
                  </h2>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900/80 text-slate-400 uppercase font-semibold border-b border-slate-800">
                      <tr>
                        <th className="px-6 py-4">Career Path</th>
                        <th className="px-6 py-4">Required Skill</th>
                        <th className="px-6 py-4">Required Level</th>
                        <th className="px-6 py-4">Priority</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80 text-slate-200">
                      {careerSkills.map((cs) => (
                        <tr key={cs._id} className="hover:bg-slate-800/40">
                          <td className="px-6 py-4 font-bold text-white">{cs.career?.title || 'Unknown Career'}</td>
                          <td className="px-6 py-4 text-purple-300 font-semibold">{cs.skill?.name || 'Unknown Skill'}</td>
                          <td className="px-6 py-4 text-slate-300 font-bold">Level {cs.requiredLevel} / 4</td>
                          <td className="px-6 py-4">
                            <span className="px-2.5 py-0.5 rounded-md text-[10px] uppercase font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                              {cs.priority}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 6. ROADMAPS TAB */}
          {activeTab === 'roadmaps' && (
            <div className="space-y-6">
              <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Map className="w-5 h-5 text-amber-400" /> Active Student Roadmaps
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900/80 text-slate-400 uppercase font-semibold border-b border-slate-800">
                      <tr>
                        <th className="px-6 py-4">Student</th>
                        <th className="px-6 py-4">Career Path</th>
                        <th className="px-6 py-4">Milestone Steps</th>
                        <th className="px-6 py-4">Generated Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80 text-slate-200">
                      {roadmaps.map((r) => (
                        <tr key={r._id} className="hover:bg-slate-800/40">
                          <td className="px-6 py-4 font-bold text-white">{r.user?.name || 'Student'} ({r.user?.email})</td>
                          <td className="px-6 py-4 text-purple-400 font-semibold">{r.career?.title || 'Career'}</td>
                          <td className="px-6 py-4 font-bold text-amber-400">{r.steps?.length || 0} Steps</td>
                          <td className="px-6 py-4 text-slate-500">{new Date(r.generatedAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 7. RESOURCES TAB */}
          {activeTab === 'resources' && (
            <div className="space-y-6">
              <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-pink-400" /> Learning Resources
                  </h2>
                  <button
                    onClick={() => {
                      setResourceForm({ title: '', description: '', url: '', type: 'course', skill: skills[0]?._id || '', difficulty: 'beginner', provider: 'Web' });
                      setEditItem(null);
                      setActiveModal('resource');
                    }}
                    className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 transition-all flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" /> Add Resource
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900/80 text-slate-400 uppercase font-semibold border-b border-slate-800">
                      <tr>
                        <th className="px-6 py-4">Title</th>
                        <th className="px-6 py-4">Type</th>
                        <th className="px-6 py-4">Skill</th>
                        <th className="px-6 py-4">URL</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80 text-slate-200">
                      {resources.map((res) => (
                        <tr key={res._id} className="hover:bg-slate-800/40">
                          <td className="px-6 py-4 font-bold text-white">{res.title}</td>
                          <td className="px-6 py-4 text-cyan-400 font-semibold uppercase">{res.type}</td>
                          <td className="px-6 py-4 text-purple-300 font-semibold">{res.skill?.name || 'Skill'}</td>
                          <td className="px-6 py-4 max-w-xs truncate">
                            <SafeLink href={res.url} className="text-blue-400 hover:underline flex items-center gap-1">
                              Link <ExternalLink className="w-3 h-3" />
                            </SafeLink>
                          </td>
                          <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                setEditItem(res);
                                setResourceForm({
                                  title: res.title,
                                  description: res.description || '',
                                  url: res.url,
                                  type: res.type,
                                  skill: res.skill?._id || '',
                                  difficulty: res.difficulty || 'beginner',
                                  provider: res.provider || 'Web'
                                });
                                setActiveModal('resource');
                              }}
                              className="p-1.5 text-blue-400 hover:bg-blue-500/10 rounded-lg"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteResource(res._id)}
                              className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded-lg"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 8. ASSESSMENTS TAB */}
          {activeTab === 'assessments' && (
            <div className="space-y-6">
              <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-amber-400" /> Assessment Quizzes
                  </h2>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900/80 text-slate-400 uppercase font-semibold border-b border-slate-800">
                      <tr>
                        <th className="px-6 py-4">Title</th>
                        <th className="px-6 py-4">Skill</th>
                        <th className="px-6 py-4">Difficulty</th>
                        <th className="px-6 py-4">Questions Count</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80 text-slate-200">
                      {assessments.map((a) => (
                        <tr key={a._id} className="hover:bg-slate-800/40">
                          <td className="px-6 py-4 font-bold text-white">{a.title}</td>
                          <td className="px-6 py-4 text-purple-300 font-semibold">{a.skill?.name || 'Skill'}</td>
                          <td className="px-6 py-4 text-amber-400 font-semibold uppercase">{a.difficulty}</td>
                          <td className="px-6 py-4 font-bold text-white">{a.questions?.length || 0} Questions</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 9. PROJECTS TAB */}
          {activeTab === 'projects' && (
            <div className="space-y-6">
              <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <FolderGit2 className="w-5 h-5 text-rose-400" /> Portfolio Projects
                  </h2>
                  <button
                    onClick={() => {
                      setProjectForm({ title: '', description: '', difficulty: 'intermediate', estimatedDuration: '10-15 hours', githubUrl: '', demoUrl: '' });
                      setEditItem(null);
                      setActiveModal('project');
                    }}
                    className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 transition-all flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" /> Add Project
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900/80 text-slate-400 uppercase font-semibold border-b border-slate-800">
                      <tr>
                        <th className="px-6 py-4">Title</th>
                        <th className="px-6 py-4">Difficulty</th>
                        <th className="px-6 py-4">Duration</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80 text-slate-200">
                      {projects.map((p) => (
                        <tr key={p._id} className="hover:bg-slate-800/40">
                          <td className="px-6 py-4 font-bold text-white">{p.title}</td>
                          <td className="px-6 py-4 text-purple-400 font-semibold uppercase">{p.difficulty}</td>
                          <td className="px-6 py-4 text-slate-400">{p.estimatedDuration}</td>
                          <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                setEditItem(p);
                                setProjectForm({
                                  title: p.title,
                                  description: p.description,
                                  difficulty: p.difficulty || 'intermediate',
                                  estimatedDuration: p.estimatedDuration || '10-15 hours',
                                  githubUrl: p.githubUrl || '',
                                  demoUrl: p.demoUrl || ''
                                });
                                setActiveModal('project');
                              }}
                              className="p-1.5 text-blue-400 hover:bg-blue-500/10 rounded-lg"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteProject(p._id)}
                              className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded-lg"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* CREATE / EDIT MODALS */}

      {/* Skill Modal */}
      {activeModal === 'skill' && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700/60 rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-5">
            <h3 className="text-xl font-bold text-white">{editItem ? 'Edit Master Skill' : 'Create Master Skill'}</h3>
            <form onSubmit={handleSaveSkill} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Skill Name</label>
                <input
                  type="text"
                  required
                  value={skillForm.name}
                  onChange={(e) => setSkillForm({ ...skillForm, name: e.target.value })}
                  placeholder="e.g. GraphQL"
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Category</label>
                <select
                  value={skillForm.category}
                  onChange={(e) => setSkillForm({ ...skillForm, category: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
                >
                  <option value="Frontend">Frontend</option>
                  <option value="Backend">Backend</option>
                  <option value="Database">Database</option>
                  <option value="DevOps">DevOps</option>
                  <option value="Tools & Soft Skills">Tools & Soft Skills</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Description</label>
                <textarea
                  rows="2"
                  value={skillForm.description}
                  onChange={(e) => setSkillForm({ ...skillForm, description: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-sm resize-none"
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button type="button" onClick={() => setActiveModal(null)} className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white">Cancel</button>
                <button type="submit" className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-lg shadow-blue-600/20">Save Skill</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Resource Modal */}
      {activeModal === 'resource' && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700/60 rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-5">
            <h3 className="text-xl font-bold text-white">{editItem ? 'Edit Resource' : 'Create Resource'}</h3>
            <form onSubmit={handleSaveResource} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Title</label>
                <input type="text" required value={resourceForm.title} onChange={(e) => setResourceForm({ ...resourceForm, title: e.target.value })} className="w-full px-4 py-2.5 rounded-xl glass-input text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">URL (http:// or https://)</label>
                <input type="url" required value={resourceForm.url} onChange={(e) => setResourceForm({ ...resourceForm, url: e.target.value })} placeholder="https://..." className="w-full px-4 py-2.5 rounded-xl glass-input text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Resource Type</label>
                <select value={resourceForm.type} onChange={(e) => setResourceForm({ ...resourceForm, type: e.target.value })} className="w-full px-4 py-2.5 rounded-xl glass-input text-sm">
                  <option value="course">Course</option>
                  <option value="documentation">Documentation</option>
                  <option value="article">Article</option>
                  <option value="video">Video</option>
                  <option value="book">Book</option>
                  <option value="tutorial">Tutorial</option>
                </select>
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button type="button" onClick={() => setActiveModal(null)} className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white">Cancel</button>
                <button type="submit" className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-lg shadow-blue-600/20">Save Resource</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Role Modal */}
      {activeModal === 'editUser' && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700/60 rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-5">
            <h3 className="text-xl font-bold text-white">Edit User Role</h3>
            <p className="text-xs text-slate-400">Updating role for <strong className="text-white">{editItem?.email}</strong></p>
            <form onSubmit={handleUpdateUserRole} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Role</label>
                <select value={userRoleForm.role} onChange={(e) => setUserRoleForm({ ...userRoleForm, role: e.target.value })} className="w-full px-4 py-2.5 rounded-xl glass-input text-sm">
                  <option value="student">Student</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button type="button" onClick={() => setActiveModal(null)} className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white">Cancel</button>
                <button type="submit" className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-lg shadow-blue-600/20">Save Role</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
