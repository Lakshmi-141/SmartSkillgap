import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { getAdminStatisticsApi } from '../services/api';
import { 
  Users, 
  Briefcase, 
  BookOpen, 
  Layers, 
  ShieldCheck, 
  Activity, 
  HelpCircle,
  FolderGit2,
  RefreshCw,
  AlertCircle,
  ChevronRight,
  Plus
} from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await getAdminStatisticsApi();
      if (res.success) {
        setStats(res.statistics);
      } else {
        setError(res.message || 'Failed to fetch platform statistics');
      }
    } catch (err) {
      console.error('Error fetching admin statistics:', err);
      setError(err.response?.data?.message || 'Failed to load admin statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = 'SmartSkillGap | Admin Portal';
    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FBFF] flex flex-col justify-between font-sans">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8 flex-1">
        
        {/* Header & Sub-Navigation Tabs */}
        <div className="bg-[#FFFFFF] p-6 sm:p-8 rounded-3xl border border-[#DBEAFE] shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-[#EFF6FF] text-[#2563EB] border border-[#DBEAFE] flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#2563EB]" />
                System Administrator
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E3A8A] mt-2">
              Admin Control Center
            </h1>
            <p className="text-sm text-[#475569] mt-1">
              Manage platform users, career catalogs, skills, assessments, resources, and projects.
            </p>
          </div>

          <button
            onClick={fetchStats}
            disabled={loading}
            className="p-3 rounded-xl text-xs font-bold text-[#1E3A8A] bg-[#F8FBFF] hover:bg-[#EFF6FF] border border-[#DBEAFE] transition-all flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 text-[#2563EB] ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Metrics</span>
          </button>
        </div>

        {/* Admin Section Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-[#DBEAFE] pb-2">
          <Link to="/admin" className="px-4 py-2 rounded-xl text-xs font-extrabold bg-[#2563EB] text-white shadow-xs">
            Overview
          </Link>
          <Link to="/admin/users" className="px-4 py-2 rounded-xl text-xs font-bold text-[#1E3A8A] bg-[#FFFFFF] hover:bg-[#EFF6FF] border border-[#DBEAFE]">
            Users
          </Link>
          <Link to="/admin/careers" className="px-4 py-2 rounded-xl text-xs font-bold text-[#1E3A8A] bg-[#FFFFFF] hover:bg-[#EFF6FF] border border-[#DBEAFE]">
            Careers
          </Link>
          <Link to="/admin/career-skills" className="px-4 py-2 rounded-xl text-xs font-bold text-[#1E3A8A] bg-[#FFFFFF] hover:bg-[#EFF6FF] border border-[#DBEAFE]">
            Career Skills
          </Link>
          <Link to="/admin/skills" className="px-4 py-2 rounded-xl text-xs font-bold text-[#1E3A8A] bg-[#FFFFFF] hover:bg-[#EFF6FF] border border-[#DBEAFE]">
            Master Skills
          </Link>
          <Link to="/admin/assessments" className="px-4 py-2 rounded-xl text-xs font-bold text-[#1E3A8A] bg-[#FFFFFF] hover:bg-[#EFF6FF] border border-[#DBEAFE]">
            Assessments
          </Link>
          <Link to="/admin/resources" className="px-4 py-2 rounded-xl text-xs font-bold text-[#1E3A8A] bg-[#FFFFFF] hover:bg-[#EFF6FF] border border-[#DBEAFE]">
            Resources
          </Link>
          <Link to="/admin/projects" className="px-4 py-2 rounded-xl text-xs font-bold text-[#1E3A8A] bg-[#FFFFFF] hover:bg-[#EFF6FF] border border-[#DBEAFE]">
            Projects
          </Link>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
            <button onClick={fetchStats} className="font-bold underline text-xs">Retry</button>
          </div>
        )}

        {/* 7 Stats Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#DBEAFE] shadow-sm space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-extrabold text-[#475569] uppercase">Total Users</span>
              <Users className="w-5 h-5 text-[#2563EB]" />
            </div>
            <div className="text-3xl font-black text-[#1E3A8A]">{stats?.totalUsers || 0}</div>
            <p className="text-[11px] text-[#64748B]">Students: {stats?.totalStudents || 0} • Admins: {stats?.roleDistribution?.admin || 0}</p>
          </div>

          <div className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#DBEAFE] shadow-sm space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-extrabold text-[#475569] uppercase">Active Careers</span>
              <Briefcase className="w-5 h-5 text-[#2563EB]" />
            </div>
            <div className="text-3xl font-black text-[#1E3A8A]">{stats?.totalCareers || 0}</div>
            <Link to="/admin/careers" className="text-xs text-[#2563EB] font-bold hover:underline">Manage Careers →</Link>
          </div>

          <div className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#DBEAFE] shadow-sm space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-extrabold text-[#475569] uppercase">Master Skills</span>
              <Layers className="w-5 h-5 text-[#2563EB]" />
            </div>
            <div className="text-3xl font-black text-[#1E3A8A]">{stats?.totalSkills || 0}</div>
            <Link to="/admin/skills" className="text-xs text-[#2563EB] font-bold hover:underline">Manage Skills →</Link>
          </div>

          <div className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#DBEAFE] shadow-sm space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-extrabold text-[#475569] uppercase">Assessments</span>
              <HelpCircle className="w-5 h-5 text-[#2563EB]" />
            </div>
            <div className="text-3xl font-black text-[#1E3A8A]">{stats?.totalAssessments || 0}</div>
            <Link to="/admin/assessments" className="text-xs text-[#2563EB] font-bold hover:underline">Manage Assessments →</Link>
          </div>

          <div className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#DBEAFE] shadow-sm space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-extrabold text-[#475569] uppercase">Resources</span>
              <BookOpen className="w-5 h-5 text-[#2563EB]" />
            </div>
            <div className="text-3xl font-black text-[#1E3A8A]">{stats?.totalResources || 0}</div>
            <Link to="/admin/resources" className="text-xs text-[#2563EB] font-bold hover:underline">Manage Resources →</Link>
          </div>

          <div className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#DBEAFE] shadow-sm space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-extrabold text-[#475569] uppercase">Projects</span>
              <FolderGit2 className="w-5 h-5 text-[#2563EB]" />
            </div>
            <div className="text-3xl font-black text-[#1E3A8A]">{stats?.totalProjects || 0}</div>
            <Link to="/admin/projects" className="text-xs text-[#2563EB] font-bold hover:underline">Manage Projects →</Link>
          </div>

          <div className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#DBEAFE] shadow-sm space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-extrabold text-[#475569] uppercase">Analyses Run</span>
              <Activity className="w-5 h-5 text-[#2563EB]" />
            </div>
            <div className="text-3xl font-black text-[#1E3A8A]">{stats?.totalSkillGapAnalyses || 0}</div>
            <p className="text-xs text-[#64748B]">Total Roadmaps: {stats?.totalRoadmaps || 0}</p>
          </div>

        </div>

        {/* Recent Registrations Table Card */}
        <div className="bg-[#FFFFFF] p-6 sm:p-8 rounded-3xl border border-[#DBEAFE] shadow-sm space-y-6">
          <div className="flex justify-between items-center pb-4 border-b border-[#DBEAFE]">
            <div>
              <h2 className="text-xl font-extrabold text-[#1E3A8A] flex items-center gap-2">
                <Users className="w-5 h-5 text-[#2563EB]" />
                <span>Recently Registered Users</span>
              </h2>
              <p className="text-xs text-[#64748B]">Latest account signups</p>
            </div>
            <Link to="/admin/users" className="text-xs font-bold text-[#2563EB] hover:underline flex items-center gap-1">
              <span>View All Users</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#334155]">
              <thead>
                <tr className="bg-[#F8FBFF] text-[#1E3A8A] uppercase font-extrabold border-b border-[#DBEAFE]">
                  <th className="p-3.5">User</th>
                  <th className="p-3.5">Role</th>
                  <th className="p-3.5">Target Career</th>
                  <th className="p-3.5">Registered Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DBEAFE]">
                {stats?.recentUsers && stats.recentUsers.length > 0 ? (
                  stats.recentUsers.map((u) => (
                    <tr key={u._id} className="hover:bg-[#F8FBFF]/60 transition-colors">
                      <td className="p-3.5 font-bold text-[#1E3A8A] flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#2563EB] text-white flex items-center justify-center font-bold text-xs">
                          {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div>
                          <span>{u.name}</span>
                          <span className="block text-[11px] text-[#64748B] font-normal">{u.email}</span>
                        </div>
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase border ${
                          u.role === 'admin' || u.role === 'ADMIN'
                            ? 'bg-[#1E3A8A] text-white border-[#1E3A8A]'
                            : 'bg-[#EFF6FF] text-[#2563EB] border-[#DBEAFE]'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="p-3.5 font-semibold text-[#1E3A8A]">
                        {u.targetCareer || 'Full Stack Web Developer'}
                      </td>
                      <td className="p-3.5 text-[#64748B]">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'Today'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="p-6 text-center text-[#64748B]">
                      No recent user registrations found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
};

export default AdminDashboard;
