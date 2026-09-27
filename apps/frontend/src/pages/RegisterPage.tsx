import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import type { SupportedLanguage } from '../i18n/translations';
import { Alert } from '../components/Alert';
import { GoogleAuthButton } from '../components/GoogleAuthButton';
import { UserPlus, LogIn, KeyRound } from 'lucide-react';

interface RegisterPageProps {
  onNavigate: (view: string) => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onNavigate }) => {
  const { register } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState<SupportedLanguage>(language);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDuplicateEmail, setIsDuplicateEmail] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsDuplicateEmail(false);

    if (!name.trim()) {
      setError(t.enterFullName);
      return;
    }

    if (!email.trim() && !phone.trim()) {
      setError(t.enterValidEmail + ' / ' + t.enterValidPhone);
      return;
    }

    if (!password || password.length < 6) {
      setError(t.passwordMinLength);
      return;
    }

    setIsLoading(true);
    try {
      await register({
        name: name.trim(),
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        password,
        preferredLanguage,
      });
      setLanguage(preferredLanguage);
      onNavigate('dashboard');
    } catch (err: any) {
      const errMsg = err.message || '';
      const errCode = err.code || '';
      setPassword(''); // Clear sensitive password input while keeping name, email, phone intact

      if (
        errCode === 'EMAIL_ALREADY_EXISTS' ||
        errCode === 'PHONE_ALREADY_EXISTS' ||
        errCode === 'CONFLICT' ||
        errMsg.toLowerCase().includes('already exists') ||
        errMsg.toLowerCase().includes('already registered')
      ) {
        setIsDuplicateEmail(true);
        setError(t.accountAlreadyExistsError);
      } else if (
        errMsg.toLowerCase().includes('failed to fetch') ||
        errMsg.toLowerCase().includes('network') ||
        errMsg.toLowerCase().includes('connection')
      ) {
        setError(t.networkError);
      } else {
        setError(errMsg || t.authError);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '480px', margin: '30px auto' }}>
      <div className="card" style={{ padding: '32px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>{t.register}</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{t.registerPrompt}</p>
        </div>

        {error && (
          <div style={{ marginBottom: '20px' }}>
            <Alert type="error">
              <div>
                <div style={{ marginBottom: isDuplicateEmail ? '12px' : 0 }}>{error}</div>
                {isDuplicateEmail && (
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '8px' }}>
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => onNavigate('login')}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    >
                      <LogIn size={14} />
                      <span>{t.signInInstead}</span>
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => onNavigate('login')}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    >
                      <KeyRound size={14} />
                      <span>{t.forgotPassword}</span>
                    </button>
                  </div>
                )}
              </div>
            </Alert>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">
              {t.fullName} <span className="required">*</span>
            </label>
            <input
              type="text"
              className="input-control"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ramesh Patel"
              disabled={isLoading}
              required
            />
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">{t.emailAddress}</label>
              <input
                type="email"
                className="input-control"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (isDuplicateEmail) setIsDuplicateEmail(false);
                }}
                placeholder="user@example.com"
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label className="form-label">{t.phoneNumber}</label>
              <input
                type="tel"
                className="input-control"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="9876543210"
                disabled={isLoading}
              />
            </div>
          </div>
          <div className="form-helper" style={{ marginTop: '-12px', marginBottom: '16px' }}>
            * {t.phoneNumber} / {t.emailAddress}
          </div>

          <div className="form-group">
            <label className="form-label">
              {t.password} <span className="required">*</span>
            </label>
            <input
              type="password"
              className="input-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t.passwordMinLength}
              disabled={isLoading}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">{t.preferredLanguage}</label>
            <select
              className="select-control"
              value={preferredLanguage}
              onChange={(e) => setPreferredLanguage(e.target.value as SupportedLanguage)}
              disabled={isLoading}
            >
              <option value="en">English</option>
              <option value="hi">हिंदी (Hindi)</option>
              <option value="gu">ગુજરાતી (Gujarati)</option>
            </select>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginTop: '8px' }}
            disabled={isLoading}
          >
            {isLoading ? <div className="spinner" /> : <UserPlus size={18} />}
            <span>{isLoading ? t.creatingAccount : t.register}</span>
          </button>
        </form>

        {/* OR Divider */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            margin: '20px 0',
            color: 'var(--text-muted)',
            fontSize: '0.85rem',
            fontWeight: 600,
          }}
        >
          <div style={{ flex: 1, height: '1px', background: 'var(--border-light)' }} />
          <span style={{ padding: '0 12px' }}>{t.orDivider}</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-light)' }} />
        </div>

        {/* Google Sign Up Button */}
        <GoogleAuthButton
          mode="register"
          onSuccess={() => onNavigate('dashboard')}
          onError={(err) => setError(err)}
        />

        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.9rem' }}>
          <a
            href="#login"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('login');
            }}
            style={{ fontWeight: 600 }}
          >
            {t.alreadyHaveAccount}
          </a>
        </div>
      </div>
    </div>
  );
};
