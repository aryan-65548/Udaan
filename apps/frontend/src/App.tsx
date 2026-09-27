import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { Navbar } from './components/Navbar';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { PreviousAssessmentsPage } from './pages/PreviousAssessmentsPage';
import { CreateAssessmentPage } from './pages/CreateAssessmentPage';
import { AssessmentWorkflowPage } from './pages/AssessmentWorkflowPage';
import { ProfilePage } from './pages/ProfilePage';
import { HelpPage } from './pages/HelpPage';

export type ViewMode =
  | 'landing'
  | 'login'
  | 'register'
  | 'dashboard'
  | 'assessments'
  | 'create'
  | 'workflow'
  | 'profile'
  | 'help';

interface ParsedRoute {
  view: ViewMode;
  assessmentId?: string;
}

function parseHash(hashStr: string): ParsedRoute {
  const clean = hashStr.replace(/^#\/?/, '').trim();
  if (!clean) {
    return { view: 'landing' };
  }

  // Check for query parameters like #workflow?id=123
  if (clean.includes('?')) {
    const [viewPart, queryPart] = clean.split('?');
    const params = new URLSearchParams(queryPart);
    const assessmentId = params.get('id') || undefined;
    const view = (viewPart as ViewMode) || 'landing';
    return { view, assessmentId };
  }

  // Check for slash like #workflow/123
  if (clean.includes('/')) {
    const [viewPart, idPart] = clean.split('/');
    return { view: (viewPart as ViewMode) || 'landing', assessmentId: idPart };
  }

  const validViews: ViewMode[] = [
    'landing',
    'login',
    'register',
    'dashboard',
    'assessments',
    'create',
    'workflow',
    'profile',
    'help',
  ];

  if (validViews.includes(clean as ViewMode)) {
    return { view: clean as ViewMode };
  }

  return { view: 'landing' };
}

const MainApp: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const { t } = useLanguage();

  const [currentView, setCurrentView] = useState<ViewMode>(() => {
    const parsed = parseHash(window.location.hash);
    return parsed.view;
  });

  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string | null>(() => {
    const parsed = parseHash(window.location.hash);
    return parsed.assessmentId || null;
  });

  // Synchronize route changes from browser back/forward and hashchange events
  const syncRouteFromLocation = useCallback(() => {
    const parsed = parseHash(window.location.hash);
    if (parsed.assessmentId) {
      setSelectedAssessmentId(parsed.assessmentId);
    }
    setCurrentView(parsed.view);
  }, []);

  useEffect(() => {
    window.addEventListener('hashchange', syncRouteFromLocation);
    window.addEventListener('popstate', syncRouteFromLocation);

    return () => {
      window.removeEventListener('hashchange', syncRouteFromLocation);
      window.removeEventListener('popstate', syncRouteFromLocation);
    };
  }, [syncRouteFromLocation]);

  // Auth redirection guards
  useEffect(() => {
    if (isLoading) return;

    if (isAuthenticated) {
      // If user is authenticated and is on landing/login/register, redirect to dashboard
      if (currentView === 'landing' || currentView === 'login' || currentView === 'register') {
        const targetHash = '#dashboard';
        if (window.location.hash !== targetHash) {
          window.location.hash = targetHash;
        }
        setCurrentView('dashboard');
      }
    } else {
      // If user is unauthenticated and tries to access protected views, redirect to login
      const protectedViews: ViewMode[] = ['dashboard', 'assessments', 'create', 'workflow', 'profile'];
      if (protectedViews.includes(currentView)) {
        const targetHash = '#login';
        if (window.location.hash !== targetHash) {
          window.location.hash = targetHash;
        }
        setCurrentView('login');
      }
    }
  }, [isAuthenticated, isLoading, currentView]);

  const handleNavigate = (view: string, assessmentId?: string) => {
    let targetHash = `#${view}`;
    if (assessmentId) {
      setSelectedAssessmentId(assessmentId);
      targetHash = `#${view}?id=${assessmentId}`;
    }

    if (window.location.hash !== targetHash) {
      window.location.hash = targetHash;
    }
    setCurrentView(view as ViewMode);
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
        <div style={{ color: 'var(--text-muted)' }}>{t.loading}</div>
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
        {currentView === 'assessments' && <PreviousAssessmentsPage onNavigate={handleNavigate} />}
        {currentView === 'create' && <CreateAssessmentPage onNavigate={handleNavigate} />}
        {currentView === 'profile' && <ProfilePage onNavigate={handleNavigate} />}
        {currentView === 'help' && <HelpPage onNavigate={handleNavigate} />}
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
