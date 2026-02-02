
"use client";

import { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// In a real app, this would not be stored in localStorage.
// This is a simplified mock for prototyping purposes.
type AdminUser = {
  name: string;
  email: string;
  avatar: string;
};

// --- Helper Functions to interact with localStorage ---

const getLocalStorageItem = <T,>(key: string, defaultValue: T): T => {
    if (typeof window === 'undefined') {
        return defaultValue;
    }
    try {
        const item = window.localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.error(`Error reading from localStorage key “${key}”:`, error);
        return defaultValue;
    }
};

const setLocalStorageItem = <T,>(key: string, value: T): void => {
    if (typeof window === 'undefined') {
        return;
    }
    try {
        window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error(`Error writing to localStorage key “${key}”:`, error);
    }
};


type AdminAuthContextType = {
  currentAdmin: AdminUser | null;
  isInitialized: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [currentAdmin, setCurrentAdmin] = useState<AdminUser | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const router = useRouter();

  // Load initial state from localStorage
  useEffect(() => {
    const admin = getLocalStorageItem<AdminUser | null>('currentAdmin', null);
    setCurrentAdmin(admin);
    setIsInitialized(true);
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    if (!email.endsWith('@kgkite.ac.in')) {
       return Promise.reject(new Error("Login restricted to @kgkite.ac.in emails."));
    }
    
    // For prototyping: allow any @kgkite.ac.in email to log in.
    const name = email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    const adminProfile: AdminUser = {
        name: name,
        email: email,
        avatar: `https://api.dicebear.com/8.x/initials/svg?seed=${name}`,
    };

    setCurrentAdmin(adminProfile);
    setLocalStorageItem('currentAdmin', adminProfile);
    return Promise.resolve();
  };
  
  const logout = () => {
    setCurrentAdmin(null);
    if (typeof window !== 'undefined') {
        window.localStorage.removeItem('currentAdmin');
    }
    router.push('/admin/login');
  };

  const value = { currentAdmin, isInitialized, login, logout };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}
