import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { request } from 'graphql-request';
import { Users, Clock, Crown, Trophy } from 'lucide-react';
import { GRAPHQL_ENDPOINT, getUserDocument, getSessionHeaderDocument } from '../queries';
import { useRequiredAccount } from '../context/AccountContext';
import StyledButton from '../components/StyledButton';
import AddressDisplay from '../components/AddressDisplay';
import { SessionState } from '../gql/graphql';
import { useTip } from '../context/TipContext';
import GloveSelectionComponent, { type GloveSelection } from '../components/GloveSelectionComponent';
import { ActionName } from '../types/types';

const JoinPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { sessionId } = useParams<{ sessionId: string }>();
  const account = useRequiredAccount();
  const [selectedGloves, setSelectedGloves] = useState<GloveSelection>({});
  const [totalSelected, setTotalSelected] = useState(0);
  const [error, setError] = useState('');
  const tip = useTip();
  const [isJoining, setIsJoining] = useState(false);

  const { data: userData, isLoading } = useQuery({
    queryKey: ['getUser', account?.address],
    queryFn: async () => {
      const response = await request(GRAPHQL_ENDPOINT, getUserDocument, { address: account.address.toString() });
      return response.stateQuery?.getUserData;
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

  const handleJoin = async () => {
    if (!sessionId) {
      setError(t('ui:invalidSessionId'));
      return;
    }

    try {
      setIsJoining(true);
      const response = await account.executeAction(
        ActionName.JOIN_SESSION,
        {
          sessionId,
          gloves: Object.entries(selectedGloves).flatMap(([key, count]) => Array(count).fill(key))
        }
      );

      setIsJoining(false);

      if (response) {
        navigate(`/game/${sessionId}`);
      }
    } catch (error) {
      console.error('Failed to join session:', error);
      setError(t('ui:failedToJoinSession'));
    }
  };

  const MAX_SELECTIONS = sessionData?.metadata?.numberOfGloves ?? -1;

  const renderSessionInfo = () => {
    if (sessionLoading) {
      return <p className="text-center">{t('ui:loading')}</p>;
    }

    if (!sessionData) {
      return <p className="text-center text-red-500">{t('ui:sessionNotFound')}</p>;
    }

    const { metadata, creationHeight, players, state } = sessionData;

    // 세션이 Ready 상태가 아닐 때 표시할 UI
    if (state !== SessionState.Ready) {
      return (
        <div className="flex flex-col items-center">
          <div className="rounded-lg p-6 border-black mb-6 w-full max-w-md text-center">
            <h2 className="text-xl font-bold mb-4 text-white">{t('ui:cannotJoinSession')}</h2>
            <p className="text-gray-300 mb-6">
              {state === SessionState.Active 
                ? t('ui:sessionAlreadyStarted')
                : state === SessionState.Ended
                  ? t('ui:sessionAlreadyEnded')
                  : t('ui:sessionNotAvailable')
              }
            </p>
            <div className="flex justify-center space-x-4">
              <StyledButton 
                bgColor="#FFE55C"
                shadowColor="#FF9F0A"
                onClick={() => navigate(`/game/${sessionId}`)}
              >
                {t('ui:watchGame')}
              </StyledButton>
              <StyledButton onClick={() => navigate('/')}>
                {t('ui:backToMain')}
              </StyledButton>
            </div>
          </div>
        </div>
      );
    }
    
    return (
      <div className="bg-white rounded-lg p-4 shadow-md mb-6 w-full">
        <h2 className="text-xl font-bold mb-2">{t('ui:sessionInfo')}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center mb-2">
              <Crown className="mr-2 h-5 w-5" />
              <span className="font-semibold">{t('ui:organizer')}:</span>
              <AddressDisplay address={metadata?.organizer} className="ml-2" type='user' />
            </div>
            
            <div className="flex items-center mb-2">
              <Trophy className="mr-2 h-5 w-5" />
              <span className="font-semibold">{t('ui:prize')}:</span>
              <AddressDisplay address={metadata?.prize} className="ml-2" type='glove' />
            </div>

            <div className="flex items-center mb-2">
              <Users className="mr-2 h-5 w-5" />
              <span className="font-semibold">{t('ui:players')}:</span>
              <span className="ml-2">{players?.length || 0} / {metadata?.maximumUser || 0}</span>
            </div>
            
            <div className="flex items-center mb-2">
              <Clock className="mr-2 h-5 w-5" />
              <span className="font-semibold">
                {t('ui:blocksLeft', { count: creationHeight + metadata?.startAfter - (tip.tip?.height ?? 0)})}
              </span>
            </div>
          </div>
          
          <div>
            <div className="flex items-center mb-2">
              <span className="font-semibold">{t('ui:maxRounds')}:</span>
              <span className="ml-2">{metadata?.maxRounds}</span>
            </div>

            <div className="flex items-center mb-2">
              <span className="font-semibold">{t('ui:roundLength')}:</span>
              <span className="ml-2">{metadata?.roundLength} {t('ui:blocks')}</span>
            </div>

            <div className="flex items-center mb-2">
              <span className="font-semibold">{t('ui:roundInterval')}:</span>
              <span className="ml-2">{metadata?.roundInterval} {t('ui:blocks')}</span>
            </div>

            <div className="flex items-center mb-2">
              <span className="font-semibold">{t('ui:initialHP')}:</span>
              <span className="ml-2">{metadata?.initialHealthPoint} HP</span>
            </div>

            <div className="flex items-center mb-2">
              <span className="font-semibold">{t('ui:selectableGloves')}:</span>
              <span className="ml-2">{metadata?.numberOfGloves} {t('ui:gloves')}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading || sessionLoading) {
    return <p className="text-center">{t('ui:loading')}</p>;
  }

  return (
    <div className="flex flex-col items-center bg-gray-700">
      <div className="flex items-center justify-center rounded-t-lg bg-gray-900 w-full">
        <h1
          className="text-4xl font-bold text-white p-4"
          style={{ textShadow: '2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000' }}
        >
          {t('ui:joinSession')}
        </h1>
      </div>
      <div className="flex flex-col items-center justify-center flex-grow p-6">
        <p className="mb-4 text-white">{t('ui:sessionId')}: {sessionId}</p>
        
        {error && <p className="text-red-500 mb-4">{error}</p>}
        
        {renderSessionInfo()}
        
        {sessionData?.state === SessionState.Ready && (
          <>
            <div className="w-full mb-4">
              {userData?.ownedGloves && (
                <GloveSelectionComponent
                  maxSelections={MAX_SELECTIONS}
                  ownedGloves={userData.ownedGloves.filter((g: any) => g !== null).map((g: any) => ({ id: g.id, count: g.count }))}
                  selectedGloves={selectedGloves}
                  setSelectedGloves={setSelectedGloves}
                  setTotalSelected={setTotalSelected}
                  totalSelected={totalSelected}
                />
              )}
            </div>
            
            <div className="flex space-x-4 mt-4">
              {((userData?.actionPoint ?? 0) <= 0) ? <p className="text-md text-red-500">{t('ui:notEnoughActionPoint')}: {userData?.actionPoint}</p> : null}
              <StyledButton 
                bgColor = '#FFE55C'
                disabled={totalSelected !== MAX_SELECTIONS || isJoining || userData?.actionPoint === 0}
                shadowColor = '#FF9F0A' 
                onClick={handleJoin}
              >
                {isJoining ? t('ui:joining') : t('ui:join')}
              </StyledButton>
              <StyledButton onClick={() => navigate('/')}>
                {t('ui:cancel')}
              </StyledButton>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default JoinPage;