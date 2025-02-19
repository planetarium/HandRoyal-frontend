import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { request } from 'graphql-request';
import { Address } from '@planetarium/account';
import { useQuery } from '@tanstack/react-query';
import { useAccount } from '../context/AccountContext';
import { useTip } from '../context/TipContext';
import { SessionState, PlayerState, Session } from '../gql/graphql';
import { GRAPHQL_ENDPOINT, getSessionDocument } from '../queries';
import GameBoard from './GameBoard';

export const GamePage: React.FC = () => {
  const { t } = useTranslation();
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { privateKey } = useAccount();
  const { tip } = useTip();
  const [userAddress, setUserAddress] = useState<Address | null>(null);
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
    privateKey?.getAddress().then(address => setUserAddress(address ?? null));
  }, [privateKey]);

  useEffect(() => {
    if (data?.players && userAddress) {
      const currentPlayer = data.players.find(player => Address.fromHex(player!.id).toHex() === userAddress.toHex());
      if (currentPlayer) {
        setPlayerStatus(currentPlayer.state);
      }
    }
  }, [data, userAddress]);

  useEffect(() => {
    if (data?.state === SessionState.Ended) {
      navigate(`/result/${sessionId}`);
    }
  }, [data, navigate, sessionId]);

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

  if (data === null) {
    return (
      <div className="game-board p-4 max-w-md mx-auto text-center">
        <h1 className="text-4xl font-bold mb-8">{t('gameBoardTitle')}</h1>
        <p className="text-2xl">{t('waitingForSession')}</p>
      </div>
    );
  }

  // Ensure data is of type Session
  const sessionData = data as Session;

  if (playerStatus === PlayerState.Lose) {
    return (
      <div className="game-board p-4 max-w-md mx-auto text-center">
        <h1 className="text-4xl font-bold mb-8">{t('gameBoardTitle')}</h1>
        <p className="text-2xl">{t('lose')}</p>
        <button
          className="bg-blue-500 text-white p-2 mt-5 rounded cursor-pointer"
          onClick={() => navigate(`/result/${sessionId}`)}
        >
          {t('viewResults')}
        </button>
        <button
          className="bg-blue-500 text-white p-2 mt-5 rounded cursor-pointer"
          onClick={() => navigate('/')}
        >
          {t('backToMain')}
        </button>
      </div>
    );
  }

  if (data?.state === SessionState.Ended) {
    return (
      <div className="game-board p-4 max-w-md mx-auto text-center">
        <h1 className="text-4xl font-bold mb-8">{t('gameBoardTitle')}</h1>
        <h2 className="text-2xl font-semibold mb-4">Session: {truncateAddress(sessionId!)} ended</h2>
        <button
          className="bg-blue-500 text-white p-2 mt-5 rounded cursor-pointer"
          onClick={() => navigate(`/result/${sessionId}`)}
        >
          {t('viewResults')}
        </button>
        <button
          className="bg-blue-500 text-white p-2 mt-5 rounded cursor-pointer"
          onClick={() => navigate('/')}
        >
          {t('backToMain')}
        </button>
      </div>
    );
  }

  if (data?.state === SessionState.Ready) {
    return (
      <div className="game-board p-4 max-w-md mx-auto text-center">
        <h1 className="text-4xl font-bold mb-8">{t('gameBoardTitle')}</h1>
        <p className="text-2xl">{t('waitingForGameToStart')}</p>
        <p className="text-2xl">{t('blocksLeft', { count: blocksLeft })}</p>
      </div>
    );
  }

  if (userAddress && data?.metadata?.organizer && Address.fromHex(data.metadata.organizer).toHex() === userAddress.toHex()) {
    return (
      <div className="game-board p-4 max-w-md mx-auto text-center">
        <h1 className="text-4xl font-bold mb-8">{t('gameBoardTitle')}</h1>
        <p className="text-2xl">{t('youAreTheSessionOrganizer')}</p>
        <div className="mt-4">
          {data.rounds?.map((round, index) => (
            <div key={index} className="mb-4">
              <h2 className="text-xl font-bold">Round {index + 1}</h2>
              {round?.matches?.map((match, matchIndex) => (
                <div key={matchIndex} className="text-lg">
                  <p>Match {matchIndex + 1}:</p>
                  <p>Player 1: {match?.move1?.type}</p>
                  <p>Player 2: {match?.move2?.type}</p>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="game-board p-4 max-w-xl mx-auto">
      {showNoSessionMessage ? (
        <p className="text-red-500 text-center mb-4">{t('noSessionFound')}</p>
      ) : (
        <>
          <h1 className="text-4xl font-bold mb-4 text-center">{t('gameBoardTitle')}</h1>
          <p className="mb-2 text-center">{t('sessionId')}: {<span className="font-mono">{sessionId}</span>}</p>
          <p className="mb-4 text-center">{t('round', { count: round })}</p>
          
          <GameBoard blocksLeft={blocksLeft} data={sessionData} />
        </>
      )}
    </div>
  );
}; 