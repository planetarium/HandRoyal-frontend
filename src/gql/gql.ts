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
    "\n  query GetUser($address: Address!) {\n    stateQuery {\n      getUserData(userId: $address) {\n        id\n        name\n        registeredGloves\n        ownedGloves {\n          id\n          count\n        }\n        equippedGlove\n        sessionId\n        balance\n      }\n    }\n  }\n": typeof types.GetUserDocument,
    "\n  query GetMatchPool {\n    stateQuery {\n      getMatchPool {\n        userId\n        gloves\n        registeredHeight\n      }\n    }\n  }\n": typeof types.GetMatchPoolDocument,
    "\n  query GetSessions {\n    stateQuery {\n      sessions {\n        metadata {\n          id\n          organizer\n          prize\n          maximumUser\n          minimumUser\n          remainingUser\n          users\n        }\n        state\n        players {\n          id\n          gloves\n        }\n        creationHeight\n        startHeight\n      }\n    }\n  }\n": typeof types.GetSessionsDocument,
    "\n  query GetUserScopedSession($sessionId: Address!, $userId: Address!) {\n    stateQuery {\n      userScopedSession(sessionId: $sessionId, userId: $userId) {\n        sessionId\n        height\n        sessionState\n        organizerAddress\n        opponentAddress\n        currentInterval\n        isPlayer\n        myGloves\n        opponentGloves\n        playersLeft\n        currentPhaseIndex\n        currentUserRoundIndex\n        myCondition {\n          healthPoint\n          gloveUsed\n          submission\n          activeEffectData {\n            type\n            duration\n            parameters\n          }\n        }\n        opponentCondition {\n          healthPoint\n          gloveUsed\n          submission\n          activeEffectData {\n            type\n            duration\n            parameters\n          }\n        }\n        lastRoundWinner\n        currentUserMatchState\n        playerState\n        intervalEndHeight\n      }\n    }\n  }\n": typeof types.GetUserScopedSessionDocument,
    "\n  query GetSessionHeader($sessionId: Address!) {\n    stateQuery {\n      session(sessionId: $sessionId) {\n        metadata {\n          id\n          organizer\n          prize\n          maximumUser\n          minimumUser\n          remainingUser\n          startAfter\n          maxRounds\n          roundLength\n          roundInterval\n          initialHealthPoint\n          numberOfGloves\n        }\n        state\n        players {\n          id\n          gloves\n        }\n        creationHeight\n        startHeight\n      }\n    }\n  }\n": typeof types.GetSessionHeaderDocument,
    "\n  query IsValidSessionId($sessionId: Address!) {\n    isValidSessionId(sessionId: $sessionId)\n  }\n": typeof types.IsValidSessionIdDocument,
    "\n  query GetSession($sessionId: Address!) {\n    stateQuery {\n      session(sessionId: $sessionId) {\n        metadata {\n          id\n          organizer\n          prize\n          maximumUser\n          minimumUser\n          remainingUser\n          startAfter\n          maxRounds\n          roundLength\n          roundInterval\n          initialHealthPoint\n          numberOfGloves\n          users\n        }\n        state\n        players {\n          id\n          gloves\n          state\n        }\n        phases {\n          height\n          matches {\n            startHeight\n            players\n            state\n            rounds {\n              condition1 {\n                healthPoint\n                gloveUsed\n                submission\n              }\n              condition2 {\n                healthPoint\n                gloveUsed\n                submission\n              }\n              winner\n            }\n            winner\n          }\n        }\n        creationHeight\n        startHeight\n        height\n      }\n    }\n  }\n": typeof types.GetSessionDocument,
    "\n  query IsGloveRegistered($gloveId: Address!) {\n    isGloveRegistered(gloveId: $gloveId)\n  }\n": typeof types.IsGloveRegisteredDocument,
    "\n  query CreateSessionAction(\n    $sessionId: Address!,\n    $prize: Address!,\n    $maximumUser: Int!,\n    $minimumUser: Int!,\n    $remainingUser: Int!,\n    $startAfter: Long!,\n    $maxRounds: Int!,\n    $roundLength: Long!,\n    $roundInterval: Long!,\n    $initialHealthPoint: Int!,\n    $users: [Address!]!\n  ) {\n    actionQuery {\n      createSession(\n        sessionId: $sessionId,\n        prize: $prize,\n        maximumUser: $maximumUser,\n        minimumUser: $minimumUser,\n        remainingUser: $remainingUser,\n        startAfter: $startAfter,\n        maxRounds: $maxRounds,\n        roundLength: $roundLength,\n        roundInterval: $roundInterval,\n        initialHealthPoint: $initialHealthPoint,\n        users: $users\n      )\n    }\n  }\n": typeof types.CreateSessionActionDocument,
    "\n  query JoinSessionAction($sessionId: Address!, $gloves: [Address!]!) {\n    actionQuery {\n      joinSession(sessionId: $sessionId, gloves: $gloves)\n    }\n  }\n": typeof types.JoinSessionActionDocument,
    "\n  query CreateUserAction($name: String!) {\n    actionQuery {\n      createUser(name: $name)\n    }\n  }\n": typeof types.CreateUserActionDocument,
    "\n  query SubmitMoveAction($sessionId: Address!, $gloveIndex: Int!) {\n    actionQuery {\n      submitMove(sessionId: $sessionId, gloveIndex: $gloveIndex)\n    }\n  }\n": typeof types.SubmitMoveActionDocument,
    "\n  query RegisterGloveAction($gloveId: Address!) {\n    actionQuery {\n      registerGlove(gloveId: $gloveId)\n    }\n  }\n": typeof types.RegisterGloveActionDocument,
    "\n  query PickUpAction {\n    actionQuery {\n      pickUp\n    }\n  }\n": typeof types.PickUpActionDocument,
    "\n  query PickUpManyAction {\n    actionQuery {\n      pickUpMany\n    }\n  }\n": typeof types.PickUpManyActionDocument,
    "\n  query RegisterMatchingAction($gloves: [Address!]!) {\n    actionQuery {\n      registerMatching(gloves: $gloves)\n    }\n  }\n": typeof types.RegisterMatchingActionDocument,
    "\n  query CancelMatchingAction {\n    actionQuery {\n      cancelMatching\n    }\n  }\n": typeof types.CancelMatchingActionDocument,
    "  \n  query UnsignedTransaction($address: Address!, $plainValue: Hex!) {\n    transaction {\n      unsignedTransaction(address: $address, plainValue: $plainValue)\n    }\n  }\n": typeof types.UnsignedTransactionDocument,
    "  \n  mutation StageTransaction($unsignedTransaction: Hex!, $signature: Hex!) {\n    stageTransaction(unsignedTransaction: $unsignedTransaction, signature: $signature)\n  }\n": typeof types.StageTransactionDocument,
    "\n  query TransactionResult($txId: TxId!) {\n    transaction {\n      transactionResult(txId: $txId) {\n        txStatus\n        blockIndex\n        exceptionNames\n      }\n    }\n  }\n": typeof types.TransactionResultDocument,
};
const documents: Documents = {
    "\n  query GetUser($address: Address!) {\n    stateQuery {\n      getUserData(userId: $address) {\n        id\n        name\n        registeredGloves\n        ownedGloves {\n          id\n          count\n        }\n        equippedGlove\n        sessionId\n        balance\n      }\n    }\n  }\n": types.GetUserDocument,
    "\n  query GetMatchPool {\n    stateQuery {\n      getMatchPool {\n        userId\n        gloves\n        registeredHeight\n      }\n    }\n  }\n": types.GetMatchPoolDocument,
    "\n  query GetSessions {\n    stateQuery {\n      sessions {\n        metadata {\n          id\n          organizer\n          prize\n          maximumUser\n          minimumUser\n          remainingUser\n          users\n        }\n        state\n        players {\n          id\n          gloves\n        }\n        creationHeight\n        startHeight\n      }\n    }\n  }\n": types.GetSessionsDocument,
    "\n  query GetUserScopedSession($sessionId: Address!, $userId: Address!) {\n    stateQuery {\n      userScopedSession(sessionId: $sessionId, userId: $userId) {\n        sessionId\n        height\n        sessionState\n        organizerAddress\n        opponentAddress\n        currentInterval\n        isPlayer\n        myGloves\n        opponentGloves\n        playersLeft\n        currentPhaseIndex\n        currentUserRoundIndex\n        myCondition {\n          healthPoint\n          gloveUsed\n          submission\n          activeEffectData {\n            type\n            duration\n            parameters\n          }\n        }\n        opponentCondition {\n          healthPoint\n          gloveUsed\n          submission\n          activeEffectData {\n            type\n            duration\n            parameters\n          }\n        }\n        lastRoundWinner\n        currentUserMatchState\n        playerState\n        intervalEndHeight\n      }\n    }\n  }\n": types.GetUserScopedSessionDocument,
    "\n  query GetSessionHeader($sessionId: Address!) {\n    stateQuery {\n      session(sessionId: $sessionId) {\n        metadata {\n          id\n          organizer\n          prize\n          maximumUser\n          minimumUser\n          remainingUser\n          startAfter\n          maxRounds\n          roundLength\n          roundInterval\n          initialHealthPoint\n          numberOfGloves\n        }\n        state\n        players {\n          id\n          gloves\n        }\n        creationHeight\n        startHeight\n      }\n    }\n  }\n": types.GetSessionHeaderDocument,
    "\n  query IsValidSessionId($sessionId: Address!) {\n    isValidSessionId(sessionId: $sessionId)\n  }\n": types.IsValidSessionIdDocument,
    "\n  query GetSession($sessionId: Address!) {\n    stateQuery {\n      session(sessionId: $sessionId) {\n        metadata {\n          id\n          organizer\n          prize\n          maximumUser\n          minimumUser\n          remainingUser\n          startAfter\n          maxRounds\n          roundLength\n          roundInterval\n          initialHealthPoint\n          numberOfGloves\n          users\n        }\n        state\n        players {\n          id\n          gloves\n          state\n        }\n        phases {\n          height\n          matches {\n            startHeight\n            players\n            state\n            rounds {\n              condition1 {\n                healthPoint\n                gloveUsed\n                submission\n              }\n              condition2 {\n                healthPoint\n                gloveUsed\n                submission\n              }\n              winner\n            }\n            winner\n          }\n        }\n        creationHeight\n        startHeight\n        height\n      }\n    }\n  }\n": types.GetSessionDocument,
    "\n  query IsGloveRegistered($gloveId: Address!) {\n    isGloveRegistered(gloveId: $gloveId)\n  }\n": types.IsGloveRegisteredDocument,
    "\n  query CreateSessionAction(\n    $sessionId: Address!,\n    $prize: Address!,\n    $maximumUser: Int!,\n    $minimumUser: Int!,\n    $remainingUser: Int!,\n    $startAfter: Long!,\n    $maxRounds: Int!,\n    $roundLength: Long!,\n    $roundInterval: Long!,\n    $initialHealthPoint: Int!,\n    $users: [Address!]!\n  ) {\n    actionQuery {\n      createSession(\n        sessionId: $sessionId,\n        prize: $prize,\n        maximumUser: $maximumUser,\n        minimumUser: $minimumUser,\n        remainingUser: $remainingUser,\n        startAfter: $startAfter,\n        maxRounds: $maxRounds,\n        roundLength: $roundLength,\n        roundInterval: $roundInterval,\n        initialHealthPoint: $initialHealthPoint,\n        users: $users\n      )\n    }\n  }\n": types.CreateSessionActionDocument,
    "\n  query JoinSessionAction($sessionId: Address!, $gloves: [Address!]!) {\n    actionQuery {\n      joinSession(sessionId: $sessionId, gloves: $gloves)\n    }\n  }\n": types.JoinSessionActionDocument,
    "\n  query CreateUserAction($name: String!) {\n    actionQuery {\n      createUser(name: $name)\n    }\n  }\n": types.CreateUserActionDocument,
    "\n  query SubmitMoveAction($sessionId: Address!, $gloveIndex: Int!) {\n    actionQuery {\n      submitMove(sessionId: $sessionId, gloveIndex: $gloveIndex)\n    }\n  }\n": types.SubmitMoveActionDocument,
    "\n  query RegisterGloveAction($gloveId: Address!) {\n    actionQuery {\n      registerGlove(gloveId: $gloveId)\n    }\n  }\n": types.RegisterGloveActionDocument,
    "\n  query PickUpAction {\n    actionQuery {\n      pickUp\n    }\n  }\n": types.PickUpActionDocument,
    "\n  query PickUpManyAction {\n    actionQuery {\n      pickUpMany\n    }\n  }\n": types.PickUpManyActionDocument,
    "\n  query RegisterMatchingAction($gloves: [Address!]!) {\n    actionQuery {\n      registerMatching(gloves: $gloves)\n    }\n  }\n": types.RegisterMatchingActionDocument,
    "\n  query CancelMatchingAction {\n    actionQuery {\n      cancelMatching\n    }\n  }\n": types.CancelMatchingActionDocument,
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
export function graphql(source: "\n  query GetUser($address: Address!) {\n    stateQuery {\n      getUserData(userId: $address) {\n        id\n        name\n        registeredGloves\n        ownedGloves {\n          id\n          count\n        }\n        equippedGlove\n        sessionId\n        balance\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetUser($address: Address!) {\n    stateQuery {\n      getUserData(userId: $address) {\n        id\n        name\n        registeredGloves\n        ownedGloves {\n          id\n          count\n        }\n        equippedGlove\n        sessionId\n        balance\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetMatchPool {\n    stateQuery {\n      getMatchPool {\n        userId\n        gloves\n        registeredHeight\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetMatchPool {\n    stateQuery {\n      getMatchPool {\n        userId\n        gloves\n        registeredHeight\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetSessions {\n    stateQuery {\n      sessions {\n        metadata {\n          id\n          organizer\n          prize\n          maximumUser\n          minimumUser\n          remainingUser\n          users\n        }\n        state\n        players {\n          id\n          gloves\n        }\n        creationHeight\n        startHeight\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetSessions {\n    stateQuery {\n      sessions {\n        metadata {\n          id\n          organizer\n          prize\n          maximumUser\n          minimumUser\n          remainingUser\n          users\n        }\n        state\n        players {\n          id\n          gloves\n        }\n        creationHeight\n        startHeight\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetUserScopedSession($sessionId: Address!, $userId: Address!) {\n    stateQuery {\n      userScopedSession(sessionId: $sessionId, userId: $userId) {\n        sessionId\n        height\n        sessionState\n        organizerAddress\n        opponentAddress\n        currentInterval\n        isPlayer\n        myGloves\n        opponentGloves\n        playersLeft\n        currentPhaseIndex\n        currentUserRoundIndex\n        myCondition {\n          healthPoint\n          gloveUsed\n          submission\n          activeEffectData {\n            type\n            duration\n            parameters\n          }\n        }\n        opponentCondition {\n          healthPoint\n          gloveUsed\n          submission\n          activeEffectData {\n            type\n            duration\n            parameters\n          }\n        }\n        lastRoundWinner\n        currentUserMatchState\n        playerState\n        intervalEndHeight\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetUserScopedSession($sessionId: Address!, $userId: Address!) {\n    stateQuery {\n      userScopedSession(sessionId: $sessionId, userId: $userId) {\n        sessionId\n        height\n        sessionState\n        organizerAddress\n        opponentAddress\n        currentInterval\n        isPlayer\n        myGloves\n        opponentGloves\n        playersLeft\n        currentPhaseIndex\n        currentUserRoundIndex\n        myCondition {\n          healthPoint\n          gloveUsed\n          submission\n          activeEffectData {\n            type\n            duration\n            parameters\n          }\n        }\n        opponentCondition {\n          healthPoint\n          gloveUsed\n          submission\n          activeEffectData {\n            type\n            duration\n            parameters\n          }\n        }\n        lastRoundWinner\n        currentUserMatchState\n        playerState\n        intervalEndHeight\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetSessionHeader($sessionId: Address!) {\n    stateQuery {\n      session(sessionId: $sessionId) {\n        metadata {\n          id\n          organizer\n          prize\n          maximumUser\n          minimumUser\n          remainingUser\n          startAfter\n          maxRounds\n          roundLength\n          roundInterval\n          initialHealthPoint\n          numberOfGloves\n        }\n        state\n        players {\n          id\n          gloves\n        }\n        creationHeight\n        startHeight\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetSessionHeader($sessionId: Address!) {\n    stateQuery {\n      session(sessionId: $sessionId) {\n        metadata {\n          id\n          organizer\n          prize\n          maximumUser\n          minimumUser\n          remainingUser\n          startAfter\n          maxRounds\n          roundLength\n          roundInterval\n          initialHealthPoint\n          numberOfGloves\n        }\n        state\n        players {\n          id\n          gloves\n        }\n        creationHeight\n        startHeight\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query IsValidSessionId($sessionId: Address!) {\n    isValidSessionId(sessionId: $sessionId)\n  }\n"): (typeof documents)["\n  query IsValidSessionId($sessionId: Address!) {\n    isValidSessionId(sessionId: $sessionId)\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetSession($sessionId: Address!) {\n    stateQuery {\n      session(sessionId: $sessionId) {\n        metadata {\n          id\n          organizer\n          prize\n          maximumUser\n          minimumUser\n          remainingUser\n          startAfter\n          maxRounds\n          roundLength\n          roundInterval\n          initialHealthPoint\n          numberOfGloves\n          users\n        }\n        state\n        players {\n          id\n          gloves\n          state\n        }\n        phases {\n          height\n          matches {\n            startHeight\n            players\n            state\n            rounds {\n              condition1 {\n                healthPoint\n                gloveUsed\n                submission\n              }\n              condition2 {\n                healthPoint\n                gloveUsed\n                submission\n              }\n              winner\n            }\n            winner\n          }\n        }\n        creationHeight\n        startHeight\n        height\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetSession($sessionId: Address!) {\n    stateQuery {\n      session(sessionId: $sessionId) {\n        metadata {\n          id\n          organizer\n          prize\n          maximumUser\n          minimumUser\n          remainingUser\n          startAfter\n          maxRounds\n          roundLength\n          roundInterval\n          initialHealthPoint\n          numberOfGloves\n          users\n        }\n        state\n        players {\n          id\n          gloves\n          state\n        }\n        phases {\n          height\n          matches {\n            startHeight\n            players\n            state\n            rounds {\n              condition1 {\n                healthPoint\n                gloveUsed\n                submission\n              }\n              condition2 {\n                healthPoint\n                gloveUsed\n                submission\n              }\n              winner\n            }\n            winner\n          }\n        }\n        creationHeight\n        startHeight\n        height\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query IsGloveRegistered($gloveId: Address!) {\n    isGloveRegistered(gloveId: $gloveId)\n  }\n"): (typeof documents)["\n  query IsGloveRegistered($gloveId: Address!) {\n    isGloveRegistered(gloveId: $gloveId)\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query CreateSessionAction(\n    $sessionId: Address!,\n    $prize: Address!,\n    $maximumUser: Int!,\n    $minimumUser: Int!,\n    $remainingUser: Int!,\n    $startAfter: Long!,\n    $maxRounds: Int!,\n    $roundLength: Long!,\n    $roundInterval: Long!,\n    $initialHealthPoint: Int!,\n    $users: [Address!]!\n  ) {\n    actionQuery {\n      createSession(\n        sessionId: $sessionId,\n        prize: $prize,\n        maximumUser: $maximumUser,\n        minimumUser: $minimumUser,\n        remainingUser: $remainingUser,\n        startAfter: $startAfter,\n        maxRounds: $maxRounds,\n        roundLength: $roundLength,\n        roundInterval: $roundInterval,\n        initialHealthPoint: $initialHealthPoint,\n        users: $users\n      )\n    }\n  }\n"): (typeof documents)["\n  query CreateSessionAction(\n    $sessionId: Address!,\n    $prize: Address!,\n    $maximumUser: Int!,\n    $minimumUser: Int!,\n    $remainingUser: Int!,\n    $startAfter: Long!,\n    $maxRounds: Int!,\n    $roundLength: Long!,\n    $roundInterval: Long!,\n    $initialHealthPoint: Int!,\n    $users: [Address!]!\n  ) {\n    actionQuery {\n      createSession(\n        sessionId: $sessionId,\n        prize: $prize,\n        maximumUser: $maximumUser,\n        minimumUser: $minimumUser,\n        remainingUser: $remainingUser,\n        startAfter: $startAfter,\n        maxRounds: $maxRounds,\n        roundLength: $roundLength,\n        roundInterval: $roundInterval,\n        initialHealthPoint: $initialHealthPoint,\n        users: $users\n      )\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query JoinSessionAction($sessionId: Address!, $gloves: [Address!]!) {\n    actionQuery {\n      joinSession(sessionId: $sessionId, gloves: $gloves)\n    }\n  }\n"): (typeof documents)["\n  query JoinSessionAction($sessionId: Address!, $gloves: [Address!]!) {\n    actionQuery {\n      joinSession(sessionId: $sessionId, gloves: $gloves)\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query CreateUserAction($name: String!) {\n    actionQuery {\n      createUser(name: $name)\n    }\n  }\n"): (typeof documents)["\n  query CreateUserAction($name: String!) {\n    actionQuery {\n      createUser(name: $name)\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query SubmitMoveAction($sessionId: Address!, $gloveIndex: Int!) {\n    actionQuery {\n      submitMove(sessionId: $sessionId, gloveIndex: $gloveIndex)\n    }\n  }\n"): (typeof documents)["\n  query SubmitMoveAction($sessionId: Address!, $gloveIndex: Int!) {\n    actionQuery {\n      submitMove(sessionId: $sessionId, gloveIndex: $gloveIndex)\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query RegisterGloveAction($gloveId: Address!) {\n    actionQuery {\n      registerGlove(gloveId: $gloveId)\n    }\n  }\n"): (typeof documents)["\n  query RegisterGloveAction($gloveId: Address!) {\n    actionQuery {\n      registerGlove(gloveId: $gloveId)\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query PickUpAction {\n    actionQuery {\n      pickUp\n    }\n  }\n"): (typeof documents)["\n  query PickUpAction {\n    actionQuery {\n      pickUp\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query PickUpManyAction {\n    actionQuery {\n      pickUpMany\n    }\n  }\n"): (typeof documents)["\n  query PickUpManyAction {\n    actionQuery {\n      pickUpMany\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query RegisterMatchingAction($gloves: [Address!]!) {\n    actionQuery {\n      registerMatching(gloves: $gloves)\n    }\n  }\n"): (typeof documents)["\n  query RegisterMatchingAction($gloves: [Address!]!) {\n    actionQuery {\n      registerMatching(gloves: $gloves)\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query CancelMatchingAction {\n    actionQuery {\n      cancelMatching\n    }\n  }\n"): (typeof documents)["\n  query CancelMatchingAction {\n    actionQuery {\n      cancelMatching\n    }\n  }\n"];
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