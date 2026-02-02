
"use client";

import { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { workerRoles } from '@/lib/app-data';


export type WorkerUser = {
  name: string;
  email: string;
  role: string;
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


type WorkerAuthContextType = {
  currentWorker: WorkerUser | null;
  isInitialized: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  roles: typeof workerRoles;
};

const WorkerAuthContext = createContext<WorkerAuthContextType | undefined>(undefined);

export function WorkerAuthProvider({ children }: { children: ReactNode }) {
  const [currentWorker, setCurrentWorker] = useState<WorkerUser | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const worker = getLocalStorageItem<WorkerUser | null>('currentWorker', null);
    setCurrentWorker(worker);
    setIsInitialized(true);
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    if (!email.endsWith('@kgkite.ac.in')) {
      return Promise.reject(new Error("Login restricted to @kgkite.ac.in emails."));
    }
    
    // For prototyping: allow any @kgkite.ac.in email to log in.
    const name = email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    const workerProfile: WorkerUser = {
        name: name,
        email: email,
        role: 'Supervisor', // Assign a default role to allow access to all dashboard features
        avatar: `https://api.dicebear.com/8.x/initials/svg?seed=${name}`,
    };
    
    setCurrentWorker(workerProfile);
    setLocalStorageItem('currentWorker', workerProfile);
    return Promise.resolve();
  };
  
  const logout = () => {
    setCurrentWorker(null);
    if (typeof window !== 'undefined') {
        window.localStorage.removeItem('currentWorker');
    }
    router.push('/worker');
  };
  
  const value = { currentWorker, isInitialized, login, logout, roles: workerRoles };

  return (
    <WorkerAuthContext.Provider value={value}>
      {children}
    </WorkerAuthContext.Provider>
  );
}

export function useWorkerAuth() {
  const context = useContext(WorkerAuthContext);
  if (context === undefined) {
    throw new Error('useWorkerAuth must be used within a WorkerAuthProvider');
  }
  return context;
}
