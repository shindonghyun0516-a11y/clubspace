'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import ToastContainer from './ToastContainer';
import { ToastData, ToastType } from './Toast';

interface ToastContextType {
  showToast: (type: ToastType, title: string, message?: string, options?: Partial<ToastData>) => void;
  removeToast: (id: string) => void;
  clearAllToasts: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider = ({ children }: ToastProviderProps) => {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const generateId = () => {
    return Math.random().toString(36).substr(2, 9);
  };

  const showToast = useCallback((
    type: ToastType, 
    title: string, 
    message?: string,
    options: Partial<ToastData> = {}
  ) => {
    const id = generateId();
    const newToast: ToastData = {
      id,
      type,
      title,
      message,
      duration: 5000,
      autoClose: true,
      ...options,
    };

    setToasts(prev => [...prev, newToast]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const value: ToastContextType = {
    showToast,
    removeToast,
    clearAllToasts,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// Convenience functions for common toast types
export const useToastHelpers = () => {
  const { showToast } = useToast();

  return {
    success: (title: string, message?: string, options?: Partial<ToastData>) => 
      showToast('success', title, message, options),
    
    error: (title: string, message?: string, options?: Partial<ToastData>) => 
      showToast('error', title, message, options),
    
    warning: (title: string, message?: string, options?: Partial<ToastData>) => 
      showToast('warning', title, message, options),
    
    info: (title: string, message?: string, options?: Partial<ToastData>) => 
      showToast('info', title, message, options),
  };
};