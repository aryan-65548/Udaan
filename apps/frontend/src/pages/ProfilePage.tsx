import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import type { SupportedLanguage } from '../i18n/translations';
import { getAssessments, type AssessmentItem } from '../api/assessments';
import { Alert } from '../components/Alert';
import {
  User as UserIcon,
  Shield,
  Trash2,
  Save,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Briefcase,
  Activity,
  Key,
  Calendar,
  Layers,
  Clock,
  ExternalLink,
  Globe,
} from 'lucide-react';

interface ProfilePageProps {
  onNavigate: (view: string) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onNavigate }) => {
  const { user, updateUserProfile, deleteUserAccount } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  // Basic Profile State
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [prefLang, setPrefLang] = useState<SupportedLanguage>(
    (user?.preferredLanguage as SupportedLanguage) || language
  );

  // Business Profile State
  const [businessName, setBusinessName] = useState(user?.businessName || '');
  const [businessCategory, setBusinessCategory] = useState(user?.businessCategory || '');
  const [operatingState, setOperatingState] = useState(user?.operatingState || '');
  const [operatingDistrict, setOperatingDistrict] = useState(user?.operatingDistrict || '');
  const [experienceLevel, setExperienceLevel] = useState<'BEGINNER' | 'SOME_EXPERIENCE' | 'EXPERIENCED' | ''>(
    (user?.experienceLevel as any) || ''
  );
  const [businessBackground, setBusinessBackground] = useState(user?.businessBackground || '');

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Activity Stats State (from real backend assessments)
  const [assessments, setAssessments] = useState<AssessmentItem[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  // Profile Save State
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Fetch real assessment data for authenticated user activity metrics
  useEffect(() => {
    let isMounted = true;
    const loadUserAssessments = async () => {
      setIsLoadingStats(true);
      try {
        const data = await getAssessments();
        if (isMounted) {
          setAssessments(data || []);
        }
      } catch {
        // Non-fatal, fallback to empty list
        if (isMounted) {
          setAssessments([]);
        }
      } finally {
        if (isMounted) {
          setIsLoadingStats(false);
        }
      }
    };

    loadUserAssessments();
    return () => {
      isMounted = false;
    };
  }, []);

  // Compute actual metrics
  const totalAssessmentsCount = assessments.length;
  const completedAssessmentsCount = assessments.filter(
    (a) => a.status === 'COMPLETED' || a.completedAt !== null
  ).length;
  const inProgressAssessmentsCount = totalAssessmentsCount - completedAssessmentsCount;

  // Format creation date
  const memberSinceFormatted = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString(
        language === 'hi' ? 'hi-IN' : language === 'gu' ? 'gu-IN' : 'en-IN',
        { day: 'numeric', month: 'long', year: 'numeric' }
      )
    : null;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSaveSuccess(false);

    if (!name.trim()) {
      setErrorMsg(t.enterFullName);
      return;
    }

    setIsSaving(true);
    try {
      await updateUserProfile({
        name: name.trim(),
        phone: phone.trim() || undefined,
        preferredLanguage: prefLang,
        businessName: businessName.trim() || undefined,
        businessCategory: businessCategory.trim() || undefined,
        operatingState: operatingState.trim() || undefined,
        operatingDistrict: operatingDistrict.trim() || undefined,
        experienceLevel: experienceLevel || undefined,
        businessBackground: businessBackground.trim() || undefined,
      });

      // Also sync active app language if user updated preferred language
      if (prefLang !== language) {
        setLanguage(prefLang);
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || t.profileUpdateFailed);
    } finally {
      setIsSaving(false);
    }
  };

  const isGoogleAccountWithoutPassword = Boolean(user?.googleId && user?.hasPassword === false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);

    if (!isGoogleAccountWithoutPassword && !currentPassword) {
      setPasswordError(t.enterPassword);
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setPasswordError(t.passwordMinLength);
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError(t.passwordMismatch);
      return;
    }

    setIsChangingPassword(true);
    try {
      await updateUserProfile({
        currentPassword: isGoogleAccountWithoutPassword ? undefined : currentPassword,
        newPassword,
      });
      setPasswordSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(false), 4000);
    } catch (err: any) {
      setPasswordError(err.message || t.profileUpdateFailed);
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await deleteUserAccount();
      onNavigate('login');
    } catch (err: any) {
      setDeleteError(err.message || t.accountDeleteFailed);
      setIsDeleting(false);
    }
  };

  return (
    <div style={{ maxWidth: '820px', margin: '0 auto', paddingBottom: '60px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          style={{ marginBottom: '16px' }}
          onClick={() => onNavigate('dashboard')}
        >
          <ArrowLeft size={16} />
          <span>{t.dashboard}</span>
        </button>

        <h1 style={{ fontSize: '1.75rem', marginBottom: '6px', color: 'var(--text-main)' }}>
          {t.profileTitle}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
          {t.profileSubtitle}
        </p>
      </div>

      {saveSuccess && (
        <Alert type="success" className="mb-4">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={18} />
            <span>{t.profileUpdatedSuccess}</span>
          </div>
        </Alert>
      )}

      {errorMsg && (
        <Alert type="error" className="mb-4">
          {errorMsg}
        </Alert>
      )}

      {/* Section A: Profile Overview Card */}
      <div className="card" style={{ padding: '28px', marginBottom: '28px' }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}>
          <UserIcon size={20} color="var(--brand-green)" />
          <span>{t.profileOverview}</span>
        </h2>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            paddingBottom: '20px',
            borderBottom: '1px solid var(--border-light)',
            marginBottom: '20px',
            flexWrap: 'wrap',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--brand-green) 0%, #1e7e34 100%)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.75rem',
              fontWeight: 700,
              boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
            }}
          >
            {user?.name ? user.name.charAt(0).toUpperCase() : <UserIcon size={28} />}
          </div>

          <div style={{ flex: 1, minWidth: '220px' }}>
            <div style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '2px' }}>
              {user?.name || 'Entrepreneur'}
            </div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              {user?.email || (user?.phone ? `+91 ${user.phone}` : 'UDAAN Member')}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '20px',
                background: 'rgba(46, 125, 50, 0.1)',
                color: 'var(--brand-green)',
                fontSize: '0.82rem',
                fontWeight: 600,
              }}
            >
              <Shield size={14} />
              {user?.role || 'ENTREPRENEUR'}
            </span>

            {user?.googleId && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  background: 'rgba(66, 133, 244, 0.1)',
                  color: '#1a73e8',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                }}
              >
                <Globe size={14} />
                {t.googleAccountLinked}
              </span>
            )}

            {memberSinceFormatted && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  background: 'var(--bg-subtle)',
                  color: 'var(--text-secondary)',
                  fontSize: '0.82rem',
                  fontWeight: 500,
                }}
              >
                <Calendar size={14} />
                {t.memberSince}: {memberSinceFormatted}
              </span>
            )}
          </div>
        </div>

        {/* Section D: Editable Account Settings */}
        <form onSubmit={handleSaveProfile}>
          <div className="grid-2" style={{ gap: '16px', marginBottom: '20px' }}>
            {/* Full Name */}
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
                disabled={isSaving}
                required
              />
            </div>

            {/* Email Address (Read-only) */}
            <div className="form-group">
              <label className="form-label">
                {t.emailAddress} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>({t.optional})</span>
              </label>
              <input
                type="email"
                className="input-control"
                value={user?.email || ''}
                placeholder="No email provided"
                disabled
                style={{ background: 'var(--bg-subtle)', cursor: 'not-allowed', color: 'var(--text-secondary)' }}
              />
            </div>

            {/* Phone Number */}
            <div className="form-group">
              <label className="form-label">{t.phoneNumber}</label>
              <input
                type="tel"
                className="input-control"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 9876543210"
                disabled={isSaving}
              />
            </div>

            {/* Preferred Advisory Language */}
            <div className="form-group">
              <label className="form-label">{t.preferredLanguage}</label>
              <select
                className="select-control"
                value={prefLang}
                onChange={(e) => setPrefLang(e.target.value as SupportedLanguage)}
                disabled={isSaving}
              >
                <option value="en">English</option>
                <option value="hi">हिंदी (Hindi)</option>
                <option value="gu">ગુજરાતી (Gujarati)</option>
              </select>
            </div>
          </div>

          {/* Section B: Personal and Business Information (Optional Business Profile) */}
          <div
            style={{
              padding: '20px',
              background: 'var(--bg-subtle)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-light)',
              marginBottom: '24px',
            }}
          >
            <div style={{ marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}>
                <Briefcase size={18} color="var(--brand-green)" />
                <span>{t.businessProfile}</span>
              </h3>
              <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                {t.businessProfileSubtitle}
              </p>
            </div>

            <div className="grid-2" style={{ gap: '14px', marginBottom: '14px' }}>
              {/* Preferred Business Name */}
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontSize: '0.85rem' }}>
                  {t.businessName} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>({t.optional})</span>
                </label>
                <input
                  type="text"
                  className="input-control"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder={t.businessNamePlaceholder}
                  disabled={isSaving}
                />
              </div>

              {/* Primary Business Category */}
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontSize: '0.85rem' }}>
                  {t.primarySector} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>({t.optional})</span>
                </label>
                <input
                  type="text"
                  className="input-control"
                  value={businessCategory}
                  onChange={(e) => setBusinessCategory(e.target.value)}
                  placeholder="e.g. Agri-processing, Dairy, Retail"
                  disabled={isSaving}
                />
              </div>

              {/* Operating State */}
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontSize: '0.85rem' }}>
                  {t.operatingState} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>({t.optional})</span>
                </label>
                <input
                  type="text"
                  className="input-control"
                  value={operatingState}
                  onChange={(e) => setOperatingState(e.target.value)}
                  placeholder="e.g. Gujarat"
                  disabled={isSaving}
                />
              </div>

              {/* Operating District */}
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontSize: '0.85rem' }}>
                  {t.operatingDistrict} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>({t.optional})</span>
                </label>
                <input
                  type="text"
                  className="input-control"
                  value={operatingDistrict}
                  onChange={(e) => setOperatingDistrict(e.target.value)}
                  placeholder="e.g. Anand"
                  disabled={isSaving}
                />
              </div>
            </div>

            {/* Entrepreneur Experience Level */}
            <div className="form-group" style={{ marginBottom: '14px' }}>
              <label className="form-label" style={{ fontSize: '0.85rem' }}>
                {t.experienceLevel} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>({t.optional})</span>
              </label>
              <select
                className="select-control"
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value as any)}
                disabled={isSaving}
              >
                <option value="">{t.selectCategory}...</option>
                <option value="BEGINNER">{t.expBeginner}</option>
                <option value="SOME_EXPERIENCE">{t.expSome}</option>
                <option value="EXPERIENCED">{t.expExperienced}</option>
              </select>
            </div>

            {/* Business Background */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontSize: '0.85rem' }}>
                {t.businessBackground} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>({t.optional})</span>
              </label>
              <textarea
                className="input-control"
                rows={3}
                value={businessBackground}
                onChange={(e) => setBusinessBackground(e.target.value)}
                placeholder={t.businessBackgroundPlaceholder}
                disabled={isSaving}
                style={{ resize: 'vertical' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSaving}
            >
              <Save size={16} />
              <span>{isSaving ? t.saving : t.saveProfileChanges}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Section C: Account Activity Card */}
      <div className="card" style={{ padding: '28px', marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}>
              <Activity size={20} color="var(--brand-green)" />
              <span>{t.accountActivity}</span>
            </h2>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              {t.dashboardSubtitle}
            </p>
          </div>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => onNavigate('previous-assessments')}
          >
            <span>{t.viewPreviousAssessments}</span>
            <ExternalLink size={14} />
          </button>
        </div>

        <div className="grid-3" style={{ gap: '16px' }}>
          {/* Total Assessments */}
          <div
            style={{
              padding: '18px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border-light)',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              <Layers size={16} color="var(--brand-green)" />
              <span>{t.totalAssessments}</span>
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-main)' }}>
              {isLoadingStats ? '...' : totalAssessmentsCount}
            </div>
          </div>

          {/* In Progress */}
          <div
            style={{
              padding: '18px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(217, 119, 6, 0.06)',
              border: '1px solid rgba(217, 119, 6, 0.2)',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#b45309', fontSize: '0.85rem' }}>
              <Clock size={16} />
              <span>{t.inProgressAssessments}</span>
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#b45309' }}>
              {isLoadingStats ? '...' : inProgressAssessmentsCount}
            </div>
          </div>

          {/* Completed Assessments */}
          <div
            style={{
              padding: '18px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(46, 125, 50, 0.06)',
              border: '1px solid rgba(46, 125, 50, 0.2)',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--brand-green)', fontSize: '0.85rem' }}>
              <CheckCircle2 size={16} />
              <span>{t.completedAssessments}</span>
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--brand-green)' }}>
              {isLoadingStats ? '...' : completedAssessmentsCount}
            </div>
          </div>
        </div>
      </div>

      {/* Password Management */}
      <div className="card" style={{ padding: '28px', marginBottom: '28px' }}>
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}>
            <Key size={20} color="var(--brand-green)" />
            <span>{isGoogleAccountWithoutPassword ? t.setPassword : t.changePassword}</span>
          </h2>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            {isGoogleAccountWithoutPassword ? t.setPasswordSubtitle : t.changePasswordSubtitle}
          </p>
        </div>

        {passwordSuccess && (
          <Alert type="success" className="mb-4">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={18} />
              <span>{t.passwordChangedSuccess}</span>
            </div>
          </Alert>
        )}

        {passwordError && (
          <Alert type="error" className="mb-4">
            {passwordError}
          </Alert>
        )}

        <form onSubmit={handleChangePassword}>
          <div className={isGoogleAccountWithoutPassword ? 'grid-2' : 'grid-3'} style={{ gap: '16px', marginBottom: '16px' }}>
            {!isGoogleAccountWithoutPassword && (
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontSize: '0.85rem' }}>
                  {t.currentPassword} <span className="required">*</span>
                </label>
                <input
                  type="password"
                  className="input-control"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  disabled={isChangingPassword}
                  required
                />
              </div>
            )}

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontSize: '0.85rem' }}>
                {t.newPassword} <span className="required">*</span>
              </label>
              <input
                type="password"
                className="input-control"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder={t.newPasswordPlaceholder}
                disabled={isChangingPassword}
                required
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontSize: '0.85rem' }}>
                {t.password} (Confirm) <span className="required">*</span>
              </label>
              <input
                type="password"
                className="input-control"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={t.newPasswordPlaceholder}
                disabled={isChangingPassword}
                required
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="submit"
              className="btn btn-secondary"
              disabled={
                isChangingPassword ||
                (!isGoogleAccountWithoutPassword && !currentPassword) ||
                !newPassword ||
                !confirmPassword
              }
            >
              <Key size={16} />
              <span>
                {isChangingPassword
                  ? t.saving
                  : isGoogleAccountWithoutPassword
                  ? t.setPassword
                  : t.changePassword}
              </span>
            </button>
          </div>
        </form>
      </div>

      {/* Danger Zone: Account Deletion */}
      <div
        className="card"
        style={{
          padding: '24px',
          border: '1px solid #fecaca',
          background: '#fffbfb',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', color: '#dc2626', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Trash2 size={18} />
              <span>{t.deleteAccountTitle}</span>
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', maxWidth: '480px' }}>
              {t.deleteAccountWarning}
            </p>
          </div>

          <button
            type="button"
            className="btn btn-sm"
            style={{
              background: '#dc2626',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
            }}
            onClick={() => setShowDeleteModal(true)}
          >
            {t.deleteAccountBtn}
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '16px',
          }}
        >
          <div
            className="card"
            style={{
              maxWidth: '460px',
              width: '100%',
              padding: '28px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#dc2626', marginBottom: '12px' }}>
              <AlertTriangle size={24} />
              <h3 style={{ fontSize: '1.2rem', margin: 0 }}>{t.confirmDeleteTitle}</h3>
            </div>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '20px', lineHeight: 1.5 }}>
              {t.confirmDeletePrompt}
            </p>

            {deleteError && (
              <div
                style={{
                  background: '#fef2f2',
                  color: '#dc2626',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.85rem',
                  marginBottom: '16px',
                }}
              >
                {deleteError}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteError(null);
                }}
                disabled={isDeleting}
              >
                {t.cancel}
              </button>

              <button
                type="button"
                className="btn"
                style={{
                  background: '#dc2626',
                  color: 'white',
                  border: 'none',
                }}
                onClick={handleDeleteAccount}
                disabled={isDeleting}
              >
                {isDeleting ? t.deleting : t.confirmDeleteConfirmBtn}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

