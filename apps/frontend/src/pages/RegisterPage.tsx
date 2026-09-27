import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import type { SupportedLanguage } from '../i18n/translations';
import { Alert } from '../components/Alert';
import { UserPlus } from 'lucide-react';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    if (!email.trim() && !phone.trim()) {
      setError('Please provide either an email address or a phone number');
      return;
    }

    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters');
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
      setError(err.message || 'Registration failed. Please check the entered details.');
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
          <Alert type="error" className="mb-4">
            {error}
          </Alert>
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
                onChange={(e) => setEmail(e.target.value)}
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
            * Provide either email or 10-digit mobile number
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
              placeholder="At least 6 characters"
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
            <span>{isLoading ? 'Creating account...' : t.register}</span>
          </button>
        </form>

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
