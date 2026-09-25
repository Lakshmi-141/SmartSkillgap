import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { Compass, Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    document.title = 'SmartSkillGap | Sign In';
  }, []);

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    const trimmedEmail = formData.email.trim();
    if (!trimmedEmail || !formData.password) {
      setFormError('Please enter both email and password.');
      return;
    }

    setIsSubmitting(true);
    const result = await login(trimmedEmail, formData.password);
    setIsSubmitting(false);

    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setFormError(result.message || 'Invalid email or password.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FBFF] flex flex-col justify-between">
      <Navbar />
      
      <div className="max-w-md w-full mx-auto px-4 py-12">
        <div className="bg-[#FFFFFF] p-8 rounded-2xl border border-[#DBEAFE] shadow-xl shadow-[#2563EB]/5">
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-[#EFF6FF] border border-[#DBEAFE] flex items-center justify-center text-[#2563EB] mx-auto mb-4">
              <Compass className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-extrabold text-[#1E3A8A]">Welcome Back</h2>
            <p className="text-sm text-[#64748B] mt-1">Sign in to access your career roadmap</p>
          </div>

          {/* Error Banner */}
          {formError && (
            <div className="mb-6 p-4 rounded-xl bg-[#EFF6FF] border border-[#DBEAFE] flex items-start gap-3 text-xs text-[#1E3A8A] font-medium">
              <AlertCircle className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#1E3A8A] uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 bg-[#F8FBFF] border border-[#DBEAFE] rounded-xl text-sm text-[#334155] focus:outline-none focus:border-[#2563EB]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1E3A8A] uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 pr-12 py-3 bg-[#F8FBFF] border border-[#DBEAFE] rounded-xl text-sm text-[#334155] focus:outline-none focus:border-[#2563EB]"
                />
                <button
                  type="button"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#2563EB] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 rounded-xl font-bold text-white bg-[#2563EB] hover:bg-[#1E3A8A] shadow-md shadow-[#2563EB]/25 transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50 cursor-pointer"
            >
              <span>{isSubmitting ? 'Signing In...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <p className="text-center text-sm text-[#64748B] mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-[#2563EB] hover:underline">
              Create one now
            </Link>
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Login;
