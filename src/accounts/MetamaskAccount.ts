import { Address } from '@planetarium/account';
import type { Account, AccountCreator } from './Account';

export class MetamaskAccount implements Account {
  addressInternal: Address | null = null;

  public get address(): Address {
    if (!this.addressInternal) {
      throw new Error('Account not connected');
    }

    return this.addressInternal;
  }

  public get isConnected(): boolean {
    return !!this.addressInternal;
  }

  public disconnect() {
    this.addressInternal = null;
  }

  public async sign(message: string): Promise<string> {
    if (!this.addressInternal) {
      throw new Error('Account not connected');
    }

    if (!window.ethereum) {
      throw new Error('Metamask is not installed');
    }

    try {
      const signature = await window.ethereum.request({
        method: 'personal_sign',
        params: [message, this.addressInternal.toString()]
      });

      return signature.startsWith("0x") ? signature.slice(2) : signature;
    } catch (error) {
      console.error('Failed to sign message with Metamask:', error);
      throw error;
    }
  }

  public get type(): string {
    return 'metamask';
  }
}

export class MetamaskAccountCreator implements AccountCreator {
  public type = 'metamask';

  public async create(): Promise<Account> {
    if (!window.ethereum) {
      throw new Error('Metamask is not installed');
    }

    try {
      // Metamask 지갑 연결 요청
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found');
      }

      const address = Address.fromHex(accounts[0], true);
      const account = new MetamaskAccount();
      account.addressInternal = address;
      localStorage.setItem('account-type-address', address.toString());
      return account;
    } catch (error) {
      console.error('Failed to connect to Metamask:', error);
      throw error;
    }
  }

  public restore(): Account {
    const address = localStorage.getItem('account-type-address');
    if (!address) {
      throw new Error('No address found');
    }

    const account = new MetamaskAccount();
    account.addressInternal = Address.fromHex(address, true);
    return account;
  }
}
