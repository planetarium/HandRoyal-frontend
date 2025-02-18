import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { request } from 'graphql-request';
import { Address } from '@planetarium/account';
import { useAccount } from '../context/AccountContext';
import { useTip } from '../context/TipContext';
import { MoveType, SessionState, PlayerState } from '../gql/graphql';
import { GRAPHQL_ENDPOINT, getSessionDocument, submitMoveDocument } from '../queries';
import type { HandType } from '../types/types';

interface GameBoardProps {
  myMove: MoveType;
  opponentMove: MoveType;
  opponentAddress: string | null;
}

export const GameBoard: React.FC = () => {
  const { t } = useTranslation();
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { privateKey } = useAccount();
  const { tip } = useTip();
  const [userAddress, setUserAddress] = useState<Address | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [selectedHand, setSelectedHand] = useState<HandType | null>(null);
  const [showNoSessionMessage, setShowNoSessionMessage] = useState(false);
  const [playerStatus, setPlayerStatus] = useState<PlayerState | null>(null);
  const [gameBoardProps, setGameBoardProps] = useState<GameBoardProps>({myMove: MoveType.None, opponentMove: MoveType.None, opponentAddress: null});

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
    privateKey?.getAddress().then(address => setUserAddress(address ?? null));
  }, [privateKey]);

  useEffect(() => {
    if (data?.players && userAddress) {
      const currentPlayer = data.players.find(player => Address.fromHex(player!.id).toHex() === userAddress.toHex());
      if (currentPlayer) {
        setPlayerStatus(currentPlayer.state);
      }
    }
  }, [data, userAddress]);

  const emojiMap: Record<MoveType, string> = {
    [MoveType.Rock]: '✊',
    [MoveType.Paper]: '✋',
    [MoveType.Scissors]: '✌️',
    [MoveType.None]: '?',
  };

  useEffect(() => {
    const updateGameBoardProps = async () => {
      const props: GameBoardProps = {myMove: MoveType.None, opponentMove: MoveType.None, opponentAddress: null};
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
            const opponentMove = match.move1.playerIndex === currentPlayerIndex ? match.move2 : match.move1;
            props.myMove = match.move1.playerIndex === currentPlayerIndex ? match.move1.type : match.move2.type;
            if (props.myMove !== gameBoardProps.myMove) {
              // Should be fixed when mutation result is implemented
              setSelectedHand(null);
              setSubmitting(false);
            }
            props.opponentAddress = data.players[opponentMove.playerIndex]?.id;
            props.opponentMove = opponentMove.type;
          }
        }
      }

      setGameBoardProps(props);
    };

    updateGameBoardProps();
  }, [data, privateKey, gameBoardProps]);

  const submitMoveMutation = useMutation({
    mutationFn: async (move: HandType) => {
      const privateKeyBytes = privateKey?.toBytes();
      const privateKeyHex = privateKeyBytes ? Array.from(privateKeyBytes).map(b => b.toString(16).padStart(2, '0')).join('') : undefined;
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
      setSubmitting(true);
      submitMoveMutation.mutate(selectedHand);
    }
  };

  const canSubmit = () => {
    return data?.state === SessionState.Active && selectedHand && !submitting;
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getFuseWidth = () => {
    if (!data?.metadata) return '0%';
    
    const maxInterval = data.state === SessionState.Ready 
      ? (data.startHeight - (data.creationHeight ?? 0))
      : data.metadata.roundInterval;
    
    const remainingBlocks = blocksLeft;
    const percentage = Math.max(0, Math.min(100, (remainingBlocks / maxInterval) * 100));
    return `${percentage}%`;
  };

  const getFuseColor = () => {
    if (!data?.metadata) return 'bg-gray-300';
    
    const maxInterval = data.state === SessionState.Ready 
      ? (data.startHeight - (data.creationHeight ?? 0))
      : data.metadata.roundInterval;
    
    const remainingBlocks = blocksLeft;
    const percentage = (remainingBlocks / maxInterval) * 100;

    if (percentage > 66) return 'bg-green-500';
    if (percentage > 33) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (isLoading) return <p>{t('loading')}</p>;
  if (error) return <p>{t('error')}: {error.message}</p>;

  if (playerStatus === PlayerState.Lose) {
    return (
      <div className="game-board p-4 max-w-md mx-auto text-center">
        <h1 className="text-4xl font-bold mb-8">{t('gameBoardTitle')}</h1>
        <p className="text-2xl">{t('lose')}</p>
        <button
          className="bg-blue-500 text-white p-2 mt-5 rounded cursor-pointer"
          onClick={() => navigate('/')}
        >
          {t('backToMain')}
        </button>
      </div>
    );
  }

  if (data === null) {
    return (
      <div className="game-board p-4 max-w-md mx-auto text-center">
        <h1 className="text-4xl font-bold mb-8">{t('gameBoardTitle')}</h1>
        <p className="text-2xl">{t('waitingForSession')}</p>
      </div>
    );
  }

  if (data?.state === SessionState.Ended) {
    return (
      <div className="game-board p-4 max-w-md mx-auto text-center">
        <h1 className="text-4xl font-bold mb-8">{t('gameBoardTitle')}</h1>
        <h2 className="text-2xl font-semibold mb-4">Session: {truncateAddress(sessionId!)} ended, redirecting to result page...</h2>
        {winner ? (
          <>
            <p className="text-xl mb-2">Winner: <span className="font-bold" title={winner.id}>{truncateAddress(winner.id)}</span></p>
            <p className="text-xl">Prize: <span className="font-bold" title={data?.metadata?.prize}>{truncateAddress(data?.metadata?.prize)}</span></p>
          </>
        ) : (
          <p className="text-xl">{t('sessionEndedWithoutWinner')}</p>
        )}
      </div>
    );
  }

  if (data?.state === SessionState.Ready) {
    return (
      <div className="game-board p-4 max-w-md mx-auto text-center">
        <h1 className="text-4xl font-bold mb-8">{t('gameBoardTitle')}</h1>
        <p className="text-2xl">{t('waitingForGameToStart')}</p>
        <p className="text-2xl">{t('blocksLeft', { count: blocksLeft })}</p>
      </div>
    );
  }

  if (userAddress && data?.metadata?.organizer && Address.fromHex(data.metadata.organizer).toHex() === userAddress.toHex()) {
    return (
      <div className="game-board p-4 max-w-md mx-auto text-center">
        <h1 className="text-4xl font-bold mb-8">{t('gameBoardTitle')}</h1>
        <p className="text-2xl">{t('youAreTheSessionOrganizer')}</p>
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
    <div className="game-board p-4 max-w-xl mx-auto">
      {showNoSessionMessage ? (
        <p className="text-red-500 text-center mb-4">{t('noSessionFound')}</p>
      ) : (
        <>
          <h1 className="text-2xl font-bold mb-4 text-center">{t('gameBoardTitle')}</h1>
          <p className="mb-2 text-center">{t('sessionId')}: {sessionId}</p>
          <p className="mb-4 text-center">{t('round', { count: round })}</p>
          
          {/* blocks left */}
          <div className="relative h-12 mb-8">
            <p className="text-center mb-4">
              {t('blocksLeft', { count: blocksLeft })}
            </p>
            <div className="w-full max-w-sm mx-auto relative mt-2">
              <div className="absolute -left-8 translate-y-[-50%]">
                {blocksLeft > 0 && (
                  <span className="inline-block text-2xl">
                    💣
                  </span>
                )}
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-1000 ease-linear ${getFuseColor()}`}
                  style={{ width: getFuseWidth() }}
                />
              </div>
              <div 
                className="absolute top-1/2 transition-all duration-1000 ease-linear"
                style={{ left: getFuseWidth(), transform: 'translate(-50%, -70%)' }}
              >
                {blocksLeft > 0 && (
                  <span className="inline-block animate-pulse text-2xl">
                    🔥
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="bg-gray-100 h-64 mb-4 flex items-center justify-center">
            <div className="flex flex-col items-center">
              <span className="text-6xl">{emojiMap[gameBoardProps.myMove]}</span>
              <span className="mt-2 text-sm text-gray-600">{t('you')}</span>
            </div>
            <span className="text-2xl text-gray-700 mx-8">VS</span>
            <div className="flex flex-col items-center">
              <span className="text-6xl">{emojiMap[gameBoardProps.opponentMove]}</span>
              {gameBoardProps.opponentAddress && (
                <span className="mt-2 text-sm text-gray-600" title={gameBoardProps.opponentAddress}>
                  {truncateAddress(gameBoardProps.opponentAddress)}
                </span>
              )}
            </div>
          </div>
          <div className="flex justify-center space-x-4 mb-4">
            <button
              className={`p-2 rounded cursor-pointer ${selectedHand === 'rock' ? (submitting ? 'bg-gray-300' : 'bg-blue-500 text-white') : 'bg-white text-black'}`}
              disabled={submitting}
              onClick={() => setSelectedHand('rock')}
            >
              ✊ {t('rock')}
            </button>
            <button
              className={`p-2 rounded cursor-pointer ${selectedHand === 'paper' ? (submitting ? 'bg-gray-300' : 'bg-blue-500 text-white') : 'bg-white text-black'}`}
              disabled={submitting}
              onClick={() => setSelectedHand('paper')}
            >
              ✋ {t('paper')}
            </button>
            <button
              className={`p-2 rounded cursor-pointer ${selectedHand === 'scissors' ? (submitting ? 'bg-gray-300' : 'bg-blue-500 text-white') : 'bg-white text-black'}`}
              disabled={submitting}
              onClick={() => setSelectedHand('scissors')}
            >
              ✌️ {t('scissors')}
            </button>
          </div>
          <div className="flex justify-center">
            <button
              className={`text-white p-2 rounded ${canSubmit() ? 'bg-blue-500 cursor-pointer' : 'bg-gray-300'}`}
              disabled={!canSubmit()}
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