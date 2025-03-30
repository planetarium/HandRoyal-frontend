import React, { createContext, useContext, useState, useCallback } from 'react';
import { request } from 'graphql-request';
import { GRAPHQL_ENDPOINT, getUserDocument, createUserAction } from '../queries';
import { executeTransaction, waitForTransaction } from '../utils/transaction';
import type { ReactNode } from 'react';
import type { Account, AccountCreator } from '../accounts/Account';

type LoginCallback = (account: Account) => void;
type LogoutCallback = () => void;

export interface AccountCallback {
  onLoggedIn?: LoginCallback;
  onLoggedOut?: LogoutCallback;
}

interface AccountContextType {
  account: Account | null;
  createAccount: (type: string, param?: any) => Promise<Account>;
  addAccountCallback: (callbacks: AccountCallback) => void;
  removeAccountCallback: (callbacks: AccountCallback) => void;
}

const globalCreators: AccountCreator[] = [];
const accountCallbacks: AccountCallback[] = [];

export const registerCreator = (creator: AccountCreator) => {
  if (!globalCreators.some((p) => p.type === creator.type)) {
    globalCreators.push(creator);
  }
};

const checkUser = async (
  address: string,
): Promise<boolean> => {
  const response = await request(GRAPHQL_ENDPOINT, getUserDocument, { 
    address: address 
  });

  if (response?.stateQuery?.getUserData) {
    return true;
  }

  return false;
}

const createUser = async (
  account: Account,
  name: string,
): Promise<void> => {
  const createUserResponse = await request(GRAPHQL_ENDPOINT, createUserAction, {
    name: name
  });
  if (!createUserResponse.actionQuery?.createUser) {
    throw new Error('Failed to create user');
  }

  const plainValue = createUserResponse.actionQuery.createUser;
  const txId = await executeTransaction(account, plainValue);
  await waitForTransaction(txId);
}

const createAccountInternal = async (
  setAccount: (account: Account | null) => void,
  type: string,
  param?: any,
): Promise<Account> => {
  const creator = globalCreators.find((p) => p.type === type);
  if (!creator) {
    throw new Error('Creator not found');
  }

  const account = await creator.create(param);
  const address = account.address.toString();

  try {
    if (!await checkUser(address)) {
      await createUser(account, address);
    }
  } catch (error) {
    account.disconnect();
    console.error('Failed to check user:', error);
    throw error;
  }

  const originalDisconnect = account.disconnect;
  account.disconnect = () => {
    originalDisconnect.call(account);
    account.disconnect = originalDisconnect;
    setAccount(null);
    localStorage.removeItem('account-type');
    accountCallbacks.forEach((callback) => callback.onLoggedOut?.());
  };

  setAccount(account);
  localStorage.setItem('account-type', account.type);
  accountCallbacks.forEach((callback) => callback.onLoggedIn?.(account));
  return account;
};

const restoreAccountInternal = (
  type: string,
  setAccount: (account: Account | null) => void,
): Account => {
  const creator = globalCreators.find((p) => p.type === type);
  if (!creator) {
    throw new Error('Creator not found');
  }

  const account = creator.restore();
  const originalDisconnect = account.disconnect;
  account.disconnect = () => {
    originalDisconnect.call(account);
    account.disconnect = originalDisconnect;
    setAccount(null);
    localStorage.removeItem('account-type');
    accountCallbacks.forEach((callback) => callback.onLoggedOut?.());
  };

  setAccount(account);
  accountCallbacks.forEach((callback) => callback.onLoggedIn?.(account));
  return account;
};

const AccountContext = createContext<AccountContextType | null>(null);

export const AccountProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [account, setAccount] = useState<Account | null>(null);
  const accountType = localStorage.getItem('account-type');
  if (!account && accountType) {
    restoreAccountInternal(accountType, setAccount);
  }

  const createAccount = async (type: string, param?: any) => {
    return await createAccountInternal(setAccount, type, param);
  };

  const addAccountCallback = useCallback(
    (callbacks: AccountCallback) => {
      accountCallbacks.push(callbacks);
    }, []);

  const removeAccountCallback = useCallback((callbacks: AccountCallback) => {
    const index = accountCallbacks.indexOf(callbacks);
    if (index > -1) {
      accountCallbacks.splice(index, 1);
    }
  }, []);

  return (
    <AccountContext.Provider
      value={{
        account,
        createAccount,
        addAccountCallback,
        removeAccountCallback,
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
