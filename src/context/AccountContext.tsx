import React, { createContext, useContext, useState } from 'react';
import type { Account, AccountCreator } from '../accounts/Account';
import type { ReactNode } from 'react';

interface AccountContextType {
  account: Account | null;
  createAccount: (type: string, param?: any) => Promise<Account>;
}

const globalCreators: AccountCreator[] = [];

export const registerCreator = (creator: AccountCreator) => {
  if (!globalCreators.some((p) => p.type === creator.type)) {
    globalCreators.push(creator);
  }
};

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
  const originalDisconnect = account.disconnect;
  account.disconnect = () => {
    originalDisconnect.call(account);
    account.disconnect = originalDisconnect;
    setAccount(null);
    localStorage.removeItem('account-type');
  };

  setAccount(account);
  localStorage.setItem('account-type', account.type);
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
  };

  setAccount(account);
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

  return (
    <AccountContext.Provider
      value={{
        account,
        createAccount,
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
