
"use client";

import { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { userProfileData as defaultProfile, UserProfile } from '@/lib/app-data';

type ProfileContextType = {
  profile: UserProfile | null;
  setProfile: (profile: UserProfile) => void;
};

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from localStorage on initial client-side render
  useEffect(() => {
    try {
      const item = window.localStorage.getItem('userProfile');
      if (item) {
        setProfile(JSON.parse(item));
      } else {
        // Initialize with default if nothing in localStorage
        setProfile(defaultProfile);
      }
    } catch (error) {
      console.error("Error reading profile from localStorage", error);
      setProfile(defaultProfile);
    }
    setIsInitialized(true);
  }, []);

  // Save to localStorage when profile changes
  useEffect(() => {
    if (isInitialized && profile) {
      window.localStorage.setItem('userProfile', JSON.stringify(profile));
    }
  }, [profile, isInitialized]);
  
  const value = { profile, setProfile: (newProfile: UserProfile) => setProfile(newProfile) };

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
}
