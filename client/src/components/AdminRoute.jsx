import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

const AdminRoute = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FBFF] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 border-4 border-[#2563EB] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-semibold text-[#1E3A8A]">Verifying Admin Authorization...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user?.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-[#F8FBFF] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#FFFFFF] p-8 rounded-3xl border border-[#DBEAFE] shadow-sm text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 border border-red-100 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <span className="px-3 py-1 bg-red-100 text-red-800 text-xs font-black uppercase rounded-full">
              403 Forbidden
            </span>
            <h1 className="text-2xl font-extrabold text-[#1E3A8A]">Access Restricted</h1>
            <p className="text-xs text-[#475569]">
              Only authorized Administrators have access to this portal. Your current account role is <strong className="text-[#2563EB]">{user?.role || 'USER'}</strong>.
            </p>
          </div>
          <Link
            to="/dashboard"
            className="w-full py-3 px-4 bg-[#2563EB] hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all inline-flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Student Dashboard</span>
          </Link>
        </div>
      </div>
    );
  }

  return children;
};

export default AdminRoute;
