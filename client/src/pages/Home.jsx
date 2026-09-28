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
  BarChart3,
  Code2,
  Database,
  Server,
  Lock,
  Cpu,
  Sparkles,
  Check,
  ChevronRight,
  Briefcase,
  Brain,
  FolderGit2,
  MessageSquare
} from 'lucide-react';

const Home = () => {
  useEffect(() => {
    document.title = 'SMARTSKILL | Smart Skill Gap & Career Roadmap Platform';
  }, []);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Workflow steps
  const workflowSteps = [
    {
      step: '01',
      title: 'Current Skills',
      desc: 'Assess and catalog your existing technical skills and current proficiency level.',
      icon: Code2,
      color: 'bg-blue-500'
    },
    {
      step: '02',
      title: 'Skill Gap',
      desc: 'Identify specific missing competencies required for your target career role.',
      icon: Target,
      color: 'bg-indigo-500'
    },
    {
      step: '03',
      title: 'Learning Roadmap',
      desc: 'Receive a personalized, step-by-step timeline of curated learning resources.',
      icon: Map,
      color: 'bg-cyan-500'
    },
    {
      step: '04',
      title: 'Projects',
      desc: 'Build real-world portfolio projects to validate and apply new skills.',
      icon: FolderGit2,
      color: 'bg-emerald-500'
    },
    {
      step: '05',
      title: 'Mock Interview',
      desc: 'Practice role-specific interview questions to sharpen your response readiness.',
      icon: MessageSquare,
      color: 'bg-amber-500'
    },
    {
      step: '06',
      title: 'Progress Tracking',
      desc: 'Monitor real-time skill acquisition and target role readiness scores.',
      icon: TrendingUp,
      color: 'bg-purple-500'
    }
  ];

  // Project Showcase Technologies
  const showcaseTechs = [
    { name: 'React.js', role: 'Frontend Framework', category: 'Frontend', bg: 'bg-sky-50 text-sky-700 border-sky-200' },
    { name: 'Tailwind CSS', role: 'Styling & UI', category: 'Frontend', bg: 'bg-teal-50 text-teal-700 border-teal-200' },
    { name: 'Node.js', role: 'Runtime Engine', category: 'Backend', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    { name: 'Express.js', role: 'REST API Framework', category: 'Backend', bg: 'bg-gray-100 text-gray-700 border-gray-300' },
    { name: 'MongoDB Atlas', role: 'Cloud Database', category: 'Database', bg: 'bg-green-50 text-green-700 border-green-200' },
    { name: 'JWT Authentication', role: 'Secure Auth & Tokens', category: 'Security', bg: 'bg-purple-50 text-purple-700 border-purple-200' },
    { name: 'REST APIs', role: 'Client-Server Communication', category: 'Architecture', bg: 'bg-blue-50 text-blue-700 border-blue-200' },
  ];

  // Project Showcase Features
  const showcaseFeatures = [
    { title: 'Skill Assessment', desc: 'Interactive skill evaluation to benchmark current abilities.' },
    { title: 'Skill Gap Analysis', desc: 'Real-time gap detection matching target job profile requirements.' },
    { title: 'Personalized Career Roadmap', desc: 'Customized week-by-week learning pathways tailored to your goals.' },
    { title: 'Learning Resources', desc: 'Curated courses, docs, and tutorials linked directly to missing skills.' },
    { title: 'Project Recommendations', desc: 'Hands-on practical project ideas designed for resume boosting.' },
    { title: 'Mock Interviews', desc: 'Practice technical & behavioral interview modules.' },
    { title: 'Progress Tracking', desc: 'Visual progress metrics, completion stats, and readiness scores.' },
  ];

  return (
    <div className="min-h-screen bg-[#F8FBFF] text-[#334155] flex flex-col font-sans">
      <Navbar />

      {/* HERO SECTION - STUDENT PROJECT SHOWCASE */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-16 lg:pb-24 border-b border-[#DBEAFE]">
        {/* Soft Background Blur Circles */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none -z-10">
          <div className="absolute top-10 left-10 w-96 h-96 bg-[#EFF6FF] rounded-full blur-3xl opacity-80"></div>
          <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-[#E0F2FE] rounded-full blur-3xl opacity-70"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto space-y-6">
            
            {/* Project Badge */}
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-[#EFF6FF] border border-[#DBEAFE] text-[#2563EB] text-xs sm:text-sm font-bold tracking-wide shadow-xs">
              <Sparkles className="w-4 h-4 fill-[#2563EB]" />
              <span>PROJECT SHOWCASE & LANDING PAGE</span>
            </div>

            {/* Main Title & Subtitle */}
            <div>
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-[#1E3A8A] tracking-tight leading-tight">
                SMARTSKILL
              </h1>
              <p className="mt-2 text-xl sm:text-2xl lg:text-3xl font-bold text-[#2563EB]">
                Smart Skill Gap & Career Roadmap Platform
              </p>
            </div>

            {/* Short Description */}
            <p className="text-base sm:text-lg lg:text-xl text-[#64748B] max-w-3xl mx-auto leading-relaxed">
              Identify your skill gaps, build a personalized learning roadmap, explore projects, practice mock interviews, and track your career progress.
            </p>

            {/* Required Action Buttons: Get Started, Login, View Project */}
            <div className="pt-4 flex flex-wrap gap-4 justify-center items-center">
              <Link
                to="/register"
                className="px-8 py-4 rounded-xl font-bold text-white bg-[#2563EB] hover:bg-[#1E3A8A] shadow-lg shadow-[#2563EB]/25 hover:shadow-xl transition-all flex items-center justify-center gap-2 group text-base"
              >
                <span>Get Started</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                to="/login"
                className="px-8 py-4 rounded-xl font-bold text-[#1E3A8A] bg-[#FFFFFF] hover:bg-[#EFF6FF] border border-[#DBEAFE] shadow-sm transition-all flex items-center justify-center gap-2 text-base"
              >
                <span>Login</span>
              </Link>
              
              <button
                onClick={() => scrollToSection('project-showcase')}
                className="px-8 py-4 rounded-xl font-bold text-[#2563EB] bg-[#EFF6FF] hover:bg-[#DBEAFE] border border-[#DBEAFE] transition-all flex items-center justify-center gap-2 text-base cursor-pointer"
              >
                <Layers className="w-5 h-5" />
                <span>View Project</span>
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* MAIN WORKFLOW SECTION */}
      <section id="workflow" className="py-20 bg-[#FFFFFF] border-b border-[#DBEAFE]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold text-[#2563EB] uppercase tracking-wider bg-[#EFF6FF] px-3.5 py-1.5 rounded-full border border-[#DBEAFE]">
              End-to-End Execution Flow
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1E3A8A] mt-4">
              Main Platform Workflow
            </h2>
            <p className="text-base text-[#64748B] mt-3">
              A structured 6-phase journey empowering students and developers to elevate their careers.
            </p>
          </div>

          {/* Sequential Workflow Banner */}
          <div className="mb-12 hidden lg:flex items-center justify-between bg-[#F8FBFF] p-4 rounded-2xl border border-[#DBEAFE] shadow-sm">
            {workflowSteps.map((item, index) => {
              const IconComp = item.icon;
              return (
                <React.Fragment key={item.step}>
                  <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white border border-[#DBEAFE] shadow-2xs">
                    <div className={`w-8 h-8 rounded-lg ${item.color} text-white flex items-center justify-center font-bold text-xs`}>
                      {item.step}
                    </div>
                    <span className="text-xs font-bold text-[#1E3A8A] whitespace-nowrap">{item.title}</span>
                  </div>
                  {index < workflowSteps.length - 1 && (
                    <ChevronRight className="w-5 h-5 text-[#2563EB] shrink-0" />
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Workflow Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workflowSteps.map((item) => {
              const IconComp = item.icon;
              return (
                <div 
                  key={item.step} 
                  className="bg-[#F8FBFF] p-6 rounded-2xl border border-[#DBEAFE] hover:border-[#2563EB] hover:shadow-lg transition-all group relative flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 rounded-xl ${item.color} text-white flex items-center justify-center shadow-md`}>
                        <IconComp className="w-6 h-6" />
                      </div>
                      <span className="text-2xl font-black text-[#DBEAFE] group-hover:text-[#2563EB] transition-colors">
                        {item.step}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-[#1E3A8A] mb-2">
                      {item.title}
                    </h3>
                    <p className="text-sm text-[#64748B] leading-relaxed">
                      {item.desc}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#DBEAFE]/60 flex items-center gap-1.5 text-xs font-semibold text-[#2563EB]">
                    <span>Phase {item.step}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* PROJECT SHOWCASE CARD SECTION */}
      <section id="project-showcase" className="py-20 bg-[#F8FBFF] border-b border-[#DBEAFE]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold text-[#2563EB] uppercase tracking-wider bg-[#EFF6FF] px-3.5 py-1.5 rounded-full border border-[#DBEAFE]">
              Portfolio Highlight
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1E3A8A] mt-4">
              Project Showcase Card
            </h2>
            <p className="text-base text-[#64748B] mt-3">
              Comprehensive overview of technology stack, architectural details, and key functional modules.
            </p>
          </div>

          {/* MAIN SHOWCASE CARD */}
          <div className="bg-white rounded-3xl border border-[#DBEAFE] shadow-xl overflow-hidden">
            
            {/* Showcase Header Banner */}
            <div className="bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] p-8 text-white flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-xs text-white text-xs font-semibold mb-3 border border-white/20">
                  <Compass className="w-3.5 h-3.5" />
                  <span>Full-Stack Web Application</span>
                </div>
                <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                  Project: SMARTSKILL
                </h3>
                <p className="text-blue-100 text-sm sm:text-base mt-2 max-w-xl">
                  An intelligent career readiness engine driving skill gap analysis and automated learning roadmaps.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="px-5 py-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-center">
                  <span className="block text-xs text-blue-200 font-semibold uppercase">Category</span>
                  <span className="text-base font-bold text-white">Full-Stack Web Application</span>
                </div>
                <div className="px-5 py-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-center">
                  <span className="block text-xs text-blue-200 font-semibold uppercase">Status</span>
                  <span className="text-base font-bold text-emerald-300 flex items-center justify-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    Live & Deployed
                  </span>
                </div>
              </div>
            </div>

            {/* Showcase Card Content Grid */}
            <div className="p-8 grid grid-cols-1 lg:grid-cols-12 gap-10">
              
              {/* Technologies Section (5 cols) */}
              <div className="lg:col-span-5 space-y-6">
                <div>
                  <h4 className="text-lg font-extrabold text-[#1E3A8A] flex items-center gap-2 border-b border-[#DBEAFE] pb-3 mb-4">
                    <Cpu className="w-5 h-5 text-[#2563EB]" />
                    <span>Technologies & Tech Stack</span>
                  </h4>
                  <p className="text-xs text-[#64748B] mb-4">
                    Built using modern industry standard tools for high performance, reliability, and security.
                  </p>
                </div>

                <div className="space-y-3">
                  {showcaseTechs.map((tech) => (
                    <div 
                      key={tech.name} 
                      className="p-3.5 rounded-xl border bg-[#F8FBFF] border-[#DBEAFE] flex items-center justify-between hover:border-[#2563EB] transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#2563EB]"></div>
                        <div>
                          <span className="font-bold text-sm text-[#1E3A8A] block">{tech.name}</span>
                          <span className="text-xs text-[#64748B]">{tech.role}</span>
                        </div>
                      </div>
                      <span className={`text-[11px] font-bold px-2.5 py-1 rounded-md border ${tech.bg}`}>
                        {tech.category}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Features Checklist Section (7 cols) */}
              <div className="lg:col-span-7 space-y-6">
                <div>
                  <h4 className="text-lg font-extrabold text-[#1E3A8A] flex items-center gap-2 border-b border-[#DBEAFE] pb-3 mb-4">
                    <CheckCircle2 className="w-5 h-5 text-[#2563EB]" />
                    <span>Core Features & Capabilities</span>
                  </h4>
                  <p className="text-xs text-[#64748B] mb-4">
                    Key platform features designed to streamline the career development process.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {showcaseFeatures.map((feat) => (
                    <div 
                      key={feat.title} 
                      className="p-4 rounded-xl bg-[#F8FBFF] border border-[#DBEAFE] flex gap-3 hover:border-[#2563EB] transition-all"
                    >
                      <div className="w-6 h-6 rounded-full bg-[#EFF6FF] border border-[#DBEAFE] flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-4 h-4 text-[#2563EB]" />
                      </div>
                      <div>
                        <h5 className="font-bold text-sm text-[#1E3A8A] flex items-center gap-1">
                          <span>✓</span> {feat.title}
                        </h5>
                        <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
                          {feat.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Quick Access CTA Box */}
                <div className="p-5 rounded-2xl bg-[#EFF6FF] border border-[#DBEAFE] flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
                  <div>
                    <span className="text-xs font-extrabold text-[#2563EB] uppercase tracking-wider block">
                      Explore Full Platform
                    </span>
                    <p className="text-sm font-bold text-[#1E3A8A]">
                      Test authentication and explore user dashboard features
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Link
                      to="/register"
                      className="px-4 py-2.5 rounded-lg text-xs font-bold text-white bg-[#2563EB] hover:bg-[#1E3A8A] transition-all"
                    >
                      Register Now
                    </Link>
                    <Link
                      to="/login"
                      className="px-4 py-2.5 rounded-lg text-xs font-bold text-[#1E3A8A] bg-white border border-[#DBEAFE] hover:bg-[#EFF6FF] transition-all"
                    >
                      Sign In
                    </Link>
                  </div>
                </div>

              </div>

            </div>
          </div>

        </div>
      </section>

      {/* CORE CAPABILITIES GRID SECTION */}
      <section id="features" className="py-20 bg-[#FFFFFF] border-b border-[#DBEAFE]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold text-[#2563EB] uppercase tracking-wider bg-[#EFF6FF] px-3.5 py-1.5 rounded-full border border-[#DBEAFE]">
              Platform Modules
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
            <div className="bg-[#F8FBFF] p-8 rounded-2xl border border-[#DBEAFE] hover:shadow-xl hover:border-[#2563EB] transition-all">
              <div className="w-12 h-12 rounded-xl bg-[#EFF6FF] border border-[#DBEAFE] flex items-center justify-center text-[#2563EB] mb-6">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-[#1E3A8A] mb-3">Skill Assessment</h3>
              <p className="text-sm text-[#64748B] leading-relaxed">
                Take comprehensive skill quizzes and evaluations to benchmark your technical proficiency.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-[#F8FBFF] p-8 rounded-2xl border border-[#DBEAFE] hover:shadow-xl hover:border-[#2563EB] transition-all">
              <div className="w-12 h-12 rounded-xl bg-[#EFF6FF] border border-[#DBEAFE] flex items-center justify-center text-[#2563EB] mb-6">
                <Map className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-[#1E3A8A] mb-3">Skill Gap Analysis</h3>
              <p className="text-sm text-[#64748B] leading-relaxed">
                Automatically compare your skills against real market role requirements to reveal exact missing competencies.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-[#F8FBFF] p-8 rounded-2xl border border-[#DBEAFE] hover:shadow-xl hover:border-[#2563EB] transition-all">
              <div className="w-12 h-12 rounded-xl bg-[#EFF6FF] border border-[#DBEAFE] flex items-center justify-center text-[#2563EB] mb-6">
                <Compass className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-[#1E3A8A] mb-3">Personalized Roadmap</h3>
              <p className="text-sm text-[#64748B] leading-relaxed">
                Step-by-step learning schedules broken down week-by-week so you always know what to study next.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-[#F8FBFF] p-8 rounded-2xl border border-[#DBEAFE] hover:shadow-xl hover:border-[#2563EB] transition-all">
              <div className="w-12 h-12 rounded-xl bg-[#EFF6FF] border border-[#DBEAFE] flex items-center justify-center text-[#2563EB] mb-6">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-[#1E3A8A] mb-3">Learning Resources</h3>
              <p className="text-sm text-[#64748B] leading-relaxed">
                Curated documentation, courses, video tutorials, and articles mapped to every skill node.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-[#F8FBFF] p-8 rounded-2xl border border-[#DBEAFE] hover:shadow-xl hover:border-[#2563EB] transition-all">
              <div className="w-12 h-12 rounded-xl bg-[#EFF6FF] border border-[#DBEAFE] flex items-center justify-center text-[#2563EB] mb-6">
                <FolderGit2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-[#1E3A8A] mb-3">Project Recommendations</h3>
              <p className="text-sm text-[#64748B] leading-relaxed">
                Practical, real-world portfolio project prompts designed to prove your skill mastery to recruiters.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-[#F8FBFF] p-8 rounded-2xl border border-[#DBEAFE] hover:shadow-xl hover:border-[#2563EB] transition-all">
              <div className="w-12 h-12 rounded-xl bg-[#EFF6FF] border border-[#DBEAFE] flex items-center justify-center text-[#2563EB] mb-6">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-[#1E3A8A] mb-3">Progress Tracking</h3>
              <p className="text-sm text-[#64748B] leading-relaxed">
                Visual progress bars, milestone tracking, and job-readiness scores updated in real time.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* SKILL GAP PREVIEW & ROADMAP PREVIEW SECTION */}
      <section id="preview" className="py-20 bg-[#F8FBFF] border-b border-[#DBEAFE]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          
          <div className="text-center max-w-3xl mx-auto">
            <span className="text-xs font-bold text-[#2563EB] uppercase tracking-wider bg-[#EFF6FF] px-3.5 py-1.5 rounded-full border border-[#DBEAFE]">
              Interactive Modules
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1E3A8A] mt-4">
              Live Interactive Demos
            </h2>
            <p className="text-base text-[#64748B] mt-3">
              Test out sample skill gap calculations and roadmap timelines right from the home page.
            </p>
          </div>

          {/* Interactive Skill Gap Preview Component */}
          <SkillGapPreview />

          {/* Roadmap Timeline Preview Component */}
          <RoadmapPreview />

        </div>
      </section>

      {/* CALL TO ACTION SECTION */}
      <section className="py-20 bg-[#EFF6FF] border-b border-[#DBEAFE]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="w-14 h-14 rounded-2xl bg-[#2563EB] text-white flex items-center justify-center mx-auto shadow-lg shadow-[#2563EB]/25">
            <Compass className="w-7 h-7" />
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1E3A8A] tracking-tight">
            Ready to Build Your Career Roadmap?
          </h2>

          <p className="text-base sm:text-lg text-[#64748B] max-w-2xl mx-auto leading-relaxed">
            Join SMARTSKILL today to discover your skill gaps, generate custom roadmaps, and land your dream tech role.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="px-8 py-4 rounded-xl font-bold text-white bg-[#2563EB] hover:bg-[#1E3A8A] shadow-lg shadow-[#2563EB]/25 transition-all flex items-center justify-center gap-2 group text-base"
            >
              <span>Get Started</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/login"
              className="px-8 py-4 rounded-xl font-bold text-[#1E3A8A] bg-[#FFFFFF] hover:bg-[#EFF6FF] border border-[#DBEAFE] transition-all text-base shadow-sm"
            >
              Sign In to Your Account
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;

