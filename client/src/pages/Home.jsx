import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SkillGapPreview from '../components/SkillGapPreview';
import RoadmapPreview from '../components/RoadmapPreview';
import { 
  Compass, 
  Target, 
  TrendingUp, 
  Map, 
  CheckCircle2, 
  Zap, 
  ArrowRight, 
  Layers, 
  BookOpen, 
  Award, 
  Users,
  ShieldCheck,
  BarChart3
} from 'lucide-react';

const Home = () => {
  useEffect(() => {
    document.title = 'SmartSkillGap | Bridge Your Skill Gap & Build Your Career Roadmap';
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FBFF] text-[#334155] flex flex-col font-sans">
      <Navbar />

      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-[#DBEAFE]">
        {/* Soft Decorative Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none -z-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-[#EFF6FF] rounded-full blur-3xl opacity-70"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#EFF6FF] rounded-full blur-3xl opacity-80"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column Text */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EFF6FF] border border-[#DBEAFE] text-[#2563EB] text-xs font-bold uppercase tracking-wider">
                <Zap className="w-3.5 h-3.5 fill-[#2563EB]" />
                <span>Next-Gen Career Intelligence</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#1E3A8A] tracking-tight leading-[1.15]">
                Bridge Your Skill Gap. <br className="hidden sm:inline" />
                <span className="text-[#2563EB]">Build Your Career Roadmap.</span>
              </h1>

              <p className="text-lg sm:text-xl text-[#64748B] max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Identify the skills you need, discover what you're missing, and follow a personalized roadmap toward your career goal.
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  to="/register"
                  className="px-8 py-4 rounded-xl font-bold text-white bg-[#2563EB] hover:bg-[#1E3A8A] shadow-lg shadow-[#2563EB]/25 transition-all flex items-center justify-center gap-3 group text-base"
                >
                  <span>Start Gap Analysis</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                
                <a
                  href="#preview"
                  className="px-8 py-4 rounded-xl font-bold text-[#1E3A8A] bg-[#FFFFFF] hover:bg-[#EFF6FF] border border-[#DBEAFE] transition-all flex items-center justify-center gap-2 text-base shadow-sm"
                >
                  <Map className="w-5 h-5 text-[#2563EB]" />
                  <span>Explore Sample Roadmap</span>
                </a>
              </div>

              {/* Key Trust Highlights */}
              <div className="pt-6 grid grid-cols-3 gap-4 border-t border-[#DBEAFE]/80 max-w-lg mx-auto lg:mx-0">
                <div>
                  <h4 className="text-xl font-extrabold text-[#1E3A8A]">500+</h4>
                  <p className="text-xs text-[#64748B] font-medium">Industry Roles</p>
                </div>
                <div>
                  <h4 className="text-xl font-extrabold text-[#1E3A8A]">10k+</h4>
                  <p className="text-xs text-[#64748B] font-medium">Mapped Skills</p>
                </div>
                <div>
                  <h4 className="text-xl font-extrabold text-[#1E3A8A]">98%</h4>
                  <p className="text-xs text-[#64748B] font-medium">Goal Clarity</p>
                </div>
              </div>
            </div>

            {/* Right Column Interactive Visual Hero Card */}
            <div className="lg:col-span-5 relative">
              <div className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#DBEAFE] shadow-2xl shadow-[#2563EB]/10 relative z-10 animate-float">
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#DBEAFE]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#EFF6FF] border border-[#DBEAFE] flex items-center justify-center text-[#2563EB]">
                      <Target className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-[#1E3A8A] text-sm">Target Goal</h3>
                      <p className="text-xs text-[#64748B]">Full Stack Developer</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#EFF6FF] text-[#2563EB] border border-[#DBEAFE]">
                    Active Path
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="bg-[#F8FBFF] p-4 rounded-xl border border-[#DBEAFE]">
                    <div className="flex justify-between text-xs font-bold text-[#1E3A8A] mb-1.5">
                      <span>Overall Skill Coverage</span>
                      <span>72%</span>
                    </div>
                    <div className="w-full bg-[#EFF6FF] h-2.5 rounded-full overflow-hidden border border-[#DBEAFE]">
                      <div className="bg-[#2563EB] h-full rounded-full" style={{ width: '72%' }}></div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="p-3 bg-[#FFFFFF] rounded-lg border border-[#DBEAFE] flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#334155] flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#2563EB]" />
                        React.js & State Management
                      </span>
                      <span className="text-[#2563EB] font-bold">Acquired</span>
                    </div>

                    <div className="p-3 bg-[#F8FBFF] rounded-lg border border-[#DBEAFE] flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#334155] flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#2563EB]" />
                        Node.js & Express REST APIs
                      </span>
                      <span className="text-[#2563EB] font-bold">Acquired</span>
                    </div>

                    <div className="p-3 bg-[#EFF6FF] rounded-lg border border-[#DBEAFE] flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#1E3A8A] flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-[#2563EB]" />
                        MongoDB Atlas & Data Modeling
                      </span>
                      <span className="text-[#2563EB] font-extrabold">Missing Gap</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-[#DBEAFE] text-center">
                  <span className="text-xs text-[#64748B] font-semibold">
                    ⚡ Smart Engine recommends 2 high-priority courses
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section id="how-it-works" className="py-20 bg-[#FFFFFF] border-b border-[#DBEAFE]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold text-[#2563EB] uppercase tracking-wider bg-[#EFF6FF] px-3.5 py-1.5 rounded-full border border-[#DBEAFE]">
              Simple 4-Step Process
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1E3A8A] mt-4">
              How Smart Skill Gap Works
            </h2>
            <p className="text-base text-[#64748B] mt-3">
              We bridge the gap between where you are today and where you want your career to be tomorrow.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            
            {/* Step 1 */}
            <div className="bg-[#F8FBFF] p-6 rounded-2xl border border-[#DBEAFE] relative hover:border-[#2563EB] transition-all group">
              <div className="w-12 h-12 rounded-xl bg-[#2563EB] text-white flex items-center justify-center font-extrabold text-lg mb-6 shadow-md shadow-[#2563EB]/20">
                01
              </div>
              <h3 className="text-lg font-bold text-[#1E3A8A] mb-2">Select Target Role</h3>
              <p className="text-sm text-[#64748B]">
                Choose your desired career title from software engineering, data science, design, or management.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-[#F8FBFF] p-6 rounded-2xl border border-[#DBEAFE] relative hover:border-[#2563EB] transition-all group">
              <div className="w-12 h-12 rounded-xl bg-[#2563EB] text-white flex items-center justify-center font-extrabold text-lg mb-6 shadow-md shadow-[#2563EB]/20">
                02
              </div>
              <h3 className="text-lg font-bold text-[#1E3A8A] mb-2">Input Current Skills</h3>
              <p className="text-sm text-[#64748B]">
                Add your current skill set, tools, technologies, and proficiency levels for accurate matching.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-[#F8FBFF] p-6 rounded-2xl border border-[#DBEAFE] relative hover:border-[#2563EB] transition-all group">
              <div className="w-12 h-12 rounded-xl bg-[#2563EB] text-white flex items-center justify-center font-extrabold text-lg mb-6 shadow-md shadow-[#2563EB]/20">
                03
              </div>
              <h3 className="text-lg font-bold text-[#1E3A8A] mb-2">Analyze Skill Gaps</h3>
              <p className="text-sm text-[#64748B]">
                Instantly view missing skills required by current market job postings and industry standards.
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-[#F8FBFF] p-6 rounded-2xl border border-[#DBEAFE] relative hover:border-[#2563EB] transition-all group">
              <div className="w-12 h-12 rounded-xl bg-[#2563EB] text-white flex items-center justify-center font-extrabold text-lg mb-6 shadow-md shadow-[#2563EB]/20">
                04
              </div>
              <h3 className="text-lg font-bold text-[#1E3A8A] mb-2">Follow Roadmap</h3>
              <p className="text-sm text-[#64748B]">
                Execute your customized step-by-step learning path to unlock career readiness.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="py-20 bg-[#F8FBFF] border-b border-[#DBEAFE]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold text-[#2563EB] uppercase tracking-wider bg-[#EFF6FF] px-3.5 py-1.5 rounded-full border border-[#DBEAFE]">
              Core Capabilities
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1E3A8A] mt-4">
              Designed for Accelerating Career Growth
            </h2>
            <p className="text-base text-[#64748B] mt-3">
              Everything you need to eliminate career guesswork and master in-demand industry skills.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Feature 1 */}
            <div className="bg-[#FFFFFF] p-8 rounded-2xl border border-[#DBEAFE] hover:shadow-xl hover:shadow-[#2563EB]/5 transition-all">
              <div className="w-12 h-12 rounded-xl bg-[#EFF6FF] border border-[#DBEAFE] flex items-center justify-center text-[#2563EB] mb-6">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-[#1E3A8A] mb-3">AI Skill Gap Identification</h3>
              <p className="text-sm text-[#64748B] leading-relaxed">
                Pinpoint exact missing competencies by comparing your profile against real-time industry requirement datasets.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-[#FFFFFF] p-8 rounded-2xl border border-[#DBEAFE] hover:shadow-xl hover:shadow-[#2563EB]/5 transition-all">
              <div className="w-12 h-12 rounded-xl bg-[#EFF6FF] border border-[#DBEAFE] flex items-center justify-center text-[#2563EB] mb-6">
                <Map className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-[#1E3A8A] mb-3">Personalized Roadmap Flow</h3>
              <p className="text-sm text-[#64748B] leading-relaxed">
                Structured learning paths broken into manageable weekly milestones so you never get overwhelmed.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-[#FFFFFF] p-8 rounded-2xl border border-[#DBEAFE] hover:shadow-xl hover:shadow-[#2563EB]/5 transition-all">
              <div className="w-12 h-12 rounded-xl bg-[#EFF6FF] border border-[#DBEAFE] flex items-center justify-center text-[#2563EB] mb-6">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-[#1E3A8A] mb-3">Real-Time Market Demand</h3>
              <p className="text-sm text-[#64748B] leading-relaxed">
                Stay ahead of technological shifts with dynamic metrics highlighting high-growth skill trends.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-[#FFFFFF] p-8 rounded-2xl border border-[#DBEAFE] hover:shadow-xl hover:shadow-[#2563EB]/5 transition-all">
              <div className="w-12 h-12 rounded-xl bg-[#EFF6FF] border border-[#DBEAFE] flex items-center justify-center text-[#2563EB] mb-6">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-[#1E3A8A] mb-3">Curated Resource Recommendations</h3>
              <p className="text-sm text-[#64748B] leading-relaxed">
                Hand-picked tutorials, documentation, and project ideas mapped specifically to your missing skills.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-[#FFFFFF] p-8 rounded-2xl border border-[#DBEAFE] hover:shadow-xl hover:shadow-[#2563EB]/5 transition-all">
              <div className="w-12 h-12 rounded-xl bg-[#EFF6FF] border border-[#DBEAFE] flex items-center justify-center text-[#2563EB] mb-6">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-[#1E3A8A] mb-3">Progress Tracking Dashboard</h3>
              <p className="text-sm text-[#64748B] leading-relaxed">
                Visual progress meters, badge unlocks, and milestone completions to keep your learning consistent.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-[#FFFFFF] p-8 rounded-2xl border border-[#DBEAFE] hover:shadow-xl hover:shadow-[#2563EB]/5 transition-all">
              <div className="w-12 h-12 rounded-xl bg-[#EFF6FF] border border-[#DBEAFE] flex items-center justify-center text-[#2563EB] mb-6">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-[#1E3A8A] mb-3">Job-Readiness Readiness Score</h3>
              <p className="text-sm text-[#64748B] leading-relaxed">
                Know exact readiness score before applying to jobs so you land interviews with total confidence.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* SKILL GAP PREVIEW & ROADMAP PREVIEW SECTION */}
      <section id="preview" className="py-20 bg-[#FFFFFF] border-b border-[#DBEAFE]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          
          <div className="text-center max-w-3xl mx-auto">
            <span className="text-xs font-bold text-[#2563EB] uppercase tracking-wider bg-[#EFF6FF] px-3.5 py-1.5 rounded-full border border-[#DBEAFE]">
              Live Previews
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1E3A8A] mt-4">
              Experience the Skill Gap & Roadmap Engine
            </h2>
            <p className="text-base text-[#64748B] mt-3">
              See how our algorithm breaks down target roles and crafts step-by-step career pathways.
            </p>
          </div>

          {/* Interactive Skill Gap Preview Component */}
          <SkillGapPreview />

          {/* Roadmap Timeline Preview Component */}
          <RoadmapPreview />

        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-20 bg-[#EFF6FF] border-b border-[#DBEAFE]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="w-14 h-14 rounded-2xl bg-[#2563EB] text-white flex items-center justify-center mx-auto shadow-lg shadow-[#2563EB]/25">
            <Compass className="w-7 h-7" />
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1E3A8A] tracking-tight">
            Ready to Bridge Your Skill Gap?
          </h2>

          <p className="text-base sm:text-lg text-[#64748B] max-w-2xl mx-auto leading-relaxed">
            Join thousands of learners building structured career roadmaps and mastering high-impact industry skills.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="px-8 py-4 rounded-xl font-bold text-white bg-[#2563EB] hover:bg-[#1E3A8A] shadow-lg shadow-[#2563EB]/25 transition-all flex items-center justify-center gap-2 group text-base"
            >
              <span>Create Free Account</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/login"
              className="px-8 py-4 rounded-xl font-bold text-[#1E3A8A] bg-[#FFFFFF] hover:bg-[#EFF6FF] border border-[#DBEAFE] transition-all text-base shadow-sm"
            >
              Sign In to Your Roadmap
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
