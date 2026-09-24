import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../api/axiosInstance';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';
import { Target, Check, DollarSign, TrendingUp, Search, Plus, ExternalLink, ArrowRight } from 'lucide-react';

const CareerSelection = () => {
  const { user, refreshUser } = useAuth();
  const [careers, setCareers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selecting, setSelecting] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [alertInfo, setAlertInfo] = useState(null);

  // Admin Create Career Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState({ title: '', description: '', category: 'Software Engineering', demand: 'High', salaryRange: '$85,000 - $135,000 / year' });
  const [creating, setCreating] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchCareers();
  }, []);

  const fetchCareers = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get('/careers');
      if (res.data.success) {
        setCareers(res.data.careers);
      }
    } catch (err) {
      setAlertInfo({ type: 'error', message: 'Failed to load career paths' });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTarget = async (careerId) => {
    try {
      setSelecting(true);
      const res = await axiosInstance.post('/careers/select-target', { careerId });
      if (res.data.success) {
        await refreshUser();
        setAlertInfo({ type: 'success', message: res.data.message });
        setTimeout(() => {
          navigate('/gap-analysis');
        }, 1000);
      }
    } catch (err) {
      setAlertInfo({ type: 'error', message: err.response?.data?.message || 'Failed to set target career' });
    } finally {
      setSelecting(false);
    }
  };

  const handleCreateCareerSubmit = async (e) => {
    e.preventDefault();
    try {
      setCreating(true);
      const res = await axiosInstance.post('/careers', createForm);
      if (res.data.success) {
        setAlertInfo({ type: 'success', message: 'New career path created!' });
        setIsCreateModalOpen(false);
        setCreateForm({ title: '', description: '', category: 'Software Engineering', demand: 'High', salaryRange: '$85,000 - $135,000 / year' });
        fetchCareers();
      }
    } catch (err) {
      setAlertInfo({ type: 'error', message: err.response?.data?.message || 'Failed to create career' });
    } finally {
      setCreating(false);
    }
  };

  if (loading) return <LoadingSpinner fullScreen message="Loading career explorer..." />;

  const currentTargetId = user?.targetCareer?._id || user?.targetCareer;
  const isAdmin = user?.role === 'admin';

  const categories = ['All', 'Software Engineering', 'Data & Analytics', 'Artificial Intelligence', 'Infrastructure', 'Security', 'Design'];

  const filteredCareers = careers.filter(c => {
    const matchesCategory = selectedCategory === 'All' || c.category === selectedCategory;
    const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-8 pb-12 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Career Explorer</h1>
          <p className="text-slate-400 text-sm mt-1">Explore industry roles, view skill requirements, and set your target career goal.</p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-5 py-3 rounded-xl bg-gradient-primary text-white font-bold text-sm shadow-lg shadow-blue-600/30 hover:opacity-95 transition-all flex items-center gap-2 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" /> Create Career Path
          </button>
        )}
      </div>

      {alertInfo && <Alert type={alertInfo.type} message={alertInfo.message} onClose={() => setAlertInfo(null)} />}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 glass-panel p-4 rounded-2xl border border-slate-800">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search careers..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 custom-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Career Grid */}
      {filteredCareers.length === 0 ? (
        <EmptyState
          title="No Careers Found"
          message="No career paths match your selected filter."
          actionText="Reset Filters"
          onAction={() => { setSelectedCategory('All'); setSearchTerm(''); }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredCareers.map((career) => {
            const isSelected = currentTargetId === career._id;

            return (
              <div
                key={career._id}
                className={`glass-panel p-8 rounded-3xl border transition-all flex flex-col justify-between relative overflow-hidden ${
                  isSelected
                    ? 'border-blue-500 bg-blue-950/20 shadow-2xl shadow-blue-600/20'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-0 right-0 bg-blue-600 text-white text-[11px] font-extrabold uppercase px-4 py-1.5 rounded-bl-2xl flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Current Goal
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-2xl bg-gradient-primary text-white shadow-lg shadow-blue-600/20">
                        <Target className="w-6 h-6" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-white">{career.title}</h2>
                        <span className="text-xs text-slate-400 font-medium">{career.category}</span>
                      </div>
                    </div>

                    <Link
                      to={`/careers/${career._id}`}
                      className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all text-xs font-semibold flex items-center gap-1"
                      title="View Full Details"
                    >
                      Details <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  <p className="text-sm text-slate-300 mb-6 leading-relaxed line-clamp-3">{career.description}</p>

                  {/* Info Badges */}
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
                      <span className="text-slate-400 font-medium block">Average Salary</span>
                      <span className="text-emerald-400 font-bold mt-0.5 block">{career.salaryRange || career.averageSalary}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
                      <span className="text-slate-400 font-medium block">Industry Demand</span>
                      <span className="text-purple-400 font-bold mt-0.5 block">{career.demand || career.jobDemand}</span>
                    </div>
                  </div>

                  {/* Required Skills Chips */}
                  <div className="mb-6">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2.5">
                      Required Skills ({career.requiredSkills?.length || 0})
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {career.requiredSkills?.slice(0, 6).map((req) => (
                        <span
                          key={req.skill?._id || Math.random()}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-200 font-medium flex items-center gap-1"
                        >
                          {req.skill?.name || 'Skill'}
                          <span className="text-[10px] text-blue-400 font-bold bg-blue-500/10 px-1 rounded">
                            Lvl {req.requiredLevel}
                          </span>
                        </span>
                      ))}
                      {(career.requiredSkills?.length || 0) > 6 && (
                        <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-400 font-medium">
                          +{career.requiredSkills.length - 6} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-800/80 flex items-center justify-between">
                  <Link to={`/careers/${career._id}`} className="text-xs text-blue-400 hover:underline font-semibold">
                    View Full Specifications
                  </Link>

                  <button
                    onClick={() => handleSelectTarget(career._id)}
                    disabled={selecting || isSelected}
                    className={`px-6 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                      isSelected
                        ? 'bg-slate-800 text-slate-400 cursor-default border border-slate-700'
                        : 'bg-gradient-primary text-white shadow-lg shadow-blue-600/30 hover:opacity-95'
                    }`}
                  >
                    {isSelected ? 'Target Active' : 'Choose This Career'}
                    {!isSelected && <ArrowRight className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Admin Create Career Modal */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Create New Career Path">
        <form onSubmit={handleCreateCareerSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Title</label>
            <input
              type="text"
              required
              value={createForm.title}
              onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl glass-input text-xs"
              placeholder="e.g. AI Systems Architect"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Description</label>
            <textarea
              required
              rows="3"
              value={createForm.description}
              onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl glass-input text-xs resize-none"
              placeholder="Describe the responsibilities and scope of this career role..."
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Category</label>
              <select
                value={createForm.category}
                onChange={(e) => setCreateForm({ ...createForm, category: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl glass-input text-xs"
              >
                {categories.filter(c => c !== 'All').map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Demand Level</label>
              <select
                value={createForm.demand}
                onChange={(e) => setCreateForm({ ...createForm, demand: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl glass-input text-xs"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Very High">Very High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Salary Range</label>
            <input
              type="text"
              value={createForm.salaryRange}
              onChange={(e) => setCreateForm({ ...createForm, salaryRange: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl glass-input text-xs"
              placeholder="$90,000 - $150,000 / year"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-semibold">Cancel</button>
            <button type="submit" disabled={creating} className="px-5 py-2 rounded-xl bg-gradient-primary text-white text-xs font-bold">{creating ? 'Creating...' : 'Create Career'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CareerSelection;
