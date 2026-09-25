import React from 'react';
import { CheckCircle2, Clock, Award, BookOpen, ChevronRight } from 'lucide-react';

const RoadmapPreview = () => {
  const steps = [
    {
      phase: 'Phase 1',
      title: 'Core Fundamentals & Frontend Mastery',
      duration: '4 Weeks',
      status: 'Completed',
      topics: ['HTML5 & Semantic Markup', 'Modern CSS & Flexbox/Grid', 'JavaScript ES6+, DOM & Async', 'React.js Component Architecture']
    },
    {
      phase: 'Phase 2',
      title: 'Backend API Development',
      duration: '3 Weeks',
      status: 'In Progress',
      topics: ['Node.js Event Loop & Modules', 'Express.js REST API Design', 'Middleware & Rate Limiting', 'Authentication & JWT Security']
    },
    {
      phase: 'Phase 3',
      title: 'Database & Data Persistence',
      duration: '3 Weeks',
      status: 'Upcoming',
      topics: ['MongoDB Atlas Setup', 'Mongoose Schema Modeling', 'Aggregation Pipelines', 'Database Indexing & Performance']
    },
    {
      phase: 'Phase 4',
      title: 'Full Stack Integration & Capstone Project',
      duration: '4 Weeks',
      status: 'Upcoming',
      topics: ['End-to-End MERN Integration', 'State Management & Axios Services', 'Deployment to Cloud (Vercel/Render)', 'CI/CD Pipelines & Testing']
    }
  ];

  return (
    <div className="bg-[#F8FBFF] rounded-2xl border border-[#DBEAFE] p-6 sm:p-8">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <span className="text-xs font-bold text-[#2563EB] uppercase tracking-wider bg-[#EFF6FF] px-3 py-1 rounded-full border border-[#DBEAFE]">
          Step-By-Step Guidance
        </span>
        <h3 className="text-2xl font-extrabold text-[#1E3A8A] mt-3">
          Personalized Career Roadmap Flow
        </h3>
        <p className="text-sm text-[#64748B] mt-2">
          Structured learning milestones tailored to transform missing skills into masteries.
        </p>
      </div>

      <div className="space-y-6 relative before:absolute before:inset-0 before:left-6 sm:before:left-1/2 before:w-0.5 before:bg-[#DBEAFE] before:-z-0">
        {steps.map((step, idx) => (
          <div
            key={idx}
            className={`relative flex flex-col sm:flex-row gap-6 items-start ${
              idx % 2 === 0 ? 'sm:flex-row-reverse' : ''
            }`}
          >
            {/* Content Box */}
            <div className="w-full sm:w-[calc(50%-2rem)] bg-[#FFFFFF] p-6 rounded-xl border border-[#DBEAFE] shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-[#2563EB] bg-[#EFF6FF] px-2.5 py-1 rounded-md border border-[#DBEAFE]">
                  {step.phase}
                </span>
                <span className="text-xs font-medium text-[#64748B] flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {step.duration}
                </span>
              </div>
              
              <h4 className="text-base font-bold text-[#1E3A8A] mb-3">{step.title}</h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4 pt-4 border-t border-[#DBEAFE]">
                {step.topics.map((topic, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-[#334155]">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#2563EB]"></div>
                    <span>{topic}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Badge Icon in middle */}
            <div className="absolute left-6 sm:left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-[#2563EB] text-white flex items-center justify-center font-bold text-sm border-4 border-[#FFFFFF] shadow-md z-10">
              {idx + 1}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoadmapPreview;
