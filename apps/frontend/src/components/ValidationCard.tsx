import React, { useState } from 'react';
import type { ValidationTaskRecord, ValidationStatus } from '../api/validation';
import { useLanguage } from '../context/LanguageContext';
import { CheckCircle2, Clock, MinusCircle, FileText, Check } from 'lucide-react';

interface ValidationCardProps {
  task: ValidationTaskRecord;
  onUpdate: (status: ValidationStatus, notes: string | null) => Promise<void>;
  disabled?: boolean;
}

export const ValidationCard: React.FC<ValidationCardProps> = ({
  task,
  onUpdate,
  disabled = false,
}) => {
  const { t } = useLanguage();
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notes, setNotes] = useState(task.notes || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleStatusChange = async (newStatus: ValidationStatus) => {
    setIsSaving(true);
    try {
      await onUpdate(newStatus, notes);
    } finally {
      setIsSaving(false);
    }
  };

  const handleNotesSave = async () => {
    setIsSaving(true);
    try {
      await onUpdate(task.status, notes);
      setIsEditingNotes(false);
    } finally {
      setIsSaving(false);
    }
  };

  const statusBorderColor = {
    COMPLETED: 'var(--brand-green)',
    SKIPPED: '#94a3b8',
    PENDING: '#f59e0b',
  }[task.status];

  const statusBgColor = {
    COMPLETED: 'var(--brand-green-light)',
    SKIPPED: 'var(--bg-subtle)',
    PENDING: '#fffbeb',
  }[task.status];

  return (
    <div
      className="card"
      style={{
        borderLeft: `4px solid ${statusBorderColor}`,
        background: 'var(--bg-surface)',
        marginBottom: '16px',
        transition: 'all 0.2s ease',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '12px',
        }}
      >
        <div style={{ flex: 1, minWidth: '240px' }}>
          <div
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              color: 'var(--text-muted)',
              marginBottom: '4px',
            }}
          >
            TASK #{task.taskKey}
          </div>
          <div style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-main)', lineHeight: 1.4 }}>
            {task.taskText}
          </div>
        </div>

        {/* Status Selection Buttons */}
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            type="button"
            className={`btn btn-sm ${task.status === 'COMPLETED' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => handleStatusChange('COMPLETED')}
            disabled={disabled || isSaving}
            title={t.statusCompleted}
          >
            <CheckCircle2 size={16} />
            <span>{t.statusCompleted}</span>
          </button>

          <button
            type="button"
            className={`btn btn-sm ${task.status === 'SKIPPED' ? 'btn-secondary' : 'btn-secondary'}`}
            style={
              task.status === 'SKIPPED'
                ? { background: '#64748b', color: 'white', borderColor: '#475569' }
                : {}
            }
            onClick={() => handleStatusChange('SKIPPED')}
            disabled={disabled || isSaving}
            title={t.statusSkipped}
          >
            <MinusCircle size={16} />
            <span>{t.statusSkipped}</span>
          </button>

          <button
            type="button"
            className={`btn btn-sm ${task.status === 'PENDING' ? 'btn-secondary' : 'btn-secondary'}`}
            style={
              task.status === 'PENDING'
                ? { background: '#f59e0b', color: 'white', borderColor: '#d97706' }
                : {}
            }
            onClick={() => handleStatusChange('PENDING')}
            disabled={disabled || isSaving}
            title={t.statusPending}
          >
            <Clock size={16} />
            <span>{t.statusPending}</span>
          </button>
        </div>
      </div>

      {/* Timestamp & Notes Preview */}
      <div
        style={{
          padding: '10px 14px',
          background: statusBgColor,
          borderRadius: 'var(--radius-sm)',
          fontSize: '0.85rem',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: isEditingNotes || task.notes ? '8px' : '0',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
            <FileText size={15} />
            <span style={{ fontWeight: 600 }}>Ground Evidence / Notes:</span>
            {task.completedAt && (
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                (Completed: {new Date(task.completedAt).toLocaleDateString()})
              </span>
            )}
          </div>

          {!isEditingNotes && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              style={{ padding: '2px 8px', height: '24px', fontSize: '0.75rem' }}
              onClick={() => setIsEditingNotes(true)}
              disabled={disabled}
            >
              {task.notes ? 'Edit Notes' : '+ Add Notes'}
            </button>
          )}
        </div>

        {isEditingNotes ? (
          <div>
            <textarea
              className="textarea-control"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t.notesPlaceholder}
              rows={3}
              disabled={disabled || isSaving}
              style={{ background: 'white', marginBottom: '8px' }}
            />
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setNotes(task.notes || '');
                  setIsEditingNotes(false);
                }}
                disabled={isSaving}
              >
                {t.cancel}
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={handleNotesSave}
                disabled={isSaving}
              >
                <Check size={14} />
                <span>{isSaving ? t.saving : t.save}</span>
              </button>
            </div>
          </div>
        ) : (
          task.notes && (
            <div
              style={{
                color: 'var(--text-main)',
                fontStyle: 'italic',
                paddingLeft: '6px',
                borderLeft: '2px solid rgba(0,0,0,0.15)',
              }}
            >
              "{task.notes}"
            </div>
          )
        )}
      </div>
    </div>
  );
};
