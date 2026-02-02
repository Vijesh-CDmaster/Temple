
"use client";

import { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { workerRoles, workerRoleGroups } from '@/lib/app-data';


export type WorkerUser = {
  name: string;
  email: string;
  role: string;
  roleGroup: string;
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
  register: (name: string, email: string, password: string, role: string, roleGroup: string) => Promise<void>;
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

    // Initialize workers database if it doesn't exist
    getLocalStorageItem<any[]>('workers', []);

    setIsInitialized(true);
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    const workers = getLocalStorageItem<(WorkerUser & { password?: string })[]>('workers', []);
    const worker = workers.find(w => w.email === email && w.password === password);

    if (worker) {
        // Found a registered worker
        const { password, ...workerProfile } = worker;
        setCurrentWorker(workerProfile);
        setLocalStorageItem('currentWorker', workerProfile);
        return Promise.resolve();
    } 
    
    // Worker not found, try fallback for prototyping if email is valid
    if (email.endsWith('@kgkite.ac.in')) {
        const name = email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        const workerProfile: WorkerUser = {
            name: name,
            email: email,
            role: 'Parking Supervisors', // A default supervisor role
            roleGroup: 'Parking Control & Traffic Flow', // The group for that role
            avatar: `https://api.dicebear.com/8.x/initials/svg?seed=${name}`,
        };
        
        setCurrentWorker(workerProfile);
        setLocalStorageItem('currentWorker', workerProfile);
        return Promise.resolve();
    }
    
    return Promise.reject(new Error("Invalid credentials."));
  };

  const register = async (name: string, email: string, password: string, role: string, roleGroup: string): Promise<void> => {
    const workers = getLocalStorageItem<(WorkerUser & { password?: string })[]>('workers', []);
    if (workers.some(w => w.email === email)) {
      return Promise.reject(new Error("A worker with this email already exists."));
    }

    const newWorker: WorkerUser & { password?: string } = {
        name,
        email,
        password,
        role,
        roleGroup,
        avatar: `https://api.dicebear.com/8.x/initials/svg?seed=${name}`,
    };

    const { password: _, ...workerProfile } = newWorker;

    workers.push(newWorker);
    setLocalStorageItem('workers', workers);
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
  
  const value = { currentWorker, isInitialized, login, register, logout, roles: workerRoles };

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
