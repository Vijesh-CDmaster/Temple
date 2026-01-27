"use client";

import { createContext, useState, useContext, ReactNode, useEffect } from 'react';

export type Pilgrim = {
    name: string;
    age: number;
    phone: string;
    isDifferentlyAbled: boolean;
};

export type Token = {
  tokenId: string;
  temple: string;
  date: string;
  timeSlot: string;
  gate: string;
  pilgrim: Pilgrim;
};

type TokenContextType = {
  activeTokens: Token[];
  setActiveTokens: (tokens: Token[]) => void;
};

const TokenContext = createContext<TokenContextType | undefined>(undefined);

export function TokenProvider({ children }: { children: ReactNode }) {
  const [activeTokens, setActiveTokens] = useState<Token[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from localStorage on initial client-side render
  useEffect(() => {
    try {
      const item = window.localStorage.getItem('activeTokens');
      if (item) {
        setActiveTokens(JSON.parse(item));
      }
    } catch (error) {
      console.error("Error reading from localStorage", error);
    }
    setIsInitialized(true);
  }, []);

  // Save to localStorage when tokens change, but only after initialization
  useEffect(() => {
    if (isInitialized) {
      window.localStorage.setItem('activeTokens', JSON.stringify(activeTokens));
    }
  }, [activeTokens, isInitialized]);

  return (
    <TokenContext.Provider value={{ activeTokens, setActiveTokens }}>
      {children}
    </TokenContext.Provider>
  );
}

export function useToken() {
  const context = useContext(TokenContext);
  if (context === undefined) {
    throw new Error('useToken must be used within a TokenProvider');
  }
  return context;
}
