import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Compass, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  useEffect(() => {
    document.title = 'SmartSkillGap | Page Not Found (404)';
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FBFF] flex flex-col justify-between">
      <Navbar />

      <div className="max-w-md w-full mx-auto px-4 py-20 text-center">
        <div className="bg-[#FFFFFF] p-8 sm:p-10 rounded-2xl border border-[#DBEAFE] shadow-xl shadow-[#2563EB]/5 space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-[#EFF6FF] border border-[#DBEAFE] flex items-center justify-center text-[#2563EB] mx-auto">
            <Compass className="w-8 h-8" />
          </div>

          <div>
            <h1 className="text-6xl font-black text-[#1E3A8A]">404</h1>
            <h2 className="text-xl font-bold text-[#334155] mt-2">Roadmap Off Course</h2>
            <p className="text-sm text-[#64748B] mt-2">
              The page or resource you are looking for does not exist or has moved.
            </p>
          </div>

          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white bg-[#2563EB] hover:bg-[#1E3A8A] shadow-md shadow-[#2563EB]/25 transition-all text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Home</span>
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default NotFound;
