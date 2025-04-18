import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { request } from 'graphql-request';
import { Clock, Swords } from 'lucide-react';
import { useRequiredAccount } from '../context/AccountContext';
import { GRAPHQL_ENDPOINT, getUserDocument } from '../queries';
import { MatchState, GloveType } from '../gql/graphql';
import StyledButton from './StyledButton';
import MoveDisplay from './MoveDisplay';
import { getLocalGloveImage } from '../fetches';
import win from '../assets/win.png';
import lose from '../assets/lose.png';
import { GetGloveType } from '../utils/gloveUtils';
import { ActionName } from '../types/types';
import type { GetUserScopedSessionQuery } from '../gql/graphql';

interface GameBoardProps {
  blockIndex: number;
  data: NonNullable<NonNullable<GetUserScopedSessionQuery['stateQuery']>['userScopedSession']>;
}

enum GloveStatus {
  Winning = 'winning',
  Losing = 'losing',
  Neutral = 'neutral'
}

const AddressToGloveType = (address: string) => {
  if (address.startsWith('0')) return GloveType.Rock;
  if (address.startsWith('1')) return GloveType.Paper;
  if (address.startsWith('2')) return GloveType.Scissors;
  if (address.startsWith('3')) return GloveType.Special;
  console.error('Invalid glove address: ' + address);
  return GloveType.Special;
}

const JudgeGloveWinLose = (opponentGlove: GloveType) => {
  if (opponentGlove === GloveType.Rock) return { winningType: GloveType.Paper, losingType: GloveType.Scissors };
  if (opponentGlove === GloveType.Paper) return { winningType: GloveType.Scissors, losingType: GloveType.Rock };
  if (opponentGlove === GloveType.Scissors) return { winningType: GloveType.Rock, losingType: GloveType.Paper };
  if (opponentGlove === GloveType.Special) return { winningType: GloveType.Special, losingType: GloveType.Special };
  console.error('Invalid opponent glove: ' + opponentGlove);
  return { winningType: GloveType.Special, losingType: GloveType.Special };
}

const GameBoard: React.FC<GameBoardProps> = ({ blockIndex, data }) => {
  const { t } = useTranslation();
  const account = useRequiredAccount();
  const [submitting, setSubmitting] = useState(false);
  const [selectedHand, setSelectedHand] = useState<number>(-1);
  const [gameBoardState, setGameBoardState] = useState<GameBoardState>({
    opponentAddress: null,
    opponentName: null,
    myGloveAddress: null,
    opponentGloveAddress: null,
    myHealthPoint: 100,
    opponentHealthPoint: 100,
    myEffects: [],
    opponentEffects: [],
    maxHealthPoint: 100
  });

  interface GameBoardState {
    opponentAddress: string | null;
    opponentName: string | null;
    myGloveAddress: string | null;
    opponentGloveAddress: string | null;
    myHealthPoint: number;
    opponentHealthPoint: number;
    myEffects: string[];
    opponentEffects: string[];
    maxHealthPoint: number;
  }

  // 상대방 정보 조회
  const { data: opponentData } = useQuery({
    queryKey: ['getOpponent', data?.opponentAddress],
    queryFn: async () => {
      if (!data?.opponentAddress) return null;
      const response = await request(GRAPHQL_ENDPOINT, getUserDocument, { 
        address: data.opponentAddress 
      });
      return response?.stateQuery?.getUserData;
    },
    enabled: !!data?.opponentAddress
  });

  const remainingBlocks = data ? data.intervalEndHeight - blockIndex : 0;
  const fusePercentage = data ? Math.max(0, Math.min(100, (remainingBlocks / data.currentInterval) * 100)) : 0;

  useEffect(() => {
    const props: GameBoardState = {
      opponentAddress: data.opponentAddress || null,
      opponentName: opponentData?.name || null,
      myGloveAddress:
        (data.myPlayer?.initialGloves !== null &&
          data.myPlayer?.initialGloves !== undefined &&
          data.myPlayer?.submission !== undefined) ?
            data.myPlayer?.initialGloves?.[data.myPlayer?.submission] :
            null,
      opponentGloveAddress:
        (data.opponentPlayer?.initialGloves !== null &&
          data.opponentPlayer?.initialGloves !== undefined &&
          data.opponentPlayer?.submission !== undefined) ?
            data.opponentPlayer?.initialGloves?.[data.opponentPlayer?.submission] :
            null,
      myHealthPoint: data.myPlayer?.healthPoint ?? 100,
      opponentHealthPoint: data.opponentPlayer?.healthPoint ?? 100,
      myEffects: data.myPlayer?.activeEffectData?.map(effect => effect?.type).filter(effect => effect !== undefined) ?? [],
      opponentEffects: data.opponentPlayer?.activeEffectData?.map(effect => effect?.type).filter(effect => effect !== undefined) ?? [],
      maxHealthPoint: 100
    };

    setGameBoardState(props);
  }, [data, opponentData]);

  const isBreak = data?.currentUserMatchState === MatchState.Break;

  // Break 상태일 때 선택된 카드 해제
  useEffect(() => {
    if (isBreak) {
      setSelectedHand(-1);
    }
  }, [isBreak]);

  const handleSubmit = async () => {
    if (selectedHand === null) return;

    setSubmitting(true);
    try {
      await account.executeAction(
        ActionName.SUBMIT_MOVE,
        {
          sessionId: data.sessionId,
          gloveIndex: selectedHand
        }
      );

      setSelectedHand(-1);
      setSubmitting(false);
    } catch (error) {
      console.error('Failed to submit move:', error);
      setSubmitting(false);
    }
  };
  
  // 사용 가능한 글러브만 필터링하되, 원본 인덱스 정보 유지
  const myGloves = data.myPlayer?.initialGloves?.map((gloveId, index) => ({
    gloveId,
    originalIndex: index,
    isInactive: data?.myPlayer?.gloveInactive?.[index] === true,
    isUsed: data?.myPlayer?.gloveUsed?.[index] === true
  }));

  const myActiveGloves = myGloves?.filter(glove => !glove.isInactive && !glove.isUsed);

  const opponentGloves = data.opponentPlayer?.initialGloves?.map((gloveId, index) => ({
    gloveId,
    originalIndex: index,
    isInactive: data?.opponentPlayer?.gloveInactive?.[index] === true,
    isUsed: data?.opponentPlayer?.gloveUsed?.[index] === true
  }));

  const calculateSpacing = () => {
    const totalCards = myGloves?.filter(glove => !glove.isInactive).length ?? 0;
    const cardWidth = 100; // w-25 = 100px
    const containerWidth = 672; // max-w-3xl = 42rem = 672px
    const totalPadding = 24;
    const cardBorder = 4;
    const effectiveCardWidth = cardWidth + cardBorder;
    const availableWidth = containerWidth - totalPadding - (effectiveCardWidth * totalCards);
    const spacing = totalCards > 1 
      ? (availableWidth / (totalCards - 1))
      : 0;
    return spacing > 10 ? 10 : spacing;
  }

  return (
    <div className="relative h-full w-full mx-auto bg-slate-800 text-white overflow-hidden rounded-lg">
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
        <div
          className="absolute top-1/2 transform -translate-y-1/2 transition-all duration-1000 ease-linear text-xs"
          style={{ left: `${fusePercentage}%` }}
        >
          🔥
        </div>
      </div>

      {/* 상대 보유 글러브 표시 영역 */}
      <div className="flex flex-wrap justify-center gap-2 p-4 w-full">
        {opponentGloves?.filter(glove => !glove.isInactive).map((glove, index) => (
          <div
            key={index}
            className="group/glove relative"
          >
            <div
              className={`w-12 h-14 rounded-lg overflow-hidden border-2 border-black bg-gray-100 relative ${
                glove.isUsed ? 'opacity-50' : ''
              }`}
            >
              <div className="flex flex-col h-full">
                <div className="h-full">
                  <img
                    alt={glove.gloveId}
                    className="w-full h-full object-cover"
                    src={getLocalGloveImage(glove.gloveId)}
                  />
                </div>
                {glove.isUsed && (
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
                      alt={glove.gloveId}
                      className="w-full h-full object-cover"
                      src={getLocalGloveImage(glove.gloveId)}
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-sm mb-1">{t(`glove:${glove.gloveId}.name`)}</h3>
                    <p className="text-xs text-slate-300">{GetGloveType(glove.gloveId)}</p>
                    <p className="text-xs text-yellow-400">{t(`glove:${glove.gloveId}.damage`)}</p>
                  </div>
                </div>
                <p className="text-xs text-slate-400">{t(`glove:${glove.gloveId}.description`)}</p>
              </div>
              <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-black/90 rotate-45" />
            </div>
          </div>
        ))}
      </div>

      {/* 현재 제출 및 체력 상태 표시 영역 */}
      <div className="flex items-center justify-center space-x-4 px-6 py-2 w-full relative">
        {isBreak && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="bg-black/80 rounded-lg p-4">
              {data.lastRoundWinner === 'you' ? (
                <p className="text-3xl font-bold text-green-500">{t('ui:roundWin')}</p>
              ) : data.lastRoundWinner === 'opponent' ? (
                <p className="text-3xl font-bold text-red-500">{t('ui:roundLose')}</p>
              ) : data.lastRoundWinner === 'draw' ? (
                <p className="text-3xl font-bold text-yellow-500">{t('ui:roundDraw')}</p>
              ) : (
                <p className="text-3xl font-bold text-gray-400">{t('ui:roundUnknown')}</p>
              )}
            </div>
          </div>
        )}
        {(() => {
          const myGloveType = gameBoardState.myGloveAddress ? AddressToGloveType(gameBoardState.myGloveAddress) : null;
          const opponentGloveType = gameBoardState.opponentGloveAddress ? AddressToGloveType(gameBoardState.opponentGloveAddress) : null;
          
          let myGloveStatus = GloveStatus.Neutral;
          let opponentGloveStatus = GloveStatus.Neutral;

          if (myGloveType && opponentGloveType) {
            const { winningType, losingType } = JudgeGloveWinLose(opponentGloveType);
            if (myGloveType === winningType) {
              myGloveStatus = GloveStatus.Winning;
              opponentGloveStatus = GloveStatus.Losing;
            } else if (myGloveType === losingType) {
              myGloveStatus = GloveStatus.Losing;
              opponentGloveStatus = GloveStatus.Winning;
            }
          }

          return (
            <>
              <MoveDisplay 
                currentHp={gameBoardState.myHealthPoint < 0 ? 0 : gameBoardState.myHealthPoint}
                effects={gameBoardState.myEffects}
                gloveAddress={gameBoardState.myGloveAddress ?? ''} 
                gloveStatus={myGloveStatus}
                maxHp={gameBoardState.maxHealthPoint}
                userAddress={'you'} 
                userName={t('ui:you')}
              />
              <Swords className="w-16 h-16" color="white" />
              <MoveDisplay 
                currentHp={gameBoardState.opponentHealthPoint < 0 ? 0 : gameBoardState.opponentHealthPoint}
                effects={gameBoardState.opponentEffects}
                gloveAddress={gameBoardState.opponentGloveAddress ?? ''}
                gloveStatus={opponentGloveStatus}
                maxHp={gameBoardState.maxHealthPoint}
                userAddress={gameBoardState.opponentAddress ?? ''}
                userName={gameBoardState.opponentName ?? t('ui:opponent')}
              />
            </>
          );
        })()}
      </div>

      {/* 글러브 선택 UI */}
      <div className="flex flex-col items-center space-y-4 p-4 w-full">
        <div className="flex justify-center relative h-[100px] w-full overflow-visible">
          <div className="flex justify-center w-full overflow-visible">
            {(() => {
              const opponentGloveType = gameBoardState.opponentGloveAddress ? AddressToGloveType(gameBoardState.opponentGloveAddress) : null;
              const { winningType, losingType } = opponentGloveType ? JudgeGloveWinLose(opponentGloveType) : { winningType: null, losingType: null };

              return myActiveGloves?.map((glove, displayIndex) => {
                const isSelected = selectedHand === glove.originalIndex;
                const gloveImage = getLocalGloveImage(glove.gloveId);
                const spacing = calculateSpacing();
                const gloveType = AddressToGloveType(glove.gloveId);
                const gloveStatus = opponentGloveType ? 
                  (gloveType === winningType ? GloveStatus.Winning : 
                  gloveType === losingType ? GloveStatus.Losing : 
                  GloveStatus.Neutral) : 
                  GloveStatus.Neutral;
                
                const borderColorClass = gloveStatus === GloveStatus.Winning 
                  ? 'border-green-500' 
                  : gloveStatus === GloveStatus.Losing
                    ? 'border-red-500' 
                    : 'border-black';
                
                return (
                  <div
                    key={glove.originalIndex}
                    className={`group/glove rounded-lg overflow-visible border-2 bg-gray-100 ${borderColorClass} cursor-pointer transition-all duration-300 transform hover:scale-105 hover:z-50 hover:-translate-y-4 ${
                      isSelected 
                        ? 'ring-4 ring-yellow-400 shadow-lg shadow-yellow-400/50 z-50 -translate-y-4' 
                        : 'hover:shadow-lg hover:shadow-white/20'
                    }`}
                    style={{
                      zIndex: isSelected ? 50 : displayIndex,
                      width: '100px',
                      height: '100px',
                      minWidth: '100px',
                      minHeight: '100px',
                      marginRight: displayIndex < myActiveGloves.length - 1 ? `${spacing}px` : '0'
                    }}
                    onClick={() => isBreak ? null : setSelectedHand(isSelected ? -1 : glove.originalIndex)}
                  >
                    {gloveStatus === GloveStatus.Winning && (
                      <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 animate-bounce">
                        <div className="text-green-500 text-2xl">↑</div>
                      </div>
                    )}
                    <div className="w-full h-full overflow-hidden rounded-lg">
                      <img
                        alt={glove.gloveId}
                        className="w-full h-full object-cover"
                        src={gloveImage}
                      />
                    </div>
                    {/* 호버 시 표시될 큰 모달 */}
                    <div className="invisible group-hover/glove:visible absolute z-[100] -top-2 left-1/2 transform -translate-x-1/2 -translate-y-full">
                      <div className="bg-black/90 p-3 rounded-lg text-white w-48 shadow-lg">
                        <div className="flex gap-3 items-start mb-2">
                          <div className="w-16 h-20 rounded-lg overflow-hidden border-2 border-white/20">
                            <img
                              alt={glove.gloveId}
                              className="w-full h-full object-cover"
                              src={gloveImage}
                            />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-sm mb-1">{t(`glove:${glove.gloveId}.name`)}</h3>
                            <p className="text-xs text-slate-300">{GetGloveType(glove.gloveId)}</p>
                            <p className="text-xs text-yellow-400">{t(`glove:${glove.gloveId}.damage`)}</p>
                          </div>
                        </div>
                        <p className="text-xs text-slate-400">{t(`glove:${glove.gloveId}.description`)}</p>
                      </div>
                      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-3 h-3 bg-black/90 rotate-45" />
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </div>
      </div>

      {/* 제출 버튼 */}
      {!isBreak && (
        <div className="flex flex-col items-center p-4">
          <StyledButton 
            bgColor='#FFE55C' 
            disabled={submitting || selectedHand === -1}
            shadowColor='#FF9F0A'
            onClick={handleSubmit}
          >
            {submitting ? t('ui:submitting') : t('ui:submit')}
          </StyledButton>
        </div>
      )}

    </div>
  );
};

export default GameBoard; 