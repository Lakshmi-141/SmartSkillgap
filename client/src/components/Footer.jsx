import React from 'react';
import { Sparkles, ShieldCheck } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-950 border-t border-slate-800/80 py-8 px-4 sm:px-6 lg:px-8 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="text-slate-300 font-bold text-sm tracking-wide">
            SMARTSKILL <span className="text-slate-500 font-normal">| Skill Gap & Roadmap Platform</span>
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs text-amber-400/90 bg-amber-500/10 px-3 py-1.5 rounded-full border border-amber-500/20 max-w-xl">
          <ShieldCheck className="w-4 h-4 flex-shrink-0" />
          <span>This is an indicative platform-generated readiness metric and does not guarantee employment.</span>
        </div>

        <p className="text-xs text-slate-500">
          &copy; {new Date().getFullYear()} SMARTSKILL. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
