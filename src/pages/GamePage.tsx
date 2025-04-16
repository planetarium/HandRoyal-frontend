import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Address } from '@planetarium/account';
import { request } from 'graphql-request';
import { useRequiredAccount } from '../context/AccountContext';
import { useTip } from '../context/TipContext';
import { SessionState, UserEntryState } from '../gql/graphql';
import { GRAPHQL_ENDPOINT, getUserScopedSessionDocument } from '../queries';
import GameBoard from '../components/GameBoard';
import StyledButton from '../components/StyledButton';
import loading from '../assets/loading.webp';
import win from '../assets/win.png';
import lose from '../assets/lose.png';
import { ActionName } from '../types/types';
import type { GetUserScopedSessionQuery } from '../gql/graphql';

export const GamePage: React.FC = () => {
  const { t } = useTranslation();
  const account = useRequiredAccount();
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { tip } = useTip();
  const [showNoSessionMessage] = useState(false);
  const [error, setError] = useState('');

  const { data: sessionData, isLoading, refetch } = useQuery<GetUserScopedSessionQuery>({
    queryKey: ['getUserScopedSession', sessionId, account?.address],
    queryFn: async () => {
      if (!sessionId || !account?.address) {
        throw new Error('Session ID and user address are required');
      }
      return request<GetUserScopedSessionQuery>(
        GRAPHQL_ENDPOINT,
        getUserScopedSessionDocument,
        {
          sessionId,
          userId: account.address.toString()
        }
      );
    },
    enabled: !!sessionId && !!account?.address && !!tip,
  });

  useEffect(() => {
    refetch();
  }, [tip, refetch]);

  const handleSubmitMove = async (move: string) => {
    if (!sessionId) {
      setError(t('ui:invalidSessionId'));
      return;
    }

    try {
      const response = await account.executeAction(
        ActionName.SUBMIT_MOVE,
        {
          sessionId,
          move
        }
      );

      if (response.txId) {
        navigate(`/result/${sessionId}`);
      }
    } catch (error) {
      console.error('Failed to submit move:', error);
      setError(t('ui:failedToSubmitMove'));
    }
  };

  if (isLoading || !sessionData?.stateQuery?.userScopedSession) {
    return <p>{t('ui:loading')}</p>;
  }

  const session = sessionData.stateQuery.userScopedSession;

  const blocksLeft = () => {
    if (!session || !tip) return 0;
    return session.intervalEndHeight - tip.height;
  };

  const renderContent = () => {
    if (showNoSessionMessage) {
      return <p className="text-red-500 text-center mb-4">{t('ui:noSessionFound')}</p>;
    }

    if (session.userEntryState === UserEntryState.Won) {
      return (
        <div className="flex flex-col items-center justify-between h-full">
          <p> </p>
          <div className="flex flex-col items-center justify-center">
            <img alt="Win" className="w-1/4 h-auto object-contain animate-cry mb-6" src={win} />
            <p className="text-2xl text-center">{t('ui:win')}</p>
          </div>
          <div className="flex justify-center space-x-4 mb-5">
            <StyledButton 
              bgColor = '#FFE55C'
              shadowColor = '#FF9F0A'
              onClick={() => navigate(`/result/${sessionId}`)}>
              {t('ui:viewResults')}
            </StyledButton>
            <StyledButton onClick={() => navigate('/')} >
              {t('ui:backToMain')}
            </StyledButton>
          </div>
        </div>
      );
    }

    if (session.userEntryState === UserEntryState.Lose) {
      return (
        <div className="flex flex-col items-center justify-between h-full">
          <p> </p>
          <div className="flex flex-col items-center justify-center">
            <img alt="Lose" className="w-1/4 h-auto object-contain animate-cry mb-6" src={lose} />
            <p className="text-2xl text-center">{t('ui:lose')}</p>
          </div>
          <div className="flex justify-center space-x-4 mb-5">
            <StyledButton 
              bgColor = '#FFE55C'
              shadowColor = '#FF9F0A'
              onClick={() => navigate(`/result/${sessionId}`)}>
              {t('ui:viewResults')}
            </StyledButton>
            <StyledButton onClick={() => navigate('/')} >
              {t('ui:backToMain')}
            </StyledButton>
          </div>
        </div>
      );
    }

    if (session.sessionState === SessionState.Ended) {
      return (
        <div className="flex flex-col items-center justify-center">
          <h2 className="text-2xl mb-4">{t('ui:sessionEnded')}</h2>
          <div className="flex justify-center space-x-4 mb-5">
            <StyledButton 
              bgColor = '#FFE55C'
              shadowColor = '#FF9F0A'
              onClick={() => navigate(`/result/${sessionId}`)}>
              {t('ui:viewResults')}
            </StyledButton>
            <StyledButton onClick={() => navigate('/')} >
              {t('ui:backToMain')}
            </StyledButton>
          </div>
        </div>
      );
    }

    if (session.sessionState === SessionState.Ready) {
      return (
        <div className="flex flex-col items-center justify-center">
          <img alt="Loading" className="w-1/4 h-auto object-contain animate-swing mb-6" src={loading} />
          <p className="text-2xl text-white text-center mt-4">{t('ui:waitingForGameToStart')}</p>
          <div className="flex items-center justify-center text-xl mt-5">
            <Clock className="w-5 h-5 mr-1" />{blocksLeft()}
          </div>
        </div>
      );
    }

    return (
      <GameBoard blockIndex={tip?.height || 0} data={session} />
    );
  };

  return (
    <div className="flex justify-center">
      <div className="flex flex-col justify-between bg-gray-700 rounded-lg text-white border-black border-2 min-h-[calc(100vh-180px)] w-full">
        <div className="flex flex-col justify-center flex-grow">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}; 
