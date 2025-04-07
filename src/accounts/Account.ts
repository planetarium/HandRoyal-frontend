import type { Address } from '@planetarium/account';

export interface Account {
  address: Address;
  type: string;
  disconnect(): void;
  sign(message: string): Promise<string>;
  executeAction<T = any>(mutation: string, actionName: string, variables?: Record<string, any>): Promise<T>;
}

export interface AccountCreator {
  type: string;
  create(param?: any): Promise<Account>;
  restore(): Account;
}