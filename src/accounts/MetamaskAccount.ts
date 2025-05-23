import { Address } from '@planetarium/account';
import { AccountType, type Account, type AccountCreator } from './Account';
import { executeAction } from '../utils/transaction';
import type { ActionName } from '../types/types';

type Ethereum = NonNullable<typeof window.ethereum>;

export const RPC_URL = import.meta.env.VITE_CHAIN_RPC_URL;
const HAND_ROYAL_CHAIN_ID = import.meta.env.VITE_CHAIN_ID;
const HAND_ROYAL_CHAIN_CONFIG = {
  chainId: HAND_ROYAL_CHAIN_ID,
  chainName: import.meta.env.VITE_CHAIN_NAME,
  rpcUrls: [
    RPC_URL + "/rpc/"
  ],
  iconUrls: [
    RPC_URL + "/logo.png"
  ],
  nativeCurrency: {
    name: "NCG",
    symbol: "NCG",
    decimals: 18
  },
  blockExplorerUrls: [
    "https://9cscan.com/"
  ]
} as const;

async function ensureCorrectChain(ethereum: Ethereum): Promise<void> {
  if (!(await isCorrectChain(ethereum))) {
    try {
      await switchChain(ethereum);
    } catch (error) {
      if (typeof error === 'object' && error !== null && 'code' in error && error.code === 4902) {
        await registerChain(ethereum);
      } else {
        throw error;
      }
    }
  }
}

async function isCorrectChain(ethereum: Ethereum): Promise<boolean> {
  const chainId = await ethereum.request({
    method: 'eth_chainId'
  });

  return chainId === HAND_ROYAL_CHAIN_ID;
}

async function registerChain(ethereum: Ethereum) {
  try {
    await ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [HAND_ROYAL_CHAIN_CONFIG]
    })
  } catch (error) {
    console.error('Failed to register chain:', error);
    throw error;
  }
}

async function switchChain(ethereum: Ethereum) {
  try {
    await ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: "0xAA36A7" }]
    });
  } catch (error) {
    console.error('Failed to switch chain:', error);
    throw error;
  }
}

async function signMessage(ethereum: Ethereum, message: string, address: Address): Promise<string> {
  try {
    const signature = await ethereum.request({
      method: 'personal_sign',
      params: [message, address.toString()]
    });

    return signature.startsWith("0x") ? signature.slice(2) : signature;
  } catch (error) {
    console.error('Failed to sign message with Metamask:', error);
    throw error;
  }
}

async function requestAccounts(ethereum: Ethereum): Promise<Address> {
  try {
    const response = await ethereum.request({
      method: 'eth_requestAccounts'
    });
    const accounts = response as unknown as string[];

    if (!accounts || accounts.length === 0) {
      throw new Error('No accounts found');
    }

    return Address.fromHex(accounts[0], true);
  } catch (error) {
    console.error('Failed to request accounts:', error);
    throw error;
  }
}

export class MetamaskAccount implements Account {
  public readonly address: Address;
  public readonly type: AccountType = AccountType.METAMASK;
  private connected: boolean;

  constructor(address: Address) {
    this.address = address;
    this.connected = true;
  }

  public disconnect() {
    this.connected = false;
    localStorage.removeItem('account-type-address');
  }

  public async sign(message: string): Promise<string> {
    if (!this.connected) {
      throw new Error('Account not connected');
    }

    const ethereum = window.ethereum;
    if (!ethereum) {
      throw new Error('Metamask is not installed');
    }

    await ensureCorrectChain(ethereum);
    return signMessage(ethereum, message, this.address);
  }

  async executeAction(actionName: ActionName, variables?: Record<string, any>): Promise<any> {
    return await executeAction(this, actionName, variables);
  }
}

export class MetamaskAccountCreator implements AccountCreator {
  public readonly type = AccountType.METAMASK;

  public async create(): Promise<Account> {
    const ethereum = window.ethereum;
    if (!ethereum) {
      throw new Error('Metamask is not installed');
    }

    try {
      await ensureCorrectChain(ethereum);
      const address = await requestAccounts(ethereum);
      localStorage.setItem('account-type-address', address.toString());
      return new MetamaskAccount(address);
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

    return new MetamaskAccount(Address.fromHex(address, true));
  }
}

