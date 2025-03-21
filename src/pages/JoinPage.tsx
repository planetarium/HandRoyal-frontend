import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { request } from 'graphql-request';
import { Users, Clock, Crown, Trophy } from 'lucide-react';
import { GRAPHQL_ENDPOINT, getUserDocument, joinSessionAction, getSessionHeaderDocument } from '../queries';
import { useRequiredAccount } from '../context/AccountContext';
import StyledButton from '../components/StyledButton';
import { getLocalGloveImage } from '../fetches';
import { executeTransaction, waitForTransaction } from '../utils/transaction';
import { useEquippedGlove } from '../context/EquippedGloveContext';
import AddressDisplay from '../components/AddressDisplay';
import { SessionState } from '../gql/graphql';
import { useTip } from '../context/TipContext';
interface GloveSelection {
  [gloveId: string]: number; // 글러브 ID를 키로, 선택된 개수를 값으로 가지는 객체
}

const JoinPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { sessionId } = useParams<{ sessionId: string }>();
  const account = useRequiredAccount();
  const { equippedGlove } = useEquippedGlove();
  const [gloveImages, setGloveImages] = useState<{ [key: string]: string }>({});
  const [selectedGloves, setSelectedGloves] = useState<GloveSelection>({});
  const [totalSelected, setTotalSelected] = useState(0);
  const [error, setError] = useState('');
  const tip = useTip();

  const { data: userData, isLoading } = useQuery({
    queryKey: ['getUser', account?.address],
    queryFn: async () => {
      const response = await request(GRAPHQL_ENDPOINT, getUserDocument, { address: account.address.toString() });
      return response.stateQuery?.user;
    }
  });

  const { data: sessionData, isLoading: sessionLoading, refetch: sessionRefetch } = useQuery({
    queryKey: ['getSession', sessionId],
    queryFn: async () => {
      if (!sessionId) return null;
      const response = await request(GRAPHQL_ENDPOINT, getSessionHeaderDocument, { sessionId });
      return response.stateQuery?.session;
    },
    enabled: !!sessionId,
  });

  useEffect(() => {
    if (tip) {
      sessionRefetch();
    }
  }, [tip, sessionRefetch]);

  const joinSessionMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      const joinSesisonResponse = await request(GRAPHQL_ENDPOINT, joinSessionAction, {
        sessionId,
        gloves: Object.entries(selectedGloves).flatMap(([key, count]) => Array(count).fill(key)),
      });
      if (!joinSesisonResponse.actionQuery?.joinSession) {
        throw new Error('Failed to join session');
      }
      
      const plainValue = joinSesisonResponse.actionQuery.joinSession;
      const txId = await executeTransaction(account, plainValue);
      await waitForTransaction(txId);
    },
    onSuccess: () => {
    },
    onError: (error) => {
      console.error('Failed to join session:', error);
    }
  });

  useEffect(() => {
    const fetchGloveImages = async () => {
      if (userData?.ownedGloves && userData.ownedGloves.length > 0) {
        const images: { [key: string]: string } = {};
        
        for (const info of userData.ownedGloves) {
          try {
            images[info?.id] = getLocalGloveImage(info?.id);
          } catch (error) {
            console.error(`Failed to load image for glove ${info?.id}:`, error);
          }
        }
        
        setGloveImages(images);
      }
    };
    
    fetchGloveImages();
  }, [userData]);

  const MAX_SELECTIONS = sessionData?.metadata?.numberOfGloves ?? -1;

  const handleGloveClick = (gloveId: string) => {
    if (totalSelected >= MAX_SELECTIONS) {
      // 이미 최대 선택 개수에 도달했을 경우우
      return;
    }

    setSelectedGloves(prev => {
      const currentCount = prev[gloveId] || 0;
      const availableCount = userData?.ownedGloves?.find(g => g?.id === gloveId)?.count || 0;
      
      // 해당 글러브의 최대 개수에 도달한 경우
      if (currentCount >= availableCount) {
        return prev;
      }
      
      const newCount = currentCount + 1;
      const newSelected = { ...prev, [gloveId]: newCount };
      
      // 총 선택 개수 업데이트
      setTotalSelected(Object.values(newSelected).reduce((sum, count) => sum + count, 0));
      
      return newSelected;
    });
  };

  const resetSelections = () => {
    setSelectedGloves({});
    setTotalSelected(0);
  };

  const handleJoin = async () => {
    if (!sessionId) {
      setError(t('invalidSessionId'));
      return;
    }

    try {
      await joinSessionMutation.mutateAsync(sessionId);
      navigate(`/game/${sessionId}`);
    } catch (error) {
      console.error('Failed to join session:', error);
      setError(t('failedToJoinSession'));
    }
  };

  const renderGlove = () => {
    if (!userData?.ownedGloves || userData.ownedGloves.length === 0) {
      return <p className="text-center">{t('noGlovesOwned')}</p>;
    }

    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {userData.ownedGloves.map((gloveInfo) => {
          const gloveId = gloveInfo?.id;
          const count = gloveInfo?.count || 0;
          const selectedCount = selectedGloves[gloveId] || 0;

          return (
            <div
              key={gloveId} 
              className={`bg-white rounded-lg p-4 shadow-md cursor-pointer hover:shadow-lg transition-shadow relative ${
                selectedCount > 0 
                  ? 'ring-4 ring-yellow-400 shadow-lg shadow-yellow-400/50' 
                  : 'hover:shadow-lg'
              }`}
              onClick={() => handleGloveClick(gloveId)}
            >
              <div className="relative">
                <img 
                  alt={`Glove ${gloveId}`} 
                  className="w-full h-40 object-contain mb-2" 
                  src={gloveImages[gloveId] || 'placeholder.png'}
                />
              </div>
              <p className="text-center text-xs mt-2 truncate">{gloveId}</p>
              <div className="flex justify-center mt-2">
                {[...Array(count)].map((_, i) => (
                  <div 
                    key={i} 
                    className={`w-4 h-4 mx-1 rounded-full border-2 transition-all duration-300 ${
                      i < selectedCount 
                        ? 'border-yellow-400 bg-yellow-400 shadow-md shadow-yellow-400/50 scale-110' 
                        : 'border-gray-300 bg-transparent'
                    }`}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderSessionInfo = () => {
    if (sessionLoading) {
      return <p className="text-center">{t('loading')}</p>;
    }

    if (!sessionData) {
      return <p className="text-center text-red-500">{t('sessionNotFound')}</p>;
    }

    const { metadata, creationHeight, players, state } = sessionData;

    // 세션이 Ready 상태가 아닐 때 표시할 UI
    if (state !== SessionState.Ready) {
      return (
        <div className="flex flex-col items-center">
          <div className="bg-white rounded-lg p-6 shadow-md mb-6 w-full max-w-md text-center">
            <h2 className="text-xl font-bold mb-4">{t('sessionNotReady')}</h2>
            <p className="text-gray-600 mb-6">
              {state === SessionState.Active 
                ? t('sessionAlreadyStarted')
                : state === SessionState.Ended
                  ? t('sessionAlreadyEnded')
                  : t('sessionNotAvailable')
              }
            </p>
            <div className="flex justify-center space-x-4">
              <StyledButton 
                bgColor="#FFE55C"
                shadowColor="#FF9F0A"
                onClick={() => navigate(`/game/${sessionId}`)}
              >
                {t('watchGame')}
              </StyledButton>
              <StyledButton onClick={() => navigate('/')}>
                {t('backToMain')}
              </StyledButton>
            </div>
          </div>
        </div>
      );
    }
    
    return (
      <div className="bg-white rounded-lg p-4 shadow-md mb-6 w-full">
        <h2 className="text-xl font-bold mb-2">{t('sessionInfo')}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center mb-2">
              <Crown className="mr-2 h-5 w-5" />
              <span className="font-semibold">{t('organizer')}:</span>
              <AddressDisplay address={metadata?.organizer} className="ml-2" type='user' />
            </div>
            
            <div className="flex items-center mb-2">
              <Trophy className="mr-2 h-5 w-5" />
              <span className="font-semibold">{t('prize')}:</span>
              <AddressDisplay address={metadata?.prize} className="ml-2" type='glove' />
            </div>

            <div className="flex items-center mb-2">
              <Users className="mr-2 h-5 w-5" />
              <span className="font-semibold">{t('players')}:</span>
              <span className="ml-2">{players?.length || 0} / {metadata?.maximumUser || 0}</span>
            </div>
            
            <div className="flex items-center mb-2">
              <Clock className="mr-2 h-5 w-5" />
              <span className="font-semibold">
                {t('blocksLeft', { count: creationHeight + metadata?.startAfter - (tip.tip?.index ?? 0)})}
              </span>
            </div>
          </div>
          
          <div>
            <div className="flex items-center mb-2">
              <span className="font-semibold">{t('maxRounds')}:</span>
              <span className="ml-2">{metadata?.maxRounds}</span>
            </div>

            <div className="flex items-center mb-2">
              <span className="font-semibold">{t('roundLength')}:</span>
              <span className="ml-2">{metadata?.roundLength} {t('blocks')}</span>
            </div>

            <div className="flex items-center mb-2">
              <span className="font-semibold">{t('roundInterval')}:</span>
              <span className="ml-2">{metadata?.roundInterval} {t('blocks')}</span>
            </div>

            <div className="flex items-center mb-2">
              <span className="font-semibold">{t('initialHP')}:</span>
              <span className="ml-2">{metadata?.initialHealthPoint} HP</span>
            </div>

            <div className="flex items-center mb-2">
              <span className="font-semibold">{t('selectableGloves')}:</span>
              <span className="ml-2">{metadata?.numberOfGloves} {t('gloves')}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading || sessionLoading) {
    return <p className="text-center">{t('loading')}</p>;
  }

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-4">{t('joinSession')}</h1>
      <p className="mb-4">{t('sessionId')}: {sessionId}</p>
      
      {error && <p className="text-red-500 mb-4">{error}</p>}
      
      {renderSessionInfo()}
      
      {sessionData?.state === SessionState.Ready && (
        <>
          <div className="w-full mb-4">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl">{t('selectGloves')}</h2>
              <div className="flex items-center">
                <span className="mr-2">{totalSelected}/{MAX_SELECTIONS}</span>
                <StyledButton onClick={resetSelections}>
                  {t('reset')}
                </StyledButton>
              </div>
            </div>
            {renderGlove()}
          </div>
          
          <div className="flex space-x-4 mt-4">
            <StyledButton 
              bgColor = '#FFE55C'
              disabled={totalSelected !== MAX_SELECTIONS}
              shadowColor = '#FF9F0A' 
              onClick={handleJoin}
            >
              {t('join')}
            </StyledButton>
            <StyledButton onClick={() => navigate('/')}>
              {t('cancel')}
            </StyledButton>
          </div>
        </>
      )}
    </div>
  );
};

export default JoinPage;