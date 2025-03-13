import type { Address } from '@planetarium/account';

export interface Account {
  address: Address;
  type: string;
  disconnect: () => void;
  sign(message: string): Promise<string>;
}

export interface AccountCreator {
  type: string;
  create: (param?: any) => Promise<Account>;
  restore: () => Account;
}