import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import type { SupportedLanguage } from '../i18n/translations';
import { LogOut, PlusCircle, LayoutDashboard, User as UserIcon } from 'lucide-react';

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
          href="#home"
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
              <button
                type="button"
                className={`btn btn-sm ${currentView === 'dashboard' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => onNavigate('dashboard')}
              >
                <LayoutDashboard size={16} />
                <span>{t.dashboard}</span>
              </button>

              <button
                type="button"
                className={`btn btn-sm ${currentView === 'create' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => onNavigate('create')}
              >
                <PlusCircle size={16} />
                <span>{t.newAssessment}</span>
              </button>

              <div className="user-menu-pill" title={user?.email || user?.phone || user?.name}>
                <div className="user-avatar-badge">
                  {user?.name ? user.name.charAt(0).toUpperCase() : <UserIcon size={12} />}
                </div>
                <span style={{ maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user?.name || 'User'}
                </span>
              </div>

              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => logout()}
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
