import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { request } from 'graphql-request';
import { Search, Swords } from 'lucide-react';
import { useRequiredAccount } from '../context/AccountContext';
import { useTip } from '../context/TipContext';
import { GRAPHQL_ENDPOINT, getSessionsDocument, getUserDocument } from '../queries';
import { SessionState } from '../gql/graphql';
import logo from '../assets/logo.png';
import StyledButton from '../components/StyledButton';
import SessionCard from '../components/SessionCard';
import type { Address } from '@planetarium/account';

export const MainPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [sessionId, setSessionId] = useState('');
  const [error, setError] = useState('');
  const account = useRequiredAccount();
  const { tip } = useTip();
  const [prizeImages] = useState<{ [key: string]: string | null }>({});

  const { data: sessionData, error: sessionError, isLoading: sessionIsLoading, refetch: sessionRefetch } = useQuery({
    queryKey: ['getSessions'],
    queryFn: async () => {
      const response = await request(GRAPHQL_ENDPOINT, getSessionsDocument);
      return response.stateQuery?.sessions || [];
    }
  });

  const { data: userData, refetch: userRefetch } = useQuery({
    queryKey: ['getUser', account?.address],
    queryFn: async () => {
      const response = await request(GRAPHQL_ENDPOINT, getUserDocument, { address: account.address.toString() });
      return response.stateQuery?.getUserData;
    }
  });

  useEffect(() => {
    if (tip) {
      sessionRefetch();
      userRefetch();
    }
  }, [tip, sessionRefetch, userRefetch]);

  const handleJoin = (id: string) => {
    navigate(`/join/${id}`);
  };

  const handleSpectate = (id: string) => {
    navigate(`/result/${id}`);
  };

  const handleCreate = () => {
    navigate('/create');
  };

  // 필터링된 세션 데이터
  const filteredSessions = sessionData?.filter(session => 
    session?.metadata?.id.includes(sessionId)
  );

  return (
    <div className="flex flex-col items-center">
      <img alt="Hand Royal Logo" className="w-60 h-60 mb-6" src={logo} />
      {userData?.sessionId && userData.sessionId !== "0000000000000000000000000000000000000000" ? (
        <div className="flex justify-between items-center bg-gradient-to-r from-yellow-200 to-blue-200 p-6 rounded-lg border-2 border-black w-full mb-6">
          <div>
            <h3 className="text-xl font-bold text-blue-800">{t('ui:alreadyJoinedSession')}</h3>
            <p className="text-gray-700 font-mono">{userData.sessionId}</p>
          </div>
          <StyledButton 
            bgColor = '#FFE55C'
            shadowColor = '#FF9F0A'
            onClick={() => navigate(`/game/${userData.sessionId}`)}>
            {t('ui:rejoin')}
          </StyledButton>
        </div>
      ) : null}
      <div className="w-full max-w-4xl bg-gray-700 border-2 border-black rounded-lg">
        <div className="bg-gray-900 p-4 rounded-t-lg">
          <p
            className="text-2xl text-center text-white font-extrabold"
            style={{ textShadow: '2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000' }}
          >
            {t('ui:sessionList')}
          </p>
        </div>
        <div className="p-6">
          <div className="w-full mb-8">
            <div className="relative">
              <input
                className="w-full pl-12 py-2 border border-black border-2 bg-gray-100 rounded-xl focus:bg-white"
                placeholder={t('ui:enterSessionId')}
                type="text"
                value={sessionId}
                onChange={(e) => {
                  setSessionId(e.target.value);
                  setError(''); // 입력이 변경될 때마다 오류 메시지 초기화
                }}
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2" strokeWidth={3} />
            </div>
          </div>
          {error && <p className="text-red-500">{error}</p>}
          {sessionIsLoading && <p>{t('ui:loading')}</p>}
          {sessionError && <p className="text-red-500">{t('ui:error')}: {sessionError.message}</p>}
          <div className="session-list overflow-hidden w-full max-w-4xl">
            <div className="text-center text-white mb-2">
              <div className="flex items-center justify-center">
                <Swords className="w-4 h-4" />
                <span className="ml-1 text-sm">{filteredSessions?.length || 0}&nbsp;/&nbsp;{sessionData?.length || 0}</span>
              </div>
            </div>
            <div className="flex flex-col space-y-4">
              {filteredSessions && filteredSessions.length > 0 ? (
                filteredSessions.map((session) => {
                  if (!session || !session.metadata || !(session.state === SessionState.Ready || session.state === SessionState.Active)) return null;
                  const sessionMetadata = session.metadata as { id: string, organizer: string, maximumUser: number, prize: string, users: Address[] };
                  const isSessionPrivate = sessionMetadata.users && sessionMetadata.users.length > 0;
                  const userAddress = account.address;
                  const isUserAllowed = !isSessionPrivate || 
                    (sessionMetadata.users && sessionMetadata.users.includes(userAddress));
                  
                  return (
                    <SessionCard
                      key={sessionMetadata.id}
                      blocksLeft={session.startHeight - (tip?.height ?? 0)}
                      canJoin={isUserAllowed}
                      currentPlayers={session.players?.length ?? 0}
                      handleJoin={handleJoin}
                      handleSpectate={handleSpectate}
                      host={sessionMetadata.organizer}
                      id={sessionMetadata.id}
                      isPrivate={isSessionPrivate}
                      maxPlayers={sessionMetadata.maximumUser}
                      prize={sessionMetadata.prize}
                      prizeImage={prizeImages[sessionMetadata.prize] || logo}
                      state={session.state}
                    />
                  );
                })) : (
                  <div className="flex justify-center items-center p-6 rounded-lg w-full border-2 bg-gray-500 border-gray-600">
                    <p className="text-gray-400"><i>{t('ui:noSessionFound')}</i></p>
                  </div>)}
            </div>
          </div>
          <p className="mt-4 text-center text-gray-300 cursor-pointer mt-10" onClick={handleCreate}>
            <i>{t('ui:createNewSession')}</i>
          </p>
        </div>
      </div>
    </div>
  );
}; 