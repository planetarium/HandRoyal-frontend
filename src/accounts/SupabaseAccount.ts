import { Address } from '@planetarium/account';
import { request } from 'graphql-request';
import { supabase, getSupabaseJWT } from '../lib/supabase';
import { GRAPHQL_ENDPOINT } from '../queries';
import { AccountType, type Account, type AccountCreator } from './Account';
import { ActionName } from '../types/types';
import {
  pickUpAction,
  pickUpManyAction,
  registerMatchingAction,
  cancelMatchingAction,
  joinSessionAction,
  submitMoveAction,
  registerGloveAction,
  createSessionAction,
  createUserAction
} from '../queries';

// GraphQL 쿼리 정의
const GET_USER_ADDRESS = `
  query GetUserAddress {
    getUserAddress
  }
`;

// GraphQL 응답 타입 정의
interface GetUserAddressResponse {
  getUserAddress: string;
}

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

  async executeAction<T = any>(actionName: ActionName, variables?: Record<string, any>): Promise<T> {
    const jwt = await getSupabaseJWT();
    if (!jwt) {
      throw new Error('No JWT token available');
    }

    let document;
    switch (actionName) {
      case ActionName.PICK_UP:
        document = pickUpAction;
        break;
      case ActionName.PICK_UP_MANY:
        document = pickUpManyAction;
        break;
      case ActionName.REGISTER_MATCHING:
        document = registerMatchingAction;
        break;
      case ActionName.CANCEL_MATCHING:
        document = cancelMatchingAction;
        break;
      case ActionName.JOIN_SESSION:
        document = joinSessionAction;
        break;
      case ActionName.SUBMIT_MOVE:
        document = submitMoveAction;
        break;
      case ActionName.REGISTER_GLOVE:
        document = registerGloveAction;
        break;
      case ActionName.CREATE_SESSION:
        document = createSessionAction;
        break;
      case ActionName.CREATE_USER:
        document = createUserAction;
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

    return response as T;
  }
}

export class SupabaseAccountCreator implements AccountCreator {
  public readonly type = AccountType.SUPABASE;

  private async fetchUserAddress(): Promise<string> {
    const jwt = await getSupabaseJWT();
    if (!jwt) {
      throw new Error('No JWT token available');
    }

    const response = await request<GetUserAddressResponse>(
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