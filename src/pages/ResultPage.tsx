import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { request } from 'graphql-request';
import { getSessionDocument, GRAPHQL_ENDPOINT } from '../queries';
import { PlayerState, SessionState, type Match, type MoveType } from '../gql/graphql';
import { useTip } from '../context/TipContext';
import StyledButton from '../components/StyledButton';

export const ResultPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { tip } = useTip();
  const { sessionId } = useParams<{ sessionId: string }>();

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

  const blocksLeft = data?.state === SessionState.Ready
  ? (data?.startHeight && tip 
    ? data.startHeight - tip.index
    : 0)
  : (data?.rounds && data.metadata && tip
    ? (data.rounds[data.rounds.length - 1]?.height + data.metadata.roundInterval) - tip.index
    : 0);

  const getAddressByIndex = (index: number | undefined) => {
    if (index !== undefined) {
      return data?.players?.[index]?.id;
    }

    return undefined;
  };

  const getWinner = () => {
    if (!data?.players) return undefined;
    const winner = data.players.find(player => player?.state === PlayerState.Won);
    return winner ? winner.id : undefined;
  };

  const handleUserClick = (userId: string | undefined) => {
    if (userId) {
      navigate(`/user/${userId}`);
    }
  };

  const renderMatches = (matches: Match[]) => {
    return matches.map((match, index) => (
      <div key={index} className="flex items-center justify-between p-1 border-b">
        <div className="flex justify-start text-left w-90 text-sm">
          {displayUser(getAddressByIndex(match.move1?.playerIndex))}
        </div>
        <div className="flex justify-center text-center">
          <span className="text-2xl text-center font-bold w-8">{getEmoji(match.move1?.type)}</span>
          <span className="mt-1 mx-2 text-center font-bold">vs</span>
          <span className="text-2xl text-center font-bold w-8">{getEmoji(match.move2?.type)}</span>
        </div>
        <div className="flex justify-end text-right w-90 text-sm">
          {displayUser(getAddressByIndex(match.move2?.playerIndex))}
        </div>
      </div>
    ));
  };

  const getEmoji = (moveType: MoveType | undefined) => {
    switch (moveType) {
      case 'ROCK':
        return '✊';
      case 'PAPER':
        return '✋';
      case 'SCISSORS':
        return '✌️';
      default:
        return '?';
    }
  };

  const displayUser = (userId: string | undefined) => {
    if (userId) {
      return <span className="font-mono cursor-pointer hover:underline" onClick={() => handleUserClick(userId)}>{userId}</span>;
    }

    return 'UNDEFINED';
  };

  if (isLoading) {
    return <p className="text-center">{t('loading')}</p>;
  }

  if (error || !data) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-4xl font-bold mb-4 text-center">{t('sessionResults')}</h1>
        <div className="text-center">
          <p>{t('invalidSession', { sessionId: sessionId })}</p>
          <button className="bg-blue-500 text-white p-2 rounded mt-4" onClick={() => navigate('/')}>{t('backToMain')}</button>
        </div>
      </div>
    );
  }

  if (data.state === SessionState.Ready) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-4xl font-bold mb-4 text-center">{t('sessionResults')}</h1>
        <div className="text-center">
          <p>{t('waitingForGameToStart')}</p>
          <p>{t('blocksLeft', { count: blocksLeft })}</p>
          <button className="bg-blue-500 text-white p-2 rounded mt-4" onClick={() => navigate('/')}>{t('backToMain')}</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-4xl font-bold mb-4 text-center">{t('sessionResults')}</h1>
      <div className="mb-4">
        <p className='text-xl mb-2'><strong>{t('sessionId')}:</strong> <span className="font-mono">{sessionId}</span></p>
        <p className='text-xl mb-2'><strong>{t('organizer')}:</strong> {displayUser(data.metadata?.organizer)}</p>
        <p className='text-xl mb-2'><strong>{t('prize')}:</strong> <span className="font-mono">{data.metadata?.prize}</span></p>
        <p className='text-xl mb-2'><strong>{t('participants')}: {data.players?.length}</strong></p>
        {data.players?.map((player, index) => (
          <p key={index} className='text-sm'>{displayUser(player?.id)}</p>
        ))}
        {data.state === SessionState.Ended ?
          <p className='text-xl mt-2'><strong>{t('winner')}:</strong> {displayUser(getWinner())}</p> :
          <p className='text-xl mt-2'><strong>{t('remainingUser')}:</strong> {data.players?.filter(player => player?.state !== PlayerState.Lose).length}</p>}
      </div>
      <p className='text-xl'><strong>{t('matches')}:</strong> {data.rounds?.length}</p>
      {data.rounds?.map((round, index) => (
        <div key={index} className="mb-4">
          <span className="font-semibold mb-2">{t('round', { count: index + 1 })}</span>
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            {renderMatches(round?.matches?.filter((match): match is Match => match !== null) ?? [])}
          </div>
        </div>
      ))}
      {data.state === SessionState.Active ? <p className='text-sm text-center'>{t('blocksLeft', { count: blocksLeft })}</p> : null}
      <div className="text-center mt-6">
        <StyledButton onClick={() => navigate('/')}>
          {t('backToMain')}
        </StyledButton>
      </div>
    </div>
  );
};

export default ResultPage; 