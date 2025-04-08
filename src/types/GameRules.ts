import { type Account } from "../accounts/Account";
import { ActionName } from './types';

export interface GameRule {
  type: GameRuleType;
  users: string[];
  readonly maximumUsers: number;

  CreateSession(account: Account, sessionId: string, prize: string): Promise<void>;
}

export class CustomGameRule implements GameRule {
  public readonly type: GameRuleType = 'custom';
  public users: string[] = [];
  private _maximumUser: number = 8;
  public minimumPlayers: number = 2;
  public remainingUsers: number = 1;
  public startAfter: number = 10;
  public maxRounds: number = 5;
  public roundLength: number = 5;
  public roundInterval: number = 5;
  public initialHealthPoint: number = 100;

  public get maximumUsers(): number {
    return this._maximumUser;
  }

  public set maximumUsers(value: number) {
    this._maximumUser = value;
  }

  async CreateSession(account: Account, sessionId: string, prize: string): Promise<void> {
    if (this.users.length > 0) {
      if (this.users.length !== this.maximumUsers) {
        throw new Error(`Private session requires exactly ${this.maximumUsers} participants. Currently have ${this.users.length}.`);
      }

      if (Array.from(new Set(this.users)).length !== this.users.length) {
        throw new Error('Duplicate addresses found. All user addresses must be unique.');
      }
    }

    const response = await account.executeAction(ActionName.CREATE_SESSION, {
      sessionId: sessionId,
      prize: prize,
      maximumUser: this.maximumUsers,
      minimumUser: this.minimumPlayers,
      remainingUser: this.remainingUsers,
      startAfter: this.startAfter,
      maxRounds: this.maxRounds,
      roundLength: this.roundLength,
      roundInterval: this.roundInterval,
      initialHealthPoint: this.initialHealthPoint,
      users: this.users
    });
    if (!response.txId) {
      throw new Error('Failed to create session');
    }
  }
}

export class SoloGameRule implements GameRule {
  public readonly type: GameRuleType = 'solo';
  public users: string[] = [];

  public get maximumUsers(): number {
    return 2;
  }

  async CreateSession(account: Account, sessionId: string, prize: string): Promise<void> {    
    if (this.users.length > 0) {
      if (this.users.length !== this.maximumUsers) {
        throw new Error(`Private session requires exactly ${this.maximumUsers} participants. Currently have ${this.users.length}.`);
      }

      if (Array.from(new Set(this.users)).length !== this.users.length) {
        throw new Error('Duplicate addresses found. All user addresses must be unique.');
      }
    }

    const response = await account.executeAction(ActionName.CREATE_SESSION, {
      sessionId: sessionId,
      prize: prize,
      maximumUser: this.maximumUsers,
      minimumUser: 2,
      remainingUser: 1,
      startAfter: 20,
      maxRounds: 5,
      roundLength: 20,
      roundInterval: 7,
      initialHealthPoint: 100,
      users: this.users
    });
    if (!response.txId) {
      throw new Error('Failed to create session');
    }
  }
}

export type GameRuleType = 'custom' | 'solo';
