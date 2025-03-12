import { graphql } from './gql/gql';

export const GRAPHQL_ENDPOINT = import.meta.env.VITE_GRAPHQL_ENDPOINT;

export const getUserDocument = graphql(/* GraphQL */ `
  query GetUser($address: Address!) {
    stateQuery {
      user(userId: $address) {
        id
        registeredGloves
        ownedGloves
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
          glove
        }
        rounds {
          height
          matches {
            move1 {
              type
            }
            move2 {
              type
            }
          }
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
          roundLength
          roundInterval
        }
        state
        players {
          id
          glove
          state
        }
        rounds {
          height
          matches {
            move1 {
              playerIndex
              type
            }
            move2 {
              playerIndex
              type
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

export const getGloveDocument = graphql(/* GraphQL */ `
  query GetGlove($gloveId: Address!) {
    stateQuery {
      glove(gloveId: $gloveId) {
        id
        author
      }
    }
  }
`);

export const createSessionAction = graphql(/* GraphQL */ `
  query CreateSessionAction(
    $sessionId: Address!,
    $prize: Address!,
    $maximumUser: Int!,
    $minimumUser: Int!,
    $remainingUser: Int!,
    $startAfter: Long!,
    $roundLength: Long!,
    $roundInterval: Long!
  ) {
    actionQuery {
      createSession(
        sessionId: $sessionId,
        prize: $prize,
        maximumUser: $maximumUser,
        minimumUser: $minimumUser,
        remainingUser: $remainingUser,
        startAfter: $startAfter,
        roundLength: $roundLength,
        roundInterval: $roundInterval
      )
    }
  }
`);

export const joinSessionAction = graphql(/* GraphQL */ `
  query JoinSessionAction($sessionId: Address!, $gloveId: Address) {
    actionQuery {
      joinSession(sessionId: $sessionId, gloveId: $gloveId)
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
  query SubmitMoveAction($sessionId: Address!, $move: MoveType!) {
    actionQuery {
      submitMove(sessionId: $sessionId, move: $move)
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