import React from 'react';
import { AlertCircle, CheckCircle2, AlertTriangle, Info } from 'lucide-react';

interface AlertProps {
  type: 'error' | 'success' | 'warning' | 'info';
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({ type, title, children, className = '' }) => {
  const icon = {
    error: <AlertCircle size={20} className="alert-icon-error" />,
    success: <CheckCircle2 size={20} className="alert-icon-success" />,
    warning: <AlertTriangle size={20} className="alert-icon-warning" />,
    info: <Info size={20} className="alert-icon-info" />,
  }[type];

  return (
    <div className={`alert alert-${type} ${className}`} role="alert">
      <div style={{ flexShrink: 0, marginTop: '2px' }}>{icon}</div>
      <div style={{ flex: 1 }}>
        {title && <div style={{ fontWeight: 700, marginBottom: '4px' }}>{title}</div>}
        <div>{children}</div>
      </div>
    </div>
  );
};
