"use client";

import { createContext, useState, useContext, ReactNode } from 'react';

export type Token = {
  temple: string;
  date: string;
  timeSlot: string;
  pilgrims: string;
  tokenId: string;
  gate: string;
};

type TokenContextType = {
  activeToken: Token | null;
  setActiveToken: (token: Token | null) => void;
};

const TokenContext = createContext<TokenContextType | undefined>(undefined);

export function TokenProvider({ children }: { children: ReactNode }) {
  const [activeToken, setActiveToken] = useState<Token | null>(null);

  return (
    <TokenContext.Provider value={{ activeToken, setActiveToken }}>
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
