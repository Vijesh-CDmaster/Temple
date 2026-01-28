"use client";

import { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { workerRoles, WorkerRole } from '@/lib/app-data';

type WorkerContextType = {
  worker: WorkerRole | null;
  setWorker: (worker: WorkerRole | null) => void;
  roles: WorkerRole[];
};

const WorkerContext = createContext<WorkerContextType | undefined>(undefined);

export function WorkerProvider({ children }: { children: ReactNode }) {
  const [worker, setWorker] = useState<WorkerRole | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from localStorage on initial client-side render
  useEffect(() => {
    try {
      const item = window.localStorage.getItem('workerRole');
      if (item) {
        setWorker(JSON.parse(item));
      }
    } catch (error) {
      console.error("Error reading worker from localStorage", error);
    }
    setIsInitialized(true);
  }, []);

  // Save to localStorage when worker changes
  useEffect(() => {
    if (isInitialized) {
      if (worker) {
        window.localStorage.setItem('workerRole', JSON.stringify(worker));
      } else {
        window.localStorage.removeItem('workerRole');
      }
    }
  }, [worker, isInitialized]);
  
  const value = { worker, setWorker, roles: workerRoles };

  return (
    <WorkerContext.Provider value={value}>
      {children}
    </WorkerContext.Provider>
  );
}

export function useWorker() {
  const context = useContext(WorkerContext);
  if (context === undefined) {
    throw new Error('useWorker must be used within a WorkerProvider');
  }
  return context;
}
