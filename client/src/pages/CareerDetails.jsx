import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../api/axiosInstance';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';
import SkillProgressBar from '../components/SkillProgressBar';
import Modal from '../components/Modal';
import SkillSelector from '../components/SkillSelector';
import ProficiencySelector from '../components/ProficiencySelector';
import ConfirmDialog from '../components/ConfirmDialog';
import { Target, Check, ArrowLeft, Briefcase, DollarSign, TrendingUp, Plus, Trash2, Edit, Shield } from 'lucide-react';

const PRIORITY_STYLES = {
  critical: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
  high: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
  medium: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
  low: 'bg-slate-800 border-slate-700 text-slate-400'
};

const CareerDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();

  const [career, setCareer] = useState(null);
  const [masterSkills, setMasterSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selecting, setSelecting] = useState(false);
  const [alertInfo, setAlertInfo] = useState(null);

  // Admin Modals
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddSkillModalOpen, setIsAddSkillModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  // Admin Form State
  const [editForm, setEditForm] = useState({ title: '', description: '', category: '', demand: 'High', salaryRange: '' });
  const [addSkillForm, setAddSkillForm] = useState({ skillId: '', requiredLevel: 2, priority: 'high' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCareerDetails();
  }, [id]);

  const fetchCareerDetails = async () => {
    try {
      setLoading(true);
      const [res, skillsRes] = await Promise.all([
        axiosInstance.get(`/careers/${id}`),
        axiosInstance.get('/skills')
      ]);

      if (res.data.success) {
        const cData = res.data.career;
        setCareer(cData);
        setEditForm({
          title: cData.title || '',
          description: cData.description || '',
          category: cData.category || 'Software Engineering',
          demand: cData.demand || 'High',
          salaryRange: cData.salaryRange || cData.averageSalary || '$85,000 - $135,000 / year'
        });
      }

      if (skillsRes.data.success) {
        setMasterSkills(skillsRes.data.skills);
      }
    } catch (err) {
      setAlertInfo({ type: 'error', message: err.response?.data?.message || 'Failed to load career details' });
    } finally {
      setLoading(false);
    }
  };

  const handleChooseCareer = async () => {
    try {
      setSelecting(true);
      const res = await axiosInstance.post('/careers/select-target', { careerId: id });
      if (res.data.success) {
        await refreshUser();
        setAlertInfo({ type: 'success', message: res.data.message });
        setTimeout(() => {
          navigate('/gap-analysis');
        }, 1200);
      }
    } catch (err) {
      setAlertInfo({ type: 'error', message: err.response?.data?.message || 'Failed to choose career' });
    } finally {
      setSelecting(false);
    }
  };

  // Admin Actions
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await axiosInstance.put(`/careers/${id}`, editForm);
      if (res.data.success) {
        setCareer(res.data.career);
        setAlertInfo({ type: 'success', message: 'Career updated successfully!' });
        setIsEditModalOpen(false);
      }
    } catch (err) {
      setAlertInfo({ type: 'error', message: err.response?.data?.message || 'Failed to update career' });
    } finally {
      setSaving(false);
    }
  };

  const handleAddSkillSubmit = async (e) => {
    e.preventDefault();
    if (!addSkillForm.skillId) {
      setAlertInfo({ type: 'error', message: 'Please select a skill' });
      return;
    }

    try {
      setSaving(true);
      const res = await axiosInstance.post(`/careers/${id}/skills`, addSkillForm);
      if (res.data.success) {
        setAlertInfo({ type: 'success', message: 'Required skill added to career!' });
        setIsAddSkillModalOpen(false);
        setAddSkillForm({ skillId: '', requiredLevel: 2, priority: 'high' });
        fetchCareerDetails();
      }
    } catch (err) {
      setAlertInfo({ type: 'error', message: err.response?.data?.message || 'Failed to add career skill' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCareerSkill = async (csId) => {
    try {
      const res = await axiosInstance.delete(`/career-skills/${csId}`);
      if (res.data.success) {
        setAlertInfo({ type: 'success', message: 'Skill requirement removed' });
        fetchCareerDetails();
      }
    } catch (err) {
      setAlertInfo({ type: 'error', message: 'Failed to remove skill requirement' });
    }
  };

  const handleDeleteCareer = async () => {
    try {
      const res = await axiosInstance.delete(`/careers/${id}`);
      if (res.data.success) {
        navigate('/careers');
      }
    } catch (err) {
      setAlertInfo({ type: 'error', message: 'Failed to delete career' });
    } finally {
      setDeleteConfirmOpen(false);
    }
  };

  if (loading) return <LoadingSpinner fullScreen message="Loading career specifications..." />;
  if (!career) return <Alert type="error" message="Career path not found" />;

  const currentTargetId = user?.targetCareer?._id || user?.targetCareer;
  const isSelected = currentTargetId === career._id;
  const isAdmin = user?.role === 'admin';

  return (
    <div className="space-y-8 pb-12 max-w-5xl mx-auto">
      {/* Back Button */}
      <Link to="/careers" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-all">
        <ArrowLeft className="w-4 h-4" /> Back to Career Explorer
      </Link>

      {alertInfo && <Alert type={alertInfo.type} message={alertInfo.message} onClose={() => setAlertInfo(null)} />}

      {/* Main Career Header Card */}
      <div className="glass-panel p-8 rounded-3xl border border-slate-800 relative overflow-hidden">
        {isSelected && (
          <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-extrabold uppercase px-5 py-2 rounded-bl-2xl flex items-center gap-1.5 shadow-lg">
            <Check className="w-4 h-4" /> Your Active Target Career
          </div>
        )}

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center text-white shadow-xl shadow-blue-600/30">
              <Target className="w-8 h-8" />
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider font-extrabold text-blue-400 px-3 py-1 rounded-md bg-blue-500/10 border border-blue-500/20">
                {career.category}
              </span>
              <h1 className="text-3xl font-black text-white mt-1.5">{career.title}</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isAdmin && (
              <>
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all"
                >
                  <Edit className="w-4 h-4" /> Edit
                </button>
                <button
                  onClick={() => setDeleteConfirmOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-rose-950/60 hover:bg-rose-900/60 border border-rose-700/50 text-rose-300 text-xs font-bold flex items-center gap-1.5 transition-all"
                >
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              </>
            )}

            <button
              onClick={handleChooseCareer}
              disabled={selecting || isSelected}
              className={`px-6 py-3.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
                isSelected
                  ? 'bg-slate-800 text-slate-400 cursor-default border border-slate-700'
                  : 'bg-gradient-primary text-white shadow-xl shadow-blue-600/30 hover:opacity-95'
              }`}
            >
              {isSelected ? 'Current Target Goal' : 'Choose This Career'}
            </button>
          </div>
        </div>

        <p className="text-slate-300 text-sm leading-relaxed mb-8">{career.description}</p>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-3">
            <DollarSign className="w-6 h-6 text-emerald-400" />
            <div>
              <span className="text-xs text-slate-400 font-medium">Salary Range</span>
              <span className="text-base font-extrabold text-emerald-400 block">{career.salaryRange || career.averageSalary}</span>
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-3">
            <TrendingUp className="w-6 h-6 text-purple-400" />
            <div>
              <span className="text-xs text-slate-400 font-medium">Industry Demand</span>
              <span className="text-base font-extrabold text-purple-400 block">{career.demand || career.jobDemand}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Required Skills Section */}
      <div className="glass-panel p-8 rounded-3xl border border-slate-800">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Required Skill Requirements</h2>
            <p className="text-xs text-slate-400 mt-0.5">Target level & priority required for market readiness</p>
          </div>

          {isAdmin && (
            <button
              onClick={() => setIsAddSkillModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 text-xs font-bold flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-4 h-4" /> Add Skill Requirement
            </button>
          )}
        </div>

        {(!career.requiredSkills || career.requiredSkills.length === 0) ? (
          <p className="text-xs text-slate-500 text-center py-8">No required skills specified yet for this career.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {career.requiredSkills.map((req) => {
              const sName = req.skill?.name || 'Skill';
              const sCat = req.skill?.category || 'General';
              const prio = req.priority || 'medium';

              return (
                <div key={req._id || Math.random()} className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 px-2 py-0.5 rounded bg-slate-800">
                        {sCat}
                      </span>
                      <h4 className="text-base font-bold text-white mt-1">{sName}</h4>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] uppercase font-black px-2.5 py-1 rounded-md border ${PRIORITY_STYLES[prio] || PRIORITY_STYLES.medium}`}>
                        {prio} Priority
                      </span>

                      {isAdmin && (
                        <button
                          onClick={() => handleDeleteCareerSkill(req._id)}
                          className="p-1 text-slate-500 hover:text-rose-400 rounded transition-all"
                          title="Delete Skill Requirement"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <SkillProgressBar
                    level={req.requiredLevel}
                    label={`Required Proficiency: Level ${req.requiredLevel}`}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Admin Edit Career Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Career Definition">
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Title</label>
            <input
              type="text"
              required
              value={editForm.title}
              onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl glass-input text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Description</label>
            <textarea
              required
              rows="3"
              value={editForm.description}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl glass-input text-xs resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Category</label>
              <input
                type="text"
                value={editForm.category}
                onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl glass-input text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Demand</label>
              <select
                value={editForm.demand}
                onChange={(e) => setEditForm({ ...editForm, demand: e.target.value })}
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
              value={editForm.salaryRange}
              onChange={(e) => setEditForm({ ...editForm, salaryRange: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl glass-input text-xs"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-semibold">Cancel</button>
            <button type="submit" disabled={saving} className="px-5 py-2 rounded-xl bg-gradient-primary text-white text-xs font-bold">{saving ? 'Saving...' : 'Save Changes'}</button>
          </div>
        </form>
      </Modal>

      {/* Admin Add Career Skill Modal */}
      <Modal isOpen={isAddSkillModalOpen} onClose={() => setIsAddSkillModalOpen(false)} title="Add Career Skill Requirement">
        <form onSubmit={handleAddSkillSubmit} className="space-y-5">
          <SkillSelector
            masterSkills={masterSkills}
            selectedSkillId={addSkillForm.skillId}
            onSelectSkill={(sId) => setAddSkillForm({ ...addSkillForm, skillId: sId })}
          />

          <ProficiencySelector
            currentLevel={addSkillForm.requiredLevel}
            onChange={(lvl) => setAddSkillForm({ ...addSkillForm, requiredLevel: lvl })}
          />

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">Priority</label>
            <select
              value={addSkillForm.priority}
              onChange={(e) => setAddSkillForm({ ...addSkillForm, priority: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl glass-input text-xs"
            >
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button type="button" onClick={() => setIsAddSkillModalOpen(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-semibold">Cancel</button>
            <button type="submit" disabled={saving || !addSkillForm.skillId} className="px-5 py-2 rounded-xl bg-gradient-primary text-white text-xs font-bold">{saving ? 'Saving...' : 'Add Requirement'}</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        title="Delete Career Path"
        message={`Are you sure you want to delete ${career.title}? Dependent requirements and student target goals will be cleaned up.`}
        onConfirm={handleDeleteCareer}
        onCancel={() => setDeleteConfirmOpen(false)}
        isDanger={true}
      />
    </div>
  );
};

export default CareerDetails;
