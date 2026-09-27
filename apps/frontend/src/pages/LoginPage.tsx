import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Alert } from '../components/Alert';
import { GoogleAuthButton } from '../components/GoogleAuthButton';
import { Mail, Phone, LogIn } from 'lucide-react';

interface LoginPageProps {
  onNavigate: (view: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const { login } = useAuth();
  const { t } = useLanguage();

  const [identifierType, setIdentifierType] = useState<'email' | 'phone'>('email');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!identifier.trim()) {
      setError(identifierType === 'email' ? t.enterValidEmail : t.enterValidPhone);
      return;
    }

    if (!password) {
      setError(t.enterPassword);
      return;
    }

    setIsLoading(true);
    try {
      await login({
        email: identifierType === 'email' ? identifier.trim() : undefined,
        phone: identifierType === 'phone' ? identifier.trim() : undefined,
        password,
      });
      onNavigate('dashboard');
    } catch (err: any) {
      setError(err.message || t.authError);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '440px', margin: '40px auto' }}>
      <div className="card" style={{ padding: '32px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>{t.login}</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{t.loginPrompt}</p>
        </div>

        {error && (
          <Alert type="error" className="mb-4">
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          {/* Toggle between Email / Phone */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            <button
              type="button"
              className={`btn btn-sm ${identifierType === 'email' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ flex: 1 }}
              onClick={() => {
                setIdentifierType('email');
                setIdentifier('');
              }}
            >
              <Mail size={14} />
              <span>{t.emailAddress}</span>
            </button>
            <button
              type="button"
              className={`btn btn-sm ${identifierType === 'phone' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ flex: 1 }}
              onClick={() => {
                setIdentifierType('phone');
                setIdentifier('');
              }}
            >
              <Phone size={14} />
              <span>{t.phoneNumber}</span>
            </button>
          </div>

          <div className="form-group">
            <label className="form-label">
              {identifierType === 'email' ? t.emailAddress : t.phoneNumber} <span className="required">*</span>
            </label>
            <input
              type={identifierType === 'email' ? 'email' : 'tel'}
              className="input-control"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder={identifierType === 'email' ? 'user@example.com' : '9876543210'}
              disabled={isLoading}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              {t.password} <span className="required">*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                className="input-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={isLoading}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginTop: '8px' }}
            disabled={isLoading}
          >
            {isLoading ? <div className="spinner" /> : <LogIn size={18} />}
            <span>{isLoading ? t.signingIn : t.login}</span>
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

        {/* Google Sign In Button */}
        <GoogleAuthButton
          mode="login"
          onSuccess={() => onNavigate('dashboard')}
          onError={(err) => setError(err)}
        />

        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.9rem' }}>
          <a
            href="#register"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('register');
            }}
            style={{ fontWeight: 600 }}
          >
            {t.dontHaveAccount}
          </a>
        </div>
      </div>
    </div>
  );
};
