'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { NotificationItem } from '@/types';
import { api } from '@/lib/api';

interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  toastMessage: NotificationItem | null;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  showToast: (item: Omit<NotificationItem, 'id' | 'date'>) => void;
  dismissToast: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [toastMessage, setToastMessage] = useState<NotificationItem | null>(null);

  useEffect(() => {
    async function loadNotifications() {
      try {
        const data = await api.getNotifications();
        if (Array.isArray(data)) {
          setNotifications(data);
        }
      } catch {
        setNotifications([]);
      }
    }

    loadNotifications();
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const showToast = (item: Omit<NotificationItem, 'id' | 'date'>) => {
    const newToast: NotificationItem = {
      id: 'toast_' + Math.random().toString(36).substring(2, 9),
      date: 'Just now',
      read: false,
      ...item,
    };
    setToastMessage(newToast);
    setNotifications((prev) => [newToast, ...prev]);

    // Auto-dismiss after 6 seconds
    setTimeout(() => {
      setToastMessage((current) => (current?.id === newToast.id ? null : current));
    }, 6000);
  };

  const dismissToast = () => {
    setToastMessage(null);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        toastMessage,
        markAsRead,
        markAllAsRead,
        showToast,
        dismissToast,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications(): NotificationContextType {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
