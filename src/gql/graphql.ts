/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  Address: { input: any; output: any; }
  BlockHash: { input: any; output: any; }
  /** A unsigned byte. (Min: 0, Max: 255) */
  Byte: { input: any; output: any; }
  /** A 128-bit, floating point value that offers greater local precision, with a smaller range, than other floating-point types. (Min: -79228162514264337593543950335, Max: 79228162514264337593543950335) */
  Decimal: { input: any; output: any; }
  Hex: { input: any; output: any; }
  /** A 64-bit integer. (Min: -9223372036854775808, Max: 9223372036854775807) */
  Long: { input: any; output: any; }
  PrivateKey: { input: any; output: any; }
  TxId: { input: any; output: any; }
};

export type BlockHeaderValue = {
  __typename?: 'BlockHeaderValue';
  hash?: Maybe<Scalars['String']['output']>;
  height: Scalars['Long']['output'];
  id: Scalars['BlockHash']['output'];
  miner: Scalars['Address']['output'];
};

export type Condition = {
  __typename?: 'Condition';
  activeEffectData?: Maybe<Array<Maybe<EffectData>>>;
  activeEffects?: Maybe<Array<Maybe<IEffect>>>;
  gloveUsed?: Maybe<Array<Scalars['Boolean']['output']>>;
  healthPoint: Scalars['Int']['output'];
  submission: Scalars['Int']['output'];
};

export type EffectData = {
  __typename?: 'EffectData';
  duration: Scalars['Int']['output'];
  parameters?: Maybe<Array<Scalars['Int']['output']>>;
  type: EffectType;
};

export enum EffectType {
  Burn = 'BURN'
}

export type GloveInfo = {
  __typename?: 'GloveInfo';
  count: Scalars['Int']['output'];
  id: Scalars['Address']['output'];
};

export type GloveRegisteredEventData = {
  __typename?: 'GloveRegisteredEventData';
  id: Scalars['Address']['output'];
  type: GloveType;
};

export enum GloveType {
  Paper = 'PAPER',
  Rock = 'ROCK',
  Scissors = 'SCISSORS',
  Special = 'SPECIAL'
}

export type IEffect = {
  duration: Scalars['Int']['output'];
  effectType: EffectType;
};

export type Input_FavValue = {
  decimalPlaces: Scalars['Byte']['input'];
  minters?: InputMaybe<Array<Scalars['Address']['input']>>;
  quantity: Scalars['Decimal']['input'];
  ticker?: InputMaybe<Scalars['String']['input']>;
};

export type Match = {
  __typename?: 'Match';
  players?: Maybe<Array<Scalars['Int']['output']>>;
  rounds?: Maybe<Array<Maybe<Round>>>;
  startHeight: Scalars['Long']['output'];
  state: MatchState;
  winner: Scalars['Int']['output'];
};

export type MatchMadeEventData = {
  __typename?: 'MatchMadeEventData';
  players?: Maybe<Array<Scalars['Address']['output']>>;
  sessionId: Scalars['Address']['output'];
};

export enum MatchState {
  Active = 'ACTIVE',
  Break = 'BREAK',
  Ended = 'ENDED',
  None = 'NONE'
}

export type MatchingInfo = {
  __typename?: 'MatchingInfo';
  gloves?: Maybe<Array<Scalars['Address']['output']>>;
  registeredHeight: Scalars['Long']['output'];
  userId: Scalars['Address']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  cancelMatching: Scalars['TxId']['output'];
  createSession: Scalars['TxId']['output'];
  createUser: Scalars['TxId']['output'];
  joinSession: Scalars['TxId']['output'];
  mintSinkAddress: Scalars['TxId']['output'];
  pickUp: Scalars['TxId']['output'];
  pickUpMany: Scalars['TxId']['output'];
  registerGlove: Scalars['TxId']['output'];
  registerMatching: Scalars['TxId']['output'];
  stageTransaction: Scalars['TxId']['output'];
  submitMove: Scalars['TxId']['output'];
};


export type MutationCancelMatchingArgs = {
  privateKey?: InputMaybe<Scalars['PrivateKey']['input']>;
};


export type MutationCreateSessionArgs = {
  initialHealthPoint: Scalars['Int']['input'];
  maxRounds: Scalars['Int']['input'];
  maximumUser: Scalars['Int']['input'];
  minimumUser: Scalars['Int']['input'];
  numberOfGloves: Scalars['Int']['input'];
  privateKey?: InputMaybe<Scalars['PrivateKey']['input']>;
  prize: Scalars['Address']['input'];
  remainingUser: Scalars['Int']['input'];
  roundInterval: Scalars['Long']['input'];
  roundLength: Scalars['Long']['input'];
  sessionId: Scalars['Address']['input'];
  startAfter: Scalars['Long']['input'];
};


export type MutationCreateUserArgs = {
  name?: InputMaybe<Scalars['String']['input']>;
  privateKey?: InputMaybe<Scalars['PrivateKey']['input']>;
};


export type MutationJoinSessionArgs = {
  gloves?: InputMaybe<Array<Scalars['Address']['input']>>;
  privateKey?: InputMaybe<Scalars['PrivateKey']['input']>;
  sessionId: Scalars['Address']['input'];
};


export type MutationMintSinkAddressArgs = {
  amount: Scalars['Long']['input'];
  privateKey?: InputMaybe<Scalars['PrivateKey']['input']>;
};


export type MutationPickUpArgs = {
  privateKey?: InputMaybe<Scalars['PrivateKey']['input']>;
};


export type MutationPickUpManyArgs = {
  privateKey?: InputMaybe<Scalars['PrivateKey']['input']>;
};


export type MutationRegisterGloveArgs = {
  gloveId: Scalars['Address']['input'];
  privateKey?: InputMaybe<Scalars['PrivateKey']['input']>;
};


export type MutationRegisterMatchingArgs = {
  gloves?: InputMaybe<Array<Scalars['Address']['input']>>;
  privateKey?: InputMaybe<Scalars['PrivateKey']['input']>;
};


export type MutationStageTransactionArgs = {
  signature?: InputMaybe<Scalars['Hex']['input']>;
  unsignedTransaction?: InputMaybe<Scalars['Hex']['input']>;
};


export type MutationSubmitMoveArgs = {
  gloveIndex: Scalars['Int']['input'];
  privateKey?: InputMaybe<Scalars['PrivateKey']['input']>;
  sessionId: Scalars['Address']['input'];
};

export type Phase = {
  __typename?: 'Phase';
  height: Scalars['Long']['output'];
  matches?: Maybe<Array<Maybe<Match>>>;
};

export type PickUpResultEventData = {
  __typename?: 'PickUpResultEventData';
  gloves?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  txId: Scalars['TxId']['output'];
  userId: Scalars['Address']['output'];
};

export type Player = {
  __typename?: 'Player';
  gloves?: Maybe<Array<Scalars['Address']['output']>>;
  id: Scalars['Address']['output'];
  state: PlayerState;
};

export enum PlayerState {
  Lose = 'LOSE',
  Playing = 'PLAYING',
  Ready = 'READY',
  Won = 'WON'
}

export type Query = {
  __typename?: 'Query';
  actionQuery?: Maybe<Query_ActionQuery>;
  getBalance: Scalars['Long']['output'];
  isGloveRegistered: Scalars['Boolean']['output'];
  isValidSessionId: Scalars['Boolean']['output'];
  nextTxNonce: Scalars['Long']['output'];
  nodeStatus?: Maybe<Query_NodeStatus>;
  stateQuery?: Maybe<Query_StateQuery>;
  transaction?: Maybe<Query_Transaction>;
};


export type QueryGetBalanceArgs = {
  address: Scalars['Address']['input'];
};


export type QueryIsGloveRegisteredArgs = {
  gloveId: Scalars['Address']['input'];
};


export type QueryIsValidSessionIdArgs = {
  sessionId: Scalars['Address']['input'];
};


export type QueryNextTxNonceArgs = {
  address: Scalars['Address']['input'];
};

export type Query_ActionQuery = {
  __typename?: 'Query_ActionQuery';
  cancelMatching?: Maybe<Scalars['Hex']['output']>;
  createSession?: Maybe<Scalars['Hex']['output']>;
  createUser?: Maybe<Scalars['Hex']['output']>;
  joinSession?: Maybe<Scalars['Hex']['output']>;
  pickUp?: Maybe<Scalars['Hex']['output']>;
  pickUpMany?: Maybe<Scalars['Hex']['output']>;
  registerGlove?: Maybe<Scalars['Hex']['output']>;
  registerMatching?: Maybe<Scalars['Hex']['output']>;
  submitMove?: Maybe<Scalars['Hex']['output']>;
};


export type Query_ActionQueryCreateSessionArgs = {
  initialHealthPoint: Scalars['Int']['input'];
  maxRounds: Scalars['Int']['input'];
  maximumUser: Scalars['Int']['input'];
  minimumUser: Scalars['Int']['input'];
  prize: Scalars['Address']['input'];
  remainingUser: Scalars['Int']['input'];
  roundInterval: Scalars['Long']['input'];
  roundLength: Scalars['Long']['input'];
  sessionId: Scalars['Address']['input'];
  startAfter: Scalars['Long']['input'];
  users?: InputMaybe<Array<Scalars['Address']['input']>>;
};


export type Query_ActionQueryCreateUserArgs = {
  name?: InputMaybe<Scalars['String']['input']>;
};


export type Query_ActionQueryJoinSessionArgs = {
  gloves?: InputMaybe<Array<Scalars['Address']['input']>>;
  sessionId: Scalars['Address']['input'];
};


export type Query_ActionQueryRegisterGloveArgs = {
  gloveId: Scalars['Address']['input'];
};


export type Query_ActionQueryRegisterMatchingArgs = {
  gloves?: InputMaybe<Array<Scalars['Address']['input']>>;
};


export type Query_ActionQuerySubmitMoveArgs = {
  gloveIndex: Scalars['Int']['input'];
  sessionId: Scalars['Address']['input'];
};

export type Query_NodeStatus = {
  __typename?: 'Query_NodeStatus';
  tip?: Maybe<BlockHeaderValue>;
};

export type Query_StateQuery = {
  __typename?: 'Query_StateQuery';
  getMatchPool?: Maybe<Array<Maybe<MatchingInfo>>>;
  getUserData?: Maybe<UserData>;
  session?: Maybe<Session>;
  sessions?: Maybe<Array<Maybe<Session>>>;
  userScopedSession?: Maybe<SessionEventData>;
};


export type Query_StateQueryGetUserDataArgs = {
  userId: Scalars['Address']['input'];
};


export type Query_StateQuerySessionArgs = {
  sessionId: Scalars['Address']['input'];
};


export type Query_StateQueryUserScopedSessionArgs = {
  sessionId: Scalars['Address']['input'];
  userId: Scalars['Address']['input'];
};

export type Query_Transaction = {
  __typename?: 'Query_Transaction';
  signTransaction?: Maybe<Scalars['Hex']['output']>;
  transactionResult?: Maybe<TxResultValue>;
  unsignedTransaction?: Maybe<Scalars['Hex']['output']>;
};


export type Query_TransactionSignTransactionArgs = {
  signature?: InputMaybe<Scalars['Hex']['input']>;
  unsignedTransaction?: InputMaybe<Scalars['Hex']['input']>;
};


export type Query_TransactionTransactionResultArgs = {
  txId: Scalars['TxId']['input'];
};


export type Query_TransactionUnsignedTransactionArgs = {
  address: Scalars['Address']['input'];
  maxGasPrice?: InputMaybe<Input_FavValue>;
  plainValue?: InputMaybe<Scalars['Hex']['input']>;
};

export type Round = {
  __typename?: 'Round';
  condition1?: Maybe<Condition>;
  condition2?: Maybe<Condition>;
  winner: Scalars['Int']['output'];
};

export type Session = {
  __typename?: 'Session';
  creationHeight: Scalars['Long']['output'];
  height: Scalars['Long']['output'];
  metadata?: Maybe<SessionMetadata>;
  phases?: Maybe<Array<Maybe<Phase>>>;
  players?: Maybe<Array<Maybe<Player>>>;
  startHeight: Scalars['Long']['output'];
  state: SessionState;
};

export type SessionEventData = {
  __typename?: 'SessionEventData';
  currentInterval: Scalars['Long']['output'];
  currentPhaseIndex?: Maybe<Scalars['Int']['output']>;
  currentUserMatchState?: Maybe<MatchState>;
  currentUserRoundIndex?: Maybe<Scalars['Int']['output']>;
  height: Scalars['Long']['output'];
  intervalEndHeight: Scalars['Long']['output'];
  isPlayer: Scalars['Boolean']['output'];
  lastRoundWinner?: Maybe<Scalars['String']['output']>;
  myCondition?: Maybe<Condition>;
  myGloves?: Maybe<Array<Scalars['Address']['output']>>;
  opponentAddress?: Maybe<Scalars['Address']['output']>;
  opponentCondition?: Maybe<Condition>;
  opponentGloves?: Maybe<Array<Scalars['Address']['output']>>;
  organizerAddress?: Maybe<Scalars['Address']['output']>;
  playerState?: Maybe<PlayerState>;
  playersLeft?: Maybe<Scalars['Int']['output']>;
  sessionId?: Maybe<Scalars['Address']['output']>;
  sessionState: SessionState;
};

export type SessionMetadata = {
  __typename?: 'SessionMetadata';
  id: Scalars['Address']['output'];
  initialHealthPoint: Scalars['Int']['output'];
  maxRounds: Scalars['Int']['output'];
  maximumUser: Scalars['Int']['output'];
  minimumUser: Scalars['Int']['output'];
  numberOfGloves: Scalars['Int']['output'];
  organizer: Scalars['Address']['output'];
  prize: Scalars['Address']['output'];
  remainingUser: Scalars['Int']['output'];
  roundInterval: Scalars['Long']['output'];
  roundLength: Scalars['Long']['output'];
  startAfter: Scalars['Long']['output'];
  users?: Maybe<Array<Scalars['Address']['output']>>;
};

export type SessionResultEventData = {
  __typename?: 'SessionResultEventData';
  loserIds?: Maybe<Array<Scalars['Address']['output']>>;
  sessionId?: Maybe<Scalars['Address']['output']>;
  winnerIds?: Maybe<Array<Scalars['Address']['output']>>;
};

export enum SessionState {
  Active = 'ACTIVE',
  Ended = 'ENDED',
  None = 'NONE',
  Ready = 'READY'
}

export type SubmitMoveEventData = {
  __typename?: 'SubmitMoveEventData';
  gloveIndex: Scalars['Int']['output'];
  sessionId: Scalars['Address']['output'];
  userId: Scalars['Address']['output'];
};

export type Subscription = {
  __typename?: 'Subscription';
  onGloveRegistered?: Maybe<GloveRegisteredEventData>;
  onMatchMade?: Maybe<MatchMadeEventData>;
  onMoveChanged?: Maybe<SubmitMoveEventData>;
  onPickUpResult?: Maybe<PickUpResultEventData>;
  onSessionChanged?: Maybe<SessionEventData>;
  onSessionResultChanged?: Maybe<SessionResultEventData>;
  onTipChanged?: Maybe<TipEventData>;
  onTransactionChanged?: Maybe<TransactionEventData>;
  onUserChanged?: Maybe<UserEventData>;
};


export type SubscriptionOnGloveRegisteredArgs = {
  gloveId: Scalars['Address']['input'];
};


export type SubscriptionOnMatchMadeArgs = {
  userId: Scalars['Address']['input'];
};


export type SubscriptionOnMoveChangedArgs = {
  sessionId: Scalars['Address']['input'];
  userId: Scalars['Address']['input'];
};


export type SubscriptionOnPickUpResultArgs = {
  userId: Scalars['Address']['input'];
};


export type SubscriptionOnSessionChangedArgs = {
  sessionId: Scalars['Address']['input'];
  userId: Scalars['Address']['input'];
};


export type SubscriptionOnTransactionChangedArgs = {
  txId: Scalars['TxId']['input'];
};


export type SubscriptionOnUserChangedArgs = {
  userId: Scalars['Address']['input'];
};

export type TipEventData = {
  __typename?: 'TipEventData';
  hash: Scalars['BlockHash']['output'];
  height: Scalars['Long']['output'];
};

export type TransactionEventData = {
  __typename?: 'TransactionEventData';
  blockHash: Scalars['BlockHash']['output'];
  blockHeight: Scalars['Long']['output'];
  status: TxStatus;
  txId: Scalars['TxId']['output'];
};

export type TxResultValue = {
  __typename?: 'TxResultValue';
  blockIndex?: Maybe<Scalars['Long']['output']>;
  exceptionNames?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  txStatus: TxStatus;
};

export enum TxStatus {
  Failure = 'FAILURE',
  Included = 'INCLUDED',
  Invalid = 'INVALID',
  Staging = 'STAGING',
  Success = 'SUCCESS'
}

export type UserData = {
  __typename?: 'UserData';
  balance: Scalars['Long']['output'];
  equippedGlove: Scalars['Address']['output'];
  id: Scalars['Address']['output'];
  name?: Maybe<Scalars['String']['output']>;
  ownedGloves?: Maybe<Array<Maybe<GloveInfo>>>;
  registeredGloves?: Maybe<Array<Scalars['Address']['output']>>;
  sessionId: Scalars['Address']['output'];
};

export type UserEventData = {
  __typename?: 'UserEventData';
  equippedGlove: Scalars['Address']['output'];
  id: Scalars['Address']['output'];
  ownedGloves?: Maybe<Array<Maybe<GloveInfo>>>;
  registeredGloves?: Maybe<Array<Scalars['Address']['output']>>;
};

export type GetUserQueryVariables = Exact<{
  address: Scalars['Address']['input'];
}>;


export type GetUserQuery = { __typename?: 'Query', stateQuery?: { __typename?: 'Query_StateQuery', getUserData?: { __typename?: 'UserData', id: any, name?: string | null, registeredGloves?: Array<any> | null, equippedGlove: any, sessionId: any, balance: any, ownedGloves?: Array<{ __typename?: 'GloveInfo', id: any, count: number } | null> | null } | null } | null };

export type GetMatchPoolQueryVariables = Exact<{ [key: string]: never; }>;


export type GetMatchPoolQuery = { __typename?: 'Query', stateQuery?: { __typename?: 'Query_StateQuery', getMatchPool?: Array<{ __typename?: 'MatchingInfo', userId: any, gloves?: Array<any> | null, registeredHeight: any } | null> | null } | null };

export type GetSessionsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetSessionsQuery = { __typename?: 'Query', stateQuery?: { __typename?: 'Query_StateQuery', sessions?: Array<{ __typename?: 'Session', state: SessionState, creationHeight: any, startHeight: any, metadata?: { __typename?: 'SessionMetadata', id: any, organizer: any, prize: any, maximumUser: number, minimumUser: number, remainingUser: number, users?: Array<any> | null } | null, players?: Array<{ __typename?: 'Player', id: any, gloves?: Array<any> | null } | null> | null } | null> | null } | null };

export type GetUserScopedSessionQueryVariables = Exact<{
  sessionId: Scalars['Address']['input'];
  userId: Scalars['Address']['input'];
}>;


export type GetUserScopedSessionQuery = { __typename?: 'Query', stateQuery?: { __typename?: 'Query_StateQuery', userScopedSession?: { __typename?: 'SessionEventData', sessionId?: any | null, height: any, sessionState: SessionState, organizerAddress?: any | null, opponentAddress?: any | null, currentInterval: any, isPlayer: boolean, myGloves?: Array<any> | null, opponentGloves?: Array<any> | null, playersLeft?: number | null, currentPhaseIndex?: number | null, currentUserRoundIndex?: number | null, lastRoundWinner?: string | null, currentUserMatchState?: MatchState | null, playerState?: PlayerState | null, intervalEndHeight: any, myCondition?: { __typename?: 'Condition', healthPoint: number, gloveUsed?: Array<boolean> | null, submission: number, activeEffectData?: Array<{ __typename?: 'EffectData', type: EffectType, duration: number, parameters?: Array<number> | null } | null> | null } | null, opponentCondition?: { __typename?: 'Condition', healthPoint: number, gloveUsed?: Array<boolean> | null, submission: number, activeEffectData?: Array<{ __typename?: 'EffectData', type: EffectType, duration: number, parameters?: Array<number> | null } | null> | null } | null } | null } | null };

export type GetSessionHeaderQueryVariables = Exact<{
  sessionId: Scalars['Address']['input'];
}>;


export type GetSessionHeaderQuery = { __typename?: 'Query', stateQuery?: { __typename?: 'Query_StateQuery', session?: { __typename?: 'Session', state: SessionState, creationHeight: any, startHeight: any, metadata?: { __typename?: 'SessionMetadata', id: any, organizer: any, prize: any, maximumUser: number, minimumUser: number, remainingUser: number, startAfter: any, maxRounds: number, roundLength: any, roundInterval: any, initialHealthPoint: number, numberOfGloves: number } | null, players?: Array<{ __typename?: 'Player', id: any, gloves?: Array<any> | null } | null> | null } | null } | null };

export type IsValidSessionIdQueryVariables = Exact<{
  sessionId: Scalars['Address']['input'];
}>;


export type IsValidSessionIdQuery = { __typename?: 'Query', isValidSessionId: boolean };

export type GetSessionQueryVariables = Exact<{
  sessionId: Scalars['Address']['input'];
}>;


export type GetSessionQuery = { __typename?: 'Query', stateQuery?: { __typename?: 'Query_StateQuery', session?: { __typename?: 'Session', state: SessionState, creationHeight: any, startHeight: any, height: any, metadata?: { __typename?: 'SessionMetadata', id: any, organizer: any, prize: any, maximumUser: number, minimumUser: number, remainingUser: number, startAfter: any, maxRounds: number, roundLength: any, roundInterval: any, initialHealthPoint: number, numberOfGloves: number, users?: Array<any> | null } | null, players?: Array<{ __typename?: 'Player', id: any, gloves?: Array<any> | null, state: PlayerState } | null> | null, phases?: Array<{ __typename?: 'Phase', height: any, matches?: Array<{ __typename?: 'Match', startHeight: any, players?: Array<number> | null, state: MatchState, winner: number, rounds?: Array<{ __typename?: 'Round', winner: number, condition1?: { __typename?: 'Condition', healthPoint: number, gloveUsed?: Array<boolean> | null, submission: number } | null, condition2?: { __typename?: 'Condition', healthPoint: number, gloveUsed?: Array<boolean> | null, submission: number } | null } | null> | null } | null> | null } | null> | null } | null } | null };

export type IsGloveRegisteredQueryVariables = Exact<{
  gloveId: Scalars['Address']['input'];
}>;


export type IsGloveRegisteredQuery = { __typename?: 'Query', isGloveRegistered: boolean };

export type CreateSessionActionQueryVariables = Exact<{
  sessionId: Scalars['Address']['input'];
  prize: Scalars['Address']['input'];
  maximumUser: Scalars['Int']['input'];
  minimumUser: Scalars['Int']['input'];
  remainingUser: Scalars['Int']['input'];
  startAfter: Scalars['Long']['input'];
  maxRounds: Scalars['Int']['input'];
  roundLength: Scalars['Long']['input'];
  roundInterval: Scalars['Long']['input'];
  initialHealthPoint: Scalars['Int']['input'];
  users: Array<Scalars['Address']['input']> | Scalars['Address']['input'];
}>;


export type CreateSessionActionQuery = { __typename?: 'Query', actionQuery?: { __typename?: 'Query_ActionQuery', createSession?: any | null } | null };

export type JoinSessionActionQueryVariables = Exact<{
  sessionId: Scalars['Address']['input'];
  gloves: Array<Scalars['Address']['input']> | Scalars['Address']['input'];
}>;


export type JoinSessionActionQuery = { __typename?: 'Query', actionQuery?: { __typename?: 'Query_ActionQuery', joinSession?: any | null } | null };

export type CreateUserActionQueryVariables = Exact<{
  name: Scalars['String']['input'];
}>;


export type CreateUserActionQuery = { __typename?: 'Query', actionQuery?: { __typename?: 'Query_ActionQuery', createUser?: any | null } | null };

export type SubmitMoveActionQueryVariables = Exact<{
  sessionId: Scalars['Address']['input'];
  gloveIndex: Scalars['Int']['input'];
}>;


export type SubmitMoveActionQuery = { __typename?: 'Query', actionQuery?: { __typename?: 'Query_ActionQuery', submitMove?: any | null } | null };

export type RegisterGloveActionQueryVariables = Exact<{
  gloveId: Scalars['Address']['input'];
}>;


export type RegisterGloveActionQuery = { __typename?: 'Query', actionQuery?: { __typename?: 'Query_ActionQuery', registerGlove?: any | null } | null };

export type PickUpActionQueryVariables = Exact<{ [key: string]: never; }>;


export type PickUpActionQuery = { __typename?: 'Query', actionQuery?: { __typename?: 'Query_ActionQuery', pickUp?: any | null } | null };

export type PickUpManyActionQueryVariables = Exact<{ [key: string]: never; }>;


export type PickUpManyActionQuery = { __typename?: 'Query', actionQuery?: { __typename?: 'Query_ActionQuery', pickUpMany?: any | null } | null };

export type RegisterMatchingActionQueryVariables = Exact<{
  gloves: Array<Scalars['Address']['input']> | Scalars['Address']['input'];
}>;


export type RegisterMatchingActionQuery = { __typename?: 'Query', actionQuery?: { __typename?: 'Query_ActionQuery', registerMatching?: any | null } | null };

export type CancelMatchingActionQueryVariables = Exact<{ [key: string]: never; }>;


export type CancelMatchingActionQuery = { __typename?: 'Query', actionQuery?: { __typename?: 'Query_ActionQuery', cancelMatching?: any | null } | null };

export type UnsignedTransactionQueryVariables = Exact<{
  address: Scalars['Address']['input'];
  plainValue: Scalars['Hex']['input'];
}>;


export type UnsignedTransactionQuery = { __typename?: 'Query', transaction?: { __typename?: 'Query_Transaction', unsignedTransaction?: any | null } | null };

export type StageTransactionMutationVariables = Exact<{
  unsignedTransaction: Scalars['Hex']['input'];
  signature: Scalars['Hex']['input'];
}>;


export type StageTransactionMutation = { __typename?: 'Mutation', stageTransaction: any };

export type TransactionResultQueryVariables = Exact<{
  txId: Scalars['TxId']['input'];
}>;


export type TransactionResultQuery = { __typename?: 'Query', transaction?: { __typename?: 'Query_Transaction', transactionResult?: { __typename?: 'TxResultValue', txStatus: TxStatus, blockIndex?: any | null, exceptionNames?: Array<string | null> | null } | null } | null };


export const GetUserDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetUser"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"address"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Address"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"stateQuery"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getUserData"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"userId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"address"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"registeredGloves"}},{"kind":"Field","name":{"kind":"Name","value":"ownedGloves"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"count"}}]}},{"kind":"Field","name":{"kind":"Name","value":"equippedGlove"}},{"kind":"Field","name":{"kind":"Name","value":"sessionId"}},{"kind":"Field","name":{"kind":"Name","value":"balance"}}]}}]}}]}}]} as unknown as DocumentNode<GetUserQuery, GetUserQueryVariables>;
export const GetMatchPoolDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetMatchPool"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"stateQuery"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getMatchPool"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"gloves"}},{"kind":"Field","name":{"kind":"Name","value":"registeredHeight"}}]}}]}}]}}]} as unknown as DocumentNode<GetMatchPoolQuery, GetMatchPoolQueryVariables>;
export const GetSessionsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetSessions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"stateQuery"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sessions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"metadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"organizer"}},{"kind":"Field","name":{"kind":"Name","value":"prize"}},{"kind":"Field","name":{"kind":"Name","value":"maximumUser"}},{"kind":"Field","name":{"kind":"Name","value":"minimumUser"}},{"kind":"Field","name":{"kind":"Name","value":"remainingUser"}},{"kind":"Field","name":{"kind":"Name","value":"users"}}]}},{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"players"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"gloves"}}]}},{"kind":"Field","name":{"kind":"Name","value":"creationHeight"}},{"kind":"Field","name":{"kind":"Name","value":"startHeight"}}]}}]}}]}}]} as unknown as DocumentNode<GetSessionsQuery, GetSessionsQueryVariables>;
export const GetUserScopedSessionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetUserScopedSession"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"sessionId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Address"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"userId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Address"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"stateQuery"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"userScopedSession"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"sessionId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"sessionId"}}},{"kind":"Argument","name":{"kind":"Name","value":"userId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"userId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sessionId"}},{"kind":"Field","name":{"kind":"Name","value":"height"}},{"kind":"Field","name":{"kind":"Name","value":"sessionState"}},{"kind":"Field","name":{"kind":"Name","value":"organizerAddress"}},{"kind":"Field","name":{"kind":"Name","value":"opponentAddress"}},{"kind":"Field","name":{"kind":"Name","value":"currentInterval"}},{"kind":"Field","name":{"kind":"Name","value":"isPlayer"}},{"kind":"Field","name":{"kind":"Name","value":"myGloves"}},{"kind":"Field","name":{"kind":"Name","value":"opponentGloves"}},{"kind":"Field","name":{"kind":"Name","value":"playersLeft"}},{"kind":"Field","name":{"kind":"Name","value":"currentPhaseIndex"}},{"kind":"Field","name":{"kind":"Name","value":"currentUserRoundIndex"}},{"kind":"Field","name":{"kind":"Name","value":"myCondition"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"healthPoint"}},{"kind":"Field","name":{"kind":"Name","value":"gloveUsed"}},{"kind":"Field","name":{"kind":"Name","value":"submission"}},{"kind":"Field","name":{"kind":"Name","value":"activeEffectData"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"duration"}},{"kind":"Field","name":{"kind":"Name","value":"parameters"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"opponentCondition"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"healthPoint"}},{"kind":"Field","name":{"kind":"Name","value":"gloveUsed"}},{"kind":"Field","name":{"kind":"Name","value":"submission"}},{"kind":"Field","name":{"kind":"Name","value":"activeEffectData"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"duration"}},{"kind":"Field","name":{"kind":"Name","value":"parameters"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"lastRoundWinner"}},{"kind":"Field","name":{"kind":"Name","value":"currentUserMatchState"}},{"kind":"Field","name":{"kind":"Name","value":"playerState"}},{"kind":"Field","name":{"kind":"Name","value":"intervalEndHeight"}}]}}]}}]}}]} as unknown as DocumentNode<GetUserScopedSessionQuery, GetUserScopedSessionQueryVariables>;
export const GetSessionHeaderDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetSessionHeader"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"sessionId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Address"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"stateQuery"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"session"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"sessionId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"sessionId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"metadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"organizer"}},{"kind":"Field","name":{"kind":"Name","value":"prize"}},{"kind":"Field","name":{"kind":"Name","value":"maximumUser"}},{"kind":"Field","name":{"kind":"Name","value":"minimumUser"}},{"kind":"Field","name":{"kind":"Name","value":"remainingUser"}},{"kind":"Field","name":{"kind":"Name","value":"startAfter"}},{"kind":"Field","name":{"kind":"Name","value":"maxRounds"}},{"kind":"Field","name":{"kind":"Name","value":"roundLength"}},{"kind":"Field","name":{"kind":"Name","value":"roundInterval"}},{"kind":"Field","name":{"kind":"Name","value":"initialHealthPoint"}},{"kind":"Field","name":{"kind":"Name","value":"numberOfGloves"}}]}},{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"players"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"gloves"}}]}},{"kind":"Field","name":{"kind":"Name","value":"creationHeight"}},{"kind":"Field","name":{"kind":"Name","value":"startHeight"}}]}}]}}]}}]} as unknown as DocumentNode<GetSessionHeaderQuery, GetSessionHeaderQueryVariables>;
export const IsValidSessionIdDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"IsValidSessionId"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"sessionId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Address"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"isValidSessionId"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"sessionId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"sessionId"}}}]}]}}]} as unknown as DocumentNode<IsValidSessionIdQuery, IsValidSessionIdQueryVariables>;
export const GetSessionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetSession"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"sessionId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Address"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"stateQuery"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"session"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"sessionId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"sessionId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"metadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"organizer"}},{"kind":"Field","name":{"kind":"Name","value":"prize"}},{"kind":"Field","name":{"kind":"Name","value":"maximumUser"}},{"kind":"Field","name":{"kind":"Name","value":"minimumUser"}},{"kind":"Field","name":{"kind":"Name","value":"remainingUser"}},{"kind":"Field","name":{"kind":"Name","value":"startAfter"}},{"kind":"Field","name":{"kind":"Name","value":"maxRounds"}},{"kind":"Field","name":{"kind":"Name","value":"roundLength"}},{"kind":"Field","name":{"kind":"Name","value":"roundInterval"}},{"kind":"Field","name":{"kind":"Name","value":"initialHealthPoint"}},{"kind":"Field","name":{"kind":"Name","value":"numberOfGloves"}},{"kind":"Field","name":{"kind":"Name","value":"users"}}]}},{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"players"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"gloves"}},{"kind":"Field","name":{"kind":"Name","value":"state"}}]}},{"kind":"Field","name":{"kind":"Name","value":"phases"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"height"}},{"kind":"Field","name":{"kind":"Name","value":"matches"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"startHeight"}},{"kind":"Field","name":{"kind":"Name","value":"players"}},{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"rounds"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"condition1"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"healthPoint"}},{"kind":"Field","name":{"kind":"Name","value":"gloveUsed"}},{"kind":"Field","name":{"kind":"Name","value":"submission"}}]}},{"kind":"Field","name":{"kind":"Name","value":"condition2"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"healthPoint"}},{"kind":"Field","name":{"kind":"Name","value":"gloveUsed"}},{"kind":"Field","name":{"kind":"Name","value":"submission"}}]}},{"kind":"Field","name":{"kind":"Name","value":"winner"}}]}},{"kind":"Field","name":{"kind":"Name","value":"winner"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"creationHeight"}},{"kind":"Field","name":{"kind":"Name","value":"startHeight"}},{"kind":"Field","name":{"kind":"Name","value":"height"}}]}}]}}]}}]} as unknown as DocumentNode<GetSessionQuery, GetSessionQueryVariables>;
export const IsGloveRegisteredDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"IsGloveRegistered"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"gloveId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Address"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"isGloveRegistered"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"gloveId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"gloveId"}}}]}]}}]} as unknown as DocumentNode<IsGloveRegisteredQuery, IsGloveRegisteredQueryVariables>;
export const CreateSessionActionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"CreateSessionAction"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"sessionId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Address"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"prize"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Address"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"maximumUser"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"minimumUser"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"remainingUser"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"startAfter"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Long"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"maxRounds"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"roundLength"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Long"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"roundInterval"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Long"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"initialHealthPoint"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"users"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Address"}}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"actionQuery"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createSession"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"sessionId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"sessionId"}}},{"kind":"Argument","name":{"kind":"Name","value":"prize"},"value":{"kind":"Variable","name":{"kind":"Name","value":"prize"}}},{"kind":"Argument","name":{"kind":"Name","value":"maximumUser"},"value":{"kind":"Variable","name":{"kind":"Name","value":"maximumUser"}}},{"kind":"Argument","name":{"kind":"Name","value":"minimumUser"},"value":{"kind":"Variable","name":{"kind":"Name","value":"minimumUser"}}},{"kind":"Argument","name":{"kind":"Name","value":"remainingUser"},"value":{"kind":"Variable","name":{"kind":"Name","value":"remainingUser"}}},{"kind":"Argument","name":{"kind":"Name","value":"startAfter"},"value":{"kind":"Variable","name":{"kind":"Name","value":"startAfter"}}},{"kind":"Argument","name":{"kind":"Name","value":"maxRounds"},"value":{"kind":"Variable","name":{"kind":"Name","value":"maxRounds"}}},{"kind":"Argument","name":{"kind":"Name","value":"roundLength"},"value":{"kind":"Variable","name":{"kind":"Name","value":"roundLength"}}},{"kind":"Argument","name":{"kind":"Name","value":"roundInterval"},"value":{"kind":"Variable","name":{"kind":"Name","value":"roundInterval"}}},{"kind":"Argument","name":{"kind":"Name","value":"initialHealthPoint"},"value":{"kind":"Variable","name":{"kind":"Name","value":"initialHealthPoint"}}},{"kind":"Argument","name":{"kind":"Name","value":"users"},"value":{"kind":"Variable","name":{"kind":"Name","value":"users"}}}]}]}}]}}]} as unknown as DocumentNode<CreateSessionActionQuery, CreateSessionActionQueryVariables>;
export const JoinSessionActionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"JoinSessionAction"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"sessionId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Address"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"gloves"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Address"}}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"actionQuery"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"joinSession"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"sessionId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"sessionId"}}},{"kind":"Argument","name":{"kind":"Name","value":"gloves"},"value":{"kind":"Variable","name":{"kind":"Name","value":"gloves"}}}]}]}}]}}]} as unknown as DocumentNode<JoinSessionActionQuery, JoinSessionActionQueryVariables>;
export const CreateUserActionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"CreateUserAction"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"name"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"actionQuery"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createUser"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"name"},"value":{"kind":"Variable","name":{"kind":"Name","value":"name"}}}]}]}}]}}]} as unknown as DocumentNode<CreateUserActionQuery, CreateUserActionQueryVariables>;
export const SubmitMoveActionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SubmitMoveAction"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"sessionId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Address"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"gloveIndex"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"actionQuery"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"submitMove"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"sessionId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"sessionId"}}},{"kind":"Argument","name":{"kind":"Name","value":"gloveIndex"},"value":{"kind":"Variable","name":{"kind":"Name","value":"gloveIndex"}}}]}]}}]}}]} as unknown as DocumentNode<SubmitMoveActionQuery, SubmitMoveActionQueryVariables>;
export const RegisterGloveActionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"RegisterGloveAction"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"gloveId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Address"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"actionQuery"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"registerGlove"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"gloveId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"gloveId"}}}]}]}}]}}]} as unknown as DocumentNode<RegisterGloveActionQuery, RegisterGloveActionQueryVariables>;
export const PickUpActionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"PickUpAction"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"actionQuery"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"pickUp"}}]}}]}}]} as unknown as DocumentNode<PickUpActionQuery, PickUpActionQueryVariables>;
export const PickUpManyActionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"PickUpManyAction"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"actionQuery"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"pickUpMany"}}]}}]}}]} as unknown as DocumentNode<PickUpManyActionQuery, PickUpManyActionQueryVariables>;
export const RegisterMatchingActionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"RegisterMatchingAction"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"gloves"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Address"}}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"actionQuery"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"registerMatching"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"gloves"},"value":{"kind":"Variable","name":{"kind":"Name","value":"gloves"}}}]}]}}]}}]} as unknown as DocumentNode<RegisterMatchingActionQuery, RegisterMatchingActionQueryVariables>;
export const CancelMatchingActionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"CancelMatchingAction"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"actionQuery"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"cancelMatching"}}]}}]}}]} as unknown as DocumentNode<CancelMatchingActionQuery, CancelMatchingActionQueryVariables>;
export const UnsignedTransactionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"UnsignedTransaction"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"address"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Address"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"plainValue"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Hex"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"transaction"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"unsignedTransaction"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"address"},"value":{"kind":"Variable","name":{"kind":"Name","value":"address"}}},{"kind":"Argument","name":{"kind":"Name","value":"plainValue"},"value":{"kind":"Variable","name":{"kind":"Name","value":"plainValue"}}}]}]}}]}}]} as unknown as DocumentNode<UnsignedTransactionQuery, UnsignedTransactionQueryVariables>;
export const StageTransactionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"StageTransaction"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"unsignedTransaction"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Hex"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"signature"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Hex"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"stageTransaction"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"unsignedTransaction"},"value":{"kind":"Variable","name":{"kind":"Name","value":"unsignedTransaction"}}},{"kind":"Argument","name":{"kind":"Name","value":"signature"},"value":{"kind":"Variable","name":{"kind":"Name","value":"signature"}}}]}]}}]} as unknown as DocumentNode<StageTransactionMutation, StageTransactionMutationVariables>;
export const TransactionResultDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"TransactionResult"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"txId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"TxId"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"transaction"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"transactionResult"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"txId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"txId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"txStatus"}},{"kind":"Field","name":{"kind":"Name","value":"blockIndex"}},{"kind":"Field","name":{"kind":"Name","value":"exceptionNames"}}]}}]}}]}}]} as unknown as DocumentNode<TransactionResultQuery, TransactionResultQueryVariables>;