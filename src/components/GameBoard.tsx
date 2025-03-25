import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation } from '@tanstack/react-query';
import { request } from 'graphql-request';
import { Clock, Swords } from 'lucide-react';
import { useRequiredAccount } from '../context/AccountContext';
import { GRAPHQL_ENDPOINT, submitMoveAction } from '../queries';
import { MatchState } from '../gql/graphql';
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
  const fusePercentage = data ? Math.max(0, Math.min(100, (remainingBlocks / data.currentInterval) * 100)) : 0;

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
    <div className="relative h-full w-full max-w-md mx-auto bg-slate-800 text-white overflow-hidden rounded-lg">
      {/* 상단 정보 바 - 컴팩트하게 한 줄로 표시 */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <div className="flex flex-col">
            <span className="text-xs text-slate-400">{t('ui:phase')}</span>
            <span className="text-sm font-bold">{((data?.currentPhaseIndex ?? -1) + 1)}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-slate-400">{t('ui:round')}</span>
            <span className="text-sm font-bold">{((data?.currentUserRoundIndex ?? -1) + 1)}</span>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-slate-800 px-2 py-0.5 rounded-full">
          <span className="text-xs">{t('ui:survivors')}:</span>
          <span className="text-sm font-bold">{data?.playersLeft ?? -1}</span>
        </div>

        <div className="flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" />
          <span className="text-sm font-bold">{remainingBlocks}</span>
        </div>
      </div>

      {/* 게임 상태 표시 */}
      {data?.currentUserMatchState !== MatchState.Ended && (
        <div className={`px-3 py-1 text-center text-xs font-medium ${
          data?.currentUserMatchState === MatchState.Active ? 'bg-green-500/20' : 'bg-yellow-500/20'
        }`}>
          {data?.currentUserMatchState === MatchState.Active ? t('ui:matchActive') : t('ui:matchBreak')}
        </div>
      )}

      {/* 타이머 퓨즈 - 슬림한 디자인 */}
      <div className="relative h-1.5 w-full bg-slate-700">
        <div
          style={{ width: `${fusePercentage}%` }}
          className={`h-full transition-all duration-1000 ease-linear ${
            fusePercentage > 66 ? "bg-green-500" : fusePercentage > 33 ? "bg-yellow-500" : "bg-red-500"
          }`}
        />
        <div className="absolute -left-1 top-1/2 transform -translate-y-1/2 text-xs">💣</div>
        {/* eslint-disable-next-line react/jsx-sort-props, react/jsx-max-props-per-line */}
        <div
          style={{ left: `${fusePercentage}%` }}
          className="absolute top-1/2 transform -translate-y-1/2 transition-all duration-1000 ease-linear text-xs"
        >
          🔥
        </div>
      </div>

      {/* 상대 보유 글러브 표시 영역 */}
      <div className="flex flex-wrap justify-center gap-2 p-2">
        {data?.opponentGloves?.map((gloveId, index) => (
          <div
            key={index}
            className="group/glove relative"
          >
            <div
              className={`w-12 h-14 rounded-lg overflow-hidden border-2 border-black bg-gray-100 relative ${
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
                    <span className="text-white text-xl">✗</span>
                  </div>
                )}
              </div>
            </div>
            {/* 호버 시 표시될 큰 모달 */}
            <div className="invisible group-hover/glove:visible absolute z-20 -bottom-2 left-1/2 transform -translate-x-1/2 translate-y-full">
              <div className="bg-black/90 p-3 rounded-lg text-white w-48 shadow-lg">
                <div className="flex gap-3 items-start mb-2">
                  <div className="w-16 h-20 rounded-lg overflow-hidden border-2 border-white/20">
                    <img
                      alt={gloveId}
                      className="w-full h-full object-cover"
                      src={getLocalGloveImage(gloveId)}
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-sm mb-1">{t(`glove:${gloveId}.name`)}</h3>
                    <p className="text-xs text-slate-300">{t(`glove:${gloveId}.type`)}</p>
                    <p className="text-xs text-yellow-400">{t(`glove:${gloveId}.damage`)}</p>
                  </div>
                </div>
                <p className="text-xs text-slate-400">{t(`glove:${gloveId}.description`)}</p>
              </div>
              <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-black/90 rotate-45" />
            </div>
          </div>
        ))}
      </div>

      {/* 현재 제출 및 체력 상태 표시 영역 */}
      <div className="flex items-center justify-center space-x-1 py-0.5">
        <MoveDisplay 
          currentHp={gameBoardState.myHealthPoint < 0 ? 0 : gameBoardState.myHealthPoint}
          gloveAddress={gameBoardState.myGloveAddress ?? ''} 
          maxHp={gameBoardState.maxHealthPoint}
          userAddress={'you'} 
        />
        <Swords className="w-16 h-16" color="white" />
        <MoveDisplay 
          currentHp={gameBoardState.opponentHealthPoint < 0 ? 0 : gameBoardState.opponentHealthPoint}
          gloveAddress={gameBoardState.opponentGloveAddress ?? ''}
          maxHp={gameBoardState.maxHealthPoint}
          userAddress={gameBoardState.opponentAddress ?? ''}
        />
      </div>
      
      {/* 글러브 선택 UI */}
      <div className="flex flex-col items-center space-y-4 p-4">
        <div className="flex justify-center relative h-[150px] w-full">
          <div className="flex justify-center w-full">
            {(() => {
              // 사용 가능한 글러브만 필터링하되, 원본 인덱스 정보 유지
              const availableGloves = data?.myGloves?.map((gloveId, index) => ({
                gloveId,
                originalIndex: index,
                isUsed: data?.myCondition?.gloveUsed?.[index] === true
              })).filter(glove => !glove.isUsed) ?? [];

              const totalCards = availableGloves.length;
              const cardWidth = 120; // w-30 = 7.5rem = 120px
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
                    className={`absolute w-30 h-40 rounded-lg overflow-hidden border-2 bg-gray-100 border-black cursor-pointer transition-all duration-300 transform hover:scale-105 hover:z-10 hover:-translate-y-4 ${
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
                    <div className="flex flex-col items-center justify-center border-b-2 border-black bg-gray-900 p-0.5">
                      <p className="text-center text-white text-2xs">{t(`glove:${glove.gloveId}.name`)}</p>
                    </div>
                    <img
                      alt={glove.gloveId}
                      className="w-full h-full object-cover"
                      src={gloveImage}
                    />
                    <div className="absolute inset-0 bg-black/0 hover:bg-black/50 transition-all duration-300">
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300 m-2">
                        <div className="bg-black/80 p-1.5 rounded-lg text-white">
                          <h3 className="font-bold mb-0.5 text-2xs">{t(`glove:${glove.gloveId}.name`)}</h3>
                          <div className="space-y-0.5 text-2xs">
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
      <div className="flex justify-center p-4">
        <StyledButton 
          bgColor='#FFE55C' 
          shadowColor='#FF9F0A'
          onClick={handleSubmit}
        >
          {t('ui:submit')}
        </StyledButton>
      </div>
    </div>
  );
};

export default GameBoard; 