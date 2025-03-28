import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { request } from 'graphql-request';
import { Swords, Eye, EyeOff, Crown } from 'lucide-react';
import { getSessionDocument, GRAPHQL_ENDPOINT } from '../queries';
import { PlayerState, SessionState, MatchState, type Phase, type Match, type Round } from '../gql/graphql';
import { useTip } from '../context/TipContext';
import AddressDisplay from '../components/AddressDisplay';
import StyledButton from '../components/StyledButton';
import { getLocalGloveImage } from '../fetches';

export const ResultPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { tip } = useTip();
  const { sessionId } = useParams<{ sessionId: string }>();
  const [showParticipants, setShowParticipants] = useState(false);
  const [hidePhases, setHidePhases] = useState<boolean[]>([]);

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

  function getPlayerIdByIndex(index: number | undefined): string | undefined {
    if (index !== undefined) {
      return data?.players?.[index]?.id;
    }

    return undefined;
  }

  function getGloveByIndex(playerIndex: number, gloveIndex: number): string | undefined {
    if (playerIndex !== -1 && gloveIndex !== -1) {
      return data?.players?.[playerIndex]?.gloves?.[gloveIndex];
    }

    return undefined;
  }

  function getWinner(): string | undefined {
    if (!data?.players) return undefined;
    const winner = data.players.find(player => player?.state === PlayerState.Won);
    return winner ? winner.id : undefined;
  };

  const renderPhase = (phase: Phase, index: number) => {
    return (
      <div key={index}>
        <p className='text-md p-1'>{t('ui:phase')}&nbsp;:&nbsp;{index + 1}</p>
        {phase?.matches?.map((match, index) => (
          match === null || match === undefined ?
            null :
            renderMatch(match, index)
        ))}
      </div>
    );
  }

  const renderMatch = (match: Match, index: number) => {
    return (
      <div key={index} className='mb-2 border border-gray-400 rounded-lg'>
        <div className='flex justify-center border-b border-gray-400 text-sm p-1'>
          <div className='flex items-center'>
            {match.state === MatchState.Ended && match.winner === match.players?.[0] && (
              <Crown className='w-4 h-4 text-yellow-400 ml-1' />
            )}
            <AddressDisplay address={getPlayerIdByIndex(match.players?.[0])} type='user'/>
          </div>
          <Swords className='w-4 h-4 mt-0.5 mx-1' />
          <div className='flex items-center'>
            <AddressDisplay address={getPlayerIdByIndex(match.players?.[1])} type='user'/>
            {match.state === MatchState.Ended && match.winner === match.players?.[1] && (
              <Crown className='w-4 h-4 text-yellow-400 ml-1' />
            )}
          </div>
        </div>
        {match.rounds?.map((round, index) => (
          round === null || round === undefined ?
            null :
            renderRound(round, index, match)
        ))}
      </div>
    );
  }

  const renderRound = (round: Round, index: number, match: Match) => {
    const submission1 = round.condition1?.submission !== undefined && round.condition1?.submission !== null ? round.condition1.submission : -1;
    const submission2 = round.condition2?.submission !== undefined && round.condition2?.submission !== null ? round.condition2.submission : -1;
    
    const player1Index = match.players?.[0] !== undefined && match.players?.[0] !== null ? match.players[0] : -1;
    const player2Index = match.players?.[1] !== undefined && match.players?.[1] !== null ? match.players[1] : -1;
    
    const player1Glove: string = getGloveByIndex(player1Index, submission1) ?? '';
    const player2Glove: string = getGloveByIndex(player2Index, submission2) ?? '';
    
    const maxHealth = data?.metadata?.initialHealthPoint ?? 100;
    let player1Health: number = round.condition1?.healthPoint || 0;
    let player2Health: number = round.condition2?.healthPoint || 0;
    player1Health = Math.max(0, Math.min(maxHealth, player1Health));
    player2Health = Math.max(0, Math.min(maxHealth, player2Health));

    return (
      <div key={index} className='flex items-center border-b border-gray-400 last:border-b-0 px-2'>
        <div className='w-[calc(50%-48px)] flex items-center'>
          <div className='flex items-center gap-2'>
            <div className='w-24 h-2 bg-gray-600 rounded-full overflow-hidden'>
              <div 
                className='h-full bg-red-500 transition-all duration-300'
                style={{ width: `${(player1Health * 100) / maxHealth}%` }}
              />
            </div>
            <span className='text-xs min-w-[60px]'>{player1Health}/{maxHealth}</span>
          </div>
        </div>
        <div className='w-24 flex items-center justify-center'>
          <div className='flex items-center gap-4'>
            <div className='flex items-center w-12 justify-end'>
              {round.winner !== undefined && round.winner >= 0 && round.winner === match.players?.[0] && (
                <Crown className='w-4 h-4 text-yellow-400 mr-1' />
              )}
              {player1Glove ? (
                <div 
                  className='cursor-pointer hover:opacity-80 transition-opacity'
                  onClick={() => navigate(`/glove/${player1Glove}`)}
                >
                  <img 
                    alt="Player 1's glove" 
                    className='w-8 h-8' 
                    src={getLocalGloveImage(player1Glove)}
                  />
                </div>
              ) : <div className='w-8 text-center'>-</div>}
            </div>
            <div className='w-px h-12 bg-gray-400' />
            <div className='flex items-center w-12'>
              {player2Glove ? (
                <div 
                  className='cursor-pointer hover:opacity-80 transition-opacity'
                  onClick={() => navigate(`/glove/${player2Glove}`)}
                >
                  <img 
                    alt="Player 2's glove" 
                    className='w-8 h-8' 
                    src={getLocalGloveImage(player2Glove)}
                  />
                </div>
              ) : <div className='w-8 text-center'>-</div>}
              {round.winner !== undefined && round.winner >= 0 && round.winner === match.players?.[1] && (
                <Crown className='w-4 h-4 text-yellow-400 ml-1' />
              )}
            </div>
          </div>
        </div>
        <div className='w-[calc(50%-48px)] flex items-center justify-end'>
          <div className='flex items-center gap-2'>
            <span className='text-xs min-w-[60px]'>{player2Health}/{maxHealth}</span>
            <div className='w-24 h-2 bg-gray-600 rounded-full overflow-hidden'>
              <div 
                className='h-full bg-red-500 transition-all duration-300'
                style={{ width: `${(player2Health * 100) / maxHealth}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const toggleParticipants = () => {
    setShowParticipants(!showParticipants);
  };

  const togglePhaseVisibility = (index: number) => {
    setHidePhases(prev => {
      const newHidePhases = [...prev];
      newHidePhases[index] = !newHidePhases[index];
      return newHidePhases;
    });
  };

  const renderContent = () => {
    if (isLoading) {
      return <p className="text-center">{t('ui:loading')}</p>;
    }

    if (error || !data) {
      return (
        <div className="text-center">
          <p>{t('ui:invalidSession', { sessionId: sessionId })}</p>
          <StyledButton onClick={() => navigate('/')}>
            {t('ui:backToMain')}
          </StyledButton>
        </div>
      );
    }

    if (data.state === SessionState.Ready) {
      return (
        <div className="text-center">
          <p>{t('ui:waitingForGameToStart')}</p>
          <p>{t('ui:blocksLeft', { count: data.startHeight ? data.startHeight - (tip?.height ?? 0) : 0 })}</p>
          <StyledButton onClick={() => navigate('/')}>
            {t('ui:backToMain')}
          </StyledButton>
        </div>
      );
    }

    return (
      <div className="flex flex-col justify-between items-center text-center p-6 h-full">
        <div className="mb-4 flex-grow">
          <p className='text-xl mb-2'>{t('ui:sessionId')}:&nbsp;{sessionId}</p>
          <p className='text-xl mb-2'>{t('ui:organizer')}:&nbsp;<AddressDisplay address={data.metadata?.organizer} type='user' /></p>
          <p className='text-xl mb-2'>{t('ui:prize')}:&nbsp;<AddressDisplay address={data.metadata?.prize} type='glove' /></p>
          <p className='text-xl mb-2'>
            {t('ui:participants')}:&nbsp;{data.players?.length}
            <button className="ml-2 text-white cursor-pointer" onClick={toggleParticipants}>
              {showParticipants ? <EyeOff className="inline-block w-5 h-5" /> : <Eye className="inline-block w-5 h-5" />}
            </button>
          </p>
          {showParticipants && (
            <div className="border border-gray-400 rounded-lg p-4 mt-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {data.players?.map((player, index) => (
                <p key={index} className='text-sm mr-4'><AddressDisplay address={player?.id} type='user' /></p>
              ))}
            </div>
          )}
          {data.state === SessionState.Ended ?
            <p className='text-xl mt-2 mb-4'>{t('ui:winner')}:&nbsp;<AddressDisplay address={getWinner()} type='user'/></p> :
            <p className='text-xl mt-2 mb-4'>{t('ui:playersLeft')}:&nbsp;{data.players?.filter(player => player?.state !== PlayerState.Lose).length}</p>}
          {data.phases && data.phases?.map((phase, index) => (
            (phase === null || phase === undefined) ?
              null :
              <div key={index} className="mb-4">
                <span className="mb-2 cursor-pointer" onClick={() => togglePhaseVisibility(index)}>
                  {t('ui:phase')}&nbsp;{index + 1}
                  {hidePhases[index] ? ' ▶' : ' ▼'}
                </span>
                {!hidePhases[index] && (
                  <div className="bg-gray-500 shadow-md rounded-lg overflow-hidden mt-1">
                    {renderPhase(phase, index)}
                  </div>
                )}
              </div>
          ))}
        </div>
        <div className="text-center mt-6">
          <StyledButton onClick={() => navigate('/')}>
            {t('ui:backToMain')}
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
            {t('ui:sessionResults')}
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