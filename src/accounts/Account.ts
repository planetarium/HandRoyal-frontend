import type { Address } from '@planetarium/account';

export interface Account {
  get address(): Address;
  get type(): string;
  disconnect: () => void;
  sign(message: string): Promise<string>;
}

export interface AccountCreator {
  type: string;
  create: (param?: any) => Promise<Account>;
  restore: () => Account;
}