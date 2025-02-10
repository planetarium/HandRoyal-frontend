import React, { createContext, useContext, useState } from 'react';
import type {  RawPrivateKey } from '@planetarium/account';
import type { ReactNode } from 'react';

interface AccountContextType {
  privateKey: RawPrivateKey | null;
  setPrivateKey: (privateKey: RawPrivateKey | null) => void;
}

const AccountContext = createContext<AccountContextType | undefined>(undefined);

export const AccountProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [privateKey, setPrivateKey] = useState<RawPrivateKey | null>(null);

  return (
    <AccountContext.Provider value={{ privateKey, setPrivateKey }}>
      {children}
    </AccountContext.Provider>
  );
};

export const useAccount = (): AccountContextType => {
  const context = useContext(AccountContext);
  if (!context) {
    throw new Error('useAccount must be used within an AccountProvider');
  }
  return context;
}; 