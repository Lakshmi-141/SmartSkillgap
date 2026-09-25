import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { getUserProfileApi, updateUserProfileApi } from '../services/api';
import { 
  User, 
  GraduationCap, 
  Briefcase, 
  Target, 
  Sparkles, 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  BookOpen,
  Calendar,
  Building
} from 'lucide-react';

const Profile = () => {
  const { user: authUser } = useAuth();
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    education: '',
    college: '',
    degree: '',
    graduationYear: '',
    experienceLevel: 'Student',
    interests: '',
    targetCareer: 'Full Stack Web Developer'
  });

  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    document.title = 'SmartSkillGap | User Profile';
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await getUserProfileApi();
      if (data.success && data.user) {
        setProfile({
          name: data.user.name || '',
          email: data.user.email || '',
          education: data.user.education || '',
          college: data.user.college || '',
          degree: data.user.degree || '',
          graduationYear: data.user.graduationYear || '',
          experienceLevel: data.user.experienceLevel || 'Student',
          interests: Array.isArray(data.user.interests) ? data.user.interests.join(', ') : '',
          targetCareer: data.user.targetCareer || 'Full Stack Web Developer'
        });
      }
    } catch (err) {
      console.error('Failed to fetch profile:', err);
      setMessage({ type: 'error', text: 'Failed to load profile data.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    setIsSaving(true);

    try {
      const formattedInterests = profile.interests
        ? profile.interests.split(',').map((i) => i.trim()).filter(Boolean)
        : [];

      const payload = {
        name: profile.name,
        education: profile.education,
        college: profile.college,
        degree: profile.degree,
        graduationYear: profile.graduationYear,
        experienceLevel: profile.experienceLevel,
        interests: formattedInterests,
        targetCareer: profile.targetCareer
      };

      const data = await updateUserProfileApi(payload);
      if (data.success) {
        setMessage({ type: 'success', text: 'Profile updated and saved successfully!' });
        setIsEditing(false);
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to update profile.' });
      }
    } catch (err) {
      console.error('Profile update error:', err);
      setMessage({ type: 'error', text: 'An error occurred while saving profile changes.' });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FBFF] flex flex-col justify-between">
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

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
        
        {/* Header Banner */}
        <div className="bg-[#FFFFFF] p-6 sm:p-8 rounded-2xl border border-[#DBEAFE] shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-[#2563EB] text-white flex items-center justify-center font-extrabold text-xl shadow-md shadow-[#2563EB]/20">
              {profile.name ? profile.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-[#1E3A8A]">
                {profile.name}
              </h1>
              <p className="text-xs text-[#64748B] mt-0.5">{profile.email}</p>
            </div>
          </div>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all ${
              isEditing
                ? 'bg-[#EFF6FF] text-[#1E3A8A] border border-[#DBEAFE]'
                : 'bg-[#2563EB] text-white shadow-md shadow-[#2563EB]/25 hover:bg-[#1E3A8A]'
            }`}
          >
            {isEditing ? 'Cancel Editing' : 'Edit Profile'}
          </button>
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

        {/* Profile Card Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Section 1: Basic Information */}
          <div className="bg-[#FFFFFF] p-6 sm:p-8 rounded-2xl border border-[#DBEAFE] shadow-sm">
            <h2 className="text-lg font-bold text-[#1E3A8A] flex items-center gap-2 mb-6 pb-3 border-b border-[#DBEAFE]">
              <User className="w-5 h-5 text-[#2563EB]" />
              Basic Personal Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-[#1E3A8A] uppercase tracking-wider mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="w-full px-4 py-3 bg-[#F8FBFF] border border-[#DBEAFE] rounded-xl text-sm text-[#334155] focus:outline-none focus:border-[#2563EB] disabled:opacity-70"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1E3A8A] uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  disabled
                  value={profile.email}
                  className="w-full px-4 py-3 bg-[#EFF6FF] border border-[#DBEAFE] rounded-xl text-sm text-[#64748B] cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1E3A8A] uppercase tracking-wider mb-2">
                  Target Career Goal
                </label>
                <select
                  disabled={!isEditing}
                  value={profile.targetCareer}
                  onChange={(e) => setProfile({ ...profile, targetCareer: e.target.value })}
                  className="w-full px-4 py-3 bg-[#F8FBFF] border border-[#DBEAFE] rounded-xl text-sm text-[#334155] focus:outline-none focus:border-[#2563EB] disabled:opacity-70"
                >
                  <option value="Full Stack Web Developer">Full Stack Web Developer</option>
                  <option value="Data Scientist & AI Engineer">Data Scientist & AI Engineer</option>
                  <option value="DevOps & Cloud Engineer">DevOps & Cloud Engineer</option>
                  <option value="UI/UX Product Designer">UI/UX Product Designer</option>
                  <option value="Mobile App Developer">Mobile App Developer</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1E3A8A] uppercase tracking-wider mb-2">
                  Experience Level
                </label>
                <select
                  disabled={!isEditing}
                  value={profile.experienceLevel}
                  onChange={(e) => setProfile({ ...profile, experienceLevel: e.target.value })}
                  className="w-full px-4 py-3 bg-[#F8FBFF] border border-[#DBEAFE] rounded-xl text-sm text-[#334155] focus:outline-none focus:border-[#2563EB] disabled:opacity-70"
                >
                  <option value="Student">Student / Fresher</option>
                  <option value="Entry Level">Entry Level (0-2 Yrs)</option>
                  <option value="Intermediate">Intermediate (2-5 Yrs)</option>
                  <option value="Experienced">Experienced (5+ Yrs)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Education Details */}
          <div className="bg-[#FFFFFF] p-6 sm:p-8 rounded-2xl border border-[#DBEAFE] shadow-sm">
            <h2 className="text-lg font-bold text-[#1E3A8A] flex items-center gap-2 mb-6 pb-3 border-b border-[#DBEAFE]">
              <GraduationCap className="w-5 h-5 text-[#2563EB]" />
              Education & Academic Background
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-[#1E3A8A] uppercase tracking-wider mb-2">
                  Highest Education Level
                </label>
                <input
                  type="text"
                  disabled={!isEditing}
                  placeholder="e.g. Bachelor's Degree"
                  value={profile.education}
                  onChange={(e) => setProfile({ ...profile, education: e.target.value })}
                  className="w-full px-4 py-3 bg-[#F8FBFF] border border-[#DBEAFE] rounded-xl text-sm text-[#334155] focus:outline-none focus:border-[#2563EB] disabled:opacity-70"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1E3A8A] uppercase tracking-wider mb-2">
                  College / University
                </label>
                <input
                  type="text"
                  disabled={!isEditing}
                  placeholder="e.g. Stanford University"
                  value={profile.college}
                  onChange={(e) => setProfile({ ...profile, college: e.target.value })}
                  className="w-full px-4 py-3 bg-[#F8FBFF] border border-[#DBEAFE] rounded-xl text-sm text-[#334155] focus:outline-none focus:border-[#2563EB] disabled:opacity-70"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1E3A8A] uppercase tracking-wider mb-2">
                  Degree / Major
                </label>
                <input
                  type="text"
                  disabled={!isEditing}
                  placeholder="e.g. Computer Science & Engineering"
                  value={profile.degree}
                  onChange={(e) => setProfile({ ...profile, degree: e.target.value })}
                  className="w-full px-4 py-3 bg-[#F8FBFF] border border-[#DBEAFE] rounded-xl text-sm text-[#334155] focus:outline-none focus:border-[#2563EB] disabled:opacity-70"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1E3A8A] uppercase tracking-wider mb-2">
                  Graduation Year
                </label>
                <input
                  type="text"
                  disabled={!isEditing}
                  placeholder="e.g. 2025"
                  value={profile.graduationYear}
                  onChange={(e) => setProfile({ ...profile, graduationYear: e.target.value })}
                  className="w-full px-4 py-3 bg-[#F8FBFF] border border-[#DBEAFE] rounded-xl text-sm text-[#334155] focus:outline-none focus:border-[#2563EB] disabled:opacity-70"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Interests & Career Preferences */}
          <div className="bg-[#FFFFFF] p-6 sm:p-8 rounded-2xl border border-[#DBEAFE] shadow-sm">
            <h2 className="text-lg font-bold text-[#1E3A8A] flex items-center gap-2 mb-6 pb-3 border-b border-[#DBEAFE]">
              <Sparkles className="w-5 h-5 text-[#2563EB]" />
              Career Interests & Focus Topics
            </h2>

            <div>
              <label className="block text-xs font-bold text-[#1E3A8A] uppercase tracking-wider mb-2">
                Interests (Comma Separated)
              </label>
              <input
                type="text"
                disabled={!isEditing}
                placeholder="e.g. Web Development, Cloud Computing, AI Solutions, Microservices"
                value={profile.interests}
                onChange={(e) => setProfile({ ...profile, interests: e.target.value })}
                className="w-full px-4 py-3 bg-[#F8FBFF] border border-[#DBEAFE] rounded-xl text-sm text-[#334155] focus:outline-none focus:border-[#2563EB] disabled:opacity-70"
              />
            </div>
          </div>

          {/* Save Action Button */}
          {isEditing && (
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isSaving}
                className="px-8 py-3.5 rounded-xl font-bold text-white bg-[#2563EB] hover:bg-[#1E3A8A] shadow-lg shadow-[#2563EB]/25 transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer text-sm"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Saving Changes...' : 'Save Profile Changes'}</span>
              </button>
            </div>
          )}

        </form>

      </main>

      <Footer />
    </div>
  );
};

export default Profile;
