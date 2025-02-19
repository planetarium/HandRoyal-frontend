import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Address, RawPrivateKey } from '@planetarium/account';
import type { ReactNode } from 'react';

interface AccountContextType {
  privateKey: RawPrivateKey | null;
  address: Address | null;
  setPrivateKey: (privateKey: RawPrivateKey | null) => void;
}

const AccountContext = createContext<AccountContextType | undefined>(undefined);

export const AccountProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [privateKey, setPrivateKey] = useState<RawPrivateKey | null>(null);
  const [address, setAddress] = useState<Address | null>(null);

  useEffect(() => {
    const fetchAddress = async () => {
      if (privateKey) {
        try {
          const address = await privateKey.getAddress();
          setAddress(address);
        } catch (error) {
          console.error('Failed to get address:', error);
        }
      }
    };

    fetchAddress();
  }, [privateKey]);

  return (
    <AccountContext.Provider value={{ privateKey, address, setPrivateKey }}>
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