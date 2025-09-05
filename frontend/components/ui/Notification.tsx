'use client';

import React, { useEffect, useState } from 'react';
import { 
  X, 
  Check, 
  AlertTriangle, 
  Info, 
  AlertCircle,
  Bell,
  BellRing,
  Volume2,
  VolumeX
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './Button';

export interface NotificationProps {
  id?: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number; // 0 means persistent
  autoClose?: boolean;
  showCloseButton?: boolean;
  actions?: Array<{
    label: string;
    action: () => void;
    variant?: 'default' | 'outline' | 'ghost';
  }>;
  onClose?: () => void;
  className?: string;
}

const notificationIcons = {
  success: Check,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const notificationStyles = {
  success: 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200',
  error: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-200',
  info: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200',
};

const iconStyles = {
  success: 'text-green-600 dark:text-green-400',
  error: 'text-red-600 dark:text-red-400',
  warning: 'text-yellow-600 dark:text-yellow-400',
  info: 'text-blue-600 dark:text-blue-400',
};

export const Notification: React.FC<NotificationProps> = ({
  id,
  type,
  title,
  message,
  duration = 5000,
  autoClose = true,
  showCloseButton = true,
  actions = [],
  onClose,
  className
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(100);

  const Icon = notificationIcons[type];

  useEffect(() => {
    if (autoClose && duration > 0) {
      const startTime = Date.now();
      
      const timer = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, duration - elapsed);
        const progressPercent = (remaining / duration) * 100;
        
        setProgress(progressPercent);
        
        if (remaining <= 0) {
          handleClose();
        }
      }, 50);

      return () => clearInterval(timer);
    }
  }, [autoClose, duration]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose?.(), 150); // Allow fade out animation
  };

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        'relative max-w-sm w-full shadow-lg rounded-lg border p-4 transition-all duration-300 ease-in-out',
        'transform translate-x-0 opacity-100',
        notificationStyles[type],
        className
      )}
      role="alert"
      aria-live="polite"
    >
      {/* Progress bar for auto-close */}
      {autoClose && duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/10 dark:bg-white/10 rounded-b-lg overflow-hidden">
          <div
            className="h-full bg-current transition-all duration-50 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      <div className="flex items-start space-x-3">
        {/* Icon */}
        <div className="flex-shrink-0">
          <Icon className={cn('w-5 h-5', iconStyles[type])} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm">{title}</div>
          {message && (
            <div className="text-sm opacity-90 mt-1">{message}</div>
          )}

          {/* Actions */}
          {actions.length > 0 && (
            <div className="flex space-x-2 mt-3">
              {actions.map((action, index) => (
                <Button
                  key={index}
                  variant={action.variant || 'outline'}
                  size="sm"
                  onClick={() => {
                    action.action();
                    handleClose();
                  }}
                  className="text-xs"
                >
                  {action.label}
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* Close button */}
        {showCloseButton && (
          <button
            onClick={handleClose}
            className="flex-shrink-0 inline-flex text-current hover:text-current/80 focus:outline-none focus:ring-2 focus:ring-current/20 rounded-md p-0.5 transition-colors"
            aria-label="关闭通知"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

// Toast container for managing multiple notifications
export interface ToastContainerProps {
  notifications: Array<NotificationProps & { id: string }>;
  onRemove: (id: string) => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  maxVisible?: number;
  className?: string;
}

const positionStyles = {
  'top-right': 'fixed top-4 right-4 z-50',
  'top-left': 'fixed top-4 left-4 z-50',
  'bottom-right': 'fixed bottom-4 right-4 z-50',
  'bottom-left': 'fixed bottom-4 left-4 z-50',
  'top-center': 'fixed top-4 left-1/2 transform -translate-x-1/2 z-50',
  'bottom-center': 'fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50',
};

export const ToastContainer: React.FC<ToastContainerProps> = ({
  notifications,
  onRemove,
  position = 'top-right',
  maxVisible = 5,
  className
}) => {
  const visibleNotifications = notifications.slice(-maxVisible);

  return (
    <div className={cn(positionStyles[position], className)}>
      <div className="space-y-2">
        {visibleNotifications.map((notification) => (
          <Notification
            key={notification.id}
            {...notification}
            onClose={() => onRemove(notification.id)}
          />
        ))}
      </div>
    </div>
  );
};

// Hook for managing notifications
export interface NotificationState extends Omit<NotificationProps, 'onClose'> {
  id: string;
  createdAt: Date;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<NotificationState[]>([]);

  const addNotification = (notification: Omit<NotificationProps, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 15);
    const newNotification: NotificationState = {
      ...notification,
      id,
      createdAt: new Date(),
    };

    setNotifications(prev => [...prev, newNotification]);
    return id;
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const updateNotification = (id: string, updates: Partial<NotificationProps>) => {
    setNotifications(prev =>
      prev.map(n =>
        n.id === id ? { ...n, ...updates } : n
      )
    );
  };

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAll,
    updateNotification,
  };
};

// Notification Manager Component for global notifications
export interface NotificationManagerProps {
  className?: string;
  position?: ToastContainerProps['position'];
  maxVisible?: number;
  enableSound?: boolean;
}

export const NotificationManager: React.FC<NotificationManagerProps> = ({
  className,
  position = 'top-right',
  maxVisible = 5,
  enableSound = false
}) => {
  const { notifications, removeNotification } = useNotifications();
  const [soundEnabled, setSoundEnabled] = useState(enableSound);

  // Play notification sound
  useEffect(() => {
    if (soundEnabled && notifications.length > 0) {
      const lastNotification = notifications[notifications.length - 1];
      if (lastNotification.createdAt.getTime() > Date.now() - 1000) {
        // Only play sound for notifications created in the last second
        const audio = new Audio('/notification-sound.mp3');
        audio.volume = 0.3;
        audio.play().catch(() => {
          // Ignore audio play errors (e.g., user hasn't interacted with page)
        });
      }
    }
  }, [notifications.length, soundEnabled]);

  return (
    <>
      <ToastContainer
        notifications={notifications}
        onRemove={removeNotification}
        position={position}
        maxVisible={maxVisible}
        className={className}
      />
      
      {/* Sound toggle button (optional) */}
      {enableSound && (
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className={cn(
            'fixed bottom-4 left-4 z-40 p-2 rounded-full shadow-lg transition-colors',
            'bg-background border hover:bg-muted'
          )}
          title={soundEnabled ? '关闭通知声音' : '开启通知声音'}
        >
          {soundEnabled ? (
            <Volume2 className="w-4 h-4" />
          ) : (
            <VolumeX className="w-4 h-4" />
          )}
        </button>
      )}
    </>
  );
};

export default Notification;