import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { request } from 'graphql-request';
import { GRAPHQL_ENDPOINT, getUserDocument } from '../queries';
import { PrivateKeyAccountCreator } from '../accounts/PrivateKeyAccount';
import { MetamaskAccountCreator } from '../accounts/MetamaskAccount';
import { SupabaseAccountCreator } from '../accounts/SupabaseAccount';
import { executeAction } from '../utils/transaction';
import { ActionName } from '../types/types';
import type { AccountType } from '../accounts/Account';
import type { Account, AccountCreator } from '../accounts/Account';
import type { ReactNode } from 'react';

type LoginCallback = (account: Account) => void;
type LogoutCallback = () => void;

export interface AccountCallback {
  onLoggedIn?: LoginCallback;
  onLoggedOut?: LogoutCallback;
}

interface AccountContextType {
  account: Account | null;
  createAccount: (type: AccountType, param?: any) => Promise<Account>;
  addAccountCallback: (callbacks: AccountCallback) => void;
  removeAccountCallback: (callbacks: AccountCallback) => void;
  creators: AccountCreator[];
}

const AccountContext = createContext<AccountContextType | null>(null);

export const AccountProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [account, setAccount] = useState<Account | null>(null);
  const [creators, setCreators] = useState<AccountCreator[]>([]);
  const [callbacks] = useState<AccountCallback[]>([]);

  useEffect(() => {
    if (creators.length > 0) return;

    const newCreators = [
      new PrivateKeyAccountCreator(),
      new MetamaskAccountCreator(),
      new SupabaseAccountCreator(),
    ];

    setCreators(newCreators);
  }, [creators]);

  useEffect(() => {
    if (creators.length === 0) return;
    if (account) return;

    const restoreAccounts = async () => {
      for (const creator of creators) {
        try {
          const restoredAccount = await creator.restore();
          if (restoredAccount) {
            const originalDisconnect = restoredAccount.disconnect;
            restoredAccount.disconnect = () => {
              originalDisconnect.call(restoredAccount);
              restoredAccount.disconnect = originalDisconnect;
              setAccount(null);
              callbacks.forEach((callback) => callback.onLoggedOut?.());
            };

            setAccount(restoredAccount);
            callbacks.forEach((callback) => callback.onLoggedIn?.(restoredAccount));
            break;
          }
        } catch (error) {
          if (error instanceof Error && (
            (creator.type === 'raw' && error.message === 'No stored private key address') ||
            (creator.type === 'metamask' && error.message === 'No address found') ||
            (creator.type === 'supabase' && error.message === 'No stored Supabase user data')
          )) {
            continue;
          }
          console.error(`Failed to restore account with creator ${creator.type}:`, error);
        }
      }
    };

    restoreAccounts();
  }, [creators, account]);

  const checkUser = async (address: string): Promise<boolean> => {
    const response = await request(GRAPHQL_ENDPOINT, getUserDocument, { 
      address: address 
    });
    return !!response?.stateQuery?.getUserData;
  };

  const createUser = async (account: Account, name: string): Promise<void> => {
    await executeAction(account, ActionName.CREATE_USER, {
      name: name
    });
  };

  const createAccount = async (type: AccountType, param?: any): Promise<Account> => {
    const creator = creators.find((p) => p.type === type);
    if (!creator) {
      throw new Error('Creator not found');
    }

    const newAccount = await creator.create(param);
    const address = newAccount.address.toString();

    try {
      if (!await checkUser(address)) {
        await createUser(newAccount, address);
      }
    } catch (error) {
      newAccount.disconnect();
      console.error('Failed to check user:', error);
      throw error;
    }

    const originalDisconnect = newAccount.disconnect;
    newAccount.disconnect = () => {
      originalDisconnect.call(newAccount);
      newAccount.disconnect = originalDisconnect;
      setAccount(null);
      callbacks.forEach((callback) => callback.onLoggedOut?.());
    };

    setAccount(newAccount);
    callbacks.forEach((callback) => callback.onLoggedIn?.(newAccount));
    return newAccount;
  };

  const addAccountCallback = useCallback((callback: AccountCallback) => {
    callbacks.push(callback);
  }, []);

  const removeAccountCallback = useCallback((callback: AccountCallback) => {
    const index = callbacks.indexOf(callback);
    if (index > -1) {
      callbacks.splice(index, 1);
    }
  }, []);

  return (
    <AccountContext.Provider
      value={{
        account,
        createAccount,
        addAccountCallback,
        removeAccountCallback,
        creators,
      }}
    >
      {children}
    </AccountContext.Provider>
  );
};

export const useAccountContext = () => {
  const context = useContext(AccountContext);
  if (!context) {
    throw new Error('useAccount must be used within an AccountProvider');
  }
  return context;
};

export const useAccount = (): Account | null => {
  const { account } = useAccountContext();
  return account;
};

export const useRequiredAccount = (): Account => {
  const { account } = useAccountContext();
  if (!account) {
    throw new Error('Account is not connected');
  }
  return account;
};

export const useRegisterCreator = () => {
  const context = useContext(AccountContext);
  if (!context) {
    throw new Error('useRegisterCreator must be used within an AccountProvider');
  }
  const { creators } = context;
  return (creator: AccountCreator) => {
    if (!creators.some((p: AccountCreator) => p.type === creator.type)) {
      creators.push(creator);
    }
  };
};
