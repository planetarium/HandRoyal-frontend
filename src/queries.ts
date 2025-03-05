import { graphql } from './gql/gql';

export const GRAPHQL_ENDPOINT = import.meta.env.VITE_GRAPHQL_ENDPOINT;

export const getUserDocument = graphql(/* GraphQL */ `
  query GetUser($address: Address!) {
    stateQuery {
      user(userId: $address) {
        id
        gloves
        sessionId
      }
    }
  }
`);

export const createUserDocument = graphql(/* GraphQL */ `
  mutation CreateUser($privateKey: PrivateKey) {
    createUser(privateKey: $privateKey)
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

export const joinSessionDocument = graphql(/* GraphQL */ `
  mutation JoinSession($privateKey: PrivateKey, $sessionId: Address!) {
    joinSession(privateKey: $privateKey, sessionId: $sessionId)
  }
`);

export const isValidSessionIdDocument = graphql(/* GraphQL */ `
  query IsValidSessionId($sessionId: Address!) {
    isValidSessionId(sessionId: $sessionId)
  }
`)

export const createSessionDocument = graphql(/* GraphQL */ `
  mutation CreateSession($privateKey: PrivateKey, $sessionId: Address!, $prize: Address!, $maximumUser: Int!, $minimumUser: Int!, $remainingUser: Int!, $roundInterval: Long!, $waitingInterval: Long!) {
    createSession(privateKey: $privateKey, sessionId: $sessionId, prize: $prize, maximumUser: $maximumUser, minimumUser: $minimumUser, remainingUser: $remainingUser, roundInterval: $roundInterval, waitingInterval: $waitingInterval)
  }
`);

export const transactionResultDocument = graphql(/* GraphQL */ `
  query TransactionResult($txId: TxId!) {
    transaction
    {
      transactionResult(txId: $txId) {
        txStatus
      }
    }
  }
`);

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
          waitingInterval
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

export const submitMoveDocument = graphql(/* GraphQL */ `
  mutation SubmitMove($privateKey: PrivateKey, $sessionId: Address!, $move: MoveType!) {
    submitMove(privateKey: $privateKey, sessionId: $sessionId, move: $move)
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

export const registerGloveDocument = graphql(/* GraphQL */ `
  mutation RegisterGlove($privateKey: PrivateKey, $gloveId: Address!) {
    registerGlove(privateKey: $privateKey, gloveId: $gloveId)
  }
`);

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