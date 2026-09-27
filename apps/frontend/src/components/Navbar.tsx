import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import type { SupportedLanguage } from '../i18n/translations';
import {
  LogOut,
  LayoutDashboard,
  FileSpreadsheet,
  User as UserIcon,
  HelpCircle,
} from 'lucide-react';

interface NavbarProps {
  onNavigate: (view: string) => void;
  currentView: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate, currentView }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  const handleLanguageChange = (lang: SupportedLanguage) => {
    setLanguage(lang);
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <a
          href={isAuthenticated ? '#dashboard' : '#landing'}
          className="brand-logo"
          onClick={(e) => {
            e.preventDefault();
            onNavigate(isAuthenticated ? 'dashboard' : 'landing');
          }}
        >
          <div className="brand-icon">उड</div>
          <div className="brand-text">
            <h1>{t.appName}</h1>
            <span className="brand-tagline">{t.tagline}</span>
          </div>
        </a>

        <div className="nav-actions">
          {/* Language Selector */}
          <div className="lang-selector" aria-label="Select language">
            <button
              type="button"
              className={`lang-btn ${language === 'en' ? 'active' : ''}`}
              onClick={() => handleLanguageChange('en')}
            >
              EN
            </button>
            <button
              type="button"
              className={`lang-btn ${language === 'hi' ? 'active' : ''}`}
              onClick={() => handleLanguageChange('hi')}
            >
              हिंदी
            </button>
            <button
              type="button"
              className={`lang-btn ${language === 'gu' ? 'active' : ''}`}
              onClick={() => handleLanguageChange('gu')}
            >
              ગુજરાતી
            </button>
          </div>

          {isAuthenticated ? (
            <>
              {/* Dashboard Link */}
              <button
                type="button"
                className={`btn btn-sm ${currentView === 'dashboard' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => onNavigate('dashboard')}
              >
                <LayoutDashboard size={16} />
                <span className="hide-mobile">{t.dashboard}</span>
              </button>

              {/* Previous Assessments Link */}
              <button
                type="button"
                className={`btn btn-sm ${currentView === 'assessments' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => onNavigate('assessments')}
                title={t.viewPreviousAssessments}
              >
                <FileSpreadsheet size={16} />
                <span className="hide-mobile">{t.myAssessments}</span>
              </button>

              {/* Help Link */}
              <button
                type="button"
                className={`btn btn-sm ${currentView === 'help' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => onNavigate('help')}
                title={t.help}
              >
                <HelpCircle size={16} />
                <span className="hide-mobile">{t.help}</span>
              </button>

              {/* Profile Link */}
              <div
                className={`user-menu-pill ${currentView === 'profile' ? 'active' : ''}`}
                style={{ cursor: 'pointer' }}
                onClick={() => onNavigate('profile')}
                title={user?.email || user?.phone || user?.name}
              >
                <div className="user-avatar-badge">
                  {user?.name ? user.name.charAt(0).toUpperCase() : <UserIcon size={12} />}
                </div>
                <span style={{ maxWidth: '110px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user?.name || t.profile}
                </span>
              </div>

              {/* Logout Button */}
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  logout();
                  onNavigate('login');
                }}
                title={t.logout}
              >
                <LogOut size={16} />
                <span className="hide-mobile">{t.logout}</span>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className={`btn btn-sm ${currentView === 'login' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => onNavigate('login')}
              >
                {t.login}
              </button>
              <button
                type="button"
                className={`btn btn-sm ${currentView === 'register' ? 'btn-secondary' : 'btn-primary'}`}
                onClick={() => onNavigate('register')}
              >
                {t.register}
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
