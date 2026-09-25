import React from 'react';
import { Compass, Globe, Code, Share2, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-[#FFFFFF] border-t border-[#DBEAFE] text-[#334155] pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-[#DBEAFE]">
          
          {/* Col 1 */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-[#2563EB] flex items-center justify-center text-white">
                <Compass className="w-5 h-5" />
              </div>
              <span className="text-xl font-extrabold text-[#1E3A8A] tracking-tight">
                SmartSkill<span className="text-[#2563EB]">Gap</span>
              </span>
            </div>
            <p className="text-sm text-[#64748B] leading-relaxed">
              Empowering students and professionals to identify skill gaps, master in-demand industry skills, and achieve career growth with personalized roadmaps.
            </p>
          </div>

          {/* Col 2 */}
          <div>
            <h4 className="text-sm font-bold text-[#1E3A8A] uppercase tracking-wider mb-4">Platform</h4>
            <ul className="space-y-2.5 text-sm text-[#64748B]">
              <li><a href="#features" className="hover:text-[#2563EB] transition-colors">Skill Gap Analyzer</a></li>
              <li><a href="#how-it-works" className="hover:text-[#2563EB] transition-colors">Career Roadmap Generator</a></li>
              <li><a href="#preview" className="hover:text-[#2563EB] transition-colors">Market Demand Matrix</a></li>
              <li><Link to="/dashboard" className="hover:text-[#2563EB] transition-colors">User Dashboard</Link></li>
            </ul>
          </div>

          {/* Col 3 */}
          <div>
            <h4 className="text-sm font-bold text-[#1E3A8A] uppercase tracking-wider mb-4">Popular Roles</h4>
            <ul className="space-y-2.5 text-sm text-[#64748B]">
              <li><span className="hover:text-[#2563EB] cursor-pointer">Full Stack Web Developer</span></li>
              <li><span className="hover:text-[#2563EB] cursor-pointer">Data Scientist & AI Engineer</span></li>
              <li><span className="hover:text-[#2563EB] cursor-pointer">DevOps & Cloud Engineer</span></li>
              <li><span className="hover:text-[#2563EB] cursor-pointer">UI/UX Product Designer</span></li>
            </ul>
          </div>

          {/* Col 4 */}
          <div>
            <h4 className="text-sm font-bold text-[#1E3A8A] uppercase tracking-wider mb-4">Stay Connected</h4>
            <p className="text-sm text-[#64748B] mb-4">
              Get the latest insights on high-demand tech skills and learning pathways.
            </p>
            <div className="flex space-x-3">
              <a href="#" aria-label="Website" className="w-9 h-9 rounded-lg bg-[#EFF6FF] border border-[#DBEAFE] flex items-center justify-center text-[#2563EB] hover:bg-[#2563EB] hover:text-white transition-all">
                <Globe className="w-4 h-4" />
              </a>
              <a href="#" aria-label="Code Repository" className="w-9 h-9 rounded-lg bg-[#EFF6FF] border border-[#DBEAFE] flex items-center justify-center text-[#2563EB] hover:bg-[#2563EB] hover:text-white transition-all">
                <Code className="w-4 h-4" />
              </a>
              <a href="#" aria-label="Share" className="w-9 h-9 rounded-lg bg-[#EFF6FF] border border-[#DBEAFE] flex items-center justify-center text-[#2563EB] hover:bg-[#2563EB] hover:text-white transition-all">
                <Share2 className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        <div className="pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-[#64748B] gap-4">
          <p>© {new Date().getFullYear()} SmartSkillGap Platform. All rights reserved.</p>
          <div className="flex space-x-6">
            <span className="hover:text-[#2563EB] cursor-pointer">Privacy Policy</span>
            <span className="hover:text-[#2563EB] cursor-pointer">Terms of Service</span>
            <span className="hover:text-[#2563EB] cursor-pointer">Security</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
