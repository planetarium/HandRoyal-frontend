import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { request } from 'graphql-request';
import { Address } from '@planetarium/account';
import { useQuery } from '@tanstack/react-query';
import { Clock, Swords } from 'lucide-react';
import { useAccount } from '../context/AccountContext';
import { useTip } from '../context/TipContext';
import { SessionState, PlayerState } from '../gql/graphql';
import { GRAPHQL_ENDPOINT, getSessionDocument } from '../queries';
import GameBoard from '../components/GameBoard';
import StyledButton from '../components/StyledButton';
import lose from '../assets/lose.webp';
import loading from '../assets/loading.webp';
import type { Session } from '../gql/graphql';

export const GamePage: React.FC = () => {
  const { t } = useTranslation();
  const { account } = useAccount();
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { tip } = useTip();
  const [showNoSessionMessage, setShowNoSessionMessage] = useState(false);
  const [playerStatus, setPlayerStatus] = useState<PlayerState | null>(null);

  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ['getSession', sessionId],
    queryFn: async () => {
      const response = await request(GRAPHQL_ENDPOINT, getSessionDocument, { sessionId });
      return response.stateQuery?.session;
    },
    enabled: !!sessionId,
  });

  useEffect(() => {
    if (tip) {
      refetch();
    }
  }, [tip, refetch]);

  useEffect(() => {
    if (data?.players && account) {
      const address = account.isConnected ? account.address : null;
      const currentPlayer = data.players.find(player => Address.fromHex(player!.id).toHex() === address?.toHex());
      if (currentPlayer) {
        setPlayerStatus(currentPlayer.state);
      }
    }
  }, [data, account]);

  useEffect(() => {
    if (!sessionId) {
      setShowNoSessionMessage(true);
      setTimeout(() => {
        navigate('/');
      }, 1000);
    }
  }, [sessionId, navigate]);

  const blocksLeft = () => {
    switch (data?.state) {
      case SessionState.Ready:
        return data?.startHeight && tip
          ? data.startHeight - tip.index
          : 0;
      case SessionState.Active:
        return data?.rounds && data.metadata && tip
          ? (data.rounds[data.rounds.length - 1]?.height + data.metadata.roundLength) - tip.index
          : 0;
      case SessionState.Break:
        return data?.rounds && data.metadata && tip
          ? (data.rounds[data.rounds.length - 1]?.height + data.metadata.roundLength + data.metadata.roundInterval) - tip.index
          : 0;
      default:
        return 0;
    }
  }

  const round = data?.rounds ? data.rounds.length : 0;

  if (isLoading) return <p>{t('loading')}</p>;
  if (error) return <p>{t('error')}: {error.message}</p>;
  
  // Ensure data is of type Session
  const sessionData = data as Session;

  const renderContent = () => {
    if (showNoSessionMessage) {
      return(
        <p className="text-red-500 text-center mb-4">{t('noSessionFound')}</p>
      );
    }

    if (sessionData === null) {
      return <p className="text-2xl">{t('waitingForSession')}</p>;
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

    if (sessionData.state === SessionState.Break) {
      {/* 여기에 승리 모션 들어가야함 */}
      return (
        <div className="flex flex-col items-center justify-center">
          <img alt="Loading" className="w-1/4 h-auto object-contain animate-swing mb-6" src={loading} />
          <p className="text-2xl text-white text-center mt-4">{t('waitingForRoundToStart')}</p>
          <div className="flex items-center justify-center text-xl mt-5">
            <Clock className="w-5 h-5 mr-1" />{blocksLeft()}
          </div>
        </div>
      );
    }

    if (sessionData.state === SessionState.Ended) {
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

    if (sessionData.state === SessionState.Ready) {
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

    const address = account?.isConnected ? account.address : null;
    if (address && sessionData.metadata?.organizer && Address.fromHex(sessionData.metadata.organizer).toHex() === address.toHex()) {
      return (
        <div>
          <p className="text-2xl">{t('youAreTheSessionOrganizer')}</p>
          <StyledButton 
            bgColor = '#FFE55C'
            shadowColor = '#FF9F0A'
            onClick={() => navigate(`/result/${sessionId}`)}>
          {t('spectate')}
          </StyledButton>
          <StyledButton onClick={() => navigate('/')} >
            {t('backToMain')}
          </StyledButton>
        </div>
      )
    }

    return (
      <GameBoard blocksLeft={blocksLeft()} data={sessionData} round={round} />
    );
  }

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