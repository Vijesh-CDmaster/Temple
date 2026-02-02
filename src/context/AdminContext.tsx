
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
  register: (name: string, email: string, password: string) => Promise<void>;
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
    
    // Initialize admin user database if it doesn't exist
    getLocalStorageItem<(AdminUser & { password?: string })[]>('admins', []);
    setIsInitialized(true);
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    const admins = getLocalStorageItem<(AdminUser & { password?: string })[]>('admins', []);
    const admin = admins.find(u => u.email === email && u.password === password);

    if (admin) {
      if (!admin.email.endsWith('@kgkite.ac.in')) {
         return Promise.reject(new Error("Login restricted to @kgkite.ac.in emails."));
      }
      const { password, ...adminProfile } = admin;
      setCurrentAdmin(adminProfile);
      setLocalStorageItem('currentAdmin', adminProfile);
      return Promise.resolve();
    } else {
      return Promise.reject(new Error("Invalid email or password."));
    }
  };

  const register = async (name: string, email: string, password: string): Promise<void> => {
    if (!email.endsWith('@kgkite.ac.in')) {
      return Promise.reject(new Error("Registration is restricted to @kgkite.ac.in emails."));
    }
    
    const admins = getLocalStorageItem<(AdminUser & { password?: string })[]>('admins', []);
    if (admins.some(u => u.email === email)) {
      return Promise.reject(new Error("An account with this email already exists."));
    }

    const newAdmin: AdminUser & { password?: string } = {
        name,
        email,
        password,
        avatar: `https://api.dicebear.com/8.x/initials/svg?seed=${name}`,
    };

    const { password: _, ...adminProfile } = newAdmin;

    admins.push(newAdmin);
    setLocalStorageItem('admins', admins);
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

  const value = { currentAdmin, isInitialized, login, register, logout };

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
