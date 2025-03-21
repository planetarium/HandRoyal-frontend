import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery } from '@tanstack/react-query';
import { request } from 'graphql-request';
import { Clock, Swords } from 'lucide-react';
import { useRequiredAccount } from '../context/AccountContext';
import { GRAPHQL_ENDPOINT, submitMoveAction, getUserDocument } from '../queries';
import { SessionState } from '../gql/graphql';
import StyledButton from './StyledButton';
import MoveDisplay from './MoveDisplay';
import { executeTransaction } from '../utils/transaction';
import { getLocalGloveImage } from '../fetches';
import type { GetUserScopedSessionQuery } from '../gql/graphql';

interface GameBoardProps {
  blockIndex: number;
  data: NonNullable<NonNullable<GetUserScopedSessionQuery['stateQuery']>['userScopedSession']>;
}

const GameBoard: React.FC<GameBoardProps> = ({ blockIndex, data }) => {
  const { t } = useTranslation();
  const account = useRequiredAccount();
  const [submitting, setSubmitting] = useState(false);
  const [selectedHand, setSelectedHand] = useState<number | null>(null);
  const [gameBoardState, setGameBoardState] = useState<GameBoardState>({
    opponentAddress: null,
    myGloveAddress: null,
    opponentGloveAddress: null,
    myHealthPoint: 100,
    opponentHealthPoint: 100,
    maxHealthPoint: 100
  });

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
      const selectedGlove = userData?.ownedGloves?.[gloveIndex];
      if (!selectedGlove?.id) {
        throw new Error('Selected glove not found');
      }

      const submitMoveResponse = await request(GRAPHQL_ENDPOINT, submitMoveAction, {
        sessionId: data?.sessionId,
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

  const { data: userData } = useQuery({
    queryKey: ['getUser', account?.address],
    queryFn: async () => {
      const response = await request(GRAPHQL_ENDPOINT, getUserDocument, { address: account.address.toString() });
      return response.stateQuery?.user;
    }
  });

  const remainingBlocks = data ? data.intervalEndHeight - blockIndex : 0;

  const getFuseWidth = () => {
    if (!data) return '0%';
    
    const maxInterval = data.sessionState === SessionState.Active ? 30 : 60; // 임시 값으로 설정
    const percentage = Math.max(0, Math.min(100, (remainingBlocks / maxInterval) * 100));
    return `${percentage}%`;
  };

  const getFuseColor = () => {
    if (!data) return 'bg-gray-300';
    
    const maxInterval = data.sessionState === SessionState.Active ? 30 : 60; // 임시 값으로 설정
    const percentage = Math.max(0, Math.min(100, (remainingBlocks / maxInterval) * 100));

    if (percentage > 66) return 'bg-green-500';
    if (percentage > 33) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  useEffect(() => {
    const props: GameBoardState = {
      opponentAddress: data.opponentAddress || null,
      myGloveAddress: data.myGloves?.[0] || null,
      opponentGloveAddress: data.opponentGloves?.[0] || null,
      myHealthPoint: data.currentUserRound?.condition1?.healthPoint ?? 100,
      opponentHealthPoint: data.currentUserRound?.condition2?.healthPoint ?? 100,
      maxHealthPoint: 100
    };

    console.error(props);

    setGameBoardState(props);
  }, [data]);

  const handleSubmit = () => {
    if (selectedHand !== null) {
      setSubmitting(true);
      submitMoveMutation.mutate(selectedHand);
    }
  };

  return (
    <div className="flex flex-col p-6">
      <p className="text-2xl font-bold text-center mb-2" 
        style={{ textShadow: '2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000' }}
      >
        {t('phase') + ' ' + (data?.currentUserRound ? 1 : 0)}
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
          currentHp={gameBoardState.myHealthPoint}
          gloveAddress={gameBoardState.myGloveAddress ?? ''} 
          maxHp={gameBoardState.maxHealthPoint}
          userAddress={'you'}
        />
        <Swords className="w-20 h-20" color="white" />
        <MoveDisplay 
          currentHp={gameBoardState.opponentHealthPoint} 
          gloveAddress={gameBoardState.opponentGloveAddress ?? ''}
          maxHp={gameBoardState.maxHealthPoint}
          userAddress={gameBoardState.opponentAddress ?? ''}
        />
      </div>
      
      {/* 글러브 선택 UI */}
      <div className="flex flex-col items-center space-y-4 mb-4 p-6">
        <div className="flex flex-wrap justify-center gap-4 max-w-4xl">
          {userData?.ownedGloves?.map((glove, index) => {
            if (!glove?.id) return null;
            
            const isSelected = selectedHand === index;
            const gloveImage = getLocalGloveImage(glove.id);
            
            return (
              <div
                key={glove.id}
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