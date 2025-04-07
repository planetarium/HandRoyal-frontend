import { Address } from '@planetarium/account';
import { request } from 'graphql-request';
import { supabase, getSupabaseJWT } from '../lib/supabase';
import { GRAPHQL_ENDPOINT } from '../queries';
import { executeTransaction, waitForTransaction } from '../utils/transaction';
import type { Account, AccountCreator } from './Account';

// GraphQL 쿼리 정의
const GET_USER_ADDRESS = `
  query GetUserAddress {
    getUserAddress
  }
`;

class SupabaseAccount implements Account {
  constructor(
    public readonly address: Address,
    public readonly type: string,
    private readonly userId: string
  ) {}

  disconnect(): void {
    supabase.auth.signOut();
    localStorage.removeItem('supabase-user-id');
    localStorage.removeItem('supabase-address');
  }

  async sign(message: string): Promise<string> {
    // Supabase 계정의 경우 서명은 백엔드에서 처리
    return this.userId;
  }

  async executeAction<T = any>(mutation: string, actionName: string, variables?: Record<string, any>): Promise<T> {
    const jwt = await getSupabaseJWT();
    if (!jwt) {
      throw new Error('No JWT token available');
    }

    const response = await request<Record<string, any>>(
      GRAPHQL_ENDPOINT,
      mutation,
      variables,
      {
        Authorization: `Bearer ${jwt}`
      }
    );

    if (response[actionName]) {
      const { transaction } = response[actionName];
      if (transaction) {
        const txId = await executeTransaction(transaction, this.address.toString());
        await waitForTransaction(txId);
        return { ...response[actionName], txId };
      }
    }

    return response[actionName];
  }
}

export class SupabaseAccountCreator implements AccountCreator {
  public readonly type = 'supabase';

  private async fetchUserAddress(): Promise<string> {
    const jwt = await getSupabaseJWT();
    if (!jwt) {
      throw new Error('No JWT token available');
    }

    const response = await request<{ getUserAddress: string }>(
      GRAPHQL_ENDPOINT,
      GET_USER_ADDRESS,
      {},
      {
        Authorization: `Bearer ${jwt}`
      }
    );

    if (!response?.getUserAddress) {
      throw new Error('Failed to get user address');
    }

    return response.getUserAddress;
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
    
    return new SupabaseAccount(address, this.type, user.id);
  }

  restore(): Account {
    const userId = localStorage.getItem('supabase-user-id');
    const addressHex = localStorage.getItem('supabase-address');
    
    if (!userId || !addressHex) {
      throw new Error('No stored Supabase user data');
    }

    const address = Address.fromHex(addressHex);
    return new SupabaseAccount(address, this.type, userId);
  }
} 