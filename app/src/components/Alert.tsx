import { useEffect } from 'react';

export type AlertType = 'success' | 'error' | 'warning' | 'info';

interface AlertProps {
  type: AlertType;
  message: string;
  onClose: () => void;
  autoClose?: boolean;
  duration?: number;
}

export function Alert({ type, message, onClose, autoClose = true, duration = 5000 }: AlertProps) {
  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [autoClose, duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
        return 'ℹ';
      default:
        return 'ℹ';
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'success':
        return 'Éxito';
      case 'error':
        return 'Error';
      case 'warning':
        return 'Advertencia';
      case 'info':
        return 'Información';
      default:
        return '';
    }
  };

  return (
    <div className={`alert alert-${type}`}>
      <div className="alert-icon">{getIcon()}</div>
      <div className="alert-content">
        <div className="alert-title">{getTitle()}</div>
        <div className="alert-message">{message}</div>
      </div>
      <button className="alert-close" onClick={onClose}>
        ×
      </button>
    </div>
  );
}
