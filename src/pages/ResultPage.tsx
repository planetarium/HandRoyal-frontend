import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { request } from 'graphql-request';
import { getSessionDocument, GRAPHQL_ENDPOINT } from '../queries';
import { PlayerState, SessionState, type Match, type MoveType } from '../gql/graphql';
import { useTip } from '../context/TipContext';
import StyledButton from '../components/StyledButton';
import AddressDisplay from '../components/AddressDisplay';
import { Swords, Eye, EyeOff } from 'lucide-react';

export const ResultPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { tip } = useTip();
  const { sessionId } = useParams<{ sessionId: string }>();
  const [showParticipants, setShowParticipants] = useState(false);

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

  const renderMatches = (matches: Match[]) => {
    return matches.map((match, index) => (
      <div key={index} className={`flex items-center justify-between p-1 ${index === matches.length - 1 ? '' : 'border-b border-gray-400'}`}>
        <div className="flex justify-start text-left w-90 text-sm ml-2">
          <AddressDisplay type='user' address={getAddressByIndex(match.move1?.playerIndex)} />
        </div>
        <div className="flex justify-center text-center">
          <span className="text-2xl text-center w-8">{getEmoji(match.move1?.type)}</span>
          <Swords className='w-6 h-6 mt-1' />
          <span className="text-2xl text-center w-8">{getEmoji(match.move2?.type)}</span>
        </div>
        <div className="flex justify-end text-right w-90 text-sm mr-2">
          <AddressDisplay type='user' address={getAddressByIndex(match.move2?.playerIndex)} />
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

  const toggleParticipants = () => {
    setShowParticipants(!showParticipants);
  };

  const renderContent = () => {
    if (isLoading) {
      return <p className="text-center">{t('loading')}</p>;
    }

    if (error || !data) {
      return (
        <div className="text-center">
          <p>{t('invalidSession', { sessionId: sessionId })}</p>
          <StyledButton onClick={() => navigate('/')}>
            {t('backToMain')}
          </StyledButton>
        </div>
      );
    }

    if (data.state === SessionState.Ready) {
      return (
        <div className="text-center">
          <p>{t('waitingForGameToStart')}</p>
          <p>{t('blocksLeft', { count: blocksLeft })}</p>
          <StyledButton onClick={() => navigate('/')}>
            {t('backToMain')}
          </StyledButton>
        </div>
      );
    }

    return (
      <div className="flex flex-col justify-between items-center text-center p-6 h-full">
        <div className="mb-4 flex-grow">
          <p className='text-xl mb-2'>{t('sessionId')}:&nbsp;{sessionId}</p>
          <p className='text-xl mb-2'>{t('organizer')}:&nbsp;<AddressDisplay type='user' address={data.metadata?.organizer} /></p>
          <p className='text-xl mb-2'>{t('prize')}:&nbsp;<AddressDisplay type='glove' address={data.metadata?.prize} /></p>
          <p className='text-xl mb-2'>
            {t('participants')}:&nbsp;{data.players?.length}
            <button onClick={toggleParticipants} className="ml-2 text-white cursor-pointer">
              {showParticipants ? <EyeOff className="inline-block w-5 h-5" /> : <Eye className="inline-block w-5 h-5" />}
            </button>
          </p>
          {showParticipants && (
            <div className="border border-gray-400 rounded-lg p-4 mt-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {data.players?.map((player, index) => (
                <p key={index} className='text-sm mr-4'><AddressDisplay type='user' address={player?.id} /></p>
              ))}
            </div>
          )}
          {data.state === SessionState.Ended ?
            <p className='text-xl mt-2 mb-4'>{t('winner')}:&nbsp;<AddressDisplay type='user' address={getWinner()}/></p> :
            <p className='text-xl mt-2 mb-4'>{t('playersLeft')}:&nbsp;{data.players?.filter(player => player?.state !== PlayerState.Lose).length}</p>}
          <p className='text-xl'>{t('matches')}:&nbsp;{data.rounds?.length}</p>
          {data.rounds?.map((round, index) => (
            <div key={index} className="mb-4">
              <span className="font-semibold mb-2">{t('round')}&nbsp;{index + 1}</span>
              <div className="bg-gray-500 shadow-md rounded-lg overflow-hidden">
                {renderMatches(round?.matches?.filter((match): match is Match => match !== null) ?? [])}
              </div>
            </div>
          ))}
          {data.state === SessionState.Active ? <p className='text-sm text-center'>{t('blocksLeft', { count: blocksLeft })}</p> : null}
        </div>
        <div className="text-center mt-6">
          <StyledButton onClick={() => navigate('/')}>
            {t('backToMain')}
          </StyledButton>
        </div>
      </div>
    );
  }

  
  return (
    <div className="flex justify-center">
      <div
        className="flex flex-col justify-between bg-gray-700 rounded-lg text-white border-black border-2 min-w min-h-[calc(100vh-180px)] w-full max-w-4xl"
      >
        <div className="flex items-center justify-center rounded-t-lg p-4 bg-gray-900">
          <p
            className="text-4xl text-center text-white font-extrabold"
            style={{ textShadow: '2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000' }}
          >
            {t('sessionResults')}
          </p>
        </div>
        <div className="flex flex-col justify-center flex-grow">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default ResultPage; 