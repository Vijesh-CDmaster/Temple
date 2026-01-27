"use client";

import { createContext, useState, useContext, ReactNode } from 'react';

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
