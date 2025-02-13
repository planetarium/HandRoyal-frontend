import React, { createContext, useContext, useState } from 'react';
import useSubscription from '../useSubscription';
import type { ReactNode } from 'react';
import type { Block } from '../types/types';

interface TipContextType {
  tip: Block | null;
  setTip: (block: Block) => void;
}

const ON_TIP_CHANGED_SUBSCRIPTION = `
  subscription OnTipChanged {
    onTipChanged {
      height
      hash
    }
  }
`;

const TipContext = createContext<TipContextType | undefined>(undefined);

export const TipProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tip, setTip] = useState<Block | null>(null);

  useSubscription(ON_TIP_CHANGED_SUBSCRIPTION, {}, (newData) => {
    if (newData?.onTipChanged) {
      setTip({index: newData?.onTipChanged?.height, hash: newData?.onTipChanged?.hash}); // 기존 메시지에 추가
    }
  });

  return (
    <TipContext.Provider value={{ tip, setTip }}>
      {children}
    </TipContext.Provider>
  );
};

export const useTip = (): TipContextType => {
  const context = useContext(TipContext);
  if (!context) {
    throw new Error('useAccount must be used within an AccountProvider');
  }
  return context;
}; 