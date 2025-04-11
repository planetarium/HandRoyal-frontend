import { Address } from '@planetarium/account';
import { request } from 'graphql-request';
import { supabase, getSupabaseJWT } from '../lib/supabase';
import { AccountType, type Account, type AccountCreator } from './Account';
import { ActionName } from '../types/types';
import { waitForTransaction } from '../utils/transaction';
import {
  GRAPHQL_ENDPOINT,
  pickUpByWallet,
  pickUpManyByWallet,
  registerMatchingByWallet,
  cancelMatchingByWallet,
  joinSessionByWallet,
  submitMoveByWallet,
  registerGloveByWallet,
  createSessionByWallet,
  createUserByWallet,
  getUserAddress,
  refillActionPointByWallet
} from '../queries';

class SupabaseAccount implements Account {
  constructor(
    public readonly address: Address,
    private readonly userId: string
  ) {}

  public get type(): AccountType {
    return AccountType.SUPABASE;
  }

  disconnect(): void {
    supabase.auth.signOut();
    localStorage.removeItem('supabase-user-id');
    localStorage.removeItem('supabase-address');
  }

  async sign(message: string): Promise<string> {
    // Supabase 계정의 경우 서명은 백엔드에서 처리
    return this.userId;
  }

  async executeAction(actionName: ActionName, variables?: Record<string, any>): Promise<any> {
    const jwt = await getSupabaseJWT();
    if (!jwt) {
      throw new Error('No JWT token available');
    }

    let document;
    switch (actionName) {
      case ActionName.PICK_UP:
        document = pickUpByWallet;
        break;
      case ActionName.PICK_UP_MANY:
        document = pickUpManyByWallet;
        break;
      case ActionName.REGISTER_MATCHING:
        document = registerMatchingByWallet;
        break;
      case ActionName.CANCEL_MATCHING:
        document = cancelMatchingByWallet;
        break;
      case ActionName.JOIN_SESSION:
        document = joinSessionByWallet;
        break;
      case ActionName.SUBMIT_MOVE:
        document = submitMoveByWallet;
        break;
      case ActionName.REGISTER_GLOVE:
        document = registerGloveByWallet;
        break;
      case ActionName.CREATE_SESSION:
        document = createSessionByWallet;
        break;
      case ActionName.CREATE_USER:
        document = createUserByWallet;
        break;
      case ActionName.REFILL_ACTION_POINT:
        document = refillActionPointByWallet;
        break;
      default:
        throw new Error(`Unknown action: ${actionName}`);
    }

    const response = await request<Record<string, any>>(
      GRAPHQL_ENDPOINT,
      document,
      variables,
      {
        Authorization: `Bearer ${jwt}`
      }
    );
    
    const txId = response?.[actionName + 'ByWallet'];
    await waitForTransaction(txId);
    return txId;
  }
}

export class SupabaseAccountCreator implements AccountCreator {
  public readonly type = AccountType.SUPABASE;

  private async fetchUserAddress(): Promise<string> {
    const jwt = await getSupabaseJWT();
    if (!jwt) {
      throw new Error('No JWT token available');
    }

    const response = await request(
      GRAPHQL_ENDPOINT,
      getUserAddress,
      {},
      {
        Authorization: `Bearer ${jwt}`
      }
    );


    if (response === undefined || response?.getUserAddress === "0x0000000000000000000000000000000000000000") {
      throw new Error('Failed to get user address');
    }

    return response?.getUserAddress as string;
  }

  async create(userId: string): Promise<Account> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // 백엔드에서 address 가져오기
    const addressHex = await this.fetchUserAddress();
    const address = Address.fromHex(addressHex);
    
    // 사용자 ID와 address 저장
    localStorage.setItem('supabase-user-id', user.id);
    localStorage.setItem('supabase-address', addressHex);
    
    return new SupabaseAccount(address, user.id);
  }

  restore(): Account {
    const userId = localStorage.getItem('supabase-user-id');
    const addressHex = localStorage.getItem('supabase-address');
    
    if (!userId || !addressHex) {
      throw new Error('No stored Supabase user data');
    }

    const address = Address.fromHex(addressHex);
    return new SupabaseAccount(address, userId);
  }
} 