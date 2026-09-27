import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Alert } from './Alert';

interface GoogleAuthButtonProps {
  mode: 'login' | 'register';
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (parent: HTMLElement, options: any) => void;
          prompt: () => void;
        };
      };
    };
  }
}

export const GoogleAuthButton: React.FC<GoogleAuthButtonProps> = ({
  mode,
  onSuccess,
  onError,
}) => {
  const { loginWithGoogle } = useAuth();
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  const handleCredentialResponse = useCallback(
    async (credential: string) => {
      setIsLoading(true);
      setLocalError(null);
      try {
        await loginWithGoogle(credential);
        onSuccess?.();
      } catch (err: any) {
        const msg = err.message || t.googleAuthFailed;
        setLocalError(msg);
        onError?.(msg);
      } finally {
        setIsLoading(false);
      }
    },
    [loginWithGoogle, onSuccess, onError, t.googleAuthFailed]
  );

  useEffect(() => {
    if (!googleClientId) return;

    // Load Google Identity Services SDK script dynamically if not present
    const scriptId = 'google-gsi-client-script';
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    }

    const initGsi = () => {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: (response: { credential?: string }) => {
            if (response.credential) {
              handleCredentialResponse(response.credential);
            }
          },
        });
      }
    };

    if (window.google?.accounts?.id) {
      initGsi();
    } else {
      script.onload = initGsi;
    }
  }, [googleClientId, handleCredentialResponse]);

  const handleButtonClick = () => {
    if (!googleClientId) {
      setLocalError(t.googleAuthNotConfigured);
      onError?.(t.googleAuthNotConfigured);
      return;
    }

    if (window.google?.accounts?.id) {
      try {
        window.google.accounts.id.prompt();
      } catch (err: any) {
        console.warn('Google One Tap prompt error:', err);
      }
    }
  };

  return (
    <div style={{ width: '100%' }}>
      {localError && (
        <Alert type="error" className="mb-3">
          {localError}
        </Alert>
      )}

      <button
        type="button"
        onClick={handleButtonClick}
        disabled={isLoading}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          padding: '11px 16px',
          background: '#ffffff',
          color: '#3c4043',
          border: '1px solid #dadce0',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.95rem',
          fontWeight: 600,
          cursor: isLoading ? 'not-allowed' : 'pointer',
          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
          transition: 'all 0.15s ease',
        }}
        onMouseEnter={(e) => {
          if (!isLoading) {
            e.currentTarget.style.background = '#f8f9fa';
            e.currentTarget.style.borderColor = '#c6c9cc';
          }
        }}
        onMouseLeave={(e) => {
          if (!isLoading) {
            e.currentTarget.style.background = '#ffffff';
            e.currentTarget.style.borderColor = '#dadce0';
          }
        }}
      >
        {/* Official Google 'G' Multi-Color SVG Logo */}
        <svg width="20" height="20" viewBox="0 0 48 48">
          <path
            fill="#EA4335"
            d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
          />
          <path
            fill="#4285F4"
            d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
          />
          <path
            fill="#FBBC05"
            d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.28-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
          />
          <path
            fill="#34A853"
            d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
          />
        </svg>

        <span>{mode === 'login' ? t.continueWithGoogle : t.signUpWithGoogle}</span>
      </button>
    </div>
  );
};
