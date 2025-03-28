import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { request } from 'graphql-request';
import StyledButton from '../components/StyledButton';
import { useRequiredAccount } from '../context/AccountContext';
import { GRAPHQL_ENDPOINT, pickUpAction, pickUpManyAction, PICK_UP_RESULT_SUBSCRIPTION, getUserDocument } from '../queries';
import { executeTransaction } from '../utils/transaction';
import GloveCard from '../components/GloveCard';
import subscriptionClient from '../subscriptionClient';
import { GetGloveRarity } from '../utils/gloveUtils';
import type { GloveRarity } from '../types/types';

// 애니메이션 스타일 정의
const animationStyles = `
  @keyframes shine {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
  .animate-shine {
    animation: shine 2s infinite;
  }
  
  @keyframes flip {
    0% { transform: rotateY(180deg); opacity: 0; }
    50% { transform: rotateY(90deg); opacity: 1; }
    100% { transform: rotateY(0deg); opacity: 0; }
  }
  .animate-flip {
    animation: flip 0.8s ease-out forwards;
  }
  
  .card-container {
    transition: all 0.3s ease-in-out;
  }
  
  .card-container.revealed .card-back {
    opacity: 0;
    transform: rotateY(180deg);
    transition: all 0.8s ease-out;
  }
  
  .card-container.revealed .card-front {
    opacity: 1;
    transition: opacity 0.3s ease-in 0.5s;
  }
  
  .card-back {
    transition: all 0.8s ease-out;
    transform: rotateY(0deg);
    opacity: 1;
  }
  
  .card-front {
    opacity: 0;
    transition: opacity 0.3s ease-out;
  }

  @keyframes pulse-glow {
    0% { box-shadow: 0 0 5px 2px var(--glow-color); }
    50% { box-shadow: 0 0 15px 5px var(--glow-color); }
    100% { box-shadow: 0 0 5px 2px var(--glow-color); }
  }
  
  .pulse-glow-rare {
    --glow-color: rgba(0,191,255,0.7);
    animation: pulse-glow 2s infinite;
  }
  
  .pulse-glow-epic {
    --glow-color: rgba(163,53,238,0.7);
    animation: pulse-glow 2s infinite;
  }
  
  .pulse-glow-legendary {
    --glow-color: rgba(255,215,0,0.7);
    animation: pulse-glow 2s infinite;
  }
`;

// 비용 상수 정의
const SINGLE_PICKUP_COST = 10;
const MULTI_PICKUP_COST = 100;

const PickUpPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const account = useRequiredAccount();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pickedGloves, setPickedGloves] = useState<string[]>([]);
  const [txId, setTxId] = useState<string | null>(null);
  const [revealedCards, setRevealedCards] = useState<boolean[]>([]);
  const [allRevealed, setAllRevealed] = useState(false);
  const [animatingCards, setAnimatingCards] = useState<boolean[]>([]);

  // 유저 데이터 가져오기
  const { data: userData, refetch: refetchUserData } = useQuery({
    queryKey: ['getUserData', account],
    queryFn: async () => {
      const response = await request(GRAPHQL_ENDPOINT, getUserDocument, { 
        address: account.address.toString() 
      });
      return response?.stateQuery?.getUserData;
    }
  });

  const handleBack = () => {
    navigate(-1);
  };

  // 구독 설정
  useEffect(() => {
    if (!txId) return;

    const unsubscribe = subscriptionClient.subscribe(
      {
        query: PICK_UP_RESULT_SUBSCRIPTION,
        variables: { txId },
      },
      {
        next: (result) => {
          const data = result.data as { onPickUpResult: { gloves: string[] } };
          if (data?.onPickUpResult?.gloves) {
            setPickedGloves(data.onPickUpResult.gloves);
            setRevealedCards(new Array(data.onPickUpResult.gloves.length).fill(false));
            setAnimatingCards(new Array(data.onPickUpResult.gloves.length).fill(false));
            setSuccess(true);
            setIsLoading(false);
            // 뽑기 완료 후 유저 데이터 리프레시
            refetchUserData();
          }
        },
        error: (err) => {
          console.error('Subscription error:', err);
          setError('Subscription error');
          setIsLoading(false);
        },
        complete: () => {
          // 구독 완료
        },
      }
    );

    return () => {
      unsubscribe();
    };
  }, [txId, refetchUserData]);

  // 카드 뽑기 액션
  const pickUpMutation = useMutation({
    mutationFn: async () => {
      const pickUpResponse = await request(GRAPHQL_ENDPOINT, pickUpAction);
      
      if (!pickUpResponse.actionQuery?.pickUp) {
        throw new Error('Failed to get pick up response');
      }

      const plainValue = pickUpResponse.actionQuery.pickUp;
      const newTxId = await executeTransaction(account, plainValue);
      setTxId(newTxId);
      return newTxId;
    },
    onError: (error) => {
      console.error('Failed to pick up card:', error);
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
      setIsLoading(false);
    }
  });

  // 10개 카드 한번에 뽑기 액션
  const pickUpManyMutation = useMutation({
    mutationFn: async () => {
      const pickUpManyResponse = await request(GRAPHQL_ENDPOINT, pickUpManyAction);
      
      if (!pickUpManyResponse.actionQuery?.pickUpMany) {
        throw new Error('Failed to get pick up many response');
      }

      const plainValue = pickUpManyResponse.actionQuery.pickUpMany;
      const newTxId = await executeTransaction(account, plainValue);
      setTxId(newTxId);
      return newTxId;
    },
    onError: (error) => {
      console.error('Failed to pick up many cards:', error);
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
      setIsLoading(false);
    }
  });

  const resetCardState = () => {
    if (isLoading) return;
    setIsLoading(true);
    setError(null);
    setSuccess(false);
    setPickedGloves([]);
    setTxId(null);
    setRevealedCards([]);
    setAllRevealed(false);
    setAnimatingCards([]);
  };

  const handlePickUpCard = async () => {
    resetCardState();
    try {
      await pickUpMutation.mutateAsync();
    } catch (err) {
      // 오류는 mutation onError에서 처리됨
    }
  };  

  // 한번에 10개 카드 뽑기 핸들러 추가
  const handlePickUpManyCards = async () => {
    resetCardState();

    try {
      await pickUpManyMutation.mutateAsync();
    } catch (err) {
      // 오류는 mutation onError에서 처리됨
    }
  };

  // 특정 카드 뒤집기
  const handleRevealCard = (index: number) => {
    if (allRevealed) return;
    
    const newRevealedCards = [...revealedCards];
    newRevealedCards[index] = true;
    setRevealedCards(newRevealedCards);
    
    // 모든 카드가 뒤집혔는지 확인
    if (newRevealedCards.every(card => card)) {
      setAllRevealed(true);
    }
  };

  // 애니메이션 효과 상태 관리
  useEffect(() => {
    if (revealedCards.length === 0) {
      setAnimatingCards([]);
      return;
    }
    
    // 새로 뒤집힌 카드 찾기
    const newAnimatingCards = [...animatingCards];
    revealedCards.forEach((revealed, idx) => {
      if (revealed && !newAnimatingCards[idx]) {
        newAnimatingCards[idx] = true;
        
        // 애니메이션 시간 후 효과 제거 (1초)
        setTimeout(() => {
          setAnimatingCards(prev => {
            const updated = [...prev];
            updated[idx] = false;
            return updated;
          });
        }, 1000);
      }
    });
    
    setAnimatingCards(newAnimatingCards);
  }, [revealedCards, animatingCards]);

  // 모든 카드 뒤집기
  const handleRevealAllCards = () => {
    const newRevealedCards = new Array(pickedGloves.length).fill(true);
    setRevealedCards(newRevealedCards);
    
    // 모든 카드에 애니메이션 효과 적용
    const newAnimatingCards = new Array(pickedGloves.length).fill(true);
    setAnimatingCards(newAnimatingCards);
    
    // 1초 후 애니메이션 효과 제거
    setTimeout(() => {
      setAnimatingCards(new Array(pickedGloves.length).fill(false));
    }, 1000);
    
    setAllRevealed(true);
  };

  // 카드 등급 확인 (레어 이상인지)
  const isCardRare = (gloveId: string) => {
    const rarity = GetGloveRarity(gloveId) as GloveRarity;
    return rarity === 'rare' || rarity === 'epic' || rarity === 'legendary';
  };

  // 카드 등급에 따른 색상 반환
  const getGlowColorByRarity = (gloveId: string) => {
    const rarity = GetGloveRarity(gloveId) as GloveRarity;
    switch (rarity) {
      case 'rare':
        return 'rgba(0,191,255,0.7)'; // 파란색 - 레어
      case 'epic':
        return 'rgba(163,53,238,0.7)'; // 보라색 - 에픽
      case 'legendary':
        return 'rgba(255,215,0,0.7)'; // 금색 - 레전더리
      default:
        return 'rgba(255,255,255,0.2)'; // 회색 - 일반
    }
  };

  // 카드 등급에 따른 테두리 색상 반환
  const getBorderColorByRarity = (gloveId: string) => {
    const rarity = GetGloveRarity(gloveId) as GloveRarity;
    switch (rarity) {
      case 'rare':
        return 'border-blue-400'; // 파란색 - 레어
      case 'epic':
        return 'border-purple-400'; // 보라색 - 에픽
      case 'legendary':
        return 'border-yellow-400'; // 금색 - 레전더리
      default:
        return 'border-gray-600'; // 회색 - 일반
    }
  };

  // 카드 등급에 따른 그라데이션 색상 반환
  const getGradientColorByRarity = (gloveId: string) => {
    const rarity = GetGloveRarity(gloveId) as GloveRarity;
    switch (rarity) {
      case 'rare':
        return 'from-blue-300/0 via-blue-300/30 to-blue-300/0'; // 파란색 - 레어
      case 'epic':
        return 'from-purple-300/0 via-purple-300/30 to-purple-300/0'; // 보라색 - 에픽
      case 'legendary':
        return 'from-yellow-300/0 via-yellow-300/30 to-yellow-300/0'; // 금색 - 레전더리
      case 'uncommon':
        return 'from-green-300/0 via-green-300/30 to-green-300/0'; // 녹색 - 언커먼
      default:
        return 'from-gray-300/0 via-gray-300/30 to-gray-300/0'; // 회색 - 일반
    }
  };

  // 카드 등급에 따른 펄스 애니메이션 클래스 반환
  const getPulseGlowClass = (gloveId: string) => {
    const rarity = GetGloveRarity(gloveId) as GloveRarity;
    switch (rarity) {
      case 'rare':
        return 'pulse-glow-rare';
      case 'epic':
        return 'pulse-glow-epic';
      case 'legendary':
        return 'pulse-glow-legendary';
      default:
        return '';
    }
  };

  // 잔액 확인
  const hasEnoughBalance = (cost: number) => {
    if (userData?.balance === undefined) return false;
    return userData.balance >= cost;
  };

  return (
    <div className="flex flex-col items-center justify-center w-full mx-auto bg-gray-700 border-2 border-black rounded-lg text-white">
      <style dangerouslySetInnerHTML={{ __html: animationStyles }} />
      <div className="w-full flex flex-col items-center bg-gray-900 p-4 rounded-t-lg border-b border-black">
        <h1 className="text-2xl font-bold mb-4" style={{ textShadow: '2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000' }}>
          {t('ui:pickupCardTitle')}
        </h1>
        <div className="px-4 py-2 bg-gray-800 rounded-lg flex items-center shadow-inner">
          <span className="text-yellow-400 text-2xl mr-2">💰</span>
          <span className="text-xl text-yellow-400 font-semibold">
            {userData?.balance !== undefined ? `${userData.balance}` : t('ui:loading')}
          </span>
        </div>
      </div>
      <div className="flex flex-col items-center p-4 space-y-4">
        <p className="text-lg text-center mb-4">{t('ui:pickupCardDescription')}</p>
        
        {error && (
          <div className="text-red-500 text-center mb-4">
            {t('ui:pickupCardError')}
            <p className="text-sm">{error}</p>
          </div>
        )}

        {pickedGloves.length > 0 && (
          <div className="w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-center">
                {t('ui:pickedUpGloves')}
              </h2>
              <div className="min-h-[60px] flex justify-end items-center">
                {!allRevealed && (
                  <StyledButton 
                    onClick={handleRevealAllCards}
                  >
                    {t('ui:revealAllCards')}
                  </StyledButton>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              {pickedGloves.map((gloveId, index) => (
                <div 
                  key={index} 
                  className={`relative card-container ${revealedCards[index] ? 'revealed' : ''}`}
                >
                  {/* 앞면 카드 */}
                  <div className="card-front">
                    <GloveCard gloveId={gloveId} />
                  </div>
                  
                  {/* 뒷면 카드 */}
                  <div 
                    className="card-back absolute inset-0"
                    onClick={() => handleRevealCard(index)}
                  >
                    <div 
                      className={`cursor-pointer h-full w-full ${isCardRare(gloveId) ? 'animate-pulse' : ''}`}
                    >
                      <div className={`h-full w-full bg-gray-800 rounded-lg border-3 ${isCardRare(gloveId) ? getBorderColorByRarity(gloveId) : 'border-gray-600'} flex items-center justify-center relative overflow-hidden
                        ${isCardRare(gloveId) ? getPulseGlowClass(gloveId) : ''}`}
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
                          <div className="text-3xl">?</div>
                          {isCardRare(gloveId) && (
                            <div className={`absolute inset-0 bg-gradient-to-r ${getGradientColorByRarity(gloveId)} animate-shine`} />
                          )}
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className={`w-16 h-16 border-4 ${isCardRare(gloveId) ? getBorderColorByRarity(gloveId) : 'border-gray-600'} rounded-full flex items-center justify-center`}>
                            <div className="text-2xl font-bold text-gray-400">?</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* 뒤집기 애니메이션 효과 */}
                  {revealedCards[index] && animatingCards[index] && (
                    <div className="absolute inset-0 animate-flip pointer-events-none z-30" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col space-y-4 mt-4">
          <div className="flex flex-row items-center justify-center space-x-4">
            <div className="min-w-[130px] flex flex-col items-center">
              <div className="text-transparent text-xs mb-1 text-center max-w-[160px] h-[38px]">
                &nbsp;
              </div>
              <StyledButton
                bgColor = '#4FD1C5'
                disabled={isLoading || !hasEnoughBalance(SINGLE_PICKUP_COST)}
                shadowColor = '#319795'
                onClick={handlePickUpCard}
              >
                {isLoading ? t('ui:loading') : (
                  <div className="flex flex-col items-center">
                    <span>{t('ui:pickupCardButton')}</span>
                    <span className="text-sm text-white mt-1">💰 {SINGLE_PICKUP_COST}</span>
                  </div>
                )}
              </StyledButton>
              <div className="text-red-400 text-xs mt-1 h-4">
                {!hasEnoughBalance(SINGLE_PICKUP_COST) && !isLoading ? t('ui:notEnoughBalance') : '\u00A0'}
              </div>
            </div>
            
            <div className="min-w-[130px] flex flex-col items-center relative group">
              {/* 말풍선 형태의 메시지 */}
              <div className="h-[38px] flex items-end justify-center pb-1 relative z-10">
                <div className="bg-green-800 text-green-200 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shadow-lg relative">
                  {t('ui:guaranteedUncommon')}
                  <div className="absolute left-1/2 transform -translate-x-1/2 translate-y-1/2 bottom-0 w-3 h-3 bg-green-800 rotate-45" />
                </div>
              </div>
              
              <StyledButton
                bgColor = '#4FD1C5'
                disabled={isLoading || !hasEnoughBalance(MULTI_PICKUP_COST)}
                shadowColor = '#319795'
                onClick={handlePickUpManyCards}
              >
                {isLoading ? t('ui:loading') : (
                  <div className="flex flex-col items-center">
                    <span>{t('ui:pickupManyCardsButton')}</span>
                    <span className="text-sm text-white mt-1">💰 {MULTI_PICKUP_COST}</span>
                  </div>
                )}
              </StyledButton>
              
              <div className="text-red-400 text-xs mt-1 h-4">
                {!hasEnoughBalance(MULTI_PICKUP_COST) && !isLoading ? t('ui:notEnoughBalance') : '\u00A0'}
              </div>
            </div>
          </div>
          
          <div className="flex justify-center">
            <StyledButton onClick={handleBack}>
              {t('ui:goBack')}
            </StyledButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PickUpPage; 