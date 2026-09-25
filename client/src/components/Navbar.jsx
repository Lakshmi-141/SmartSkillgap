import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Compass, Menu, X, ArrowRight, LogOut, User, Award, Target, BarChart3, Map } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  const publicNavLinks = [
    { name: 'Home', path: '/' },
    { name: 'How It Works', path: '/#how-it-works' },
    { name: 'Features', path: '/#features' },
    { name: 'Gap Preview', path: '/#preview' },
  ];

  const authNavLinks = [
    { name: 'Home', path: '/' },
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Roadmap', path: '/roadmap' },
    { name: 'Skill Gap', path: '/skill-gap' },
    { name: 'Compare Careers', path: '/career-comparison' },
    { name: 'Careers', path: '/careers' },
    { name: 'My Profile', path: '/profile' },
    { name: 'My Skills', path: '/skills' },
    ...(user?.role === 'ADMIN' ? [{ name: 'Admin Panel', path: '/admin' }] : [])
  ];

  const navLinks = isAuthenticated ? authNavLinks : publicNavLinks;


  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNavClick = (path) => {
    setMobileMenuOpen(false);
    if (path.includes('#')) {
      const [pathname, hash] = path.split('#');
      if (location.pathname !== pathname && pathname !== '') {
        navigate(path);
      } else if (hash) {
        const elem = document.getElementById(hash);
        if (elem) {
          elem.scrollIntoView({ behavior: 'smooth' });
        }
      }
    } else {
      navigate(path);
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-[#FFFFFF]/90 backdrop-blur-md border-b border-[#DBEAFE] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-11 h-11 rounded-xl bg-[#2563EB] flex items-center justify-center text-white shadow-md shadow-[#2563EB]/20 group-hover:scale-105 transition-transform">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-extrabold text-[#1E3A8A] tracking-tight block leading-none">
                SmartSkill<span className="text-[#2563EB]">Gap</span>
              </span>
              <span className="text-[11px] font-medium text-[#64748B] tracking-wider uppercase">
                Career Roadmap
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.path}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(link.path);
                }}
                className={`text-sm font-semibold transition-colors duration-200 ${
                  isActive(link.path)
                    ? 'text-[#2563EB]'
                    : 'text-[#334155] hover:text-[#2563EB]'
                }`}
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* Action Buttons / User Status */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <Link
                  to="/profile"
                  className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-[#EFF6FF] border border-[#DBEAFE] hover:border-[#2563EB] transition-all"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#2563EB] text-white flex items-center justify-center text-xs font-bold">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="text-left">
                    <span className="text-xs font-bold text-[#1E3A8A] block leading-tight">{user?.name}</span>
                    <span className="text-[10px] text-[#2563EB] font-semibold tracking-wide uppercase">{user?.role}</span>
                  </div>
                </Link>
                
                <button
                  onClick={handleLogout}
                  aria-label="Logout"
                  className="p-2.5 rounded-xl text-sm font-semibold text-[#1E3A8A] hover:bg-[#EFF6FF] border border-[#DBEAFE] transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-[#2563EB]" />
                </button>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-5 py-2.5 rounded-lg text-sm font-semibold text-[#1E3A8A] hover:bg-[#EFF6FF] border border-transparent hover:border-[#DBEAFE] transition-all"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-[#2563EB] hover:bg-[#1E3A8A] shadow-md shadow-[#2563EB]/25 transition-all flex items-center gap-2 group"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
              className="p-2 rounded-lg text-[#334155] hover:bg-[#EFF6FF] focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu & Backdrop */}
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-[#334155]/20 backdrop-blur-xs z-40 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          ></div>
          <div className="relative z-50 md:hidden bg-[#FFFFFF] border-b border-[#DBEAFE] px-4 pt-2 pb-6 space-y-3">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.path}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(link.path);
                }}
                className="block py-2 text-base font-semibold text-[#334155] hover:text-[#2563EB]"
              >
                {link.name}
              </a>
            ))}
            <div className="pt-4 border-t border-[#DBEAFE] flex flex-col space-y-3">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-3 rounded-lg bg-[#EFF6FF] border border-[#DBEAFE] flex items-center space-x-3"
                  >
                    <div className="w-9 h-9 rounded-lg bg-[#2563EB] text-white flex items-center justify-center font-bold">
                      {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#1E3A8A]">{user?.name}</p>
                      <p className="text-xs text-[#64748B]">{user?.email}</p>
                    </div>
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-center py-2.5 rounded-lg text-sm font-semibold text-[#1E3A8A] bg-[#EFF6FF] border border-[#DBEAFE]"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2.5 rounded-lg text-sm font-semibold text-[#1E3A8A] bg-[#EFF6FF] border border-[#DBEAFE]"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2.5 rounded-lg text-sm font-semibold text-white bg-[#2563EB]"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </nav>
  );
};

export default Navbar;
