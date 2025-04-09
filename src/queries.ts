import { graphql } from './gql/gql';

export const GRAPHQL_ENDPOINT = import.meta.env.VITE_GRAPHQL_ENDPOINT;

export const getUserDocument = graphql(/* GraphQL */ `
  query GetUser($address: Address!) {
    stateQuery {
      getUserData(userId: $address) {
        id
        name
        registeredGloves
        ownedGloves {
          id
          count
        }
        equippedGlove
        sessionId
        balance
      }
    }
  }
`);

export const getMatchPoolDocument = graphql(/* GraphQL */ `
  query GetMatchPool {
    stateQuery {
      getMatchPool {
        userId
        gloves
        registeredHeight
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
          users
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

export const getUserScopedSessionDocument = graphql(/* GraphQL */ `
  query GetUserScopedSession($sessionId: Address!, $userId: Address!) {
    stateQuery {
      userScopedSession(sessionId: $sessionId, userId: $userId) {
        sessionId
        height
        sessionState
        organizerAddress
        opponentAddress
        currentInterval
        isPlayer
        myGloves
        opponentGloves
        playersLeft
        currentPhaseIndex
        currentUserRoundIndex
        myCondition {
          healthPoint
          gloveUsed
          submission
          activeEffectData {
            type
            duration
            parameters
          }
        }
        opponentCondition {
          healthPoint
          gloveUsed
          submission
          activeEffectData {
            type
            duration
            parameters
          }
        }
        lastRoundWinner
        currentUserMatchState
        playerState
        intervalEndHeight
      }
    }
  }
`);

export const getSessionHeaderDocument = graphql(/* GraphQL */ `
  query GetSessionHeader($sessionId: Address!) {
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
          numberOfGloves
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
          numberOfGloves
          users
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
            winner
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
      sessionState
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

export const PICK_UP_RESULT_SUBSCRIPTION = `
  subscription OnPickUpResult($userId: Address!) {
    onPickUpResult(userId: $userId) {
      gloves
    }
  }
`;

export const MATCH_MADE_SUBSCRIPTION = `
  subscription OnMatchMade($userId: Address!) {
    onMatchMade(userId: $userId) {
      sessionId
      players
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
    $initialHealthPoint: Int!,
    $users: [Address!]!
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
        initialHealthPoint: $initialHealthPoint,
        users: $users
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
  query CreateUserAction($name: String!) {
    actionQuery {
      createUser(name: $name)
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

export const pickUpAction = graphql(/* GraphQL */ `
  query PickUpAction {
    actionQuery {
      pickUp
    }
  }
`);

export const pickUpManyAction = graphql(/* GraphQL */ `
  query PickUpManyAction {
    actionQuery {
      pickUpMany
    }
  }
`);

export const registerMatchingAction = graphql(/* GraphQL */ `
  query RegisterMatchingAction($gloves: [Address!]!) {
    actionQuery {
      registerMatching(gloves: $gloves)
    }
  }
`);

export const cancelMatchingAction = graphql(/* GraphQL */ `
  query CancelMatchingAction {
    actionQuery {
      cancelMatching
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

/* Query for email-based action mutations */
export const getUserAddress = graphql(/* GraphQL */ `
  query GetUserAddress {
    getUserAddress
  }
`);

export const createUserByWallet = graphql(/* GraphQL */ `
  mutation CreateUserByWallet($name: String!) {
    createUserByWallet(name: $name)
  }
`);

export const createSessionByWallet = graphql(/* GraphQL */ `
  mutation CreateSessionByWallet(
    $sessionId: Address!,
    $prize: Address!,
    $maximumUser: Int!,
    $minimumUser: Int!,
    $remainingUser: Int!,
    $startAfter: Long!,
    $maxRounds: Int!,
    $roundLength: Long!,
    $roundInterval: Long!,
    $initialHealthPoint: Int!,
    $users: [Address!]!
  ) {
    createSessionByWallet(
      sessionId: $sessionId,
      prize: $prize,
      maximumUser: $maximumUser,
      minimumUser: $minimumUser,
      remainingUser: $remainingUser,
      startAfter: $startAfter,
      maxRounds: $maxRounds,
      roundLength: $roundLength,
      roundInterval: $roundInterval,
      initialHealthPoint: $initialHealthPoint,
      users: $users
    )
  }
`);

export const joinSessionByWallet = graphql(/* GraphQL */ `
  mutation JoinSessionByWallet($sessionId: Address!, $gloves: [Address!]!) {
    joinSessionByWallet(sessionId: $sessionId, gloves: $gloves)
  }
`);

export const submitMoveByWallet = graphql(/* GraphQL */ `
  mutation SubmitMoveByWallet($sessionId: Address!, $gloveIndex: Int!) {
    submitMoveByWallet(sessionId: $sessionId, gloveIndex: $gloveIndex)
  }
`);

export const registerGloveByWallet = graphql(/* GraphQL */ `
  mutation RegisterGloveByWallet($gloveId: Address!) {
    registerGloveByWallet(gloveId: $gloveId)
  }
`);

export const pickUpByWallet = graphql(/* GraphQL */ `
  mutation pickUpByWallet {
    pickUpByWallet
  }
`);

export const pickUpManyByWallet = graphql(/* GraphQL */ `
  mutation pickUpManyByWallet {
    pickUpManyByWallet
  }
`);

export const registerMatchingByWallet = graphql(/* GraphQL */ `
  mutation RegisterMatchingByWallet($gloves: [Address!]!) {
    registerMatchingByWallet(gloves: $gloves)
  }
`);

export const cancelMatchingByWallet = graphql(/* GraphQL */ `
  mutation cancelMatchingByWallet {
    cancelMatchingByWallet
  }
`);