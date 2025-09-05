'use client';

import React, { createContext, useContext, useCallback } from 'react';
import { ToastContainer } from '@/components/ui/Notification';
import { useUIStore } from '@/lib/stores';
import type { NotificationProps } from '@/components/ui/Notification';

interface NotificationContextType {
  addNotification: (notification: Omit<NotificationProps, 'id'>) => string;
  removeNotification: (id: string) => void;
  clearAllNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotificationContext must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: React.ReactNode;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  maxVisible?: number;
  enableSound?: boolean;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
  position = 'top-right',
  maxVisible = 5,
  enableSound = false
}) => {
  const { notifications, addNotification, removeNotification, clearNotifications } = useUIStore();

  const handleAddNotification = useCallback((notification: Omit<NotificationProps, 'id'>) => {
    return addNotification(notification);
  }, [addNotification]);

  const handleRemoveNotification = useCallback((id: string) => {
    removeNotification(id);
  }, [removeNotification]);

  const handleClearAll = useCallback(() => {
    clearNotifications();
  }, [clearNotifications]);

  const contextValue: NotificationContextType = {
    addNotification: handleAddNotification,
    removeNotification: handleRemoveNotification,
    clearAllNotifications: handleClearAll,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      <ToastContainer
        notifications={notifications}
        onRemove={handleRemoveNotification}
        position={position}
        maxVisible={maxVisible}
      />
    </NotificationContext.Provider>
  );
};

export default NotificationProvider;