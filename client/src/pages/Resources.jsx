import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { getResourcesApi } from '../services/api';
import { 
  BookOpen, 
  ExternalLink, 
  Search, 
  Filter, 
  AlertCircle, 
  CheckCircle2, 
  Layers, 
  Award,
  Book,
  Video,
  FileText
} from 'lucide-react';

const Resources = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [selectedType, setSelectedType] = useState('');

  const fetchResources = async () => {
    try {
      setLoading(true);
      setError('');
      const params = {};
      if (search) params.search = search;
      if (selectedDifficulty) params.difficulty = selectedDifficulty;
      if (selectedType) params.type = selectedType;

      const res = await getResourcesApi(params);
      if (res.success) {
        setResources(res.resources || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load learning resources.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = 'SmartSkillGap | Learning Resources';
    fetchResources();
  }, [selectedDifficulty, selectedType]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchResources();
  };

  return (
    <div className="min-h-screen bg-[#F8FBFF] flex flex-col justify-between font-sans">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8 flex-1">
        
        {/* Header Banner */}
        <div className="bg-[#FFFFFF] p-6 sm:p-8 rounded-3xl border border-[#DBEAFE] shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-[#EFF6FF] text-[#2563EB] text-xs font-extrabold rounded-full border border-[#DBEAFE]">
                Curated Learning Library
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E3A8A] mt-1">
              Learning Resources
            </h1>
            <p className="text-xs text-[#475569] mt-0.5">
              Explore high-quality tutorials, official documentation, courses, and security guides to bridge your skill gaps.
            </p>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <form onSubmit={handleSearchSubmit} className="bg-[#FFFFFF] p-4 rounded-2xl border border-[#DBEAFE] shadow-sm flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#64748B] absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Search resources by title, topic, or skill..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#F8FBFF] border border-[#DBEAFE] rounded-xl text-xs text-[#1E3A8A] focus:outline-none focus:border-[#2563EB]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="px-3 py-2.5 bg-[#F8FBFF] border border-[#DBEAFE] rounded-xl text-xs text-[#1E3A8A] font-semibold focus:outline-none"
            >
              <option value="">All Difficulties</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>

            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2.5 bg-[#F8FBFF] border border-[#DBEAFE] rounded-xl text-xs text-[#1E3A8A] font-semibold focus:outline-none"
            >
              <option value="">All Resource Types</option>
              <option value="Documentation">Documentation</option>
              <option value="Course">Course</option>
              <option value="Tutorial">Tutorial</option>
              <option value="Video">Video</option>
              <option value="Article">Article</option>
            </select>

            <button
              type="submit"
              className="px-5 py-2.5 bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-2xs transition-all"
            >
              Search
            </button>
          </div>
        </form>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Resources Grid */}
        {loading ? (
          <div className="py-16 text-center text-xs font-semibold text-[#1E3A8A]">Loading learning resources...</div>
        ) : resources.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources.map((res) => (
              <div key={res._id} className="bg-[#FFFFFF] p-6 rounded-3xl border border-[#DBEAFE] shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center flex-wrap gap-2">
                    <span className="px-2.5 py-1 bg-[#EFF6FF] text-[#2563EB] text-[10px] font-extrabold rounded-lg border border-[#DBEAFE]">
                      {res.skill}
                    </span>
                    <span className="text-[10px] font-bold text-[#64748B] bg-[#F8FBFF] px-2 py-0.5 rounded-md border border-[#DBEAFE]">
                      {res.difficulty}
                    </span>
                  </div>

                  <h3 className="text-base font-extrabold text-[#1E3A8A] leading-snug">{res.title}</h3>
                  <p className="text-xs text-[#475569] line-clamp-3">{res.description}</p>
                </div>

                <div className="pt-3 border-t border-[#DBEAFE] flex justify-between items-center">
                  <span className="text-[11px] font-bold text-[#64748B]">{res.type}</span>
                  <a
                    href={res.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition-all inline-flex items-center gap-1"
                  >
                    <span>Open Link</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 bg-[#FFFFFF] rounded-3xl border border-[#DBEAFE] text-center space-y-2">
            <BookOpen className="w-10 h-10 text-[#2563EB] mx-auto opacity-50" />
            <h3 className="text-sm font-bold text-[#1E3A8A]">No Resources Found</h3>
            <p className="text-xs text-[#64748B]">Try clearing your search terms or filters.</p>
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
};

export default Resources;
