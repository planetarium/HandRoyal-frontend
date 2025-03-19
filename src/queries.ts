import { graphql } from './gql/gql';

export const GRAPHQL_ENDPOINT = import.meta.env.VITE_GRAPHQL_ENDPOINT;

export const getUserDocument = graphql(/* GraphQL */ `
  query GetUser($address: Address!) {
    stateQuery {
      user(userId: $address) {
        id
        registeredGloves
        ownedGloves {
          id
          count
        }
        equippedGlove
        sessionId
      }
    }
  }
`);

export const getSessionsDocument = graphql(/* GraphQL */ `
  query GetSessions {
    stateQuery {
      sessions {
        metadata {
          id
          organizer
          prize
          maximumUser
          minimumUser
          remainingUser
        }
        state
        players {
          id
          gloves
        }
        creationHeight
        startHeight
      }
    }
  }
`);

export const isValidSessionIdDocument = graphql(/* GraphQL */ `
  query IsValidSessionId($sessionId: Address!) {
    isValidSessionId(sessionId: $sessionId)
  }
`)

export const getSessionDocument = graphql(/* GraphQL */ `
  query GetSession($sessionId: Address!) {
    stateQuery {
      session(sessionId: $sessionId) {
        metadata {
          id
          organizer
          prize
          maximumUser
          minimumUser
          remainingUser
          startAfter
          maxRounds
          roundLength
          roundInterval
          initialHealthPoint
        }
        state
        players {
          id
          gloves
          state
        }
        phases {
          height
          matches {
            startHeight
            players
            state
            rounds {
              condition1 {
                healthPoint
                gloveUsed
                submission
              }
              condition2 {
                healthPoint
                gloveUsed
                submission
              }
              winner
            }
          }
        }
        creationHeight
        startHeight
        height
      }
    }
  }
`);

export const USER_SUBSCRIPTION = `
  subscription OnUserChanged($userId: Address!) {
    onUserChanged(userId: $userId) {
      id
      equippedGlove
    }
  }
`;

export const SESSION_SUBSCRIPTION = `
  subscription OnSessionChanged($sessionId: Address!, $userId: Address!) {
    onSessionChanged(sessionId: $sessionId, userId: $userId) {
      state
    }
  }
`;

export const isGloveRegisteredDocument = graphql(/* GraphQL */ `
  query IsGloveRegistered($gloveId: Address!) {
    isGloveRegistered(gloveId: $gloveId)
  }
`);

export const GLOVE_SUBSCRIPTION = `
  subscription OnGloveRegistered($gloveId: Address!) {
    onGloveRegistered(gloveId: $gloveId) {
      id
    }
  }
`;

export const createSessionAction = graphql(/* GraphQL */ `
  query CreateSessionAction(
    $sessionId: Address!,
    $prize: Address!,
    $maximumUser: Int!,
    $minimumUser: Int!,
    $remainingUser: Int!,
    $startAfter: Long!,
    $maxRounds: Int!,
    $roundLength: Long!,
    $roundInterval: Long!,
    $initialHealthPoint: Int!
  ) {
    actionQuery {
      createSession(
        sessionId: $sessionId,
        prize: $prize,
        maximumUser: $maximumUser,
        minimumUser: $minimumUser,
        remainingUser: $remainingUser,
        startAfter: $startAfter,
        maxRounds: $maxRounds,
        roundLength: $roundLength,
        roundInterval: $roundInterval,
        initialHealthPoint: $initialHealthPoint
      )
    }
  }
`);

export const joinSessionAction = graphql(/* GraphQL */ `
  query JoinSessionAction($sessionId: Address!, $gloves: [Address!]!) {
    actionQuery {
      joinSession(sessionId: $sessionId, gloves: $gloves)
    }
  }
`);

export const createUserAction = graphql(/* GraphQL */ `
  query CreateUserAction {
    actionQuery {
      createUser
    }
  }
`);

export const submitMoveAction = graphql(/* GraphQL */ `
  query SubmitMoveAction($sessionId: Address!, $gloveIndex: Int!) {
    actionQuery {
      submitMove(sessionId: $sessionId, gloveIndex: $gloveIndex)
    }
  }
`);

export const registerGloveAction = graphql(/* GraphQL */ `
  query RegisterGloveAction($gloveId: Address!) {
    actionQuery {
      registerGlove(gloveId: $gloveId)
    }
  }
`);

export const unsignedTransactionQuery = graphql(/* GraphQL */ `  
  query UnsignedTransaction($address: Address!, $plainValue: Hex!) {
    transaction {
      unsignedTransaction(address: $address, plainValue: $plainValue)
    }
  }
`);

export const stageTransactionMutation = graphql(/* GraphQL */ `  
  mutation StageTransaction($unsignedTransaction: Hex!, $signature: Hex!) {
    stageTransaction(unsignedTransaction: $unsignedTransaction, signature: $signature)
  }
`);

export const transactionResultQuery = graphql(/* GraphQL */ `
  query TransactionResult($txId: TxId!) {
    transaction {
      transactionResult(txId: $txId) {
        txStatus
        blockIndex
        exceptionNames
      }
    }
  }
`);

export const onTransactionChangedSubscription = `
  subscription OnTransactionChanged($txId: TxId!) {
    onTransactionChanged(txId: $txId) {
      status
    }
  }
`;