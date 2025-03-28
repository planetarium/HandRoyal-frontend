import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { request } from 'graphql-request';
import subscriptionClient from '../subscriptionClient';
import { useAccount, useAccountContext } from './AccountContext';
import { GRAPHQL_ENDPOINT } from '../queries';
import type { ReactNode } from 'react';
import type { Block } from '../types/types';
import type { AccountCallback } from './AccountContext';

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

const NODE_STATUS_QUERY = `
  query NodeStatus2 {
    nodeStatus {
      tip {
        height
        hash
      }
    }
  }
`;

const TIP_STORAGE_KEY = 'tip-storage';
const TipContext = createContext<TipContextType | undefined>(undefined);

const saveTip = (tip: Block | null) => {
  if (tip) {
    localStorage.setItem(TIP_STORAGE_KEY, JSON.stringify(tip));
  } else {
    localStorage.removeItem(TIP_STORAGE_KEY);
  }
};

const loadTip = (): Block | null => {
  const savedTip = localStorage.getItem(TIP_STORAGE_KEY);
  return savedTip ? JSON.parse(savedTip) : null;
};

const getTip = async (queryClient: ReturnType<typeof useQueryClient>): Promise<Block> => {
  const nodeStatus = await queryClient.fetchQuery<{ nodeStatus: { tip: Block } }>({
    queryKey: ['nodeStatus'],
    queryFn: () => request(GRAPHQL_ENDPOINT, NODE_STATUS_QUERY, {}),
  });
  return nodeStatus.nodeStatus.tip;
};

export const TipProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [tip, setTip] = useState<Block | null>(loadTip);
  const queryClient = useQueryClient();
  const account = useAccount();
  const {
    addAccountCallback,
    removeAccountCallback,
  } = useAccountContext();
  const [unsubscribe, setUnsubscribe] = useState<(() => void) | null>();
  const ref = useRef(false);

  useEffect(() => {
    saveTip(tip);
  }, [tip]);

  const handleLogin = useCallback(async () => {
    const subscribe = () => {
      const unsubscribe = subscriptionClient.subscribe(
        {
          query: ON_TIP_CHANGED_SUBSCRIPTION,
          variables: {},
        },
        {
          next: (result) => {
            setTip(result.data?.onTipChanged as Block);
          },
          error: (err) => console.error('error', err),
          complete: () => {},
        },
      );
      setUnsubscribe(() => unsubscribe);
    };
    setTip(await getTip(queryClient));
    subscribe();
  }, [queryClient]);

  const handleLogout = useCallback(() => {
    setTip(null);
    if (unsubscribe) {
      unsubscribe();
    }
    setUnsubscribe(null);
  }, [unsubscribe]);

  const accountCallback = useMemo<AccountCallback>(() => ({
    onLoggedIn: handleLogin,
    onLoggedOut: handleLogout,
  }), [handleLogin, handleLogout]);

  useEffect(() => {
    addAccountCallback(accountCallback);

    return () => {
      removeAccountCallback(accountCallback);
    };
  }, [accountCallback, addAccountCallback, removeAccountCallback]);

  useEffect(() => {
    if (ref.current) return;
    ref.current = true;

    if (account) {
      handleLogin();
    }
  }, [account, handleLogin]);

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
