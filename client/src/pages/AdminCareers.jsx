import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { 
  getCareersApi, 
  createCareerApi, 
  updateCareerApi, 
  deleteCareerApi 
} from '../services/api';
import { 
  Briefcase, 
  ShieldCheck, 
  Plus, 
  Edit3, 
  Trash2, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2, 
  X,
  PlusCircle
} from 'lucide-react';

const AdminCareers = () => {
  const [careers, setCareers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modal / Form state
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [reqSkillsText, setReqSkillsText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchCareers = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await getCareersApi();
      if (res.success && res.careers) {
        setCareers(res.careers);
      }
    } catch (err) {
      console.error('Error fetching admin careers:', err);
      setError(err.response?.data?.message || 'Failed to load career paths');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = 'SmartSkillGap | Admin Career Management';
    fetchCareers();
  }, []);

  const openCreateModal = () => {
    setIsEditing(false);
    setCurrentId(null);
    setFormTitle('');
    setFormDesc('');
    setReqSkillsText('');
    setShowModal(true);
  };

  const openEditModal = (car) => {
    setIsEditing(true);
    setCurrentId(car._id);
    setFormTitle(car.title);
    setFormDesc(car.description);

    // Format required skills to comma-separated string for easy editing
    const skillsString = (car.requiredSkills || [])
      .map(sk => (typeof sk === 'object' ? sk.name : sk))
      .join(', ');
    setReqSkillsText(skillsString);

    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formTitle.trim() || !formDesc.trim()) {
      setError('Title and Description are required.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      // Parse comma-separated skills
      const parsedSkills = reqSkillsText
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0)
        .map(name => ({ name, importance: 'Required', category: 'Technical' }));

      const payload = {
        title: formTitle.trim(),
        description: formDesc.trim(),
        requiredSkills: parsedSkills
      };

      if (isEditing) {
        const res = await updateCareerApi(currentId, payload);
        if (res.success) {
          setSuccessMsg(`Career path "${formTitle}" updated successfully!`);
        }
      } else {
        const res = await createCareerApi(payload);
        if (res.success) {
          setSuccessMsg(`New career path "${formTitle}" created successfully!`);
        }
      }

      setShowModal(false);
      fetchCareers();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error('Error saving career:', err);
      setError(err.response?.data?.message || 'Failed to save career path');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete career path "${title}"?`)) {
      return;
    }

    try {
      setError('');
      const res = await deleteCareerApi(id);
      if (res.success) {
        setSuccessMsg(`Career path "${title}" deleted successfully.`);
        fetchCareers();
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      console.error('Error deleting career:', err);
      setError(err.response?.data?.message || 'Failed to delete career path');
    }
  };

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
                Career Path Management
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E3A8A] mt-2">
              Career Catalog Management
            </h1>
            <p className="text-sm text-[#475569] mt-1">
              Add, edit, or remove tech career options from MongoDB.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={openCreateModal}
              className="px-5 py-3 rounded-xl text-xs font-extrabold text-white bg-[#2563EB] hover:bg-blue-700 shadow-md shadow-[#2563EB]/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Career</span>
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
            className="px-5 py-2.5 rounded-xl text-xs font-extrabold bg-[#2563EB] text-white shadow-xs"
          >
            Career Catalog ({careers.length})
          </Link>
          <Link
            to="/admin/skills"
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-[#1E3A8A] bg-[#FFFFFF] hover:bg-[#EFF6FF] border border-[#DBEAFE] transition-all"
          >
            Skills Catalog
          </Link>
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

        {/* Careers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {careers.map((car) => (
            <div 
              key={car._id} 
              className="bg-[#FFFFFF] p-6 rounded-3xl border border-[#DBEAFE] shadow-sm flex flex-col justify-between space-y-4 hover:border-[#2563EB]/40 transition-all"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <span className="px-2.5 py-1 bg-[#EFF6FF] text-[#2563EB] text-[10px] font-extrabold uppercase rounded-lg border border-[#DBEAFE]">
                    {car.requiredSkills?.length || 0} Required Skills
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(car)}
                      className="p-2 text-[#2563EB] hover:bg-[#EFF6FF] rounded-lg transition-colors cursor-pointer"
                      title="Edit career path"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(car._id, car.title)}
                      className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete career path"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-extrabold text-[#1E3A8A]">{car.title}</h3>
                  <p className="text-xs text-[#475569] mt-1 line-clamp-2">{car.description}</p>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-[#DBEAFE]">
                  <span className="text-[11px] font-extrabold text-[#1E3A8A] uppercase tracking-wider block">
                    Required Skills Sample:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {(car.requiredSkills || []).slice(0, 5).map((sk, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-[#F8FBFF] text-[#334155] border border-[#DBEAFE] text-[11px] font-semibold rounded-md">
                        {typeof sk === 'object' ? sk.name : sk}
                      </span>
                    ))}
                    {(car.requiredSkills || []).length > 5 && (
                      <span className="px-2 py-0.5 bg-[#EFF6FF] text-[#2563EB] text-[11px] font-bold rounded-md">
                        +{(car.requiredSkills.length - 5)} more
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[#DBEAFE] flex justify-between items-center text-xs text-[#64748B]">
                <span>Updated: {car.updatedAt ? new Date(car.updatedAt).toLocaleDateString() : 'Recently'}</span>
                <button
                  onClick={() => openEditModal(car)}
                  className="font-bold text-[#2563EB] hover:underline"
                >
                  Edit Details →
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Modal for Add / Edit Career */}
        {showModal && (
          <div className="fixed inset-0 bg-[#334155]/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-[#FFFFFF] max-w-lg w-full rounded-3xl border border-[#DBEAFE] p-6 sm:p-8 shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center pb-3 border-b border-[#DBEAFE]">
                <h2 className="text-xl font-extrabold text-[#1E3A8A]">
                  {isEditing ? 'Edit Career Path' : 'Add New Career Path'}
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
                    Career Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. AI Systems Architect"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#F8FBFF] border border-[#DBEAFE] rounded-xl text-xs text-[#1E3A8A] font-semibold focus:outline-none focus:border-[#2563EB]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1E3A8A] uppercase mb-1">
                    Career Description *
                  </label>
                  <textarea
                    required
                    rows="3"
                    placeholder="Detailed overview of role responsibilities and industry scope..."
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#F8FBFF] border border-[#DBEAFE] rounded-xl text-xs text-[#1E3A8A] focus:outline-none focus:border-[#2563EB]"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1E3A8A] uppercase mb-1">
                    Required Skills (Comma separated)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Python, PyTorch, Docker, Kubernetes, MLOps"
                    value={reqSkillsText}
                    onChange={(e) => setReqSkillsText(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#F8FBFF] border border-[#DBEAFE] rounded-xl text-xs text-[#1E3A8A] focus:outline-none focus:border-[#2563EB]"
                  />
                  <p className="text-[11px] text-[#64748B] mt-1">Separate skills with commas (e.g. React.js, Node.js, MongoDB)</p>
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
                    {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : (isEditing ? 'Update Career' : 'Create Career')}
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

export default AdminCareers;
