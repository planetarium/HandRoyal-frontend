import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation } from '@tanstack/react-query';
import { Address } from '@planetarium/account';
import { request } from 'graphql-request';
import { Clock, Swords } from 'lucide-react';
import { MoveType, SessionState } from '../gql/graphql';
import { useAccount } from '../context/AccountContext';
import { GRAPHQL_ENDPOINT, submitMoveAction } from '../queries';
import StyledButton from './StyledButton';
import MoveDisplay from './MoveDisplay';
import { executeTransaction } from '../utils/transaction';
import type { Session } from '../gql/graphql';
import type { HandType } from '../types/types';

interface GameBoardProps {
  round: number;
  blocksLeft: number;
  data: Session | undefined;
}

const GameBoard: React.FC<GameBoardProps> = ({ round, blocksLeft, data }) => {
  const { t } = useTranslation();
  const { account } = useAccount();
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
      if (!account) {
        throw new Error('Account not connected');
      }

      const moveType = move === 'rock' ? MoveType.Rock : move === 'paper' ? MoveType.Paper : MoveType.Scissors;
      const submitMoveResponse = await request(GRAPHQL_ENDPOINT, submitMoveAction, {
        sessionId: data?.metadata?.id,
        move: moveType
      });

      if (!submitMoveResponse.actionQuery?.submitMove) {
        throw new Error('Failed to get submit move response');
      }

      const plainValue = submitMoveResponse.actionQuery.submitMove;
      return executeTransaction(account, plainValue);
    },
    onSuccess: (data) => {
      console.error('Move submitted successfully: ' + data);
      setSubmitting(false);
    },
    onError: (error) => {
      console.error('Failed to submit move:', error);
      setSubmitting(false);
    }
  });

  const getFuseWidth = () => {
    if (!data?.metadata) return '0%';
    
    const maxInterval = data.state === SessionState.Ready 
      ? (data.startHeight - (data.creationHeight ?? 0))
      : data.metadata.roundLength;
    
    const remainingBlocks = blocksLeft;
    const percentage = Math.max(0, Math.min(100, (remainingBlocks / maxInterval) * 100));
    return `${percentage}%`;
  };

  const getFuseColor = () => {
    if (!data?.metadata) return 'bg-gray-300';
    
    const maxInterval = data.state === SessionState.Ready 
      ? (data.startHeight - (data.creationHeight ?? 0))
      : data.metadata.roundLength;
    
    const remainingBlocks = blocksLeft;
    const percentage = (remainingBlocks / maxInterval) * 100;

    if (percentage > 66) return 'bg-green-500';
    if (percentage > 33) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  useEffect(() => {
    const updateGameBoardState = async () => {
      const props: GameBoardState = {myMove: MoveType.None, opponentMove: MoveType.None, opponentAddress: null};
      const address = account?.isConnected ? account.address : null;
      if (data?.rounds && data.players) {
        const currentPlayerIndex = data.players.findIndex(player => player && Address.fromHex(player.id).toHex() === address?.toHex());
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
  }, [data, account]);

  const handleSubmit = () => {
    if (selectedHand) {
      setSubmitting(true);
      submitMoveMutation.mutate(selectedHand);
    }
  };

  return (
    <div className="flex flex-col p-6">
      <p className="text-2xl font-bold text-center mb-2" 
        style={{ textShadow: '2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000' }}
      >
        {t('round') + ' ' + round}
      </p>
      {/* blocks left */}
      <div className="relative h-12 mb-8">
        {/* 추후에 시계 연출 추가할 예정. 파이가 줄어드는 모양으로 표시하고, 숫자도 안에 같이 표시해서 컴팩트하고 가시성 좋게 */}
        <div className="flex justify-center items-center text-center mb-4">
          <Clock className="w-5 h-5 mr-1" />{blocksLeft}
        </div>
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

      <div className="flex items-center justify-center space-x-4 mb-4">
        <MoveDisplay 
          gloveAddress={data?.metadata?.id} 
          moveType={gameBoardState.myMove} 
          userAddress={'you'} 
        />
        <Swords className="w-20 h-20" color="white" />
        <MoveDisplay 
          gloveAddress={data?.metadata?.id} 
          moveType={gameBoardState.opponentMove} 
          userAddress={gameBoardState.opponentAddress ?? ''}
        />
      </div>
      
      <div className="flex justify-center space-x-4 mb-4 p-6">
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
        <StyledButton 
          bgColor='#FFE55C' 
          shadowColor='#FF9F0A'
          onClick={handleSubmit}
        >
          {t('submit')}
        </StyledButton>
      </div>
    </div>
  );
};

export default GameBoard; 