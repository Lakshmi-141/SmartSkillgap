import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { getCareersApi, updateCareerApi } from '../services/api';
import { 
  ShieldCheck, 
  Layers, 
  Plus, 
  Trash2, 
  Edit3, 
  Save, 
  AlertCircle, 
  CheckCircle2, 
  ArrowLeft 
} from 'lucide-react';

const AdminCareerSkills = () => {
  const [careers, setCareers] = useState([]);
  const [selectedCareer, setSelectedCareer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form states for required skills
  const [newSkillName, setNewSkillName] = useState('');
  const [newImportance, setNewImportance] = useState('Required');
  const [newCategory, setNewCategory] = useState('Technical');
  const [saving, setSaving] = useState(false);

  const fetchCareers = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await getCareersApi();
      if (res.success) {
        setCareers(res.careers || []);
        if (res.careers?.length > 0 && !selectedCareer) {
          setSelectedCareer(res.careers[0]);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load career list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = 'SmartSkillGap Admin | Career Skills';
    fetchCareers();
  }, []);

  const handleAddSkillToCareer = async (e) => {
    e.preventDefault();
    if (!selectedCareer || !newSkillName.trim()) return;

    try {
      setSaving(true);
      setError('');
      setSuccessMsg('');

      const updatedSkills = [
        ...(selectedCareer.requiredSkills || []),
        { name: newSkillName.trim(), importance: newImportance, category: newCategory }
      ];

      const res = await updateCareerApi(selectedCareer._id, {
        requiredSkills: updatedSkills
      });

      if (res.success) {
        setSuccessMsg(`Added skill "${newSkillName}" to ${selectedCareer.title}!`);
        setNewSkillName('');
        setSelectedCareer(res.career);
        fetchCareers();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update career skills.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSkillFromCareer = async (skillName) => {
    if (!selectedCareer) return;

    try {
      setSaving(true);
      setError('');
      setSuccessMsg('');

      const updatedSkills = (selectedCareer.requiredSkills || []).filter(
        s => s.name.toLowerCase() !== skillName.toLowerCase()
      );

      const res = await updateCareerApi(selectedCareer._id, {
        requiredSkills: updatedSkills
      });

      if (res.success) {
        setSuccessMsg(`Removed skill "${skillName}" from ${selectedCareer.title}!`);
        setSelectedCareer(res.career);
        fetchCareers();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete skill from career.');
    } finally {
      setSaving(false);
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
              Manage Career Required Skills
            </h1>
            <p className="text-xs text-[#475569] mt-0.5">
              Define required skill sets and proficiencies for each career path in MongoDB.
            </p>
          </div>

          <Link
            to="/admin"
            className="px-4 py-2 bg-[#EFF6FF] text-[#1E3A8A] border border-[#DBEAFE] font-bold text-xs rounded-xl hover:bg-[#DBEAFE] transition-all flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Admin Dashboard</span>
          </Link>
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

        {loading ? (
          <div className="py-16 text-center text-xs font-semibold text-[#1E3A8A]">Loading career requirements...</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Col: Career Selection List (1 col) */}
            <div className="space-y-4">
              <h2 className="text-lg font-extrabold text-[#1E3A8A]">Select Career Path</h2>
              <div className="bg-[#FFFFFF] p-4 rounded-3xl border border-[#DBEAFE] shadow-sm space-y-2 max-h-[600px] overflow-y-auto">
                {careers.map((c) => {
                  const isSelected = selectedCareer?._id === c._id;
                  return (
                    <button
                      key={c._id}
                      onClick={() => setSelectedCareer(c)}
                      className={`w-full text-left p-3.5 rounded-2xl border text-xs font-bold transition-all flex justify-between items-center ${
                        isSelected
                          ? 'bg-[#2563EB] text-white border-[#2563EB] shadow-md shadow-[#2563EB]/20'
                          : 'bg-[#F8FBFF] text-[#1E3A8A] border-[#DBEAFE] hover:border-[#2563EB]'
                      }`}
                    >
                      <span>{c.title}</span>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] ${isSelected ? 'bg-white/20 text-white' : 'bg-[#EFF6FF] text-[#2563EB]'}`}>
                        {(c.requiredSkills || []).length} skills
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Col: Skills Editor (2 cols) */}
            <div className="lg:col-span-2 space-y-6">
              {selectedCareer && (
                <div className="bg-[#FFFFFF] p-6 sm:p-8 rounded-3xl border border-[#DBEAFE] shadow-sm space-y-6">
                  <div>
                    <span className="text-[10px] font-bold text-[#2563EB] uppercase tracking-wider block">Editing Skills For</span>
                    <h2 className="text-2xl font-black text-[#1E3A8A]">{selectedCareer.title}</h2>
                  </div>

                  {/* Form to add new skill */}
                  <form onSubmit={handleAddSkillToCareer} className="bg-[#F8FBFF] p-4 rounded-2xl border border-[#DBEAFE] space-y-3">
                    <h3 className="text-xs font-extrabold text-[#1E3A8A] uppercase">Add New Required Skill:</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <input
                        type="text"
                        placeholder="Skill Name (e.g. React.js)"
                        value={newSkillName}
                        onChange={(e) => setNewSkillName(e.target.value)}
                        className="px-3 py-2 bg-white border border-[#DBEAFE] rounded-xl text-xs text-[#1E3A8A] font-semibold focus:outline-none"
                      />

                      <select
                        value={newImportance}
                        onChange={(e) => setNewImportance(e.target.value)}
                        className="px-3 py-2 bg-white border border-[#DBEAFE] rounded-xl text-xs text-[#1E3A8A] font-semibold focus:outline-none"
                      >
                        <option value="Core">Core</option>
                        <option value="Required">Required</option>
                        <option value="Recommended">Recommended</option>
                      </select>

                      <select
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        className="px-3 py-2 bg-white border border-[#DBEAFE] rounded-xl text-xs text-[#1E3A8A] font-semibold focus:outline-none"
                      >
                        <option value="Frontend">Frontend</option>
                        <option value="Backend">Backend</option>
                        <option value="Database">Database</option>
                        <option value="DevOps">DevOps</option>
                        <option value="Tools">Tools</option>
                        <option value="Technical">Technical</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      disabled={saving || !newSkillName.trim()}
                      className="px-4 py-2 bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-2xs transition-all inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{saving ? 'Adding...' : 'Add Skill to Career'}</span>
                    </button>
                  </form>

                  {/* Current required skills table */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-extrabold text-[#1E3A8A] uppercase">Current Required Skills:</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {(selectedCareer.requiredSkills || []).map((sk, idx) => (
                        <div key={idx} className="p-3.5 bg-[#F8FBFF] rounded-2xl border border-[#DBEAFE] flex items-center justify-between gap-2">
                          <div>
                            <span className="text-xs font-bold text-[#1E3A8A] block">{sk.name}</span>
                            <span className="text-[10px] text-[#64748B]">{sk.importance} • {sk.category}</span>
                          </div>
                          <button
                            onClick={() => handleDeleteSkillFromCareer(sk.name)}
                            disabled={saving}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Remove skill"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>
        )}

      </main>

      <Footer />
    </div>
  );
};

export default AdminCareerSkills;
