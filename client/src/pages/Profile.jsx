import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../api/axiosInstance';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';
import SafeLink from '../components/SafeLink';
import { User, Mail, GraduationCap, Globe, Share2, Award, Save, Target } from 'lucide-react';

const Profile = () => {
  const { user, refreshUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [careers, setCareers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    education: '',
    interests: '',
    targetCareer: '',
    githubUrl: '',
    linkedinUrl: ''
  });

  const [alertInfo, setAlertInfo] = useState(null);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const [profRes, careerRes] = await Promise.all([
        axiosInstance.get('/users/profile'),
        axiosInstance.get('/careers')
      ]);

      if (profRes.data.success) {
        const prof = profRes.data.profile;
        setProfile(prof);
        setFormData({
          name: prof.name || '',
          bio: prof.bio || '',
          education: prof.education || '',
          interests: Array.isArray(prof.interests) ? prof.interests.join(', ') : prof.interests || '',
          targetCareer: prof.targetCareer?._id || prof.targetCareer || '',
          githubUrl: prof.githubUrl || '',
          linkedinUrl: prof.linkedinUrl || ''
        });
      }

      if (careerRes.data.success) {
        setCareers(careerRes.data.careers || careerRes.data.careerPaths || []);
      }
    } catch (err) {
      setAlertInfo({ type: 'error', message: 'Failed to load profile details' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlertInfo(null);
    setSaving(true);

    try {
      const res = await axiosInstance.put('/users/profile', formData);
      if (res.data.success) {
        setProfile(res.data.profile);
        await refreshUser();
        setAlertInfo({ type: 'success', message: 'Profile details saved successfully!' });
      }
    } catch (err) {
      setAlertInfo({
        type: 'error',
        message: err.response?.data?.message || 'Failed to update profile'
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner fullScreen message="Loading profile..." />;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight">Student Profile</h1>
        <p className="text-slate-400 text-sm mt-1">Manage your personal information, education, and target career path</p>
      </div>

      {alertInfo && <Alert type={alertInfo.type} message={alertInfo.message} onClose={() => setAlertInfo(null)} />}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col items-center text-center">
          <div className="w-24 h-24 rounded-full bg-gradient-primary flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-blue-600/30 mb-4">
            {profile?.name?.charAt(0).toUpperCase()}
          </div>
          <h2 className="text-xl font-bold text-white">{profile?.name}</h2>
          <p className="text-xs text-blue-400 font-medium mt-0.5 capitalize">{profile?.role}</p>
          <p className="text-xs text-slate-400 mt-2">{profile?.email}</p>

          <div className="w-full border-t border-slate-800 my-5 pt-5 space-y-3 text-left">
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <Target className="w-4 h-4 text-purple-400" />
              <span>Goal: <strong className="text-white">{profile?.targetCareer?.title || 'None Selected'}</strong></span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <GraduationCap className="w-4 h-4 text-emerald-400" />
              <span>Education: <strong className="text-white">{profile?.education || 'Not Specified'}</strong></span>
            </div>
          </div>

          <div className="w-full flex gap-3 pt-2">
            {profile?.githubUrl && (
              <SafeLink
                href={profile.githubUrl}
                className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
              >
                <Globe className="w-4 h-4 text-blue-400" /> GitHub
              </SafeLink>
            )}
            {profile?.linkedinUrl && (
              <SafeLink
                href={profile.linkedinUrl}
                className="flex-1 py-2 px-3 rounded-xl bg-blue-950/60 hover:bg-blue-900/60 border border-blue-700/50 text-blue-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
              >
                <Share2 className="w-4 h-4 text-purple-400" /> LinkedIn
              </SafeLink>
            )}
          </div>
        </div>

        <div className="md:col-span-2 glass-panel p-8 rounded-3xl border border-slate-800">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <User className="w-5 h-5 text-blue-400" /> Edit Profile Details
          </h3>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl glass-input text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Target Career Path
              </label>
              <select
                name="targetCareer"
                value={formData.targetCareer}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl glass-input text-sm"
              >
                <option value="">-- Select Target Career --</option>
                {careers.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.title} ({c.category})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Education / Degree
              </label>
              <div className="relative">
                <GraduationCap className="w-5 h-5 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  name="education"
                  value={formData.education}
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-3 rounded-xl glass-input text-sm"
                  placeholder="e.g. B.S. Computer Science"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Interests (Comma separated)
              </label>
              <input
                type="text"
                name="interests"
                value={formData.interests}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl glass-input text-sm"
                placeholder="e.g. Web Development, Cloud Computing, Machine Learning"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Bio / Personal Summary
              </label>
              <textarea
                name="bio"
                rows="3"
                value={formData.bio}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl glass-input text-sm resize-none"
                placeholder="Briefly describe your career goals..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  GitHub Profile URL
                </label>
                <div className="relative">
                  <Globe className="w-5 h-5 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type="url"
                    name="githubUrl"
                    value={formData.githubUrl}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 rounded-xl glass-input text-sm"
                    placeholder="https://github.com/username"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  LinkedIn Profile URL
                </label>
                <div className="relative">
                  <Share2 className="w-5 h-5 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type="url"
                    name="linkedinUrl"
                    value={formData.linkedinUrl}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 rounded-xl glass-input text-sm"
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 rounded-xl bg-gradient-primary text-white font-bold text-sm shadow-lg shadow-blue-600/30 hover:opacity-95 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
