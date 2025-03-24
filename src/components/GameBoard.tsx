import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery } from '@tanstack/react-query';
import { request } from 'graphql-request';
import { Clock, Swords } from 'lucide-react';
import { useRequiredAccount } from '../context/AccountContext';
import { GRAPHQL_ENDPOINT, submitMoveAction, getUserDocument } from '../queries';
import { MatchState, SessionState } from '../gql/graphql';
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
      console.error('sessionId: ' + data?.sessionId);
      console.error('gloveIndex: ' + gloveIndex);
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

  const remainingBlocks = data ? data.intervalEndHeight - blockIndex : 0;

  const getFuseWidth = () => {
    if (!data) return '0%';
    
    const maxInterval = data.currentInterval;
    const percentage = Math.max(0, Math.min(100, (remainingBlocks / maxInterval) * 100));
    return `${percentage}%`;
  };

  const getFuseColor = () => {
    if (!data) return 'bg-gray-300';
    
    const maxInterval = data.currentInterval;
    const percentage = Math.max(0, Math.min(100, (remainingBlocks / maxInterval) * 100));

    if (percentage > 66) return 'bg-green-500';
    if (percentage > 33) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  useEffect(() => {
    const props: GameBoardState = {
      opponentAddress: data.opponentAddress || null,
      myGloveAddress:
        (data.myGloves !== null &&
          data.myGloves !== undefined &&
          data.myCondition?.submission !== undefined) ?
            data.myGloves?.[data.myCondition?.submission] :
            null,
      opponentGloveAddress:
        (data.opponentGloves !== null &&
          data.opponentGloves !== undefined &&
          data.opponentCondition?.submission !== undefined) ?
            data.opponentGloves?.[data.opponentCondition?.submission] :
            null,
      myHealthPoint: data.myCondition?.healthPoint ?? 100,
      opponentHealthPoint: data.opponentCondition?.healthPoint ?? 100,
      maxHealthPoint: 100
    };

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
        {t('ui:phase')}&nbsp;{((data?.currentPhaseIndex ?? -1) + 1)}
      </p>
      <p className="text-md font-bold text-center mb-4" 
        style={{ textShadow: '2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000' }}
      >
        {t('ui:survivors')}:&nbsp;{(data?.playersLeft ?? -1)}
      </p>
      {data?.currentUserMatchState !== MatchState.Ended ? (
        <>
        <p className="text-xl font-bold text-center mb-2" 
          style={{ textShadow: '2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000' }}
        >
          {t('ui:round')}&nbsp;{((data?.currentUserRoundIndex ?? -1) + 1)}
        </p>
        
        <p className="text-lg font-bold text-center mb-2" 
          style={{ textShadow: '2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000' }}
        >
          {data?.currentUserMatchState === MatchState.Active ? t('ui:matchActive') : t('ui:matchBreak')}
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

        {/* 상대 보유 글러브 표시 영역 */}
        <div className="flex flex-wrap justify-center gap-2 mb-4">
          {data?.opponentGloves?.map((gloveId, index) => (
            <div
              key={index}
              className={`w-12 h-16 rounded-lg overflow-hidden border-2 border-black bg-gray-100 relative ${
                data?.opponentCondition?.gloveUsed?.[index] ? 'opacity-50' : ''
              }`}
            >
              <div className="flex flex-col h-full">
                <div className="h-full">
                  <img
                    alt={gloveId}
                    className="w-full h-full object-cover"
                    src={getLocalGloveImage(gloveId)}
                  />
                </div>
                {data?.opponentCondition?.gloveUsed?.[index] && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <span className="text-white text-2xl">✗</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* 현재 제출 및 체력 상태 표시 영역 */}
        <div className="flex items-center justify-center space-x-4 mb-4">
          <MoveDisplay 
            currentHp={gameBoardState.myHealthPoint < 0 ? 0 : gameBoardState.myHealthPoint}
            gloveAddress={gameBoardState.myGloveAddress ?? ''} 
            maxHp={gameBoardState.maxHealthPoint}
            userAddress={'you'}
          />
          <Swords className="w-20 h-20" color="white" />
          <MoveDisplay 
            currentHp={gameBoardState.opponentHealthPoint < 0 ? 0 : gameBoardState.opponentHealthPoint}
            gloveAddress={gameBoardState.opponentGloveAddress ?? ''}
            maxHp={gameBoardState.maxHealthPoint}
            userAddress={gameBoardState.opponentAddress ?? ''}
          />
        </div>
        
        {/* 글러브 선택 UI */}
        <div className="flex flex-col items-center space-y-4 mb-4 p-6">
          <div className="flex justify-center relative h-[300px] w-full max-w-4xl">
            <div className="flex justify-center w-full">
              {(() => {
                // 사용 가능한 글러브만 필터링하되, 원본 인덱스 정보 유지
                const availableGloves = data?.myGloves?.map((gloveId, index) => ({
                  gloveId,
                  originalIndex: index,
                  isUsed: data?.myCondition?.gloveUsed?.[index] === true
                })).filter(glove => !glove.isUsed) ?? [];

                const totalCards = availableGloves.length;
                const cardWidth = 192; // w-48 = 12rem = 192px
                const containerWidth = 896; // max-w-4xl = 56rem = 896px
                const totalPadding = 72; // p-6 * 3 = 1.5rem * 3 = 24px * 3
                const cardBorder = 4; // border-2 = 2px * 2
                const effectiveCardWidth = cardWidth + cardBorder;
                const availableWidth = containerWidth - totalPadding - effectiveCardWidth;
                const spacing = totalCards > 1 
                  ? (100 - (effectiveCardWidth / availableWidth * 100)) / (totalCards - 1) 
                  : 0;

                return availableGloves.map((glove, displayIndex) => {
                  const isSelected = selectedHand === glove.originalIndex;
                  const gloveImage = getLocalGloveImage(glove.gloveId);
                  
                  return (
                    <div
                      key={glove.originalIndex}
                      className={`absolute w-48 h-64 rounded-lg overflow-hidden border-2 bg-gray-100 border-black cursor-pointer transition-all duration-300 transform hover:scale-105 hover:z-10 hover:-translate-y-4 ${
                        isSelected 
                          ? 'ring-4 ring-yellow-400 shadow-lg shadow-yellow-400/50 z-10 -translate-y-4' 
                          : 'hover:shadow-lg hover:shadow-white/20'
                      }`}
                      style={{
                        left: `${displayIndex * spacing}%`,
                        zIndex: isSelected ? 10 : displayIndex,
                      }}
                      onClick={() => setSelectedHand(isSelected ? -1 : glove.originalIndex)}
                    >
                      <div className="flex flex-col items-center justify-center border-b-2 border-black bg-gray-900 p-1">
                        <p className="text-center text-white text-sm">{t(`glove:${glove.gloveId}.name`)}</p>
                      </div>
                      <img
                        alt={glove.gloveId}
                        className="w-full h-full object-cover"
                        src={gloveImage}
                      />
                      <div className="absolute inset-0 bg-black/0 hover:bg-black/50 transition-all duration-300">
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300 m-6">
                          <div className="bg-black/80 p-4 rounded-lg text-white">
                            <h3 className="font-bold mb-2">{t(`glove:${glove.gloveId}.name`)}</h3>
                            <div className="space-y-1 text-xs">
                              <p>{t('ui:type')}: {t(`glove:${glove.gloveId}.type`)}</p>
                              <p>{t('ui:damage')}: {t(`glove:${glove.gloveId}.damage`)}</p>
                              <p>{t('ui:description')}</p>
                              <p className='text-2xs'>{t(`glove:${glove.gloveId}.description`)}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        </div>

        {/* 제출 버튼 */}
        <div className="flex justify-center">
          <StyledButton 
            bgColor='#FFE55C' 
            shadowColor='#FF9F0A'
            onClick={handleSubmit}
          >
            {t('ui:submit')}
          </StyledButton>
        </div></>) :
        <div className="flex flex-col items-center justify-center">
        <p className="text-xl font-bold text-center mb-2" 
          style={{ textShadow: '2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000' }}
        >
          {t('ui:matchEnded')}
        </p>
        <p className="text-xl font-bold text-center mb-2" 
          style={{ textShadow: '2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000' }}
        >
          {t('ui:expectedBlocksForNextMatch')}: {(data?.intervalEndHeight ?? 0) - (blockIndex ?? 0)}
        </p>
        </div>
       }
    </div>
  );
};

export default GameBoard; 