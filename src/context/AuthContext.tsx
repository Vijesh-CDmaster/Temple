
"use client";

import { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { userProfileData as defaultProfile, UserProfile } from '@/lib/app-data';

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


type AuthContextType = {
  currentUser: UserProfile | null;
  isInitialized: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (data: Partial<UserProfile>) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const router = useRouter();

  // Load initial state from localStorage
  useEffect(() => {
    const user = getLocalStorageItem<UserProfile | null>('currentUser', null);
    setCurrentUser(user);
    
    // Initialize user database if it doesn't exist
    const users = getLocalStorageItem<any[]>('users', []);
    if (users.length === 0) {
        // We add a default user for demonstration purposes.
        // In a real app, the `users` array would start empty.
        const defaultUserWithPassword = { ...defaultProfile, password: "password123" };
        setLocalStorageItem('users', [defaultUserWithPassword]);
    }

    setIsInitialized(true);
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    const users = getLocalStorageItem<(UserProfile & { password?: string })[]>('users', []);
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
      const { password, ...userProfile } = user; // Don't store password in currentUser state
      setCurrentUser(userProfile);
      setLocalStorageItem('currentUser', userProfile);
      return Promise.resolve();
    } else {
      return Promise.reject(new Error("Invalid email or password."));
    }
  };

  const register = async (name: string, email: string, password: string): Promise<void> => {
    const users = getLocalStorageItem<(UserProfile & { password?: string })[]>('users', []);
    if (users.some(u => u.email === email)) {
      return Promise.reject(new Error("An account with this email already exists."));
    }

    const newUser: UserProfile & { password?: string } = {
        ...defaultProfile, // Start with default structure
        name,
        email,
        password,
        avatar: `https://api.dicebear.com/8.x/initials/svg?seed=${name}`, // Generate a simple avatar
    };

    const { password: _, ...userProfile } = newUser;

    users.push(newUser);
    setLocalStorageItem('users', users);
    setCurrentUser(userProfile);
    setLocalStorageItem('currentUser', userProfile);
    return Promise.resolve();
  };
  
  const logout = () => {
    setCurrentUser(null);
    if (typeof window !== 'undefined') {
        window.localStorage.removeItem('currentUser');
    }
    router.push('/login');
  };

  const updateUser = (data: Partial<UserProfile>) => {
    if (currentUser) {
      const updatedUser = { ...currentUser, ...data };
      setCurrentUser(updatedUser);
      setLocalStorageItem('currentUser', updatedUser);
      
      // Also update the user in the main users list
      const users = getLocalStorageItem<(UserProfile & { password?: string })[]>('users', []);
      const userIndex = users.findIndex(u => u.email === currentUser.email);
      if (userIndex !== -1) {
          const existingUser = users[userIndex];
          users[userIndex] = { ...existingUser, ...data };
          setLocalStorageItem('users', users);
      }
    }
  };

  const value = { currentUser, isInitialized, login, register, logout, updateUser };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
