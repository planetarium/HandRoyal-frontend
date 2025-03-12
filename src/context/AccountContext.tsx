import React, { createContext, useContext, useState } from 'react';
import { secp256k1 } from 'ethereum-cryptography/secp256k1';
import { keccak256 } from 'ethereum-cryptography/keccak';
import { utf8ToBytes, hexToBytes } from 'ethereum-cryptography/utils';
import { Address } from '@planetarium/account';
import type { RawPrivateKey } from '@planetarium/account';
import type { ReactNode } from 'react';

export interface IAccount {
  get address(): Address;
  disconnect: () => void;
  sign(message: string): Promise<string>;
}

export class PrivateKeyAccount implements IAccount {
  privateKey: RawPrivateKey;
  addressInternal: Address | null = null;

  constructor(privateKey: RawPrivateKey) {
    this.privateKey = privateKey;
  }

  public get address(): Address {
    if (!this.addressInternal) {
      throw new Error('Account not connected');
    }

    return this.addressInternal;
  }

  public get isConnected(): boolean {
    return !!this.addressInternal;
  }

  public async connect(): Promise<void> {
    if (this.addressInternal) {
      throw new Error('Account already connected');
    }

    this.addressInternal = await this.privateKey.getAddress();
  }

  public disconnect() {
    if (!this.address) {
      throw new Error('Account not connected');
    }

    this.addressInternal = null;
  }

  public async sign(message: string): Promise<string> {
    try {     
      const messageBytes = hexToBytes(message);
      const prefix = utf8ToBytes("\x19Ethereum Signed Message:\n" + messageBytes.length);
      const prefixedMessage = Uint8Array.from([...Array.from(prefix), ...Array.from(messageBytes)]);
      const messageHash = keccak256(prefixedMessage);
      const privateKeyBytes = this.privateKey.toBytes();
      const signature = secp256k1.sign(messageHash, privateKeyBytes);
      
      const r = signature.r.toString(16).padStart(64, '0');
      const s = signature.s.toString(16).padStart(64, '0');
      const v = (signature.recovery + 27).toString(16).padStart(2, '0');
      return r + s + v;
    } catch (error) {
      console.error('Failed to sign message:', error);
      throw new Error('Failed to sign message');
    }
  }
}

export class MetamaskAccount implements IAccount {
  addressInternal: Address | null = null;

  public async connect(): Promise<void> {
    if (this.addressInternal) {
      throw new Error('Account already connected');
    }

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

      // 첫 번째 계정 주소를 저장
      this.addressInternal = Address.fromHex(accounts[0], true);
    } catch (error) {
      console.error('Failed to connect to Metamask:', error);
      throw error;
    }
  }

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
}

interface AccountContextType {
  account: IAccount | null;
  setAccount: (account: IAccount) => void;
}

const AccountContext = createContext<AccountContextType | null>(null);

export const AccountProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [account, setAccountInternal] = useState<IAccount | null>(null);

  const setAccount = (newAccount: IAccount) => {
    const originalDisconnect = newAccount.disconnect;
    newAccount.disconnect = () => {
      originalDisconnect.call(newAccount);
      newAccount.disconnect = originalDisconnect;
      setAccountInternal(null);
    };

    setAccountInternal(newAccount);
  };

  return (
    <AccountContext.Provider value={{ 
      account,
      setAccount
    }}>
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

export const useAccount = (): IAccount | null => {
  const { account } = useAccountContext();
  return account;
};

export const useRequiredAccount = (): IAccount => {
  const { account } = useAccountContext();
  if (!account) {
    throw new Error('Account is not connected');
  }
  return account;
};