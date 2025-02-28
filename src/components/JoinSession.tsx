import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { request } from 'graphql-request';
import { useAccount } from '../context/AccountContext';
import { useTip } from '../context/TipContext';
import { GRAPHQL_ENDPOINT, getSessionsDocument, getUserDocument, joinSessionDocument } from '../queries';
import { SessionState } from '../gql/graphql';

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

  return (
    <div className="join-session-page p-4 max-w-5xl mx-auto">
      <h1 className="text-4xl text-center font-bold mb-4">{t('joinSession')}</h1>
      {userData?.sessionId && userData.sessionId !== "0000000000000000000000000000000000000000" ?
      <div className="flex items-center justify-center space-x-2 mb-4">
        <p>{t('alreadyJoinedSession', { sessionId: userData.sessionId })}</p>
        <button className="bg-blue-500 text-white p-2 rounded cursor-pointer" onClick={() => navigate(`/game/${userData.sessionId}`)}>
          {t('join')}
        </button>
      </div> : null}
      <div className="join-form flex items-center space-x-2 mb-4">
        <input
          className="flex-grow p-2 border border-gray-300 rounded"
          placeholder={t('enterSessionId')}
          type="text"
          value={sessionId}
          onChange={(e) => {
            setSessionId(e.target.value);
            setError(''); // 입력이 변경될 때마다 오류 메시지 초기화
          }}
        />
        <button className="bg-blue-500 text-white p-2 rounded cursor-pointer" onClick={() => handleJoin(sessionId)}>
          {t('join')}
        </button>
      </div>
      {error && <p className="text-red-500">{error}</p>}
      {sessionIsLoading && <p>{t('loading')}</p>}
      {sessionError && <p className="text-red-500">{t('error')}: {sessionError.message}</p>}
      <div className="session-list bg-white shadow-md rounded-lg overflow-hidden">
        <p className="text-xl mb-2 text-center">{t('sessionList')}</p>
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-6 py-3 border-b text-left">{t('sessionId')}</th>
              <th className="px-6 py-3 border-b text-left">{t('prize')}</th>
              <th className="px-6 py-3 border-b text-left">{t('players')}</th>
              <th className="px-6 py-3 border-b text-left">{t('startAfter')}</th>
              <th className="px-6 py-3 border-b text-left"> </th>
            </tr>
          </thead>
          <tbody>
            {sessionData && sessionData.map((session) => {
              if (!session || !session.metadata || !(session.state === SessionState.Ready || session.state === SessionState.Active)) return null;
              const sessionMetadata = session.metadata as { id: string };
              return (
                <tr key={sessionMetadata.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 border-b">{truncateAddress(sessionMetadata.id)}</td>
                  <td className="px-6 py-4 border-b">{session.metadata.prize}</td>
                  <td className="px-6 py-4 border-b">{session.players?.length}/{session.metadata.maximumUser}</td>
                  <td className="px-6 py-4 border-b">{session.state === SessionState.Ready ? session.startHeight - (tip?.index ?? 0) : "Playing..."}</td>
                  <td className="px-6 py-4 border-b">
                    {session.state === SessionState.Ready ? (
                      <button
                        className={`bg-blue-500 text-white p-2 rounded ${(session.players?.length ?? session.metadata.maximumUser) >= session.metadata.maximumUser ? 'opacity-50' : 'cursor-pointer '}`}
                        disabled={(session.players?.length ?? session.metadata.maximumUser) >= session.metadata.maximumUser}
                        onClick={() => handleJoin(sessionMetadata.id)}
                      >
                          {t('join')}
                        </button>
                    ) : (
                      <button
                        className="bg-blue-500 text-white p-2 rounded cursor-pointer"
                        onClick={() => handleSpectate(sessionMetadata.id)}
                      >
                        {t('spectate')}
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="create-session-link mt-4 text-center text-gray-500 cursor-pointer mt-10" onClick={handleCreate}>
        <i>{t('createNewSession')}</i>
      </p>
    </div>
  );
}; 