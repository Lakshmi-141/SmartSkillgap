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
  TrendingUp, 
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
              Manage platform users, career catalogs, skill definitions, and system metrics.
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
          <Link
            to="/admin"
            className="px-5 py-2.5 rounded-xl text-xs font-extrabold bg-[#2563EB] text-white shadow-xs"
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
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-[#1E3A8A] bg-[#FFFFFF] hover:bg-[#EFF6FF] border border-[#DBEAFE] transition-all"
          >
            Skills Catalog
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

        {/* Top 4 Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#DBEAFE] shadow-sm space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-extrabold text-[#475569] uppercase tracking-wider">Total Users</span>
              <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center border border-[#DBEAFE]">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-black text-[#1E3A8A]">{stats?.totalUsers || 0}</div>
            <div className="text-xs text-[#64748B] font-medium flex justify-between">
              <span>Standard Users: {stats?.roleDistribution?.USER || 0}</span>
              <span>Admins: {stats?.roleDistribution?.ADMIN || 0}</span>
            </div>
          </div>

          <div className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#DBEAFE] shadow-sm space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-extrabold text-[#475569] uppercase tracking-wider">Active Careers</span>
              <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center border border-[#DBEAFE]">
                <Briefcase className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-black text-[#1E3A8A]">{stats?.totalCareers || 0}</div>
            <p className="text-xs text-[#2563EB] font-semibold">Available for gap analysis</p>
          </div>

          <div className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#DBEAFE] shadow-sm space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-extrabold text-[#475569] uppercase tracking-wider">Master Skills</span>
              <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center border border-[#DBEAFE]">
                <Layers className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-black text-[#1E3A8A]">{stats?.totalSkills || 0}</div>
            <p className="text-xs text-[#64748B] font-medium">Catalog skills database</p>
          </div>

          <div className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#DBEAFE] shadow-sm space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-extrabold text-[#475569] uppercase tracking-wider">Analyses Run</span>
              <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center border border-[#DBEAFE]">
                <Activity className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-black text-[#1E3A8A]">{stats?.totalSkillGapAnalyses || 0}</div>
            <p className="text-xs text-[#64748B] font-medium">Saved roadmaps: {stats?.totalRoadmaps || 0}</p>
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
              <p className="text-xs text-[#64748B]">Latest accounts created across the platform</p>
            </div>
            <Link
              to="/admin/users"
              className="text-xs font-bold text-[#2563EB] hover:underline flex items-center gap-1"
            >
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
                          u.role === 'ADMIN'
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
