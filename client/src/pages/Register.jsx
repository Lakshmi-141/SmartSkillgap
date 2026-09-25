import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { Compass, User, Mail, Lock, Eye, EyeOff, Target, ArrowRight, AlertCircle } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    targetRole: 'Full Stack Web Developer'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'SmartSkillGap | Create Account';
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    const trimmedName = formData.name.trim();
    const trimmedEmail = formData.email.trim();

    if (!trimmedName || !trimmedEmail || !formData.password) {
      setFormError('Please fill out all required fields.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setFormError('Passwords do not match. Please verify your password entry.');
      return;
    }

    if (formData.password.length < 6) {
      setFormError('Password must be at least 6 characters long.');
      return;
    }

    setIsSubmitting(true);
    const result = await register(
      trimmedName,
      trimmedEmail,
      formData.password,
      formData.confirmPassword,
      formData.targetRole
    );
    setIsSubmitting(false);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setFormError(result.message || 'Registration failed.');
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
            <h2 className="text-2xl font-extrabold text-[#1E3A8A]">Create Your Account</h2>
            <p className="text-sm text-[#64748B] mt-1">Start your personalized skill gap analysis</p>
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
                Full Name
              </label>
              <div className="relative">
                <User className="w-5 h-5 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="Alex Morgan"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 bg-[#F8FBFF] border border-[#DBEAFE] rounded-xl text-sm text-[#334155] focus:outline-none focus:border-[#2563EB]"
                />
              </div>
            </div>

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
                Target Career Goal
              </label>
              <div className="relative">
                <Target className="w-5 h-5 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
                <select
                  value={formData.targetRole}
                  onChange={(e) => setFormData({ ...formData, targetRole: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 bg-[#F8FBFF] border border-[#DBEAFE] rounded-xl text-sm text-[#334155] focus:outline-none focus:border-[#2563EB] appearance-none"
                >
                  <option value="Full Stack Web Developer">Full Stack Web Developer</option>
                  <option value="Data Scientist & AI Engineer">Data Scientist & AI Engineer</option>
                  <option value="DevOps & Cloud Engineer">DevOps & Cloud Engineer</option>
                  <option value="UI/UX Product Designer">UI/UX Product Designer</option>
                </select>
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

            <div>
              <label className="block text-xs font-bold text-[#1E3A8A] uppercase tracking-wider mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full pl-10 pr-12 py-3 bg-[#F8FBFF] border border-[#DBEAFE] rounded-xl text-sm text-[#334155] focus:outline-none focus:border-[#2563EB]"
                />
                <button
                  type="button"
                  aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#2563EB] transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 rounded-xl font-bold text-white bg-[#2563EB] hover:bg-[#1E3A8A] shadow-md shadow-[#2563EB]/25 transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50 cursor-pointer"
            >
              <span>{isSubmitting ? 'Creating Account...' : 'Create Account'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <p className="text-center text-sm text-[#64748B] mt-6">
            Already registered?{' '}
            <Link to="/login" className="font-bold text-[#2563EB] hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Register;
