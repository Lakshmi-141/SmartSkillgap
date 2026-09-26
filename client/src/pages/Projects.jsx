import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { getProjectsApi, getProjectRecommendationsApi, updateProjectProgressApi } from '../services/api';
import { 
  FolderGit2, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  ExternalLink, 
  GitBranch, 
  AlertCircle, 
  Layers,
  ChevronRight
} from 'lucide-react';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const fetchProjectData = async () => {
    try {
      setLoading(true);
      setError('');
      const [resProj, resRec] = await Promise.all([
        getProjectsApi(),
        getProjectRecommendationsApi()
      ]);

      if (resProj.success) setProjects(resProj.projects || []);
      if (resRec.success) setRecommendations(resRec.recommendations || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load project recommendations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = 'SmartSkillGap | Project Recommendations';
    fetchProjectData();
  }, []);

  const handleStatusChange = async (projectId, newStatus) => {
    try {
      setUpdatingId(projectId);
      const res = await updateProjectProgressApi(projectId, { status: newStatus });
      if (res.success) {
        fetchProjectData();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update project status.');
    } finally {
      setUpdatingId(null);
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
              <span className="px-3 py-1 bg-[#EFF6FF] text-[#2563EB] text-xs font-extrabold rounded-full border border-[#DBEAFE]">
                Practical Portfolio Development
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E3A8A] mt-1">
              Project Recommendations
            </h1>
            <p className="text-xs text-[#475569] mt-0.5">
              Hands-on capstone and portfolio projects tailored to your target career and skill gap analysis.
            </p>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Tailored Recommendations Grid */}
        {loading ? (
          <div className="py-16 text-center text-xs font-semibold text-[#1E3A8A]">Computing personalized project recommendations...</div>
        ) : recommendations.length > 0 ? (
          <div className="space-y-6">
            <h2 className="text-xl font-extrabold text-[#1E3A8A] flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#2563EB]" />
              <span>Recommended for Your Target Career</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendations.map((proj) => (
                <div key={proj._id} className="bg-[#FFFFFF] p-6 rounded-3xl border border-[#DBEAFE] shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="px-2.5 py-1 bg-[#EFF6FF] text-[#2563EB] text-[10px] font-extrabold rounded-lg border border-[#DBEAFE]">
                        {proj.difficulty}
                      </span>
                      <span className="text-[10px] font-bold text-[#64748B] flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#2563EB]" />
                        {proj.estimatedDuration}
                      </span>
                    </div>

                    <h3 className="text-base font-extrabold text-[#1E3A8A] leading-snug">{proj.title}</h3>
                    <p className="text-xs text-[#475569] line-clamp-3">{proj.description}</p>

                    {proj.skillsGained && proj.skillsGained.length > 0 && (
                      <div className="space-y-1 pt-1">
                        <span className="text-[10px] font-bold text-[#64748B] uppercase">Skills Gained:</span>
                        <div className="flex flex-wrap gap-1">
                          {proj.skillsGained.map((sg, idx) => (
                            <span key={idx} className="px-2 py-0.5 bg-[#F8FBFF] text-[#1E3A8A] text-[10px] font-semibold rounded-md border border-[#DBEAFE]">
                              {sg}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-[#DBEAFE] space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#1E3A8A]">Status:</span>
                      <select
                        value={proj.userStatus || 'NOT_STARTED'}
                        disabled={updatingId === proj._id}
                        onChange={(e) => handleStatusChange(proj._id, e.target.value)}
                        className="px-2.5 py-1.5 bg-[#F8FBFF] border border-[#DBEAFE] rounded-xl text-xs font-bold text-[#1E3A8A] focus:outline-none"
                      >
                        <option value="NOT_STARTED">Not Started</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="COMPLETED">Completed</option>
                      </select>
                    </div>

                    <div className="flex gap-2">
                      {proj.githubUrl && (
                        <a
                          href={proj.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 py-2 bg-[#F8FBFF] hover:bg-[#EFF6FF] text-[#1E3A8A] border border-[#DBEAFE] font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1"
                        >
                          <GitBranch className="w-3.5 h-3.5 text-[#2563EB]" />
                          <span>Repo</span>
                        </a>
                      )}
                      {proj.demoUrl && (
                        <a
                          href={proj.demoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 py-2 bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1"
                        >
                          <span>Live Demo</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-12 bg-[#FFFFFF] rounded-3xl border border-[#DBEAFE] text-center space-y-2">
            <FolderGit2 className="w-10 h-10 text-[#2563EB] mx-auto opacity-50" />
            <h3 className="text-sm font-bold text-[#1E3A8A]">No Project Recommendations Found</h3>
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
};

export default Projects;
