/* eslint-disable */
import * as types from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "\n  query GetUser($address: Address!) {\n    stateQuery {\n      user(userId: $address) {\n        id\n        registeredGloves\n        ownedGloves\n        equippedGlove\n        sessionId\n      }\n    }\n  }\n": typeof types.GetUserDocument,
    "\n  query GetSessions {\n    stateQuery {\n      sessions {\n        metadata {\n          id\n          organizer\n          prize\n          maximumUser\n          minimumUser\n          remainingUser\n        }\n        state\n        players {\n          id\n          glove\n        }\n        rounds {\n          height\n          matches {\n            move1 {\n              type\n            }\n            move2 {\n              type\n            }\n          }\n        }\n        creationHeight\n        startHeight\n      }\n    }\n  }\n": typeof types.GetSessionsDocument,
    "\n  query IsValidSessionId($sessionId: Address!) {\n    isValidSessionId(sessionId: $sessionId)\n  }\n": typeof types.IsValidSessionIdDocument,
    "\n  query GetSession($sessionId: Address!) {\n    stateQuery {\n      session(sessionId: $sessionId) {\n        metadata {\n          id\n          organizer\n          prize\n          maximumUser\n          minimumUser\n          remainingUser\n          startAfter\n          roundLength\n          roundInterval\n        }\n        state\n        players {\n          id\n          glove\n          state\n        }\n        rounds {\n          height\n          matches {\n            move1 {\n              playerIndex\n              type\n            }\n            move2 {\n              playerIndex\n              type\n            }\n          }\n        }\n        creationHeight\n        startHeight\n        height\n      }\n    }\n  }\n": typeof types.GetSessionDocument,
    "\n  query IsGloveRegistered($gloveId: Address!) {\n    isGloveRegistered(gloveId: $gloveId)\n  }\n": typeof types.IsGloveRegisteredDocument,
    "\n  query GetGlove($gloveId: Address!) {\n    stateQuery {\n      glove(gloveId: $gloveId) {\n        id\n        author\n      }\n    }\n  }\n": typeof types.GetGloveDocument,
    "\n  query CreateSessionAction(\n    $sessionId: Address!,\n    $prize: Address!,\n    $maximumUser: Int!,\n    $minimumUser: Int!,\n    $remainingUser: Int!,\n    $startAfter: Long!,\n    $roundLength: Long!,\n    $roundInterval: Long!\n  ) {\n    actionQuery {\n      createSession(\n        sessionId: $sessionId,\n        prize: $prize,\n        maximumUser: $maximumUser,\n        minimumUser: $minimumUser,\n        remainingUser: $remainingUser,\n        startAfter: $startAfter,\n        roundLength: $roundLength,\n        roundInterval: $roundInterval\n      )\n    }\n  }\n": typeof types.CreateSessionActionDocument,
    "\n  query JoinSessionAction($sessionId: Address!, $gloveId: Address) {\n    actionQuery {\n      joinSession(sessionId: $sessionId, gloveId: $gloveId)\n    }\n  }\n": typeof types.JoinSessionActionDocument,
    "\n  query CreateUserAction {\n    actionQuery {\n      createUser\n    }\n  }\n": typeof types.CreateUserActionDocument,
    "\n  query SubmitMoveAction($sessionId: Address!, $move: MoveType!) {\n    actionQuery {\n      submitMove(sessionId: $sessionId, move: $move)\n    }\n  }\n": typeof types.SubmitMoveActionDocument,
    "\n  query RegisterGloveAction($gloveId: Address!) {\n    actionQuery {\n      registerGlove(gloveId: $gloveId)\n    }\n  }\n": typeof types.RegisterGloveActionDocument,
    "  \n  query UnsignedTransaction($address: Address!, $plainValue: Hex!) {\n    transaction {\n      unsignedTransaction(address: $address, plainValue: $plainValue)\n    }\n  }\n": typeof types.UnsignedTransactionDocument,
    "  \n  mutation StageTransaction($unsignedTransaction: Hex!, $signature: Hex!) {\n    stageTransaction(unsignedTransaction: $unsignedTransaction, signature: $signature)\n  }\n": typeof types.StageTransactionDocument,
    "\n  query TransactionResult($txId: TxId!) {\n    transaction {\n      transactionResult(txId: $txId) {\n        txStatus\n        blockIndex\n        exceptionNames\n      }\n    }\n  }\n": typeof types.TransactionResultDocument,
};
const documents: Documents = {
    "\n  query GetUser($address: Address!) {\n    stateQuery {\n      user(userId: $address) {\n        id\n        registeredGloves\n        ownedGloves\n        equippedGlove\n        sessionId\n      }\n    }\n  }\n": types.GetUserDocument,
    "\n  query GetSessions {\n    stateQuery {\n      sessions {\n        metadata {\n          id\n          organizer\n          prize\n          maximumUser\n          minimumUser\n          remainingUser\n        }\n        state\n        players {\n          id\n          glove\n        }\n        rounds {\n          height\n          matches {\n            move1 {\n              type\n            }\n            move2 {\n              type\n            }\n          }\n        }\n        creationHeight\n        startHeight\n      }\n    }\n  }\n": types.GetSessionsDocument,
    "\n  query IsValidSessionId($sessionId: Address!) {\n    isValidSessionId(sessionId: $sessionId)\n  }\n": types.IsValidSessionIdDocument,
    "\n  query GetSession($sessionId: Address!) {\n    stateQuery {\n      session(sessionId: $sessionId) {\n        metadata {\n          id\n          organizer\n          prize\n          maximumUser\n          minimumUser\n          remainingUser\n          startAfter\n          roundLength\n          roundInterval\n        }\n        state\n        players {\n          id\n          glove\n          state\n        }\n        rounds {\n          height\n          matches {\n            move1 {\n              playerIndex\n              type\n            }\n            move2 {\n              playerIndex\n              type\n            }\n          }\n        }\n        creationHeight\n        startHeight\n        height\n      }\n    }\n  }\n": types.GetSessionDocument,
    "\n  query IsGloveRegistered($gloveId: Address!) {\n    isGloveRegistered(gloveId: $gloveId)\n  }\n": types.IsGloveRegisteredDocument,
    "\n  query GetGlove($gloveId: Address!) {\n    stateQuery {\n      glove(gloveId: $gloveId) {\n        id\n        author\n      }\n    }\n  }\n": types.GetGloveDocument,
    "\n  query CreateSessionAction(\n    $sessionId: Address!,\n    $prize: Address!,\n    $maximumUser: Int!,\n    $minimumUser: Int!,\n    $remainingUser: Int!,\n    $startAfter: Long!,\n    $roundLength: Long!,\n    $roundInterval: Long!\n  ) {\n    actionQuery {\n      createSession(\n        sessionId: $sessionId,\n        prize: $prize,\n        maximumUser: $maximumUser,\n        minimumUser: $minimumUser,\n        remainingUser: $remainingUser,\n        startAfter: $startAfter,\n        roundLength: $roundLength,\n        roundInterval: $roundInterval\n      )\n    }\n  }\n": types.CreateSessionActionDocument,
    "\n  query JoinSessionAction($sessionId: Address!, $gloveId: Address) {\n    actionQuery {\n      joinSession(sessionId: $sessionId, gloveId: $gloveId)\n    }\n  }\n": types.JoinSessionActionDocument,
    "\n  query CreateUserAction {\n    actionQuery {\n      createUser\n    }\n  }\n": types.CreateUserActionDocument,
    "\n  query SubmitMoveAction($sessionId: Address!, $move: MoveType!) {\n    actionQuery {\n      submitMove(sessionId: $sessionId, move: $move)\n    }\n  }\n": types.SubmitMoveActionDocument,
    "\n  query RegisterGloveAction($gloveId: Address!) {\n    actionQuery {\n      registerGlove(gloveId: $gloveId)\n    }\n  }\n": types.RegisterGloveActionDocument,
    "  \n  query UnsignedTransaction($address: Address!, $plainValue: Hex!) {\n    transaction {\n      unsignedTransaction(address: $address, plainValue: $plainValue)\n    }\n  }\n": types.UnsignedTransactionDocument,
    "  \n  mutation StageTransaction($unsignedTransaction: Hex!, $signature: Hex!) {\n    stageTransaction(unsignedTransaction: $unsignedTransaction, signature: $signature)\n  }\n": types.StageTransactionDocument,
    "\n  query TransactionResult($txId: TxId!) {\n    transaction {\n      transactionResult(txId: $txId) {\n        txStatus\n        blockIndex\n        exceptionNames\n      }\n    }\n  }\n": types.TransactionResultDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetUser($address: Address!) {\n    stateQuery {\n      user(userId: $address) {\n        id\n        registeredGloves\n        ownedGloves\n        equippedGlove\n        sessionId\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetUser($address: Address!) {\n    stateQuery {\n      user(userId: $address) {\n        id\n        registeredGloves\n        ownedGloves\n        equippedGlove\n        sessionId\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetSessions {\n    stateQuery {\n      sessions {\n        metadata {\n          id\n          organizer\n          prize\n          maximumUser\n          minimumUser\n          remainingUser\n        }\n        state\n        players {\n          id\n          glove\n        }\n        rounds {\n          height\n          matches {\n            move1 {\n              type\n            }\n            move2 {\n              type\n            }\n          }\n        }\n        creationHeight\n        startHeight\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetSessions {\n    stateQuery {\n      sessions {\n        metadata {\n          id\n          organizer\n          prize\n          maximumUser\n          minimumUser\n          remainingUser\n        }\n        state\n        players {\n          id\n          glove\n        }\n        rounds {\n          height\n          matches {\n            move1 {\n              type\n            }\n            move2 {\n              type\n            }\n          }\n        }\n        creationHeight\n        startHeight\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query IsValidSessionId($sessionId: Address!) {\n    isValidSessionId(sessionId: $sessionId)\n  }\n"): (typeof documents)["\n  query IsValidSessionId($sessionId: Address!) {\n    isValidSessionId(sessionId: $sessionId)\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetSession($sessionId: Address!) {\n    stateQuery {\n      session(sessionId: $sessionId) {\n        metadata {\n          id\n          organizer\n          prize\n          maximumUser\n          minimumUser\n          remainingUser\n          startAfter\n          roundLength\n          roundInterval\n        }\n        state\n        players {\n          id\n          glove\n          state\n        }\n        rounds {\n          height\n          matches {\n            move1 {\n              playerIndex\n              type\n            }\n            move2 {\n              playerIndex\n              type\n            }\n          }\n        }\n        creationHeight\n        startHeight\n        height\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetSession($sessionId: Address!) {\n    stateQuery {\n      session(sessionId: $sessionId) {\n        metadata {\n          id\n          organizer\n          prize\n          maximumUser\n          minimumUser\n          remainingUser\n          startAfter\n          roundLength\n          roundInterval\n        }\n        state\n        players {\n          id\n          glove\n          state\n        }\n        rounds {\n          height\n          matches {\n            move1 {\n              playerIndex\n              type\n            }\n            move2 {\n              playerIndex\n              type\n            }\n          }\n        }\n        creationHeight\n        startHeight\n        height\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query IsGloveRegistered($gloveId: Address!) {\n    isGloveRegistered(gloveId: $gloveId)\n  }\n"): (typeof documents)["\n  query IsGloveRegistered($gloveId: Address!) {\n    isGloveRegistered(gloveId: $gloveId)\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetGlove($gloveId: Address!) {\n    stateQuery {\n      glove(gloveId: $gloveId) {\n        id\n        author\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetGlove($gloveId: Address!) {\n    stateQuery {\n      glove(gloveId: $gloveId) {\n        id\n        author\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query CreateSessionAction(\n    $sessionId: Address!,\n    $prize: Address!,\n    $maximumUser: Int!,\n    $minimumUser: Int!,\n    $remainingUser: Int!,\n    $startAfter: Long!,\n    $roundLength: Long!,\n    $roundInterval: Long!\n  ) {\n    actionQuery {\n      createSession(\n        sessionId: $sessionId,\n        prize: $prize,\n        maximumUser: $maximumUser,\n        minimumUser: $minimumUser,\n        remainingUser: $remainingUser,\n        startAfter: $startAfter,\n        roundLength: $roundLength,\n        roundInterval: $roundInterval\n      )\n    }\n  }\n"): (typeof documents)["\n  query CreateSessionAction(\n    $sessionId: Address!,\n    $prize: Address!,\n    $maximumUser: Int!,\n    $minimumUser: Int!,\n    $remainingUser: Int!,\n    $startAfter: Long!,\n    $roundLength: Long!,\n    $roundInterval: Long!\n  ) {\n    actionQuery {\n      createSession(\n        sessionId: $sessionId,\n        prize: $prize,\n        maximumUser: $maximumUser,\n        minimumUser: $minimumUser,\n        remainingUser: $remainingUser,\n        startAfter: $startAfter,\n        roundLength: $roundLength,\n        roundInterval: $roundInterval\n      )\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query JoinSessionAction($sessionId: Address!, $gloveId: Address) {\n    actionQuery {\n      joinSession(sessionId: $sessionId, gloveId: $gloveId)\n    }\n  }\n"): (typeof documents)["\n  query JoinSessionAction($sessionId: Address!, $gloveId: Address) {\n    actionQuery {\n      joinSession(sessionId: $sessionId, gloveId: $gloveId)\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query CreateUserAction {\n    actionQuery {\n      createUser\n    }\n  }\n"): (typeof documents)["\n  query CreateUserAction {\n    actionQuery {\n      createUser\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query SubmitMoveAction($sessionId: Address!, $move: MoveType!) {\n    actionQuery {\n      submitMove(sessionId: $sessionId, move: $move)\n    }\n  }\n"): (typeof documents)["\n  query SubmitMoveAction($sessionId: Address!, $move: MoveType!) {\n    actionQuery {\n      submitMove(sessionId: $sessionId, move: $move)\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query RegisterGloveAction($gloveId: Address!) {\n    actionQuery {\n      registerGlove(gloveId: $gloveId)\n    }\n  }\n"): (typeof documents)["\n  query RegisterGloveAction($gloveId: Address!) {\n    actionQuery {\n      registerGlove(gloveId: $gloveId)\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "  \n  query UnsignedTransaction($address: Address!, $plainValue: Hex!) {\n    transaction {\n      unsignedTransaction(address: $address, plainValue: $plainValue)\n    }\n  }\n"): (typeof documents)["  \n  query UnsignedTransaction($address: Address!, $plainValue: Hex!) {\n    transaction {\n      unsignedTransaction(address: $address, plainValue: $plainValue)\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "  \n  mutation StageTransaction($unsignedTransaction: Hex!, $signature: Hex!) {\n    stageTransaction(unsignedTransaction: $unsignedTransaction, signature: $signature)\n  }\n"): (typeof documents)["  \n  mutation StageTransaction($unsignedTransaction: Hex!, $signature: Hex!) {\n    stageTransaction(unsignedTransaction: $unsignedTransaction, signature: $signature)\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query TransactionResult($txId: TxId!) {\n    transaction {\n      transactionResult(txId: $txId) {\n        txStatus\n        blockIndex\n        exceptionNames\n      }\n    }\n  }\n"): (typeof documents)["\n  query TransactionResult($txId: TxId!) {\n    transaction {\n      transactionResult(txId: $txId) {\n        txStatus\n        blockIndex\n        exceptionNames\n      }\n    }\n  }\n"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;