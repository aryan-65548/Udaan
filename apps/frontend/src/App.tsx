import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { Navbar } from './components/Navbar';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { CreateAssessmentPage } from './pages/CreateAssessmentPage';
import { AssessmentWorkflowPage } from './pages/AssessmentWorkflowPage';

type ViewMode = 'landing' | 'login' | 'register' | 'dashboard' | 'create' | 'workflow';

const MainApp: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const { t } = useLanguage();

  const [currentView, setCurrentView] = useState<ViewMode>(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash === 'login' || hash === 'register' || hash === 'create') {
      return hash as ViewMode;
    }
    return 'landing';
  });

  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string | null>(null);

  // Auto-redirect authenticated users to dashboard if on landing/login/register
  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated && (currentView === 'landing' || currentView === 'login' || currentView === 'register')) {
        setCurrentView('dashboard');
      } else if (!isAuthenticated && (currentView === 'dashboard' || currentView === 'create' || currentView === 'workflow')) {
        setCurrentView('login');
      }
    }
  }, [isAuthenticated, isLoading, currentView]);

  const handleNavigate = (view: string, assessmentId?: string) => {
    if (assessmentId) {
      setSelectedAssessmentId(assessmentId);
    }
    setCurrentView(view as ViewMode);
    window.location.hash = view;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        <div className="spinner" style={{ width: '32px', height: '32px' }} />
        <div style={{ color: 'var(--text-muted)' }}>Loading UDAAN...</div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Navbar onNavigate={handleNavigate} currentView={currentView} />

      <main className="main-content">
        {currentView === 'landing' && <LandingPage onNavigate={handleNavigate} />}
        {currentView === 'login' && <LoginPage onNavigate={handleNavigate} />}
        {currentView === 'register' && <RegisterPage onNavigate={handleNavigate} />}
        {currentView === 'dashboard' && <DashboardPage onNavigate={handleNavigate} />}
        {currentView === 'create' && <CreateAssessmentPage onNavigate={handleNavigate} />}
        {currentView === 'workflow' && selectedAssessmentId && (
          <AssessmentWorkflowPage
            assessmentId={selectedAssessmentId}
            onNavigate={handleNavigate}
          />
        )}
      </main>

      {/* Footer */}
      <footer
        style={{
          borderTop: '1px solid var(--border-light)',
          background: 'var(--bg-surface)',
          padding: '24px 16px',
          textAlign: 'center',
          fontSize: '0.85rem',
          color: 'var(--text-muted)',
          marginTop: 'auto',
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
            {t.appName} — {t.tagline}
          </div>
          <div>
            AI-Assisted Rural & Semi-Urban Business Advisory & Feasibility Platform • SIH 2026
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </LanguageProvider>
  );
}
