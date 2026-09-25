import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { getAdminUsersApi } from '../services/api';
import { 
  Users, 
  ShieldCheck, 
  Search, 
  RefreshCw, 
  AlertCircle,
  Mail,
  Calendar,
  Briefcase,
  CheckCircle2
} from 'lucide-react';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await getAdminUsersApi();
      if (res.success) {
        setUsers(res.users || []);
      } else {
        setError(res.message || 'Failed to fetch registered users');
      }
    } catch (err) {
      console.error('Error fetching admin users:', err);
      setError(err.response?.data?.message || 'Failed to load user list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = 'SmartSkillGap | Admin Users Management';
    fetchUsers();
  }, []);

  // Filter users by search query & role
  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      (u.name && u.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (u.email && u.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (u.targetCareer && u.targetCareer.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;

    return matchesSearch && matchesRole;
  });

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
                User Authorization & Management
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E3A8A] mt-2">
              User Accounts Directory
            </h1>
            <p className="text-sm text-[#475569] mt-1">
              View and audit all {users.length} registered user profiles on MongoDB.
            </p>
          </div>

          <button
            onClick={fetchUsers}
            disabled={loading}
            className="p-3 rounded-xl text-xs font-bold text-[#1E3A8A] bg-[#F8FBFF] hover:bg-[#EFF6FF] border border-[#DBEAFE] transition-all flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 text-[#2563EB] ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Users</span>
          </button>
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
            className="px-5 py-2.5 rounded-xl text-xs font-extrabold bg-[#2563EB] text-white shadow-xs"
          >
            Users Management ({users.length})
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

        {/* Search & Role Filter Toolbar */}
        <div className="bg-[#FFFFFF] p-4 rounded-2xl border border-[#DBEAFE] shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-[#64748B] absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by name, email or career..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#F8FBFF] border border-[#DBEAFE] rounded-xl text-xs text-[#1E3A8A] placeholder-[#64748B] focus:outline-none focus:border-[#2563EB]"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <span className="text-xs font-bold text-[#64748B]">Filter Role:</span>
            {['ALL', 'USER', 'ADMIN'].map((role) => (
              <button
                key={role}
                onClick={() => setRoleFilter(role)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  roleFilter === role
                    ? 'bg-[#2563EB] text-white'
                    : 'bg-[#F8FBFF] text-[#334155] border border-[#DBEAFE] hover:bg-[#EFF6FF]'
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
            <button onClick={fetchUsers} className="font-bold underline text-xs">Retry</button>
          </div>
        )}

        {/* Users Directory Table Card */}
        <div className="bg-[#FFFFFF] p-6 sm:p-8 rounded-3xl border border-[#DBEAFE] shadow-sm space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-[#DBEAFE]">
            <h2 className="text-lg font-extrabold text-[#1E3A8A] flex items-center gap-2">
              <Users className="w-5 h-5 text-[#2563EB]" />
              <span>Registered Users ({filteredUsers.length})</span>
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#334155]">
              <thead>
                <tr className="bg-[#F8FBFF] text-[#1E3A8A] uppercase font-extrabold border-b border-[#DBEAFE]">
                  <th className="p-3.5">Full Name & Email</th>
                  <th className="p-3.5">Role</th>
                  <th className="p-3.5">Target Career</th>
                  <th className="p-3.5">Skills Added</th>
                  <th className="p-3.5">Education / Experience</th>
                  <th className="p-3.5">Registered</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DBEAFE]">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((u) => (
                    <tr key={u._id} className="hover:bg-[#F8FBFF]/60 transition-colors">
                      <td className="p-3.5 font-bold text-[#1E3A8A]">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-[#2563EB] text-white flex items-center justify-center font-bold text-xs shrink-0">
                            {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div>
                            <span className="text-sm font-black text-[#1E3A8A] block">{u.name}</span>
                            <span className="text-xs text-[#64748B] flex items-center gap-1 font-medium">
                              <Mail className="w-3 h-3 text-[#2563EB]" />
                              {u.email}
                            </span>
                          </div>
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
                        <span className="flex items-center gap-1">
                          <Briefcase className="w-3.5 h-3.5 text-[#2563EB]" />
                          {u.targetCareer || 'Full Stack Web Developer'}
                        </span>
                      </td>

                      <td className="p-3.5 font-bold text-[#2563EB]">
                        {Array.isArray(u.skills) ? u.skills.length : 0} skills
                      </td>

                      <td className="p-3.5 text-[#475569]">
                        <div>{u.experienceLevel || 'Student'}</div>
                        {u.education && <div className="text-[11px] text-[#64748B]">{u.education}</div>}
                      </td>

                      <td className="p-3.5 text-[#64748B]">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-[#2563EB]" />
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'Today'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-[#64748B]">
                      {loading ? 'Loading user profiles...' : 'No users match search criteria.'}
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

export default AdminUsers;
