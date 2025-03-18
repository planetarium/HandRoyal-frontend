import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation } from '@tanstack/react-query';
import { Address } from '@planetarium/account';
import { request } from 'graphql-request';
import { Clock, Swords } from 'lucide-react';
import { MatchState } from '../gql/graphql';
import { useRequiredAccount } from '../context/AccountContext';
import { GRAPHQL_ENDPOINT, submitMoveAction } from '../queries';
import StyledButton from './StyledButton';
import MoveDisplay from './MoveDisplay';
import { executeTransaction } from '../utils/transaction';
import { getLocalGloveImage } from '../fetches';
import type { Session , Match } from '../gql/graphql';

interface GameBoardProps {
  blockIndex: number;
  data: Session | undefined;
}

const GameBoard: React.FC<GameBoardProps> = ({ blockIndex, data }) => {
  const { t } = useTranslation();
  const account = useRequiredAccount();
  const [submitting, setSubmitting] = useState(false);
  const [selectedHand, setSelectedHand] = useState<number | null>(null);
  const [match, setMatch] = useState<Match | null>(null);
  const [gameBoardState, setGameBoardState] = useState<GameBoardState>({opponentAddress: null, myGloveAddress: null, opponentGloveAddress: null, myHealthPoint: 100, opponentHealthPoint: 100, maxHealthPoint: 100});

  interface GameBoardState {
    opponentAddress: string | null;
    myGloveAddress: string | null;
    opponentGloveAddress: string | null;
    myHealthPoint: number;
    opponentHealthPoint: number;
    maxHealthPoint: number;
  }

  const submitMoveMutation = useMutation({
    mutationFn: async (gloveIndex: number) => {
      const submitMoveResponse = await request(GRAPHQL_ENDPOINT, submitMoveAction, {
        sessionId: data?.metadata?.id,
        gloveIndex: gloveIndex
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

  const remainingBlocks =  match?.state === MatchState.Active ? blockIndex - match?.startHeight : blockIndex - data?.metadata?.roundLength - match?.startHeight;

  const getFuseWidth = () => {
    if (!match) return '0%';
    
    const maxInterval = (match.state === MatchState.Active ? data?.metadata?.roundLength : data?.metadata?.roundInterval) ?? 0;
    const percentage = Math.max(0, Math.min(100, (remainingBlocks / maxInterval) * 100));
    return `${percentage}%`;
  };

  const getFuseColor = () => {
    if (!match) return 'bg-gray-300';
    
    const maxInterval = (match.state === MatchState.Active ? data?.metadata?.roundLength : data?.metadata?.roundInterval) ?? 0;
    const percentage = Math.max(0, Math.min(100, (remainingBlocks / maxInterval) * 100));

    if (percentage > 66) return 'bg-green-500';
    if (percentage > 33) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  useEffect(() => {
    const updateGameBoardState = async () => {
      const props: GameBoardState = {
        opponentAddress: null,
        myGloveAddress: null,
        opponentGloveAddress: null,
        myHealthPoint: data?.metadata?.initialHealthPoint ?? 100,
        opponentHealthPoint: data?.metadata?.initialHealthPoint ?? 100,
        maxHealthPoint: data?.metadata?.initialHealthPoint ?? 100
      };
      const address = account.address;
      if (data?.phases && data.players) {
        const currentPlayerIndex = data.players.findIndex(player => player && Address.fromHex(player.id).toHex() === address.toHex());
        const currentPhase = data.phases[data.phases.length - 1];
        if (currentPhase?.matches) {
          const match = currentPhase.matches.find(match => {
            return (match?.players?.[0] && match.players?.[0] === currentPlayerIndex) || 
                    (match?.players?.[1] && match.players?.[1] === currentPlayerIndex);
          });
          if (match) {
            setMatch(match);
          }
          else {
            setMatch(null);
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
        {t('phase') + ' ' + data?.phases?.length}
      </p>
      {/* blocks left */}
      <div className="relative h-12 mb-8">
        {/* 추후에 시계 연출 추가할 예정. 파이가 줄어드는 모양으로 표시하고, 숫자도 안에 같이 표시해서 컴팩트하고 가시성 좋게 */}
        <div className="flex justify-center items-center text-center mb-4">
          <Clock className="w-5 h-5 mr-1" />{remainingBlocks}
        </div>
        <div className="w-full max-w-sm mx-auto relative mt-2">
          <div className="absolute -left-8 translate-y-[-50%]">
            {remainingBlocks > 0 && (
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
            {remainingBlocks > 0 && (
              <span className="inline-block animate-pulse text-2xl">
                🔥
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 현재 제출 및 체력 상태 표시 영역 */}
      <div className="flex items-center justify-center space-x-4 mb-4">
        <MoveDisplay 
          currentHp={100}
          gloveAddress={gameBoardState.myGloveAddress ?? ''} 
          maxHp={100}
          userAddress={'you'}
        />
        <Swords className="w-20 h-20" color="white" />
        <MoveDisplay 
          currentHp={100} 
          gloveAddress={gameBoardState.opponentGloveAddress ?? ''}
          maxHp={100}
          userAddress={gameBoardState.opponentAddress ?? ''}
        />
      </div>
      
      {/* 글러브 선택 UI */}
      <div className="flex flex-col items-center space-y-4 mb-4 p-6">
        <div className="flex flex-wrap justify-center gap-4 max-w-4xl">
          {data?.players?.map((player, index) => {
            if (!player?.gloves) return null;
            
            const isSelected = selectedHand === index;
            const gloveImage = getLocalGloveImage(player.gloves[index]);
            
            return (
              <div
                key={index}
                className={`relative w-48 h-64 rounded-lg overflow-hidden cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                  isSelected 
                    ? 'ring-4 ring-yellow-400 shadow-lg shadow-yellow-400/50' 
                    : 'hover:shadow-lg hover:shadow-white/20'
                }`}
                onClick={() => setSelectedHand(index)}
              >
                <img
                  alt={`Glove ${index + 1}`}
                  className="w-full h-full object-cover"
                  src={gloveImage}
                />
                <div className="absolute inset-0 bg-black/0 hover:bg-black/50 transition-all duration-300">
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                    <div className="bg-black/80 p-4 rounded-lg text-white">
                      <h3 className="font-bold mb-2">{t('gloveStats')}</h3>
                      <div className="space-y-1">
                        <p>{t('attack')}: 100</p>
                        <p>{t('defense')}: 100</p>
                        <p>{t('speed')}: 100</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 제출 버튼 */}
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