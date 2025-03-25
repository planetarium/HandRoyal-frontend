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

export type Glove = {
  __typename?: 'Glove';
  author: Scalars['Address']['output'];
  id: Scalars['Address']['output'];
};

export type GloveRegisteredEventData = {
  __typename?: 'GloveRegisteredEventData';
  author: Scalars['Address']['output'];
  id: Scalars['Address']['output'];
};

export type Input_FavValue = {
  decimalPlaces: Scalars['Byte']['input'];
  minters?: InputMaybe<Array<Scalars['Address']['input']>>;
  quantity: Scalars['Decimal']['input'];
  ticker?: InputMaybe<Scalars['String']['input']>;
};

export type Match = {
  __typename?: 'Match';
  move1?: Maybe<Move>;
  move2?: Maybe<Move>;
};

export type Move = {
  __typename?: 'Move';
  playerIndex: Scalars['Int']['output'];
  type: MoveType;
};

export enum MoveType {
  None = 'NONE',
  Paper = 'PAPER',
  Rock = 'ROCK',
  Scissors = 'SCISSORS'
}

export type Mutation = {
  __typename?: 'Mutation';
  createSession: Scalars['TxId']['output'];
  createUser: Scalars['TxId']['output'];
  joinSession: Scalars['TxId']['output'];
  registerGlove: Scalars['TxId']['output'];
  stageTransaction: Scalars['TxId']['output'];
  submitMove: Scalars['TxId']['output'];
};


export type MutationCreateSessionArgs = {
  maximumUser: Scalars['Int']['input'];
  minimumUser: Scalars['Int']['input'];
  privateKey?: InputMaybe<Scalars['PrivateKey']['input']>;
  prize: Scalars['Address']['input'];
  remainingUser: Scalars['Int']['input'];
  roundInterval: Scalars['Long']['input'];
  roundLength: Scalars['Long']['input'];
  sessionId: Scalars['Address']['input'];
  startAfter: Scalars['Long']['input'];
};


export type MutationCreateUserArgs = {
  privateKey?: InputMaybe<Scalars['PrivateKey']['input']>;
};


export type MutationJoinSessionArgs = {
  gloveId?: InputMaybe<Scalars['Address']['input']>;
  privateKey?: InputMaybe<Scalars['PrivateKey']['input']>;
  sessionId: Scalars['Address']['input'];
};


export type MutationRegisterGloveArgs = {
  gloveId: Scalars['Address']['input'];
  privateKey?: InputMaybe<Scalars['PrivateKey']['input']>;
};


export type MutationStageTransactionArgs = {
  signature?: InputMaybe<Scalars['Hex']['input']>;
  unsignedTransaction?: InputMaybe<Scalars['Hex']['input']>;
};


export type MutationSubmitMoveArgs = {
  move: MoveType;
  privateKey?: InputMaybe<Scalars['PrivateKey']['input']>;
  sessionId: Scalars['Address']['input'];
};

export type Player = {
  __typename?: 'Player';
  glove: Scalars['Address']['output'];
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
  isGloveRegistered: Scalars['Boolean']['output'];
  isValidSessionId: Scalars['Boolean']['output'];
  nextTxNonce: Scalars['Long']['output'];
  nodeStatus?: Maybe<Query_NodeStatus>;
  stateQuery?: Maybe<Query_StateQuery>;
  transaction?: Maybe<Query_Transaction>;
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
  createSession?: Maybe<Scalars['Hex']['output']>;
  createUser?: Maybe<Scalars['Hex']['output']>;
  joinSession?: Maybe<Scalars['Hex']['output']>;
  registerGlove?: Maybe<Scalars['Hex']['output']>;
  submitMove?: Maybe<Scalars['Hex']['output']>;
};


export type Query_ActionQueryCreateSessionArgs = {
  maximumUser: Scalars['Int']['input'];
  minimumUser: Scalars['Int']['input'];
  prize: Scalars['Address']['input'];
  remainingUser: Scalars['Int']['input'];
  roundInterval: Scalars['Long']['input'];
  roundLength: Scalars['Long']['input'];
  sessionId: Scalars['Address']['input'];
  startAfter: Scalars['Long']['input'];
};


export type Query_ActionQueryJoinSessionArgs = {
  gloveId?: InputMaybe<Scalars['Address']['input']>;
  sessionId: Scalars['Address']['input'];
};


export type Query_ActionQueryRegisterGloveArgs = {
  gloveId: Scalars['Address']['input'];
};


export type Query_ActionQuerySubmitMoveArgs = {
  move: MoveType;
  sessionId: Scalars['Address']['input'];
};

export type Query_NodeStatus = {
  __typename?: 'Query_NodeStatus';
  tip?: Maybe<BlockHeaderValue>;
};

export type Query_StateQuery = {
  __typename?: 'Query_StateQuery';
  glove?: Maybe<Glove>;
  session?: Maybe<Session>;
  sessions?: Maybe<Array<Maybe<Session>>>;
  user?: Maybe<User>;
};


export type Query_StateQueryGloveArgs = {
  gloveId: Scalars['Address']['input'];
};


export type Query_StateQuerySessionArgs = {
  sessionId: Scalars['Address']['input'];
};


export type Query_StateQueryUserArgs = {
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
  height: Scalars['Long']['output'];
  matches?: Maybe<Array<Maybe<Match>>>;
};

export type Session = {
  __typename?: 'Session';
  creationHeight: Scalars['Long']['output'];
  height: Scalars['Long']['output'];
  metadata?: Maybe<SessionMetadata>;
  players?: Maybe<Array<Maybe<Player>>>;
  rounds?: Maybe<Array<Maybe<Round>>>;
  startHeight: Scalars['Long']['output'];
  state: SessionState;
};

export type SessionEventData = {
  __typename?: 'SessionEventData';
  height: Scalars['Long']['output'];
  match?: Maybe<Match>;
  state: SessionState;
};

export type SessionMetadata = {
  __typename?: 'SessionMetadata';
  id: Scalars['Address']['output'];
  maximumUser: Scalars['Int']['output'];
  minimumUser: Scalars['Int']['output'];
  organizer: Scalars['Address']['output'];
  prize: Scalars['Address']['output'];
  remainingUser: Scalars['Int']['output'];
  roundInterval: Scalars['Long']['output'];
  roundLength: Scalars['Long']['output'];
  startAfter: Scalars['Long']['output'];
};

export enum SessionState {
  Active = 'ACTIVE',
  Break = 'BREAK',
  Ended = 'ENDED',
  None = 'NONE',
  Ready = 'READY'
}

export type SubmitMoveEventData = {
  __typename?: 'SubmitMoveEventData';
  move: MoveType;
  sessionId: Scalars['Address']['output'];
  userId: Scalars['Address']['output'];
};

export type Subscription = {
  __typename?: 'Subscription';
  onGloveRegistered?: Maybe<GloveRegisteredEventData>;
  onMoveChanged?: Maybe<SubmitMoveEventData>;
  onSessionChanged?: Maybe<SessionEventData>;
  onTipChanged?: Maybe<TipEventData>;
  onTransactionChanged?: Maybe<TransactionEventData>;
  onUserChanged?: Maybe<UserEventData>;
};


export type SubscriptionOnGloveRegisteredArgs = {
  gloveId: Scalars['Address']['input'];
};


export type SubscriptionOnMoveChangedArgs = {
  sessionId: Scalars['Address']['input'];
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

export type User = {
  __typename?: 'User';
  equippedGlove: Scalars['Address']['output'];
  id: Scalars['Address']['output'];
  ownedGloves?: Maybe<Array<Scalars['Address']['output']>>;
  registeredGloves?: Maybe<Array<Scalars['Address']['output']>>;
  sessionId: Scalars['Address']['output'];
};

export type UserEventData = {
  __typename?: 'UserEventData';
  equippedGlove: Scalars['Address']['output'];
  id: Scalars['Address']['output'];
  ownedGloves?: Maybe<Array<Scalars['Address']['output']>>;
  registeredGloves?: Maybe<Array<Scalars['Address']['output']>>;
};

export type GetUserQueryVariables = Exact<{
  address: Scalars['Address']['input'];
}>;


export type GetUserQuery = { __typename?: 'Query', stateQuery?: { __typename?: 'Query_StateQuery', user?: { __typename?: 'User', id: any, registeredGloves?: Array<any> | null, ownedGloves?: Array<any> | null, equippedGlove: any, sessionId: any } | null } | null };

export type GetSessionsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetSessionsQuery = { __typename?: 'Query', stateQuery?: { __typename?: 'Query_StateQuery', sessions?: Array<{ __typename?: 'Session', state: SessionState, creationHeight: any, startHeight: any, metadata?: { __typename?: 'SessionMetadata', id: any, organizer: any, prize: any, maximumUser: number, minimumUser: number, remainingUser: number } | null, players?: Array<{ __typename?: 'Player', id: any, glove: any } | null> | null, rounds?: Array<{ __typename?: 'Round', height: any, matches?: Array<{ __typename?: 'Match', move1?: { __typename?: 'Move', type: MoveType } | null, move2?: { __typename?: 'Move', type: MoveType } | null } | null> | null } | null> | null } | null> | null } | null };

export type IsValidSessionIdQueryVariables = Exact<{
  sessionId: Scalars['Address']['input'];
}>;


export type IsValidSessionIdQuery = { __typename?: 'Query', isValidSessionId: boolean };

export type GetSessionQueryVariables = Exact<{
  sessionId: Scalars['Address']['input'];
}>;


export type GetSessionQuery = { __typename?: 'Query', stateQuery?: { __typename?: 'Query_StateQuery', session?: { __typename?: 'Session', state: SessionState, creationHeight: any, startHeight: any, height: any, metadata?: { __typename?: 'SessionMetadata', id: any, organizer: any, prize: any, maximumUser: number, minimumUser: number, remainingUser: number, startAfter: any, roundLength: any, roundInterval: any } | null, players?: Array<{ __typename?: 'Player', id: any, glove: any, state: PlayerState } | null> | null, rounds?: Array<{ __typename?: 'Round', height: any, matches?: Array<{ __typename?: 'Match', move1?: { __typename?: 'Move', playerIndex: number, type: MoveType } | null, move2?: { __typename?: 'Move', playerIndex: number, type: MoveType } | null } | null> | null } | null> | null } | null } | null };

export type IsGloveRegisteredQueryVariables = Exact<{
  gloveId: Scalars['Address']['input'];
}>;


export type IsGloveRegisteredQuery = { __typename?: 'Query', isGloveRegistered: boolean };

export type GetGloveQueryVariables = Exact<{
  gloveId: Scalars['Address']['input'];
}>;


export type GetGloveQuery = { __typename?: 'Query', stateQuery?: { __typename?: 'Query_StateQuery', glove?: { __typename?: 'Glove', id: any, author: any } | null } | null };

export type CreateSessionActionQueryVariables = Exact<{
  sessionId: Scalars['Address']['input'];
  prize: Scalars['Address']['input'];
  maximumUser: Scalars['Int']['input'];
  minimumUser: Scalars['Int']['input'];
  remainingUser: Scalars['Int']['input'];
  startAfter: Scalars['Long']['input'];
  roundLength: Scalars['Long']['input'];
  roundInterval: Scalars['Long']['input'];
}>;


export type CreateSessionActionQuery = { __typename?: 'Query', actionQuery?: { __typename?: 'Query_ActionQuery', createSession?: any | null } | null };

export type JoinSessionActionQueryVariables = Exact<{
  sessionId: Scalars['Address']['input'];
  gloveId?: InputMaybe<Scalars['Address']['input']>;
}>;


export type JoinSessionActionQuery = { __typename?: 'Query', actionQuery?: { __typename?: 'Query_ActionQuery', joinSession?: any | null } | null };

export type CreateUserActionQueryVariables = Exact<{ [key: string]: never; }>;


export type CreateUserActionQuery = { __typename?: 'Query', actionQuery?: { __typename?: 'Query_ActionQuery', createUser?: any | null } | null };

export type SubmitMoveActionQueryVariables = Exact<{
  sessionId: Scalars['Address']['input'];
  move: MoveType;
}>;


export type SubmitMoveActionQuery = { __typename?: 'Query', actionQuery?: { __typename?: 'Query_ActionQuery', submitMove?: any | null } | null };

export type RegisterGloveActionQueryVariables = Exact<{
  gloveId: Scalars['Address']['input'];
}>;


export type RegisterGloveActionQuery = { __typename?: 'Query', actionQuery?: { __typename?: 'Query_ActionQuery', registerGlove?: any | null } | null };

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


export const GetUserDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetUser"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"address"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Address"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"stateQuery"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"user"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"userId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"address"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"registeredGloves"}},{"kind":"Field","name":{"kind":"Name","value":"ownedGloves"}},{"kind":"Field","name":{"kind":"Name","value":"equippedGlove"}},{"kind":"Field","name":{"kind":"Name","value":"sessionId"}}]}}]}}]}}]} as unknown as DocumentNode<GetUserQuery, GetUserQueryVariables>;
export const GetSessionsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetSessions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"stateQuery"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sessions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"metadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"organizer"}},{"kind":"Field","name":{"kind":"Name","value":"prize"}},{"kind":"Field","name":{"kind":"Name","value":"maximumUser"}},{"kind":"Field","name":{"kind":"Name","value":"minimumUser"}},{"kind":"Field","name":{"kind":"Name","value":"remainingUser"}}]}},{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"players"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"glove"}}]}},{"kind":"Field","name":{"kind":"Name","value":"rounds"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"height"}},{"kind":"Field","name":{"kind":"Name","value":"matches"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"move1"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}}]}},{"kind":"Field","name":{"kind":"Name","value":"move2"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"creationHeight"}},{"kind":"Field","name":{"kind":"Name","value":"startHeight"}}]}}]}}]}}]} as unknown as DocumentNode<GetSessionsQuery, GetSessionsQueryVariables>;
export const IsValidSessionIdDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"IsValidSessionId"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"sessionId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Address"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"isValidSessionId"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"sessionId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"sessionId"}}}]}]}}]} as unknown as DocumentNode<IsValidSessionIdQuery, IsValidSessionIdQueryVariables>;
export const GetSessionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetSession"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"sessionId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Address"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"stateQuery"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"session"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"sessionId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"sessionId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"metadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"organizer"}},{"kind":"Field","name":{"kind":"Name","value":"prize"}},{"kind":"Field","name":{"kind":"Name","value":"maximumUser"}},{"kind":"Field","name":{"kind":"Name","value":"minimumUser"}},{"kind":"Field","name":{"kind":"Name","value":"remainingUser"}},{"kind":"Field","name":{"kind":"Name","value":"startAfter"}},{"kind":"Field","name":{"kind":"Name","value":"roundLength"}},{"kind":"Field","name":{"kind":"Name","value":"roundInterval"}}]}},{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"players"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"glove"}},{"kind":"Field","name":{"kind":"Name","value":"state"}}]}},{"kind":"Field","name":{"kind":"Name","value":"rounds"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"height"}},{"kind":"Field","name":{"kind":"Name","value":"matches"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"move1"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"playerIndex"}},{"kind":"Field","name":{"kind":"Name","value":"type"}}]}},{"kind":"Field","name":{"kind":"Name","value":"move2"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"playerIndex"}},{"kind":"Field","name":{"kind":"Name","value":"type"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"creationHeight"}},{"kind":"Field","name":{"kind":"Name","value":"startHeight"}},{"kind":"Field","name":{"kind":"Name","value":"height"}}]}}]}}]}}]} as unknown as DocumentNode<GetSessionQuery, GetSessionQueryVariables>;
export const IsGloveRegisteredDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"IsGloveRegistered"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"gloveId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Address"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"isGloveRegistered"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"gloveId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"gloveId"}}}]}]}}]} as unknown as DocumentNode<IsGloveRegisteredQuery, IsGloveRegisteredQueryVariables>;
export const GetGloveDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetGlove"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"gloveId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Address"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"stateQuery"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"glove"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"gloveId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"gloveId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"author"}}]}}]}}]}}]} as unknown as DocumentNode<GetGloveQuery, GetGloveQueryVariables>;
export const CreateSessionActionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"CreateSessionAction"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"sessionId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Address"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"prize"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Address"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"maximumUser"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"minimumUser"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"remainingUser"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"startAfter"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Long"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"roundLength"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Long"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"roundInterval"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Long"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"actionQuery"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createSession"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"sessionId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"sessionId"}}},{"kind":"Argument","name":{"kind":"Name","value":"prize"},"value":{"kind":"Variable","name":{"kind":"Name","value":"prize"}}},{"kind":"Argument","name":{"kind":"Name","value":"maximumUser"},"value":{"kind":"Variable","name":{"kind":"Name","value":"maximumUser"}}},{"kind":"Argument","name":{"kind":"Name","value":"minimumUser"},"value":{"kind":"Variable","name":{"kind":"Name","value":"minimumUser"}}},{"kind":"Argument","name":{"kind":"Name","value":"remainingUser"},"value":{"kind":"Variable","name":{"kind":"Name","value":"remainingUser"}}},{"kind":"Argument","name":{"kind":"Name","value":"startAfter"},"value":{"kind":"Variable","name":{"kind":"Name","value":"startAfter"}}},{"kind":"Argument","name":{"kind":"Name","value":"roundLength"},"value":{"kind":"Variable","name":{"kind":"Name","value":"roundLength"}}},{"kind":"Argument","name":{"kind":"Name","value":"roundInterval"},"value":{"kind":"Variable","name":{"kind":"Name","value":"roundInterval"}}}]}]}}]}}]} as unknown as DocumentNode<CreateSessionActionQuery, CreateSessionActionQueryVariables>;
export const JoinSessionActionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"JoinSessionAction"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"sessionId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Address"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"gloveId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Address"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"actionQuery"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"joinSession"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"sessionId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"sessionId"}}},{"kind":"Argument","name":{"kind":"Name","value":"gloveId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"gloveId"}}}]}]}}]}}]} as unknown as DocumentNode<JoinSessionActionQuery, JoinSessionActionQueryVariables>;
export const CreateUserActionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"CreateUserAction"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"actionQuery"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createUser"}}]}}]}}]} as unknown as DocumentNode<CreateUserActionQuery, CreateUserActionQueryVariables>;
export const SubmitMoveActionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SubmitMoveAction"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"sessionId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Address"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"move"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"MoveType"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"actionQuery"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"submitMove"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"sessionId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"sessionId"}}},{"kind":"Argument","name":{"kind":"Name","value":"move"},"value":{"kind":"Variable","name":{"kind":"Name","value":"move"}}}]}]}}]}}]} as unknown as DocumentNode<SubmitMoveActionQuery, SubmitMoveActionQueryVariables>;
export const RegisterGloveActionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"RegisterGloveAction"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"gloveId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Address"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"actionQuery"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"registerGlove"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"gloveId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"gloveId"}}}]}]}}]}}]} as unknown as DocumentNode<RegisterGloveActionQuery, RegisterGloveActionQueryVariables>;
export const UnsignedTransactionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"UnsignedTransaction"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"address"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Address"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"plainValue"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Hex"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"transaction"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"unsignedTransaction"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"address"},"value":{"kind":"Variable","name":{"kind":"Name","value":"address"}}},{"kind":"Argument","name":{"kind":"Name","value":"plainValue"},"value":{"kind":"Variable","name":{"kind":"Name","value":"plainValue"}}}]}]}}]}}]} as unknown as DocumentNode<UnsignedTransactionQuery, UnsignedTransactionQueryVariables>;
export const StageTransactionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"StageTransaction"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"unsignedTransaction"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Hex"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"signature"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Hex"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"stageTransaction"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"unsignedTransaction"},"value":{"kind":"Variable","name":{"kind":"Name","value":"unsignedTransaction"}}},{"kind":"Argument","name":{"kind":"Name","value":"signature"},"value":{"kind":"Variable","name":{"kind":"Name","value":"signature"}}}]}]}}]} as unknown as DocumentNode<StageTransactionMutation, StageTransactionMutationVariables>;
export const TransactionResultDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"TransactionResult"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"txId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"TxId"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"transaction"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"transactionResult"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"txId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"txId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"txStatus"}},{"kind":"Field","name":{"kind":"Name","value":"blockIndex"}},{"kind":"Field","name":{"kind":"Name","value":"exceptionNames"}}]}}]}}]}}]} as unknown as DocumentNode<TransactionResultQuery, TransactionResultQueryVariables>;