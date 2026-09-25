import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { getSkillsApi, addSkillApi, updateSkillApi, deleteSkillApi } from '../services/api';
import { 
  Award, 
  Plus, 
  Search, 
  Trash2, 
  CheckCircle2, 
  Sparkles, 
  BookOpen, 
  AlertCircle,
  TrendingUp,
  Tag
} from 'lucide-react';

const Skills = () => {
  const [userSkills, setUserSkills] = useState([]);
  const [masterSkills, setMasterSkills] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  
  // New Skill Form State
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillProficiency, setNewSkillProficiency] = useState('Beginner');
  const [newSkillCategory, setNewSkillCategory] = useState('Frontend');
  const [isAdding, setIsAdding] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const proficiencyLevels = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
  const categories = ['Frontend', 'Backend', 'Database', 'DevOps', 'Languages', 'Tools', 'General'];

  useEffect(() => {
    document.title = 'SmartSkillGap | My Skills';
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      const data = await getSkillsApi();
      if (data.success) {
        setUserSkills(data.userSkills || []);
        setMasterSkills(data.masterSkills || []);
      }
    } catch (err) {
      console.error('Failed to load skills:', err);
      setMessage({ type: 'error', text: 'Failed to load skills list.' });
    } finally {
      setLoading(false);
    }
  };

  const handleAddSkill = async (e) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;

    setMessage({ type: '', text: '' });
    setIsAdding(true);

    try {
      const data = await addSkillApi({
        name: newSkillName.trim(),
        proficiency: newSkillProficiency,
        category: newSkillCategory
      });

      if (data.success) {
        setUserSkills(data.skills);
        setNewSkillName('');
        setMessage({ type: 'success', text: `Skill "${newSkillName}" added successfully!` });
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to add skill.' });
      }
    } catch (err) {
      console.error('Error adding skill:', err);
      setMessage({ type: 'error', text: 'Error adding skill to profile.' });
    } finally {
      setIsAdding(false);
    }
  };

  const handleUpdateProficiency = async (skillId, newProficiency) => {
    try {
      const data = await updateSkillApi(skillId, newProficiency);
      if (data.success) {
        setUserSkills(data.skills);
        setMessage({ type: 'success', text: 'Skill proficiency updated successfully!' });
      }
    } catch (err) {
      console.error('Error updating proficiency:', err);
      setMessage({ type: 'error', text: 'Failed to update skill proficiency.' });
    }
  };

  const handleDeleteSkill = async (skillId) => {
    if (!window.confirm('Are you sure you want to remove this skill from your profile?')) return;

    try {
      const data = await deleteSkillApi(skillId);
      if (data.success) {
        setUserSkills(data.skills);
        setMessage({ type: 'success', text: 'Skill removed from profile.' });
      }
    } catch (err) {
      console.error('Error removing skill:', err);
      setMessage({ type: 'error', text: 'Failed to remove skill.' });
    }
  };

  const handleSelectMasterSkill = (skill) => {
    setNewSkillName(skill.name);
    if (skill.category) setNewSkillCategory(skill.category);
  };

  // Filter user skills based on search query
  const filteredUserSkills = userSkills.filter(
    (skill) =>
      skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      skill.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      skill.proficiency.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter master skills catalog for autocomplete suggestions
  const suggestedMasterSkills = masterSkills.filter(
    (ms) =>
      !userSkills.some((us) => us.name.toLowerCase() === ms.name.toLowerCase()) &&
      ms.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FBFF] flex flex-col justify-between font-sans">
        <Navbar />
        <div className="flex justify-center items-center py-24">
          <div className="w-10 h-10 border-4 border-[#2563EB] border-t-transparent rounded-full animate-spin"></div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FBFF] flex flex-col justify-between font-sans text-[#334155]">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
        
        {/* Header & Stats Banner */}
        <div className="bg-[#FFFFFF] p-6 sm:p-8 rounded-2xl border border-[#DBEAFE] shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#2563EB] uppercase tracking-wider mb-1">
              <Award className="w-4 h-4" />
              <span>Skill Inventory & Competency</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E3A8A]">
              My Acquired Skills ({userSkills.length})
            </h1>
            <p className="text-xs text-[#64748B] mt-1">
              Manage your technical competencies, track proficiency, and discover new skills.
            </p>
          </div>

          <div className="bg-[#F8FBFF] px-4 py-2.5 rounded-xl border border-[#DBEAFE] flex items-center gap-4">
            <div>
              <span className="text-xs text-[#64748B] block">Total Skills</span>
              <span className="text-lg font-extrabold text-[#2563EB]">{userSkills.length}</span>
            </div>
            <div className="w-px h-8 bg-[#DBEAFE]"></div>
            <div>
              <span className="text-xs text-[#64748B] block">Expert Skills</span>
              <span className="text-lg font-extrabold text-[#1E3A8A]">
                {userSkills.filter((s) => s.proficiency === 'Expert').length}
              </span>
            </div>
          </div>
        </div>

        {/* Message Banner */}
        {message.text && (
          <div
            className={`p-4 rounded-xl border flex items-center gap-3 text-xs font-medium ${
              message.type === 'success'
                ? 'bg-[#EFF6FF] border-[#DBEAFE] text-[#1E3A8A]'
                : 'bg-rose-50 border-rose-200 text-rose-700'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-[#2563EB]" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* Add Skill Form & Catalog Search */}
        <div className="bg-[#FFFFFF] p-6 sm:p-8 rounded-2xl border border-[#DBEAFE] shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-[#1E3A8A] flex items-center gap-2 pb-3 border-b border-[#DBEAFE]">
            <Plus className="w-5 h-5 text-[#2563EB]" />
            Add New Skill to Profile
          </h2>

          <form onSubmit={handleAddSkill} className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
            <div className="sm:col-span-5">
              <label className="block text-xs font-bold text-[#1E3A8A] uppercase tracking-wider mb-2">
                Skill Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="e.g. React.js, Docker, MongoDB"
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  className="w-full px-4 py-3 bg-[#F8FBFF] border border-[#DBEAFE] rounded-xl text-sm text-[#334155] focus:outline-none focus:border-[#2563EB]"
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-bold text-[#1E3A8A] uppercase tracking-wider mb-2">
                Proficiency Level
              </label>
              <select
                value={newSkillProficiency}
                onChange={(e) => setNewSkillProficiency(e.target.value)}
                className="w-full px-4 py-3 bg-[#F8FBFF] border border-[#DBEAFE] rounded-xl text-sm text-[#334155] focus:outline-none focus:border-[#2563EB]"
              >
                {proficiencyLevels.map((lvl) => (
                  <option key={lvl} value={lvl}>{lvl}</option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-[#1E3A8A] uppercase tracking-wider mb-2">
                Category
              </label>
              <select
                value={newSkillCategory}
                onChange={(e) => setNewSkillCategory(e.target.value)}
                className="w-full px-4 py-3 bg-[#F8FBFF] border border-[#DBEAFE] rounded-xl text-sm text-[#334155] focus:outline-none focus:border-[#2563EB]"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={isAdding}
                className="w-full py-3 px-4 rounded-xl font-bold text-white bg-[#2563EB] hover:bg-[#1E3A8A] shadow-md shadow-[#2563EB]/25 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{isAdding ? 'Adding...' : 'Add Skill'}</span>
              </button>
            </div>
          </form>

          {/* Quick Add Suggestions from Master Catalog */}
          {suggestedMasterSkills.length > 0 && (
            <div className="pt-2">
              <span className="text-xs font-bold text-[#64748B] block mb-2">Popular Suggested Skills:</span>
              <div className="flex flex-wrap gap-2">
                {suggestedMasterSkills.slice(0, 8).map((skill) => (
                  <button
                    key={skill._id}
                    onClick={() => handleSelectMasterSkill(skill)}
                    className="px-3 py-1 rounded-lg text-xs font-semibold bg-[#EFF6FF] text-[#2563EB] border border-[#DBEAFE] hover:bg-[#2563EB] hover:text-white transition-all flex items-center gap-1.5"
                  >
                    <Plus className="w-3 h-3" />
                    <span>{skill.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Skills List Header & Filter */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-xl font-extrabold text-[#1E3A8A]">
            Current Profile Skills
          </h2>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search acquired skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#FFFFFF] border border-[#DBEAFE] rounded-xl text-xs text-[#334155] focus:outline-none focus:border-[#2563EB]"
            />
          </div>
        </div>

        {/* Skills Cards Grid */}
        {filteredUserSkills.length === 0 ? (
          <div className="bg-[#FFFFFF] p-12 rounded-2xl border border-[#DBEAFE] text-center space-y-4">
            <BookOpen className="w-12 h-12 text-[#2563EB] mx-auto opacity-80" />
            <h3 className="text-lg font-bold text-[#1E3A8A]">No Skills Added Yet</h3>
            <p className="text-xs text-[#64748B] max-w-sm mx-auto">
              Use the form above to add skills, or click on popular suggested skills to populate your profile inventory.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUserSkills.map((skill) => (
              <div
                key={skill._id || skill.name}
                className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#DBEAFE] shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <h3 className="text-base font-bold text-[#1E3A8A]">{skill.name}</h3>
                    <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-[#EFF6FF] text-[#2563EB] border border-[#DBEAFE] shrink-0">
                      {skill.category || 'General'}
                    </span>
                  </div>
                  <p className="text-xs text-[#64748B]">
                    Competency Status: <strong className="text-[#1E3A8A]">{skill.proficiency}</strong>
                  </p>
                </div>

                <div className="pt-4 border-t border-[#DBEAFE] flex justify-between items-center gap-3">
                  {/* Proficiency Selector */}
                  <select
                    value={skill.proficiency}
                    onChange={(e) => handleUpdateProficiency(skill._id, e.target.value)}
                    className="px-2.5 py-1.5 bg-[#F8FBFF] border border-[#DBEAFE] rounded-lg text-xs font-semibold text-[#1E3A8A] focus:outline-none focus:border-[#2563EB]"
                  >
                    {proficiencyLevels.map((lvl) => (
                      <option key={lvl} value={lvl}>{lvl}</option>
                    ))}
                  </select>

                  {/* Remove Button */}
                  <button
                    onClick={() => handleDeleteSkill(skill._id)}
                    aria-label={`Remove ${skill.name}`}
                    className="p-2 rounded-lg text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-all"
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

export default Skills;
