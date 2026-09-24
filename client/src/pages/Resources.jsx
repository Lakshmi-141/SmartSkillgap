import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';
import SafeLink from '../components/SafeLink';
import {
  BookOpen,
  ExternalLink,
  Bookmark,
  Video,
  FileText,
  Globe,
  Sparkles,
  Search,
  Filter,
  GraduationCap,
  Star
} from 'lucide-react';

const Resources = () => {
  const [resources, setResources] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [skills, setSkills] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [loading, setLoading] = useState(true);
  const [alertInfo, setAlertInfo] = useState(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchResources();
  }, [selectedSkill, selectedDifficulty, selectedType, search]);

  const fetchInitialData = async () => {
    try {
      const [skillRes, recRes] = await Promise.all([
        axiosInstance.get('/skills'),
        axiosInstance.get('/recommendations').catch(() => ({ data: { success: false } }))
      ]);

      if (skillRes.data.success) {
        setSkills(skillRes.data.skills);
      }
      if (recRes.data.success && Array.isArray(recRes.data.recommendedResources)) {
        setRecommendations(recRes.data.recommendedResources);
      }
    } catch (err) {
      console.error('Error fetching initial data:', err);
    }
  };

  const fetchResources = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedSkill) params.skill = selectedSkill;
      if (selectedDifficulty) params.difficulty = selectedDifficulty;
      if (selectedType) params.type = selectedType;
      if (search) params.search = search;

      const res = await axiosInstance.get('/resources', { params });
      if (res.data.success) {
        setResources(res.data.resources);
      }
    } catch (err) {
      setAlertInfo({ type: 'error', message: 'Failed to load learning resources' });
    } finally {
      setLoading(false);
    }
  };

  const handleBookmarkToggle = async (resourceId, currentStatus) => {
    const nextStatus = currentStatus === 'bookmarked' ? 'none' : 'bookmarked';
    try {
      const res = await axiosInstance.post('/resources/bookmark', {
        resourceId,
        status: nextStatus
      });
      if (res.data.success) {
        setResources(prev => prev.map(r => {
          if (r._id === resourceId) {
            return { ...r, userStatus: nextStatus };
          }
          return r;
        }));
      }
    } catch (err) {
      setAlertInfo({ type: 'error', message: 'Failed to update resource bookmark' });
    }
  };

  const typeIcons = {
    course: <GraduationCap className="w-4 h-4 text-purple-400" />,
    documentation: <Globe className="w-4 h-4 text-blue-400" />,
    article: <FileText className="w-4 h-4 text-emerald-400" />,
    video: <Video className="w-4 h-4 text-rose-400" />,
    book: <BookOpen className="w-4 h-4 text-amber-400" />,
    tutorial: <BookOpen className="w-4 h-4 text-cyan-400" />
  };

  const difficultyColors = {
    beginner: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    intermediate: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    advanced: 'bg-rose-500/10 text-rose-400 border-rose-500/20'
  };

  return (
    <div className="space-y-10 pb-16">
      {/* Header Banner */}
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight">Curated Learning Resources</h1>
        <p className="text-slate-400 text-sm mt-1">
          High-quality documentation, courses, articles, and tutorials mapped to your required target skills.
        </p>
      </div>

      {alertInfo && <Alert type={alertInfo.type} message={alertInfo.message} onClose={() => setAlertInfo(null)} />}

      {/* Recommended Resources Prominent Section */}
      {recommendations.length > 0 && (
        <div className="glass-panel p-6 rounded-3xl border border-amber-500/30 bg-gradient-to-r from-amber-950/20 via-slate-900 to-purple-950/20 space-y-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Recommended for You</h2>
              <p className="text-xs text-slate-400">Personalized learning recommendations based on your active career skill gaps.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendations.slice(0, 4).map((rec, idx) => {
              const res = rec.resource;
              if (!res) return null;

              return (
                <div key={res._id || idx} className="glass-card p-5 rounded-2xl border border-slate-800 bg-slate-900/60 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
                        <Star className="w-3 h-3" /> Recommended
                      </span>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md border ${difficultyColors[res.difficulty] || 'bg-slate-800 text-slate-400'}`}>
                        {res.difficulty || 'beginner'}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white mb-1.5">{res.title}</h3>
                    <p className="text-xs text-amber-300 font-medium mb-3 italic">
                      "{rec.reason}"
                    </p>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{res.description}</p>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-xs text-purple-300 font-semibold">{res.skill?.name || 'Skill'}</span>
                    <SafeLink
                      href={res.url}
                      className="px-3.5 py-1.5 rounded-xl bg-gradient-primary text-white text-xs font-bold shadow-md hover:opacity-95 transition-all flex items-center gap-1.5"
                    >
                      Start Resource <ExternalLink className="w-3.5 h-3.5" />
                    </SafeLink>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Search & Filter Toolbar */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search Input */}
        <div className="relative">
          <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Search Resources</label>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search title, description..."
              className="w-full pl-9 pr-3 py-2 rounded-xl glass-input text-xs font-semibold"
            />
          </div>
        </div>

        {/* Skill Filter */}
        <div>
          <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Filter by Skill</label>
          <select
            value={selectedSkill}
            onChange={(e) => setSelectedSkill(e.target.value)}
            className="w-full px-3 py-2 rounded-xl glass-input text-xs font-semibold"
          >
            <option value="">All Skills</option>
            {skills.map(s => (
              <option key={s._id} value={s._id}>{s.name}</option>
            ))}
          </select>
        </div>

        {/* Difficulty Filter */}
        <div>
          <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Difficulty</label>
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="w-full px-3 py-2 rounded-xl glass-input text-xs font-semibold"
          >
            <option value="">All Difficulties</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>

        {/* Type Filter */}
        <div>
          <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Resource Type</label>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full px-3 py-2 rounded-xl glass-input text-xs font-semibold"
          >
            <option value="">All Types</option>
            <option value="documentation">Documentation</option>
            <option value="course">Course</option>
            <option value="article">Article</option>
            <option value="video">Video</option>
            <option value="book">Book</option>
            <option value="tutorial">Tutorial</option>
          </select>
        </div>
      </div>

      {/* Main Resource Cards Grid */}
      {loading ? (
        <LoadingSpinner message="Loading resources..." />
      ) : resources.length === 0 ? (
        <div className="text-center py-12 glass-panel p-8 rounded-3xl border border-slate-800 text-slate-400">
          <BookOpen className="w-12 h-12 mx-auto text-slate-600 mb-3" />
          <p className="font-bold text-lg">No learning resources found</p>
          <p className="text-xs text-slate-500 mt-1">Try adjusting your search query or filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((res) => {
            const isBookmarked = res.userStatus === 'bookmarked';

            return (
              <div
                key={res._id}
                className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      {res.skill?.name || 'Skill'}
                    </span>
                    <button
                      onClick={() => handleBookmarkToggle(res._id, res.userStatus)}
                      className={`p-1.5 rounded-lg transition-all ${
                        isBookmarked ? 'bg-amber-500/20 text-amber-400' : 'text-slate-500 hover:text-slate-300'
                      }`}
                      title={isBookmarked ? 'Remove Bookmark' : 'Bookmark Resource'}
                    >
                      <Bookmark className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2 mb-2">
                    {typeIcons[res.type] || <BookOpen className="w-4 h-4 text-slate-400" />}
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">{res.type}</span>
                    <span className="text-slate-600">•</span>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md border ${difficultyColors[res.difficulty] || 'bg-slate-800 text-slate-400'}`}>
                      {res.difficulty || 'beginner'}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-2">{res.title}</h3>
                  <p className="text-xs text-slate-400 mb-6 leading-relaxed line-clamp-3">{res.description}</p>
                </div>

                <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium">
                    {res.provider || 'Web Resource'}
                  </span>

                  <SafeLink
                    href={res.url}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5"
                  >
                    Open Resource <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
                  </SafeLink>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Resources;
