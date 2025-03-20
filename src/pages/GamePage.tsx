import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock } from 'lucide-react';
import { useRequiredAccount } from '../context/AccountContext';
import { useTip } from '../context/TipContext';
import { SessionState, PlayerState } from '../gql/graphql';
import { SESSION_SUBSCRIPTION } from '../queries';
import GameBoard from '../components/GameBoard';
import StyledButton from '../components/StyledButton';
import win from '../assets/lose.webp';
import lose from '../assets/lose.webp';
import loading from '../assets/loading.webp';
import subscriptionClient from '../subscriptionClient';

export interface SessionSubscriptionData {
  onSessionChanged: {
    sessionId: string;
    sessionState: SessionState;
    height: number;
    intervalEndHeight: number;
    currentUserRound: {
      winner: string | null;
      condition1: {
        healthPoint: number;
        gloveUsed: string;
        submission: string;
      };
      condition2: {
        healthPoint: number;
        gloveUsed: string;
        submission: string;
      };
    } | null;
    userPlayerIndex: number;
    opponentPlayerIndex: number;
    currentUserMatchState: string;
    myGloves: string[];
    opponentGloves: string[];
  };
}

export const GamePage: React.FC = () => {
  const { t } = useTranslation();
  const account = useRequiredAccount();
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { tip } = useTip();
  const [showNoSessionMessage, setShowNoSessionMessage] = useState(false);
  const [playerStatus, setPlayerStatus] = useState<PlayerState | null>(null);
  const [subscriptionData, setSubscriptionData] = useState<SessionSubscriptionData['onSessionChanged'] | null>(null);

  useEffect(() => {
    if (!sessionId || !account?.address) return;

    const unsubscribe = subscriptionClient.subscribe(
      {
        query: SESSION_SUBSCRIPTION,
        variables: {
          sessionId: sessionId,
          userId: account.address.toString()
        }
      },
      {
        next: (result) => {
          console.log(result);
          if (result?.data) {
            setSubscriptionData((result.data as unknown as SessionSubscriptionData).onSessionChanged);
          }
        },
        error: (error) => {
          console.error('Subscription error:', error);
        },
        complete: () => {
          console.log('Subscription completed');
        }
      }
    );

    return () => {
      unsubscribe();
    };
  }, [sessionId, account?.address]);

  useEffect(() => {
    if (!sessionId) {
      setShowNoSessionMessage(true);
      setTimeout(() => {
        navigate('/');
      }, 1000);
    }
  }, [sessionId, navigate]);

  const blocksLeft = () => {
    if (!subscriptionData || !tip) return 0;
    
    switch (subscriptionData.sessionState) {
      case SessionState.Ready:
        return subscriptionData.intervalEndHeight - tip.index;
      case SessionState.Active:
        return subscriptionData.intervalEndHeight - tip.index;
      default:
        return 0;
    }
  };

  if (!subscriptionData) {
    return <p>{t('loading')}</p>;
  }

  const renderContent = () => {
    if (showNoSessionMessage) {
      return <p className="text-red-500 text-center mb-4">{t('noSessionFound')}</p>;
    }

    if (playerStatus === PlayerState.Won) {
      return (
        <div className="flex flex-col items-center justify-between h-full">
          <p> </p>
          <div className="flex flex-col items-center justify-center">
            <img alt="Win" className="w-1/4 h-auto object-contain animate-cry mb-6" src={win} />
            <p className="text-2xl text-center">{t('win')}</p>
          </div>
          <div className="flex justify-center space-x-4 mb-5">
            <StyledButton 
              bgColor = '#FFE55C'
              shadowColor = '#FF9F0A'
              onClick={() => navigate(`/result/${sessionId}`)}>
              {t('viewResults')}
            </StyledButton>
            <StyledButton onClick={() => navigate('/')} >
              {t('backToMain')}
            </StyledButton>
          </div>
        </div>
      );
    }

    if (playerStatus === PlayerState.Lose) {
      return (
        <div className="flex flex-col items-center justify-between h-full">
          <p> </p>
          <div className="flex flex-col items-center justify-center">
            <img alt="Lose" className="w-1/4 h-auto object-contain animate-cry mb-6" src={lose} />
            <p className="text-2xl text-center">{t('lose')}</p>
          </div>
          <div className="flex justify-center space-x-4 mb-5">
            <StyledButton 
              bgColor = '#FFE55C'
              shadowColor = '#FF9F0A'
              onClick={() => navigate(`/result/${sessionId}`)}>
              {t('viewResults')}
            </StyledButton>
            <StyledButton onClick={() => navigate('/')} >
              {t('backToMain')}
            </StyledButton>
          </div>
        </div>
      );
    }

    if (subscriptionData.sessionState === SessionState.Ended) {
      return (
        <div className="flex flex-col items-center justify-center">
          <h2 className="text-2xl mb-4">{t('sessionEnded')}</h2>
          <div className="flex justify-center space-x-4 mb-5">
            <StyledButton 
              bgColor = '#FFE55C'
              shadowColor = '#FF9F0A'
              onClick={() => navigate(`/result/${sessionId}`)}>
              {t('viewResults')}
            </StyledButton>
            <StyledButton onClick={() => navigate('/')} >
              {t('backToMain')}
            </StyledButton>
          </div>
        </div>
      );
    }

    if (subscriptionData.sessionState === SessionState.Ready) {
      return (
        <div className="flex flex-col items-center justify-center">
          <img alt="Loading" className="w-1/4 h-auto object-contain animate-swing mb-6" src={loading} />
          <p className="text-2xl text-white text-center mt-4">{t('waitingForGameToStart')}</p>
          <div className="flex items-center justify-center text-xl mt-5">
            <Clock className="w-5 h-5 mr-1" />{blocksLeft()}
          </div>
        </div>
      );
    }

    return (
      <GameBoard blockIndex={tip?.index || 0} data={subscriptionData} />
    );
  };

  return (
    <div className="flex justify-center">
      <div className="flex flex-col justify-between bg-gray-700 rounded-lg text-white border-black border-2 min-h-[calc(100vh-180px)] w-full">
        <div className="flex items-center justify-center rounded-t-lg p-6 bg-gray-900">
          <p
            className="text-4xl text-center text-white font-extrabold"
            style={{ textShadow: '2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000' }}
          >
            {t('gameBoardTitle')}
          </p>
        </div>
        <div className="flex flex-col justify-center flex-grow">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}; 
