import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { graphql } from '../gql/gql';
import { request } from 'graphql-request';
import { useAccount } from '../context/AccountContext';
import { useTip } from '../context/TipContext';

const GRAPHQL_ENDPOINT = import.meta.env.VITE_GRAPHQL_ENDPOINT;

const getSessionsDocument = graphql(/* GraphQL */ `
  query GetSessions {
    stateQuery {
      sessions {
        metadata {
          id
          organizer
          prize
          maximumUser
          minimumUser
          remainingUser
        }
        state
        players {
          id
          glove
        }
        rounds {
          height
          matches {
            move1 {
              type
            }
            move2 {
              type
            }
          }
        }
        creationHeight
        startHeight
      }
    }
  }
`);

const joinSessionDocument = graphql(/* GraphQL */ `
  mutation JoinSession($privateKey: PrivateKey, $sessionId: Address!) {
    joinSession(privateKey: $privateKey, sessionId: $sessionId)
  }
`);

export const JoinSession: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [sessionId, setSessionId] = useState('');
  const [error, setError] = useState('');
  const { privateKey } = useAccount();
  const { tip } = useTip();

  const bytesToHex = (bytes: Uint8Array): string => {
    return Array.from(bytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  };

  const { data, error: queryError, isLoading, refetch } = useQuery({
    queryKey: ['getSessions'],
    queryFn: async () => {
      const response = await request(GRAPHQL_ENDPOINT, getSessionsDocument);
      return response.stateQuery?.sessions || [];
    }
  });

  useEffect(() => {
    if (tip) {
      refetch();
    }
  }, [tip, refetch]);

  const joinSessionMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      const privateKeyBytes = privateKey?.toBytes();
      const privateKeyHex = privateKeyBytes ? bytesToHex(privateKeyBytes) : undefined;
      console.error('privateKeyHex: ' + privateKeyHex);
      
      const response = await request(GRAPHQL_ENDPOINT, joinSessionDocument, {
        privateKey: privateKeyHex,
        sessionId,
      });
      return response.joinSession;
    },
    onSuccess: (data) => {
      console.error('txId: ' + data)
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
    <div className="join-session p-4 max-w-md mx-auto text-center">
      <h1 className="text-4xl font-bold mb-8">HandRoyal</h1>
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
      {isLoading && <p>{t('loading')}</p>}
      {queryError && <p className="text-red-500">{t('error')}: {queryError.message}</p>}
      <div className="session-list grid grid-cols-1 gap-4 mb-4">
        {data && data.map((session) => {
          if (!session || !session.metadata) return null;
          const sessionMetadata = session.metadata as { id: string };
          return (
            <button
              key={sessionMetadata.id}
              className="bg-blue-500 text-white p-2 rounded cursor-pointer"
              onClick={() => handleJoin(sessionMetadata.id)}
            >
              {t('Join Session')} {truncateAddress(sessionMetadata.id)}
            </button>
          );
        })}
      </div>
      <p className="create-session-link mt-4 text-center text-gray-500 cursor-pointer" onClick={handleCreate}>
        <i>{t('createNewSession')}</i>
      </p>
    </div>
  );
}; 