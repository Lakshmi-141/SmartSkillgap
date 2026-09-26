import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { getCareerReadinessApi } from '../services/api';
import { 
  ResponsiveContainer, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip
} from 'recharts';
import { 
  TrendingUp, 
  Award, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  Target, 
  BookOpen, 
  FolderGit2,
  Info
} from 'lucide-react';

const Progress = () => {
  const [readinessData, setReadinessData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchReadiness = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await getCareerReadinessApi();
      if (res.success) {
        setReadinessData(res);
      } else {
        setError(res.message || 'Failed to calculate career readiness.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load progress metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = 'SmartSkillGap | Career Readiness & Progress';
    fetchReadiness();
  }, []);

  const breakdown = readinessData?.breakdown || {};
  const readinessPct = readinessData?.careerReadinessPercentage || 0;

  // Chart Data for Recharts
  const chartData = [
    { subject: 'Skills (40%)', A: breakdown.skillCompletion?.percentage || 0, fullMark: 100 },
    { subject: 'Assessments (20%)', A: breakdown.assessmentPerformance?.percentage || 0, fullMark: 100 },
    { subject: 'Roadmap (20%)', A: breakdown.roadmapCompletion?.percentage || 0, fullMark: 100 },
    { subject: 'Projects (20%)', A: breakdown.projectCompletion?.percentage || 0, fullMark: 100 },
  ];

  return (
    <div className="min-h-screen bg-[#F8FBFF] flex flex-col justify-between font-sans">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8 flex-1">
        
        {/* Header Banner */}
        <div className="bg-[#FFFFFF] p-6 sm:p-8 rounded-3xl border border-[#DBEAFE] shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-[#EFF6FF] text-[#2563EB] text-xs font-extrabold rounded-full border border-[#DBEAFE]">
                Indicative Evaluation Engine
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E3A8A] mt-1">
              Career Readiness & Progress
            </h1>
            <p className="text-xs text-[#475569] mt-0.5">
              Target Career: <strong className="text-[#1E3A8A]">{readinessData?.targetCareer || 'Full Stack Web Developer'}</strong>
            </p>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {!loading && (
          <div className="space-y-8">
            
            {/* Top Score & Disclaimer Card */}
            <div className="bg-[#FFFFFF] p-8 rounded-3xl border border-[#DBEAFE] shadow-sm flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="flex items-center gap-6">
                <div className="relative w-32 h-32 flex items-center justify-center rounded-full bg-[#EFF6FF] border-8 border-[#2563EB] shadow-lg shadow-[#2563EB]/20 shrink-0">
                  <div className="text-center">
                    <span className="text-3xl font-black text-[#1E3A8A] block leading-none">{readinessPct}%</span>
                    <span className="text-[10px] font-bold text-[#2563EB] uppercase tracking-wider">Readiness</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="px-3 py-1 bg-[#EFF6FF] text-[#2563EB] text-xs font-bold rounded-full border border-[#DBEAFE]">
                    Overall Metric
                  </span>
                  <h2 className="text-2xl font-black text-[#1E3A8A]">Platform Career Readiness Index</h2>
                  <p className="text-xs text-[#475569] max-w-xl">
                    Weighted index evaluated strictly on backend servers across 4 dimensions: Skill Mastery (40%), Assessment Scores (20%), Roadmap Progress (20%), and Projects (20%).
                  </p>
                </div>
              </div>

              {/* Mandatory Disclaimer Box */}
              <div className="bg-[#F8FBFF] p-4 rounded-2xl border border-[#DBEAFE] flex items-start gap-3 max-w-md">
                <Info className="w-5 h-5 text-[#2563EB] shrink-0 mt-0.5" />
                <p className="text-xs text-[#334155] leading-relaxed font-semibold">
                  {readinessData?.disclaimer || "This is an indicative platform-generated readiness metric and does not guarantee employment."}
                </p>
              </div>
            </div>

            {/* 4 Dimension Breakdown Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* Dim 1: Skills */}
              <div className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#DBEAFE] shadow-sm space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-extrabold text-[#475569] uppercase">Skills (40%)</span>
                  <Target className="w-5 h-5 text-[#2563EB]" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-[#1E3A8A]">{breakdown.skillCompletion?.percentage || 0}%</span>
                  <span className="text-xs font-bold text-[#2563EB]">+{breakdown.skillCompletion?.weightedContribution || 0}% pts</span>
                </div>
                <div className="w-full bg-[#EFF6FF] h-2 rounded-full overflow-hidden border border-[#DBEAFE]">
                  <div className="bg-[#2563EB] h-full" style={{ width: `${breakdown.skillCompletion?.percentage || 0}%` }}></div>
                </div>
              </div>

              {/* Dim 2: Assessments */}
              <div className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#DBEAFE] shadow-sm space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-extrabold text-[#475569] uppercase">Assessments (20%)</span>
                  <Award className="w-5 h-5 text-[#2563EB]" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-[#1E3A8A]">{breakdown.assessmentPerformance?.percentage || 0}%</span>
                  <span className="text-xs font-bold text-[#2563EB]">+{breakdown.assessmentPerformance?.weightedContribution || 0}% pts</span>
                </div>
                <div className="w-full bg-[#EFF6FF] h-2 rounded-full overflow-hidden border border-[#DBEAFE]">
                  <div className="bg-[#2563EB] h-full" style={{ width: `${breakdown.assessmentPerformance?.percentage || 0}%` }}></div>
                </div>
              </div>

              {/* Dim 3: Roadmap */}
              <div className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#DBEAFE] shadow-sm space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-extrabold text-[#475569] uppercase">Roadmap (20%)</span>
                  <BookOpen className="w-5 h-5 text-[#2563EB]" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-[#1E3A8A]">{breakdown.roadmapCompletion?.percentage || 0}%</span>
                  <span className="text-xs font-bold text-[#2563EB]">+{breakdown.roadmapCompletion?.weightedContribution || 0}% pts</span>
                </div>
                <div className="w-full bg-[#EFF6FF] h-2 rounded-full overflow-hidden border border-[#DBEAFE]">
                  <div className="bg-[#2563EB] h-full" style={{ width: `${breakdown.roadmapCompletion?.percentage || 0}%` }}></div>
                </div>
              </div>

              {/* Dim 4: Projects */}
              <div className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#DBEAFE] shadow-sm space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-extrabold text-[#475569] uppercase">Projects (20%)</span>
                  <FolderGit2 className="w-5 h-5 text-[#2563EB]" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-[#1E3A8A]">{breakdown.projectCompletion?.percentage || 0}%</span>
                  <span className="text-xs font-bold text-[#2563EB]">+{breakdown.projectCompletion?.weightedContribution || 0}% pts</span>
                </div>
                <div className="w-full bg-[#EFF6FF] h-2 rounded-full overflow-hidden border border-[#DBEAFE]">
                  <div className="bg-[#2563EB] h-full" style={{ width: `${breakdown.projectCompletion?.percentage || 0}%` }}></div>
                </div>
              </div>

            </div>

            {/* Recharts Visualizations */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Radar Chart */}
              <div className="bg-[#FFFFFF] p-6 rounded-3xl border border-[#DBEAFE] shadow-sm space-y-4">
                <h3 className="text-lg font-extrabold text-[#1E3A8A]">Competency Radar Chart</h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                      <PolarGrid stroke="#DBEAFE" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#1E3A8A', fontSize: 12, fontWeight: 'bold' }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} />
                      <Radar name="Student Progress" dataKey="A" stroke="#2563EB" fill="#2563EB" fillOpacity={0.4} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Bar Chart */}
              <div className="bg-[#FFFFFF] p-6 rounded-3xl border border-[#DBEAFE] shadow-sm space-y-4">
                <h3 className="text-lg font-extrabold text-[#1E3A8A]">Weight Distribution Bar Breakdown</h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                      <XAxis dataKey="subject" tick={{ fill: '#1E3A8A', fontSize: 11 }} />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Bar dataKey="A" fill="#2563EB" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>

          </div>
        )}

      </main>

      <Footer />
    </div>
  );
};

export default Progress;
