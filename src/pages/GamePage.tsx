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
import logo from '../assets/logo.webp';
import type { Session } from '../gql/graphql';

export const GamePage: React.FC = () => {
  const { t } = useTranslation();
  const { address } = useAccount();
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
    if (data?.players && address) {
      const currentPlayer = data.players.find(player => Address.fromHex(player!.id).toHex() === address.toHex());
      if (currentPlayer) {
        setPlayerStatus(currentPlayer.state);
      }
    }
  }, [data, address]);

  useEffect(() => {
    if (!sessionId) {
      setShowNoSessionMessage(true);
      setTimeout(() => {
        navigate('/');
      }, 1000);
    }
  }, [sessionId, navigate]);

  const blocksLeft = data?.state === SessionState.Ready
    ? (data?.startHeight && tip 
      ? data.startHeight - tip.index
      : 0)
    : (data?.rounds && data.metadata && tip
      ? (data.rounds[data.rounds.length - 1]?.height + data.metadata.roundInterval) - tip.index
      : 0);

  const round = data?.rounds ? data.rounds.length : 0;

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

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

    if (playerStatus === PlayerState.Lose) {
      return (
        <div className="flex flex-col justify-between h-full">
          <p> </p>
          <div>
            <img alt="lose" className="w-1/2 h-1/2" src={logo} />
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
        <div>
          <p className="text-2xl text-white text-center">{t('waitingForGameToStart')}</p>
          <div className="flex items-center justify-center font-bold text-xl mt-5">
            <Clock className="w-5 h-5 mr-1" />{blocksLeft}
          </div>
        </div>
      );
    }

    if (sessionData.state === SessionState.Ended) {
      return (
        <div>
          <h2 className="text-2xl font-semibold mb-4">Session: {truncateAddress(sessionId!)} ended</h2>
          <StyledButton onClick={() => navigate(`/result/${sessionId}`)}>
            {t('viewResults')}
          </StyledButton>
          <StyledButton onClick={() => navigate('/')} >
            {t('backToMain')}
          </StyledButton>
        </div>
      );
    }

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
      <GameBoard blocksLeft={blocksLeft} data={sessionData} round={round} />
    );
  }

  return (
    <div className="flex justify-center">
      <div className="flex flex-col justify-between bg-gray-500 rounded-lg text-white border-black border-2 min-w-1/2 min-h-[calc(100vh-180px)] w-full max-w-4xl">
        <div className="flex items-center justify-center rounded-t-lg p-4 bg-gray-700">
          <Swords className="w-10 h-10 mr-1" />
          <p
            className="text-2xl text-center text-white font-extrabold"
            style={{ textShadow: '2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000' }}
          >
            {t('gameBoardTitle')}
          </p>
          <Swords className="w-10 h-10 ml-1" />
        </div>
        <div className="flex flex-col justify-center flex-grow">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}; 