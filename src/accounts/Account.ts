import type { ActionName } from '../types/types';
import type { Address } from '@planetarium/account';

export enum AccountType {
  RAW = 'raw',
  METAMASK = 'metamask',
  SUPABASE = 'supabase'
}

export interface Account {
  readonly address: Address;
  readonly type: AccountType;
  disconnect(): void;
  sign(message: string): Promise<string>;
  executeAction(actionName: ActionName, variables?: Record<string, any>): Promise<any>;
}

export interface AccountCreator {
  type: AccountType;
  create(param?: any): Promise<Account>;
  restore(): Account;
}
