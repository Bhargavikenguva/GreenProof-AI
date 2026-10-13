import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import NewAssessmentPage from './pages/NewAssessmentPage';
import EvidenceUploadPage from './pages/EvidenceUploadPage';
import ReportPage from './pages/ReportPage';
import HistoryPage from './pages/HistoryPage';
import ReviewQueuePage from './pages/ReviewQueuePage';

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) {
    return (
      <div className="py-20 text-center text-xs text-charcoal-500">
        Authenticating session...
      </div>
    );
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function ReviewerRoute({ children }) {
  const { isAuthenticated, isReviewer, loading } = useAuth();
  if (loading) {
    return (
      <div className="py-20 text-center text-xs text-charcoal-500">
        Verifying permissions...
      </div>
    );
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (!isReviewer) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

export function App() {
  return (
    <div className="min-h-screen flex flex-col bg-mint-50/40">
      <Navbar />
      <main className="flex-1">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/assessments/new"
            element={
              <ProtectedRoute>
                <NewAssessmentPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/assessments/:id/evidence"
            element={
              <ProtectedRoute>
                <EvidenceUploadPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/assessments/:id"
            element={
              <ProtectedRoute>
                <ReportPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <HistoryPage />
              </ProtectedRoute>
            }
          />

          {/* Reviewer Only Route */}
          <Route
            path="/reviews"
            element={
              <ReviewerRoute>
                <ReviewQueuePage />
              </ReviewerRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
