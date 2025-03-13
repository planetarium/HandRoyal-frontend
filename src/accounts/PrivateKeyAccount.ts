import { secp256k1 } from 'ethereum-cryptography/secp256k1';
import { keccak256 } from 'ethereum-cryptography/keccak';
import { utf8ToBytes, hexToBytes } from 'ethereum-cryptography/utils';
import { Address, RawPrivateKey } from '@planetarium/account';
import type { Account, AccountCreator } from './Account';

export class PrivateKeyAccount implements Account {
  privateKey: RawPrivateKey | null = null;
  addressInternal: Address | null = null;

  public get address(): Address {
    if (!this.addressInternal) {
      throw new Error('Account not connected');
    }

    return this.addressInternal;
  }

  public get type(): string {
    return 'raw';
  }

  public disconnect() {
    if (!this.address) {
      throw new Error('Account not connected');
    }

    this.addressInternal = null;
    localStorage.removeItem('account-type-param');
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
}

export class PrivateKeyAccountCreator implements AccountCreator {
  public type = 'raw';

  public async create(param?: any): Promise<Account> {
    if (typeof param === 'string') {
      const privateKey = RawPrivateKey.fromHex(param);
      const account = new PrivateKeyAccount();
      account.privateKey = privateKey;
      account.addressInternal = await privateKey.getAddress();
      localStorage.setItem('account-type-key', param);
      localStorage.setItem('account-type-address', account.addressInternal.toString());
      return account;
    }

    throw new Error('Invalid parameter');
  }

  public restore(): Account {
    const key = localStorage.getItem('account-type-key');
    const address = localStorage.getItem('account-type-address');
    if (!key || !address) {
      throw new Error('No parameter found');
    }

    const account = new PrivateKeyAccount();
    account.privateKey = RawPrivateKey.fromHex(key);
    account.addressInternal = Address.fromHex(address, true);
    return account;
  }
}