import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { 
  getAdminCatalogSkillsApi, 
  createAdminCatalogSkillApi, 
  updateAdminCatalogSkillApi, 
  deleteAdminCatalogSkillApi 
} from '../services/api';
import { 
  Layers, 
  ShieldCheck, 
  Plus, 
  Edit3, 
  Trash2, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2, 
  X,
  Search,
  Tag
} from 'lucide-react';

const AdminSkills = () => {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('Frontend');
  const [formDesc, setFormDesc] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchCatalogSkills = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await getAdminCatalogSkillsApi();
      if (res.success && res.skills) {
        setSkills(res.skills);
      }
    } catch (err) {
      console.error('Error fetching admin skills catalog:', err);
      setError(err.response?.data?.message || 'Failed to load master skills catalog');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = 'SmartSkillGap | Admin Skills Catalog';
    fetchCatalogSkills();
  }, []);

  const openCreateModal = () => {
    setIsEditing(false);
    setCurrentId(null);
    setFormName('');
    setFormCategory('Frontend');
    setFormDesc('');
    setShowModal(true);
  };

  const openEditModal = (sk) => {
    setIsEditing(true);
    setCurrentId(sk._id);
    setFormName(sk.name);
    setFormCategory(sk.category || 'General');
    setFormDesc(sk.description || '');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formName.trim()) {
      setError('Skill name is required.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      const payload = {
        name: formName.trim(),
        category: formCategory.trim(),
        description: formDesc.trim()
      };

      if (isEditing) {
        const res = await updateAdminCatalogSkillApi(currentId, payload);
        if (res.success) {
          setSuccessMsg(`Skill "${formName}" updated successfully!`);
        }
      } else {
        const res = await createAdminCatalogSkillApi(payload);
        if (res.success) {
          setSuccessMsg(`New master skill "${formName}" added to catalog!`);
        }
      }

      setShowModal(false);
      fetchCatalogSkills();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error('Error saving catalog skill:', err);
      setError(err.response?.data?.message || 'Failed to save catalog skill');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete master skill "${name}" from catalog?`)) {
      return;
    }

    try {
      setError('');
      const res = await deleteAdminCatalogSkillApi(id);
      if (res.success) {
        setSuccessMsg(`Master skill "${name}" deleted successfully.`);
        fetchCatalogSkills();
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      console.error('Error deleting skill:', err);
      setError(err.response?.data?.message || 'Failed to delete catalog skill');
    }
  };

  const filteredSkills = skills.filter(sk => 
    (sk.name && sk.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (sk.category && sk.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-[#F8FBFF] flex flex-col justify-between font-sans">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8 flex-1">
        
        {/* Header Section */}
        <div className="bg-[#FFFFFF] p-6 sm:p-8 rounded-3xl border border-[#DBEAFE] shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-[#EFF6FF] text-[#2563EB] border border-[#DBEAFE] flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#2563EB]" />
                Master Catalog Administration
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E3A8A] mt-2">
              Skills Database Catalog
            </h1>
            <p className="text-sm text-[#475569] mt-1">
              Add, edit, or delete global master skills available across the platform.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={openCreateModal}
              className="px-5 py-3 rounded-xl text-xs font-extrabold text-white bg-[#2563EB] hover:bg-blue-700 shadow-md shadow-[#2563EB]/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Master Skill</span>
            </button>
          </div>
        </div>

        {/* Sub-Nav Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-[#DBEAFE] pb-2">
          <Link
            to="/admin"
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-[#1E3A8A] bg-[#FFFFFF] hover:bg-[#EFF6FF] border border-[#DBEAFE] transition-all"
          >
            Overview
          </Link>
          <Link
            to="/admin/users"
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-[#1E3A8A] bg-[#FFFFFF] hover:bg-[#EFF6FF] border border-[#DBEAFE] transition-all"
          >
            Users Management
          </Link>
          <Link
            to="/admin/careers"
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-[#1E3A8A] bg-[#FFFFFF] hover:bg-[#EFF6FF] border border-[#DBEAFE] transition-all"
          >
            Career Catalog
          </Link>
          <Link
            to="/admin/skills"
            className="px-5 py-2.5 rounded-xl text-xs font-extrabold bg-[#2563EB] text-white shadow-xs"
          >
            Skills Catalog ({skills.length})
          </Link>
        </div>

        {/* Search Bar */}
        <div className="bg-[#FFFFFF] p-4 rounded-2xl border border-[#DBEAFE] shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-[#64748B] absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search master skills by name or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#F8FBFF] border border-[#DBEAFE] rounded-xl text-xs text-[#1E3A8A] placeholder-[#64748B] focus:outline-none focus:border-[#2563EB]"
            />
          </div>
          <span className="text-xs font-bold text-[#64748B]">
            Showing {filteredSkills.length} of {skills.length} skills
          </span>
        </div>

        {/* Feedback Banners */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
            <button onClick={() => setError('')} className="font-bold text-xs">Dismiss</button>
          </div>
        )}

        {successMsg && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span className="font-bold">{successMsg}</span>
            </div>
            <button onClick={() => setSuccessMsg('')} className="font-bold text-xs">Dismiss</button>
          </div>
        )}

        {/* Skills Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredSkills.map((sk) => (
            <div 
              key={sk._id}
              className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#DBEAFE] shadow-sm flex flex-col justify-between space-y-3 hover:border-[#2563EB]/40 transition-all"
            >
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="px-2 py-0.5 bg-[#EFF6FF] text-[#2563EB] text-[10px] font-extrabold uppercase rounded-md border border-[#DBEAFE] flex items-center gap-1">
                    <Tag className="w-3 h-3" />
                    {sk.category || 'General'}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(sk)}
                      className="p-1.5 text-[#2563EB] hover:bg-[#EFF6FF] rounded-lg transition-colors cursor-pointer"
                      title="Edit skill"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(sk._id, sk.name)}
                      className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete skill"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="text-base font-extrabold text-[#1E3A8A]">{sk.name}</h3>
                {sk.description && (
                  <p className="text-xs text-[#64748B] line-clamp-2">{sk.description}</p>
                )}
              </div>

              <div className="pt-2 border-t border-[#DBEAFE] text-[11px] text-[#64748B] flex justify-between items-center">
                <span>Added: {sk.createdAt ? new Date(sk.createdAt).toLocaleDateString() : 'System'}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Modal for Add / Edit Skill */}
        {showModal && (
          <div className="fixed inset-0 bg-[#334155]/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-[#FFFFFF] max-w-md w-full rounded-3xl border border-[#DBEAFE] p-6 sm:p-8 shadow-2xl space-y-6 relative">
              <div className="flex justify-between items-center pb-3 border-b border-[#DBEAFE]">
                <h2 className="text-xl font-extrabold text-[#1E3A8A]">
                  {isEditing ? 'Edit Master Skill' : 'Add Master Skill'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1 rounded-lg hover:bg-[#EFF6FF] text-[#64748B] cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#1E3A8A] uppercase mb-1">
                    Skill Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. GraphQL, PyTorch, Docker"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#F8FBFF] border border-[#DBEAFE] rounded-xl text-xs text-[#1E3A8A] font-semibold focus:outline-none focus:border-[#2563EB]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1E3A8A] uppercase mb-1">
                    Category
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#F8FBFF] border border-[#DBEAFE] rounded-xl text-xs text-[#1E3A8A] font-semibold focus:outline-none focus:border-[#2563EB]"
                  >
                    <option value="Frontend">Frontend</option>
                    <option value="Backend">Backend</option>
                    <option value="Database">Database</option>
                    <option value="DevOps & Cloud">DevOps & Cloud</option>
                    <option value="Data & AI">Data & AI</option>
                    <option value="Security">Security</option>
                    <option value="Languages">Languages</option>
                    <option value="General">General</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1E3A8A] uppercase mb-1">
                    Description (Optional)
                  </label>
                  <textarea
                    rows="2"
                    placeholder="Brief definition or tech scope..."
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#F8FBFF] border border-[#DBEAFE] rounded-xl text-xs text-[#1E3A8A] focus:outline-none focus:border-[#2563EB]"
                  ></textarea>
                </div>

                <div className="pt-4 border-t border-[#DBEAFE] flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-2.5 px-4 bg-[#F8FBFF] hover:bg-[#EFF6FF] text-[#1E3A8A] font-bold text-xs rounded-xl border border-[#DBEAFE] transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 py-2.5 px-4 bg-[#2563EB] hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : (isEditing ? 'Update Skill' : 'Add Skill')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
};

export default AdminSkills;
