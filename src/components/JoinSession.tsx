import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { request } from 'graphql-request';
import { Search, Users, Star, Clock } from 'lucide-react';
import { useAccount } from '../context/AccountContext';
import { useTip } from '../context/TipContext';
import { GRAPHQL_ENDPOINT, getSessionsDocument, getUserDocument, joinSessionDocument } from '../queries';
import { SessionState } from '../gql/graphql';
import logo from '../assets/logo.webp';
import StyledButton from './StyledButton';

export const JoinSession: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [sessionId, setSessionId] = useState('');
  const [error, setError] = useState('');
  const { privateKey, address } = useAccount();
  const { tip } = useTip();

  const bytesToHex = (bytes: Uint8Array): string => {
    return Array.from(bytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  };

  const { data: sessionData, error: sessionError, isLoading: sessionIsLoading, refetch: sessionRefetch } = useQuery({
    queryKey: ['getSessions'],
    queryFn: async () => {
      const response = await request(GRAPHQL_ENDPOINT, getSessionsDocument);
      return response.stateQuery?.sessions || [];
    }
  });

  const { data: userData, refetch: userRefetch } = useQuery({
    queryKey: ['getUser', address],
    queryFn: async () => {
      const response = await request(GRAPHQL_ENDPOINT, getUserDocument, { address: address?.toString() });
      return response.stateQuery?.user;
    }
  });

  useEffect(() => {
    if (tip) {
      sessionRefetch();
      userRefetch();
    }
  }, [tip, sessionRefetch, userRefetch]);

  const joinSessionMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      const privateKeyBytes = privateKey?.toBytes();
      const privateKeyHex = privateKeyBytes ? bytesToHex(privateKeyBytes) : undefined;
      
      const response = await request(GRAPHQL_ENDPOINT, joinSessionDocument, {
        privateKey: privateKeyHex,
        sessionId,
      });
      return response.joinSession;
    },
    onSuccess: () => {
    },
    onError: (error) => {
      console.error('Failed to join session:', error);
    }
  });

  const handleJoin = (id: string) => {
    if (!validateSessionIdLength(id)) {
      setError(t('invalidSessionIdLength'));
      return;
    }

    joinSessionMutation.mutate(id);
    navigate(`/game/${id}`);
  };

  const handleSpectate = (id: string) => {
    if (!validateSessionIdLength(id)) {
      setError(t('invalidSessionIdLength'));
      return;
    }

    navigate(`/result/${id}`);
  };

  const handleCreate = () => {
    navigate('/create');
  };

  const validateSessionIdLength = (id: string): boolean => {
    return id.length === 40;
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // 필터링된 세션 데이터
  const filteredSessions = sessionData?.filter(session => 
    session?.metadata?.id.includes(sessionId)
  );

  return (
    <div className="flex flex-col items-center min-h-screen bg-gradient-to-b from-yellow-100 to-blue-100 p-10">
      <img alt="Hand Royal Logo" className="w-120 h-120 mb-6" src={logo} />
      {userData?.sessionId && userData.sessionId !== "0000000000000000000000000000000000000000" ? (
        <div className="flex justify-between items-center bg-gradient-to-r from-yellow-200 to-blue-200 p-6 rounded-lg shadow-lg w-full max-w-4xl mb-6">
          <div>
            <h3 className="text-xl font-bold text-blue-800">{t('alreadyJoinedSession')}</h3>
            <p className="text-gray-700 font-mono">{userData.sessionId}</p>
          </div>
          <StyledButton onClick={() => navigate(`/game/${userData.sessionId}`)}>
            {t('rejoin')}
          </StyledButton>
        </div>
      ) : null}
      <p className="text-2xl mb-4 text-center text-blue-800">{t('sessionList')}</p>
      <div className="w-full max-w-2xl mb-8">
        <div className="relative">
          <input
            className="w-full pl-12 py-4 rounded-full border-2 border-blue-300 focus:border-blue-500 shadow-md bg-white"
            placeholder={t('enterSessionId')}
            type="text"
            value={sessionId}
            onChange={(e) => {
              setSessionId(e.target.value);
              setError(''); // 입력이 변경될 때마다 오류 메시지 초기화
            }}
          />
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-400" />
        </div>
      </div>
      {error && <p className="text-red-500">{error}</p>}
      {sessionIsLoading && <p>{t('loading')}</p>}
      {sessionError && <p className="text-red-500">{t('error')}: {sessionError.message}</p>}
      <div className="session-list shadow-lg rounded-lg overflow-hidden w-full max-w-4xl">
        <div className="flex flex-col space-y-4">
          {filteredSessions && filteredSessions.length > 0 ? (
            filteredSessions.map((session) => {
              if (!session || !session.metadata || !(session.state === SessionState.Ready || session.state === SessionState.Active)) return null;
              const sessionMetadata = session.metadata as { id: string, organizer: string };
              return (
                <div key={sessionMetadata.id} className="flex justify-between items-center bg-gradient-to-r from-yellow-200 to-blue-200 p-6 rounded-lg shadow-md w-full">
                  <div>
                    <h3 className="text-lg font-bold text-blue-800">{sessionMetadata.id}</h3>
                    <div className="flex items-center text-sm text-gray-700">
                      <span>{t('host')}:&nbsp;</span>
                      <span className="font-mono">{sessionMetadata.organizer}</span>
                    </div>
                    <div className="flex items-center text-gray-700 rounded text-sm">
                      <span>{t('prize')}:&nbsp;</span>
                      <span className="font-mono">{session.metadata.prize}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className={`flex items-center ${session.players?.length === session.metadata.maximumUser ? 'text-red-700' : 'text-blue-700'}`}>
                      <Users className="mr-1 h-4 w-4" />
                      <span>{session.players?.length}/{session.metadata.maximumUser}</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <Clock className="mr-1 h-4 w-4" />
                      <span>{session.state === SessionState.Ready ? `${session.startHeight - (tip?.index ?? 0)} ${t('blocksLeft')}` : "Playing..."}</span>
                    </div>
                    {session.state === SessionState.Ready ? (
                      <StyledButton
                        disabled={(session.players?.length ?? session.metadata.maximumUser) >= session.metadata.maximumUser}
                        onClick={() => handleJoin(sessionMetadata.id)}
                      >
                        {t('join')}
                      </StyledButton>
                    ) : (
                      <StyledButton onClick={() => handleSpectate(sessionMetadata.id)}>
                        {t('spectate')}
                      </StyledButton>
                    )}
                  </div>
                </div>
              );
            })) : (<p className="text-center text-gray-500">{t('noSessionFound')}</p>)}
        </div>
      </div>
      <p className="create-session-link mt-4 text-center text-blue-800 cursor-pointer mt-10" onClick={handleCreate}>
        <i>{t('createNewSession')}</i>
      </p>
    </div>
  );
}; 