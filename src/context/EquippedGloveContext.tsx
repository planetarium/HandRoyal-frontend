import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface EquippedGloveContextType {
  equippedGlove: string | null;
  setEquippedGlove: (glove: string | null) => void;
}

const EquippedGloveContext = createContext<EquippedGloveContextType | undefined>(undefined);

export const EquippedGloveProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [equippedGlove, setEquippedGlove] = useState<string | null>(null);

  useEffect(() => {
    if (!equippedGlove) {
      setEquippedGlove('0000000000000000000000000000000000000000');
    }
  }, [equippedGlove]);

  return (
    <EquippedGloveContext.Provider value={{ equippedGlove, setEquippedGlove }}>
      {children}
    </EquippedGloveContext.Provider>
  );
};

export const useEquippedGlove = (): EquippedGloveContextType => {
  const context = useContext(EquippedGloveContext);
  if (!context) {
    throw new Error('useEquippedGlove must be used within an EquippedGloveProvider');
  }
  return context;
};