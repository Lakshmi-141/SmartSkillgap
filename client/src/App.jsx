import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import SkillsManager from './pages/SkillsManager';
import CareerSelection from './pages/CareerSelection';
import CareerDetails from './pages/CareerDetails';
import AssessmentList from './pages/AssessmentList';
import AssessmentTake from './pages/AssessmentTake';
import AssessmentResult from './pages/AssessmentResult';
import SkillGapAnalysis from './pages/SkillGapAnalysis';
import CareerRoadmap from './pages/CareerRoadmap';
import Resources from './pages/Resources';
import Projects from './pages/Projects';
import CareerReadiness from './pages/CareerReadiness';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 selection:bg-blue-600 selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <Routes>
          {/* Public Authentication Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Student Protected Routes */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/skills" element={<ProtectedRoute><SkillsManager /></ProtectedRoute>} />
          <Route path="/careers" element={<ProtectedRoute><CareerSelection /></ProtectedRoute>} />
          <Route path="/careers/:id" element={<ProtectedRoute><CareerDetails /></ProtectedRoute>} />
          <Route path="/skill-gap" element={<ProtectedRoute><SkillGapAnalysis /></ProtectedRoute>} />
          <Route path="/gap-analysis" element={<ProtectedRoute><SkillGapAnalysis /></ProtectedRoute>} />
          <Route path="/assessment" element={<Navigate to="/assessments" replace />} />
          <Route path="/assessments" element={<ProtectedRoute><AssessmentList /></ProtectedRoute>} />
          <Route path="/assessments/:id" element={<ProtectedRoute><AssessmentTake /></ProtectedRoute>} />
          <Route path="/assessments/results/:resultId" element={<ProtectedRoute><AssessmentResult /></ProtectedRoute>} />
          <Route path="/roadmap" element={<ProtectedRoute><CareerRoadmap /></ProtectedRoute>} />
          <Route path="/resources" element={<ProtectedRoute><Resources /></ProtectedRoute>} />
          <Route path="/projects" element={<ProtectedRoute><Projects /></ProtectedRoute>} />
          <Route path="/progress" element={<ProtectedRoute><CareerReadiness /></ProtectedRoute>} />
          <Route path="/readiness" element={<ProtectedRoute><CareerReadiness /></ProtectedRoute>} />

          {/* Admin Protected Routes */}
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/users" element={<AdminRoute><AdminDashboard tab="users" /></AdminRoute>} />
          <Route path="/admin/skills" element={<AdminRoute><AdminDashboard tab="skills" /></AdminRoute>} />
          <Route path="/admin/careers" element={<AdminRoute><AdminDashboard tab="careers" /></AdminRoute>} />
          <Route path="/admin/career-skills" element={<AdminRoute><AdminDashboard tab="career-skills" /></AdminRoute>} />
          <Route path="/admin/roadmaps" element={<AdminRoute><AdminDashboard tab="roadmaps" /></AdminRoute>} />
          <Route path="/admin/resources" element={<AdminRoute><AdminDashboard tab="resources" /></AdminRoute>} />
          <Route path="/admin/assessments" element={<AdminRoute><AdminDashboard tab="assessments" /></AdminRoute>} />
          <Route path="/admin/projects" element={<AdminRoute><AdminDashboard tab="projects" /></AdminRoute>} />

          {/* Catch-all redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default App;
