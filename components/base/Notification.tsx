import { ReactNode, useEffect, useState } from 'react';
import { cn } from '@/lib/utils/cn';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface NotificationProps {
  type: NotificationType;
  message: string;
  onClose?: () => void;
  duration?: number;
  icon?: ReactNode;
}

export default function Notification({
  type,
  message,
  onClose,
  duration = 5000,
  icon,
}: NotificationProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration]);

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  const typeStyles = {
    success: 'bg-success-50 border-success-500 text-success-800 dark:bg-success-900/20 dark:border-success-500 dark:text-success-200',
    error: 'bg-error-50 border-error-500 text-error-800 dark:bg-error-900/20 dark:border-error-500 dark:text-error-200',
    warning: 'bg-warning-50 border-warning-500 text-warning-800 dark:bg-warning-900/20 dark:border-warning-500 dark:text-warning-200',
    info: 'bg-primary-50 border-primary-500 text-primary-800 dark:bg-primary-900/20 dark:border-primary-500 dark:text-primary-200',
  };

  const defaultIcons = {
    success: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
    error: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
    warning: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    info: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  };

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        'flex items-center gap-3 px-4 py-3 rounded-lg border-l-4 shadow-md animate-slide-down',
        typeStyles[type]
      )}
    >
      <div className="flex-shrink-0">{icon || defaultIcons[type]}</div>
      <div className="flex-1 text-sm font-medium">{message}</div>
      {onClose && (
        <button
          onClick={handleClose}
          className="flex-shrink-0 p-1 hover:opacity-70 transition-opacity"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}

// Notification Container for managing multiple notifications
export interface NotificationContainerProps {
  notifications: Array<{
    id: string;
    type: NotificationType;
    message: string;
  }>;
  onRemove: (id: string) => void;
}

export function NotificationContainer({ notifications, onRemove }: NotificationContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-md">
      {notifications.map((notification) => (
        <Notification
          key={notification.id}
          type={notification.type}
          message={notification.message}
          onClose={() => onRemove(notification.id)}
        />
      ))}
    </div>
  );
}
