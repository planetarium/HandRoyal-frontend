import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { request } from 'graphql-request';
import { Loader, X } from 'lucide-react';
import StyledButton from '../components/StyledButton';
import { useRequiredAccount } from '../context/AccountContext';
import { getLocalGloveImage } from '../fetches';
import { GRAPHQL_ENDPOINT, getUserDocument, MATCH_MADE_SUBSCRIPTION, getMatchPoolDocument } from '../queries';
import subscriptionClient from '../subscriptionClient';
import GloveSelectionComponent, { type GloveSelection } from '../components/GloveSelectionComponent';
import { useTip } from '../context/TipContext';
import { ActionName } from '../types/types';
import type { GloveInfo } from '../gql/graphql';

const GLOVE_SELECTION_LIMIT: number = 8;

// 매칭 상태를 표현하는 타입
type MatchingStatus = 'selecting' | 'confirming' | 'searching' | 'matched' | 'failed';

// 매치 메이드 서브스크립션 결과 타입
type MatchMadeSubscriptionResult = {
  data?: {
    onMatchMade?: {
      sessionId: string;
      players: string[];
    }
  }
};

export const MatchingPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const account = useRequiredAccount();
  const { tip } = useTip();

  // 상태 관리
  const [matchingStatus, setMatchingStatus] = useState<MatchingStatus>('selecting');
  const [selectedGloves, setSelectedGloves] = useState<GloveSelection>({});
  const [totalSelected, setTotalSelected] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [registeredHeight, setRegisteredHeight] = useState(0);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // 유저 데이터 가져오기
  const { data: userData, isLoading: userLoading } = useQuery({
    queryKey: ['getUser', account?.address],
    queryFn: async () => {
      const response = await request(GRAPHQL_ENDPOINT, getUserDocument, { 
        address: account.address.toString() 
      });
      return response.stateQuery?.getUserData;
    }
  });
  
  // 매치 풀풀 데이터 가져오기
  const { data: matchPoolData, isLoading: matchPoolLoading } = useQuery({
    queryKey: ['getMatchPool'],
    queryFn: async () => {
      const response = await request(GRAPHQL_ENDPOINT, getMatchPoolDocument);
      return response.stateQuery?.getMatchPool;
    }
  });

  useEffect(() => {
    const myAddress = account.address.toString().substring(2);
    if (matchPoolData?.some(matchPool => matchPool?.userId === myAddress)) {
      setMatchingStatus('searching');
      setRegisteredHeight(matchPoolData?.find(matchPool => matchPool?.userId === myAddress)?.registeredHeight);
    }
  }, [matchPoolData, account.address]);

  // 매치 서브스크립션 설정
  useEffect(() => {
    if (!account || matchingStatus !== 'searching') return;

    const unsubscribe = subscriptionClient.subscribe(
      {
        query: MATCH_MADE_SUBSCRIPTION,
        variables: { userId: account.address.toString() },
      },
      {
        next: (result: MatchMadeSubscriptionResult) => {
          const data = result.data;
          if (data?.onMatchMade?.sessionId) {
            setSessionId(data.onMatchMade.sessionId);
            setMatchingStatus('matched');
            
            // 매치가 성사되면 2초 후에 게임 페이지로 이동
            setTimeout(() => {
              navigate(`/game/${data.onMatchMade?.sessionId}`);
            }, 2000);
          }
        },
        error: (err: Error) => {
          console.error('Subscription error:', err);
          setError('Subscription error');
          setMatchingStatus('failed');
        },
        complete: () => {
          // 구독 완료
        },
      }
    );

    return () => {
      unsubscribe();
    };
  }, [account, matchingStatus, navigate]);

  // 매칭 등록 핸들러
  const handleRegisterMatching = async () => {
    if (totalSelected === 0) {
      setError('장갑을 최소 1개 이상 선택해주세요');
      return;
    }

    setError(null);
    setMatchingStatus('confirming');
  };

  // 매칭 등록 확인 핸들러
  const handleConfirmMatching = async () => {
    setError(null);
    setIsProcessing(true);

    try {
      // 선택한 장갑 배열 생성 (객체 형태를 배열로 변환)
      const gloves = Object.entries(selectedGloves).flatMap(([key, count]) => 
        Array(count).fill(key)
      );
      
      // 매칭 등록 요청
      const txId = await account.executeAction(
        ActionName.REGISTER_MATCHING,
        { gloves }
      );

      if (txId) {
        setRegisteredHeight(tip?.height ?? 0);
        setMatchingStatus('searching');
      }
    } catch (error) {
      console.error('Failed to register matching:', error);
      setError(error instanceof Error ? error.message : '매칭 등록에 실패했습니다');
      setMatchingStatus('failed');
    } finally {
      setIsProcessing(false);
    }
  };

  // 매칭 취소 핸들러
  const handleCancelMatching = async () => {
    if (matchingStatus === 'confirming') {
      // 확인 화면에서 취소한 경우 선택 화면으로 돌아감
      setMatchingStatus('selecting');
      return;
    }

    setIsProcessing(true);
    try {
      const txId = await account.executeAction(ActionName.CANCEL_MATCHING);

      if (txId) {
        setMatchingStatus('confirming');
      }
    } catch (error) {
      console.error('Failed to cancel matching:', error);
      setError(error instanceof Error ? error.message : '매칭 취소에 실패했습니다');
    } finally {
      setIsProcessing(false);
    }
  };

  // 화면 상단 제목 표시
  const renderHeader = () => (
    <div className="w-full bg-gray-900 p-4 rounded-t-lg border-b border-black">
      <h1 
        className="text-2xl text-center text-white font-extrabold"
        style={{ textShadow: '2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000' }}
      >
        {t('ui:quickMatch')}
      </h1>
    </div>
  );

  // 장갑 선택 화면
  const renderSelectingState = () => (
    <div className="p-6">
      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-100 p-3 rounded-lg mb-4">
          {error}
        </div>
      )}
      
      {userData?.ownedGloves && (
        <GloveSelectionComponent
          maxSelections={GLOVE_SELECTION_LIMIT}
          ownedGloves={userData.ownedGloves.filter((g: GloveInfo | null | undefined) => g !== null && g !== undefined) ?? []}
          selectedGloves={selectedGloves}
          setSelectedGloves={setSelectedGloves}
          setTotalSelected={setTotalSelected}
          totalSelected={totalSelected}
        />
      )}
      
      <div className="mt-6 flex justify-between">
        <StyledButton
          bgColor="#FF3366"
          shadowColor="#CC0033"
          onClick={() => navigate('/')}
        >
          {t('ui:cancel')}
        </StyledButton>
        
        <StyledButton
          bgColor="#4FD1C5"
          disabled={totalSelected !== GLOVE_SELECTION_LIMIT}
          shadowColor="#319795"
          onClick={handleRegisterMatching}
        >
          {t('ui:next')}
        </StyledButton>
      </div>
    </div>
  );

  // 확인 화면
  const renderConfirmingState = () => (
    <div className="p-6">
      <div className="bg-gray-800 p-4 rounded-lg mb-6">
        <h2 className="text-xl font-semibold text-white mb-4">
          {t('ui:confirmSelection')}
        </h2>
        
        <p className="text-gray-300 mb-4">
          {t('ui:matchingConfirmDescription')}
        </p>
        
        <div className="bg-gray-700 p-3 rounded-lg mb-4">
          <div className="flex justify-between text-sm text-gray-300 mb-2">
            <span>{t('ui:selectedGloves')}:</span>
            <span>{totalSelected}</span>
          </div>
          
          {/* 선택한 장갑 목록 표시 */}
          <div className="mt-4">
            <h3 className="text-sm font-medium text-white mb-2">{t('ui:selectedGlovesDetail')}</h3>
            <div className="flex flex-wrap gap-2 justify-center">
              {Object.entries(selectedGloves)
                .flatMap(([gloveId, count]) => 
                  Array.from({ length: count }, (_, i) => (
                    <div key={`${gloveId}-${i}`} className="relative">
                      <img 
                        alt={t(`glove:${gloveId}.name`)}
                        className="w-14 h-14 object-contain bg-gray-800 rounded-lg border border-gray-600"
                        src={getLocalGloveImage(gloveId)}
                      />
                    </div>
                  ))
                )
              }
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-6 flex justify-between">
        <StyledButton
          bgColor="#FF3366"
          disabled={isProcessing}
          shadowColor="#CC0033"
          onClick={handleCancelMatching}
        >
          {isProcessing ? t('ui:processing') : t('ui:back')}
        </StyledButton>
        
        {((userData?.actionPoint ?? 0) <= 0) ? <p className="text-md text-red-500">{t('ui:notEnoughActionPoint')}: {userData?.actionPoint}</p> : null}
        <StyledButton
          bgColor="#4FD1C5"
          disabled={userData?.actionPoint === 0 || isProcessing}
          shadowColor="#319795"
          onClick={handleConfirmMatching}
        >
          {isProcessing ? (
            <div className="flex items-center">
              <Loader className="w-4 h-4 text-white animate-spin mr-2" />
              {t('ui:processing')}
            </div>
          ) : t('ui:register')}
        </StyledButton>
      </div>
    </div>
  );

  // 매칭 검색 중 화면
  const renderSearchingState = () => (
    <div className="p-6 flex flex-col items-center">
      <div className="flex items-center justify-center mb-6">
        <Loader className="w-12 h-12 text-blue-400 animate-spin mr-4" />
        <div className="text-white">
          <p className="text-xl font-bold">{t('ui:searchingForOpponents')}</p>
        </div>
      </div>
      
      <div className="bg-gray-800 rounded-lg p-4 w-full mb-6">
        <div className="flex justify-center text-white mb-2">
          <span>{t('ui:elapsed')}:&nbsp;</span>
          <span>{(tip?.height ?? 0) - registeredHeight}</span>
        </div>
      </div>
      
      <StyledButton
        bgColor="#FF3366"
        disabled={isProcessing}
        shadowColor="#CC0033"
        onClick={handleCancelMatching}
      >
        {isProcessing ? t('ui:processing') : t('ui:cancel')}
      </StyledButton>
    </div>
  );

  // 매칭 성공 화면
  const renderMatchedState = () => (
    <div className="p-6 flex flex-col items-center">
      <div className="text-center py-8">
        <p className="text-2xl text-green-400 font-bold mb-4">{t('ui:matchFound')}</p>
        <p className="text-white opacity-80">{t('ui:redirecting')}...</p>
        <div className="mt-6 animate-pulse">
          <Loader className="w-12 h-12 text-green-400 animate-spin mx-auto" />
        </div>
      </div>
    </div>
  );

  // 매칭 실패 화면
  const renderFailedState = () => (
    <div className="p-6 flex flex-col items-center">
      <div className="text-center py-8">
        <div className="bg-red-500/20 p-4 rounded-full inline-block mb-4">
          <X className="w-12 h-12 text-red-400" />
        </div>
        <p className="text-2xl text-red-400 font-bold mb-4">{t('ui:matchFailed')}</p>
        <p className="text-white opacity-80 mb-6">{error || t('ui:tryAgainLater')}</p>
        
        <div className="flex space-x-4">
          <StyledButton
            bgColor="#40C4FF"
            shadowColor="#0288D1"
            onClick={() => {
              setError(null);
              setMatchingStatus('selecting');
            }}
          >
            {t('ui:tryAgain')}
          </StyledButton>
          
          <StyledButton
            bgColor="#FF3366"
            shadowColor="#CC0033"
            onClick={() => navigate('/')}
          >
            {t('ui:goBack')}
          </StyledButton>
        </div>
      </div>
    </div>
  );

  // 현재 상태에 따른 화면 렌더링
  const renderContent = () => {
    switch (matchingStatus) {
      case 'selecting':
        return renderSelectingState();
      case 'confirming':
        return renderConfirmingState();
      case 'searching':
        return renderSearchingState();
      case 'matched':
        return renderMatchedState();
      case 'failed':
        return renderFailedState();
      default:
        return null;
    }
  };

  if (userLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-180px)]">
        <div className="w-full max-w-md bg-gray-700 border-2 border-black rounded-lg shadow-lg overflow-hidden">
          {renderHeader()}
          <div className="p-6 flex justify-center">
            <Loader className="w-8 h-8 text-blue-400 animate-spin" />
            <span className="ml-2 text-white">{t('ui:loading')}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-180px)]">
      <div className="w-full bg-gray-700 border-2 border-black rounded-lg shadow-lg overflow-hidden">
        {renderHeader()}
        {renderContent()}
      </div>
    </div>
  );
};

export default MatchingPage; 