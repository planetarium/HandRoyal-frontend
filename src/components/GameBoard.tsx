import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { graphql } from '../gql/gql';
import { request } from 'graphql-request';
import { useAccount } from '../context/AccountContext';
import { useTip } from '../context/TipContext';
import { HandType } from '../types/types';
import { MoveType, SessionState, PlayerState, Move } from '../gql/graphql';
import { Address } from '@planetarium/account';

const GRAPHQL_ENDPOINT = import.meta.env.VITE_GRAPHQL_ENDPOINT;

const getSessionDocument = graphql(/* GraphQL */ `
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
      }
    }
  }
`);

const submitMoveDocument = graphql(/* GraphQL */ `
  mutation SubmitMove($privateKey: PrivateKey, $sessionId: Address!, $move: MoveType!) {
    submitMove(privateKey: $privateKey, sessionId: $sessionId, move: $move)
  }
`);

export const GameBoard: React.FC = () => {
  const { t } = useTranslation();
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { privateKey } = useAccount();
  const { tip } = useTip();
  const [userAddress, setUserAddress] = useState<Address | null>(null);
  const [selectedHand, setSelectedHand] = useState<HandType | null>(null);
  const [displayedEmoji, setDisplayedEmoji] = useState<string | null>(null);
  const [opponentEmoji, setOpponentEmoji] = useState<string | null>(null);
  const [showNoSessionMessage, setShowNoSessionMessage] = useState(false);
  const [playerStatus, setPlayerStatus] = useState<PlayerState | null>(null);

  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ['getSession', sessionId],
    queryFn: async () => {
      const response = await request(GRAPHQL_ENDPOINT, getSessionDocument, { sessionId });
      return response.stateQuery?.session;
    },
    enabled: !!sessionId,
  });

  useEffect(() => {
    if (tip) {
      refetch();
    }
  }, [tip, refetch]);

  useEffect(() => {
    const useUserAddress = async () => {
      const address = await privateKey?.getAddress();
      setUserAddress(address ?? null);
    }
    useUserAddress();
  }, [privateKey]);

  useEffect(() => {
    if (data?.players && userAddress) {
      const currentPlayer = data.players.find(player => Address.fromHex(player!.id).toHex() === userAddress.toHex());
      if (currentPlayer) {
        setPlayerStatus(currentPlayer.state);
      }
    }
  }, [data, userAddress]);

  useEffect(() => {
    const updateOpponentEmoji = async () => {
      const emojiMap: Record<MoveType, string> = {
        [MoveType.Rock]: '✊',
        [MoveType.Paper]: '✋',
        [MoveType.Scissors]: '✌️',
        [MoveType.None]: '',
      };
      if (data?.rounds && data.players) {
        const userAddress = await privateKey?.getAddress();
        const currentPlayerIndex = data.players.findIndex(player => player && Address.fromHex(player.id).toHex() === userAddress?.toHex());
        const currentRound = data.rounds[data.rounds.length - 1];
        if (currentRound?.matches) {
          const match = currentRound.matches.find(match => {
            return (match?.move1 && match.move1.playerIndex === currentPlayerIndex) || 
                    (match?.move2 && match.move2.playerIndex === currentPlayerIndex);
          });  
          if (match && match.move1 && match.move2) {
            const opponentMoveType = match.move1.playerIndex === currentPlayerIndex ? match.move2.type : match.move1.type;
            setOpponentEmoji(emojiMap[opponentMoveType]);
          } else {
            setOpponentEmoji(null);
          }
        } else {
          setOpponentEmoji(null);
        }
      } else {
        setOpponentEmoji(null);
      }
    };
    updateOpponentEmoji();
  }, [data]);

  const submitMoveMutation = useMutation({
    mutationFn: async (move: HandType) => {
      const privateKeyBytes = privateKey?.toBytes();
      const privateKeyHex = privateKeyBytes ? Array.from(privateKeyBytes).map(b => b.toString(16).padStart(2, '0')).join('') : undefined;
      console.error('privateKeyHex: ' + privateKeyHex);

      const moveType = move === 'rock' ? MoveType.Rock : move === 'paper' ? MoveType.Paper : MoveType.Scissors;
      const response = await request(GRAPHQL_ENDPOINT, submitMoveDocument, {
        privateKey: privateKeyHex,
        sessionId,
        move: moveType,
      });
      return response.submitMove;
    },
    onSuccess: (data) => {
      console.error('Move submitted successfully: ' + data);
      // 추가적인 성공 처리 로직을 여기에 추가할 수 있습니다.
    },
    onError: (error) => {
      console.error('Failed to submit move:', error);
    }
  });

  useEffect(() => {
    if (!sessionId) {
      setShowNoSessionMessage(true);
      setTimeout(() => {
        navigate('/');
      }, 1000);
    }
  }, [sessionId, navigate]);

  const blocksLeft = data?.state === SessionState.Ready
    ? (data?.startHeight && tip 
      ? data.startHeight - tip.index
      : 0) 
    : (data?.rounds && data.metadata && tip
      ? (data.rounds[data.rounds.length - 1]?.height + data.metadata.roundInterval) - tip.index
      : 0);

  const round = data?.rounds ? data.rounds.length : 0;

  const winner = data?.players?.find(player => player?.state === PlayerState.Won);

  const handleSubmit = () => {
    if (selectedHand) {
      const emojiMap: Record<HandType, string> = {
        rock: '✊',
        paper: '✋',
        scissors: '✌️',
      };
      setDisplayedEmoji(emojiMap[selectedHand]);
      submitMoveMutation.mutate(selectedHand);
    }
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (isLoading) return <p>{t('loading')}</p>;
  if (error) return <p>{t('error')}: {error.message}</p>;

  if (playerStatus === PlayerState.Lose) {
    return (
      <div className="game-board p-4 max-w-md mx-auto text-center">
        <h1 className="text-4xl font-bold mb-8">{t('gameBoardTitle')}</h1>
        <p className="text-2xl">You have lost the game.</p>
      </div>
    );
  }

  if (data === null) {
    return (
      <div className="game-board p-4 max-w-md mx-auto text-center">
        <h1 className="text-4xl font-bold mb-8">{t('gameBoardTitle')}</h1>
        <p className="text-2xl">Waiting for the session to be created...</p>
      </div>
    );
  }

  if (data?.state === SessionState.Ended) {
    return (
      <div className="game-board p-4 max-w-md mx-auto text-center">
        <h1 className="text-4xl font-bold mb-8">{t('gameBoardTitle')}</h1>
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Session: {truncateAddress(sessionId!)}</h2>
          {winner ? (
            <>
              <p className="text-xl mb-2">Winner: <span className="font-bold" title={winner.id}>{truncateAddress(winner.id)}</span></p>
              <p className="text-xl">Prize: <span className="font-bold" title={data?.metadata?.prize}>{truncateAddress(data?.metadata?.prize)}</span></p>
            </>
          ) : (
            <p className="text-xl">The session ended without a winner.</p>
          )}
        </div>
      </div>
    );
  }

  if (data?.state === SessionState.Ready) {
    return (
      <div className="game-board p-4 max-w-md mx-auto text-center">
        <h1 className="text-4xl font-bold mb-8">{t('gameBoardTitle')}</h1>
        <p className="text-2xl">Waiting for the game to start...</p>
        <p className="text-2xl">{t('blocksLeft', { count: blocksLeft })}</p>
      </div>
    );
  }

  if (userAddress && data?.metadata?.organizer && Address.fromHex(data.metadata.organizer).toHex() === userAddress.toHex()) {
    return (
      <div className="game-board p-4 max-w-md mx-auto text-center">
        <h1 className="text-4xl font-bold mb-8">{t('gameBoardTitle')}</h1>
        <p className="text-2xl">You are the session organizer.</p>
        <div className="mt-4">
          {data.rounds?.map((round, index) => (
            <div key={index} className="mb-4">
              <h2 className="text-xl font-bold">Round {index + 1}</h2>
              {round?.matches?.map((match, matchIndex) => (
                <div key={matchIndex} className="text-lg">
                  <p>Match {matchIndex + 1}:</p>
                  <p>Player 1: {match?.move1?.type}</p>
                  <p>Player 2: {match?.move2?.type}</p>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="game-board p-4 max-w-md mx-auto">
      {showNoSessionMessage ? (
        <p className="text-red-500 text-center mb-4">{t('noSessionFound')}</p>
      ) : (
        <>
          <h1 className="text-2xl font-bold mb-4">{t('gameBoardTitle')}</h1>
          <p className="mb-2">{t('sessionId')}: {sessionId}</p>
          <p className="mb-4">{t('round', { count: round })}</p>
          <p className="mb-4">{t('blocksLeft', { count: blocksLeft })}</p>          
          <div className="bg-gray-100 h-64 mb-4 flex items-center justify-center space-x-4">
            {displayedEmoji ? (
              <>
                <span className="text-6xl">{displayedEmoji}</span>
                <span className="text-2xl text-gray-700">VS</span>
                <span className="text-6xl">{opponentEmoji}</span>
              </>
            ) : (
              <span className="text-gray-500">Image Placeholder</span>
            )}
          </div>
          <div className="flex justify-center space-x-4 mb-4">
            <button
              className={`p-2 rounded cursor-pointer ${selectedHand === 'rock' ? 'bg-blue-500 text-white' : 'bg-white text-black'}`}
              onClick={() => setSelectedHand('rock')}
            >
              ✊ {t('rock')}
            </button>
            <button
              className={`p-2 rounded cursor-pointer ${selectedHand === 'paper' ? 'bg-blue-500 text-white' : 'bg-white text-black'}`}
              onClick={() => setSelectedHand('paper')}
            >
              ✋ {t('paper')}
            </button>
            <button
              className={`p-2 rounded cursor-pointer ${selectedHand === 'scissors' ? 'bg-blue-500 text-white' : 'bg-white text-black'}`}
              onClick={() => setSelectedHand('scissors')}
            >
              ✌️ {t('scissors')}
            </button>
          </div>
          <div className="flex justify-center">
            <button
              className="bg-blue-500 text-white p-2 rounded cursor-pointer"
              disabled={!selectedHand}
              onClick={handleSubmit}
            >
              {t('submit')}
            </button>
          </div>
        </>
      )}
    </div>
  );
}; 