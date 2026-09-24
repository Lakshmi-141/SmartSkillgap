import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';
import ConfirmDialog from '../components/ConfirmDialog';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';
import SkillCard from '../components/SkillCard';
import SkillSelector from '../components/SkillSelector';
import ProficiencySelector from '../components/ProficiencySelector';
import { Plus, Search } from 'lucide-react';

const SkillsManager = () => {
  const [masterSkills, setMasterSkills] = useState([]);
  const [userSkills, setUserSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [alertInfo, setAlertInfo] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Modal State for Adding New Skill
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedSkillId, setSelectedSkillId] = useState('');
  const [selectedProficiency, setSelectedProficiency] = useState(1);
  const [addingSkill, setAddingSkill] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [allRes, userRes] = await Promise.all([
        axiosInstance.get('/skills'),
        axiosInstance.get('/user-skills')
      ]);

      if (allRes.data.success) {
        setMasterSkills(allRes.data.skills);
      }
      if (userRes.data.success) {
        setUserSkills(userRes.data.skills);
      }
    } catch (err) {
      setAlertInfo({ type: 'error', message: 'Failed to load skills database' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProficiency = async (skillId, newLevel) => {
    try {
      // Find if userSkill record exists
      const existingUserSkill = userSkills.find(
        us => (us.skill?._id || us.skill) === skillId || us._id === skillId
      );

      let res;
      if (existingUserSkill) {
        // PUT /api/user-skills/:id
        res = await axiosInstance.put(`/user-skills/${existingUserSkill._id}`, {
          proficiency: newLevel,
          source: 'self'
        });
      } else {
        // POST /api/user-skills
        res = await axiosInstance.post('/user-skills', {
          skillId,
          proficiency: newLevel,
          source: 'self'
        });
      }

      if (res.data.success) {
        setAlertInfo({ type: 'success', message: 'Skill proficiency updated successfully!' });
        fetchData();
      }
    } catch (err) {
      setAlertInfo({
        type: 'error',
        message: err.response?.data?.message || 'Failed to update skill proficiency'
      });
    }
  };

  const handleAddSkillSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSkillId) {
      setAlertInfo({ type: 'error', message: 'Please select a skill to add' });
      return;
    }

    try {
      setAddingSkill(true);
      const res = await axiosInstance.post('/user-skills', {
        skillId: selectedSkillId,
        proficiency: selectedProficiency,
        source: 'self'
      });

      if (res.data.success) {
        setAlertInfo({ type: 'success', message: 'Skill added to your profile!' });
        setIsAddModalOpen(false);
        setSelectedSkillId('');
        setSelectedProficiency(1);
        fetchData();
      }
    } catch (err) {
      setAlertInfo({
        type: 'error',
        message: err.response?.data?.message || 'Failed to add skill'
      });
    } finally {
      setAddingSkill(false);
    }
  };

  const handleDeleteSkill = async () => {
    if (!deleteTarget) return;
    try {
      const res = await axiosInstance.delete(`/user-skills/${deleteTarget._id}`);
      if (res.data.success) {
        setAlertInfo({ type: 'success', message: 'Skill removed from profile' });
        fetchData();
      }
    } catch (err) {
      setAlertInfo({ type: 'error', message: err.response?.data?.message || 'Failed to remove skill' });
    } finally {
      setDeleteTarget(null);
    }
  };

  if (loading) return <LoadingSpinner fullScreen message="Loading skill matrix..." />;

  const categories = ['All', 'Frontend', 'Backend', 'Database', 'DevOps', 'Data Science', 'Security', 'UI/UX Design', 'Tools & Soft Skills'];

  // Map of user skill document by skill ID
  const userSkillMap = {};
  userSkills.forEach(us => {
    if (us.skill) {
      const sId = us.skill._id || us.skill;
      userSkillMap[sId] = us;
    }
  });

  const filteredSkills = masterSkills.filter(skill => {
    const matchesCategory = selectedCategory === 'All' || skill.category === selectedCategory;
    const matchesSearch = skill.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          skill.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-8 pb-12 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">My Skills & Proficiency</h1>
          <p className="text-slate-400 text-sm mt-1">Manage your skill portfolio and set proficiency levels (0: No Knowledge to 4: Expert)</p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-5 py-3 rounded-xl bg-gradient-primary text-white font-bold text-sm shadow-lg shadow-blue-600/30 hover:opacity-95 transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Add Skill
        </button>
      </div>

      {alertInfo && <Alert type={alertInfo.type} message={alertInfo.message} onClose={() => setAlertInfo(null)} />}

      {/* Filter and Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 glass-panel p-4 rounded-2xl border border-slate-800">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search skills..."
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

      {/* Skill Cards Grid */}
      {filteredSkills.length === 0 ? (
        <EmptyState
          title="No Skills Found"
          message="No skills match your selected category or search filter."
          actionText="Reset Filters"
          onAction={() => { setSelectedCategory('All'); setSearchTerm(''); }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSkills.map((skill) => {
            const userSkill = userSkillMap[skill._id];
            return (
              <SkillCard
                key={skill._id}
                skill={skill}
                userSkill={userSkill}
                onUpdateProficiency={handleUpdateProficiency}
                onDelete={() => setDeleteTarget(userSkill)}
              />
            );
          })}
        </div>
      )}

      {/* Add Skill Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Skill to Profile"
      >
        <form onSubmit={handleAddSkillSubmit} className="space-y-6">
          <SkillSelector
            masterSkills={masterSkills}
            selectedSkillId={selectedSkillId}
            onSelectSkill={(id) => setSelectedSkillId(id)}
          />

          <ProficiencySelector
            currentLevel={selectedProficiency}
            onChange={(lvl) => setSelectedProficiency(lvl)}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={addingSkill || !selectedSkillId}
              className="px-5 py-2.5 rounded-xl bg-gradient-primary text-white font-bold text-xs shadow-lg shadow-blue-600/30 hover:opacity-95 transition-all disabled:opacity-50"
            >
              {addingSkill ? 'Saving...' : 'Add Skill'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Remove Skill"
        message={`Are you sure you want to remove this skill from your profile?`}
        onConfirm={handleDeleteSkill}
        onCancel={() => setDeleteTarget(null)}
        isDanger={true}
      />
    </div>
  );
};

export default SkillsManager;
