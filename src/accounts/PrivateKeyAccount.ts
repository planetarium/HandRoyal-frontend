import { secp256k1 } from 'ethereum-cryptography/secp256k1';
import { keccak256 } from 'ethereum-cryptography/keccak';
import { utf8ToBytes, hexToBytes } from 'ethereum-cryptography/utils';
import { Address, RawPrivateKey } from '@planetarium/account';
import { executeAction } from '../utils/transaction';
import { AccountType, type Account, type AccountCreator } from './Account';
import type { ActionName } from '../types/types';

export class PrivateKeyAccount implements Account {
  privateKey: RawPrivateKey | null = null;
  addressInternal: Address | null = null;

  public get address(): Address {
    if (!this.addressInternal) {
      throw new Error('Account not connected');
    }

    return this.addressInternal;
  }

  public get type(): AccountType {
    return AccountType.RAW;
  }

  public disconnect(): void {
    localStorage.removeItem('private-key-address');
    localStorage.removeItem('private-key');
  }

  public async sign(message: string): Promise<string> {
    try {
      if (!this.privateKey) {
        throw new Error('Private key not connected');
      }

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

  async executeAction(actionName: ActionName, variables?: Record<string, any>): Promise<any> {
    return await executeAction(this, actionName, variables);
  }
}

export class PrivateKeyAccountCreator implements AccountCreator {
  public readonly type = AccountType.RAW;

  public async create(param?: any): Promise<Account> {
    if (typeof param === 'string') {
      const privateKey = RawPrivateKey.fromHex(param);
      const account = new PrivateKeyAccount();
      account.privateKey = privateKey;
      account.addressInternal = await privateKey.getAddress();
      localStorage.setItem('private-key-address', account.addressInternal.toString());
      localStorage.setItem('private-key', param);
      return account;
    }

    throw new Error('Invalid parameter');
  }

  public restore(): Account {
    const address = localStorage.getItem('private-key-address');
    const privateKey = localStorage.getItem('private-key');
    if (!address) {
      throw new Error('No stored private key address');
    }
    if (!privateKey) {
      throw new Error('No stored private key');
    }

    const account = new PrivateKeyAccount();
    account.privateKey = RawPrivateKey.fromHex(privateKey);
    account.addressInternal = Address.fromHex(address, true);
    return account;
  }
}