import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation } from '@tanstack/react-query';
import { Address } from '@planetarium/account';
import { request } from 'graphql-request';
import { MoveType, SessionState } from '../gql/graphql';
import { useAccount } from '../context/AccountContext';
import { GRAPHQL_ENDPOINT, submitMoveDocument } from '../queries';
import type { Session } from '../gql/graphql';
import type { HandType } from '../types/types';

interface GameBoardProps {
  blocksLeft: number;
  data: Session | undefined;
}

const GameBoard: React.FC<GameBoardProps> = ({ blocksLeft, data }) => {
  const { t } = useTranslation();
  const { privateKey } = useAccount();
  const emojiMap: Record<MoveType, string> = {
    [MoveType.Rock]: '✊',
    [MoveType.Paper]: '✋',
    [MoveType.Scissors]: '✌️',
    [MoveType.None]: '?',
  };
  const [submitting, setSubmitting] = useState(false);
  const [selectedHand, setSelectedHand] = useState<HandType | null>(null);
  const [gameBoardState, setGameBoardState] = useState<GameBoardState>({myMove: MoveType.None, opponentMove: MoveType.None, opponentAddress: null});

  interface GameBoardState {
    myMove: MoveType;
    opponentMove: MoveType;
    opponentAddress: string | null;
  }

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

  useEffect(() => {
    const updateGameBoardState = async () => {
      console.error('update game board props');
      const props: GameBoardState = {myMove: MoveType.None, opponentMove: MoveType.None, opponentAddress: null};
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
            props.opponentAddress = data.players[opponentMove.playerIndex]?.id;
            props.opponentMove = opponentMove.type;
          }
        }
      }

      setGameBoardState(props);
    };

    updateGameBoardState();
  }, [data, privateKey]);

  const handleSubmit = () => {
    if (selectedHand) {
      setSubmitting(true);
      submitMoveMutation.mutate(selectedHand);
    }
  };

  const canSubmit = () => {
    return data?.state === SessionState.Active && selectedHand && !submitting;
  };

  return (
    <div>
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
          <span className="text-6xl">{emojiMap[gameBoardState.myMove]}</span>
          <span className="mt-2 text-sm text-gray-600">{t('you')}</span>
        </div>
        <span className="text-2xl text-gray-700 mx-8">VS</span>
        <div className="flex flex-col items-center">
          <span className="text-6xl">{emojiMap[gameBoardState.opponentMove]}</span>
          <span className="mt-2 text-sm text-gray-600 font-mono">
            {gameBoardState.opponentAddress ?? ''}
          </span>
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
    </div>
  );
};

export default GameBoard; 