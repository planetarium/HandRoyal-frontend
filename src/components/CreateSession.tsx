import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { request } from 'graphql-request';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { graphql } from '../gql/gql'
import { useAccount } from '../context/AccountContext';


interface GameRules {
  minPlayers: number;
  maxPlayers: number;
  blocksPerRound: number;
}

const GRAPHQL_ENDPOINT = import.meta.env.VITE_GRAPHQL_ENDPOINT;
const isValidSessionIdDocument = graphql(/* GraphQL */ `
  query IsValidSessionId($sessionId: Address!) {
    isValidSessionId(sessionId: $sessionId)
  }
`)

const createSessionDocument = graphql(/* GraphQL */ `
  mutation CreateSession($privateKey: PrivateKey, $sessionId: Address!, $prize: Address!) {
    createSession(privateKey: $privateKey, sessionId: $sessionId, prize: $prize)
  }
`);

export const CreateSession: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [sessionId, setSessionId] = useState<string>('0000000000000000000000000000000000000000');
  const [isSessionIdValid, setIsSessionIdValid] = useState<boolean>(false);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [gameRules, setGameRules] = useState<GameRules>({
    minPlayers: 10,
    maxPlayers: 100,
    blocksPerRound: 10
  });
  const [prize, setPrize] = useState('0000000000000000000000000000000000000000');
  const isFirstMount = useRef(true);
  const queryClient = useQueryClient();
  const { privateKey } = useAccount();

  const generateRandomAddress = () => {
    let address = '';
    for (let i = 0; i < 40; i++) {
      address += Math.floor(Math.random() * 16).toString(16);
    }
    return address;
  };

  const generateAndValidateSessionId = useCallback(async () => {
    setIsSessionIdValid(false);
    setIsFetching(true);
    const newSessionId = generateRandomAddress();
    setSessionId(newSessionId);
    
    try {
      const data = await queryClient.fetchQuery({
        queryKey: ['checkSessionId', newSessionId],
        queryFn: async () => {
          const response = await request(GRAPHQL_ENDPOINT, isValidSessionIdDocument, { sessionId: newSessionId });
          return response;
        }
      });
      
      if (data?.isValidSessionId === true) {
        setIsSessionIdValid(true);
      } else if (data?.isValidSessionId === false) {
        setTimeout(() => {
          generateAndValidateSessionId();
        }, 1000);
      }
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setIsFetching(false);
    }
  }, [queryClient]);

  // 초기 마운트시에만 실행
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      generateAndValidateSessionId();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGameRulesChange = (field: keyof GameRules, value: string) => {
    const numValue = parseInt(value, 10) || 0;
    setGameRules(prev => ({
      ...prev,
      [field]: numValue
    }));
  };

  const bytesToHex = (bytes: Uint8Array): string => {
    return Array.from(bytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  };

  const createSessionMutation = useMutation({
    mutationFn: async () => {
      const privateKeyBytes = privateKey?.toBytes();
      const privateKeyHex = privateKeyBytes ? bytesToHex(privateKeyBytes) : undefined;
      console.error('privateKeyHex: ' + privateKeyHex);
      
      const response = await request(GRAPHQL_ENDPOINT, createSessionDocument, {
        privateKey: privateKeyHex,
        sessionId,
        prize
      });
      return response.createSession;
    },
    onSuccess: (data) => {
      console.error('txId: ' + data)
      navigate(`/game/${sessionId}`);
    },
    onError: (error) => {
      console.error('Failed to create session:', error);
      // TODO: 에러 처리
    }
  });

  const handleCreateSession = () => {
    createSessionMutation.mutate();
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="create-session p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">{t('createSession')}</h1>
      <div className="session-form space-y-4">
        <div className="form-group">
          <label className="block text-sm font-medium text-gray-700">{t('sessionId')}</label>
          <div className="flex items-center space-x-2">
            <input
              readOnly
              className="flex-grow mt-1 block text-gray-400 w-full border border-gray-300 rounded-md shadow-sm p-2 bg-gray-100"
              type="text"
              value={(!isSessionIdValid || isFetching) ? 'Checking...' : sessionId}
            />
            <button
              aria-label={t('refresh')}
              className="text-blue-500 text-2xl cursor-pointer"
              disabled={!isSessionIdValid || isFetching}
              onClick={generateAndValidateSessionId}
            >
              🔄
            </button>
          </div>
        </div>

        <div className="rules-section mt-8 mb-8">
          <h2 className="text-xl font-semibold mb-2">{t('gameRules')}</h2>
          <div className="form-group">
            <label className="block text-sm font-medium text-gray-700">{t('minPlayers')}</label>
            <input
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              min="1"
              type="number"
              value={gameRules.minPlayers}
              onChange={(e) => handleGameRulesChange('minPlayers', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="block text-sm font-medium text-gray-700">{t('maxPlayers')}</label>
            <input
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              min="1"
              type="number"
              value={gameRules.maxPlayers}
              onChange={(e) => handleGameRulesChange('maxPlayers', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="block text-sm font-medium text-gray-700">{t('blocksPerRound')}</label>
            <input
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              min="1"
              type="number"
              value={gameRules.blocksPerRound}
              onChange={(e) => handleGameRulesChange('blocksPerRound', e.target.value)}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="block text-sm font-medium text-gray-700">{t('prize')}</label>
          <input
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            placeholder={t('enterPrize')}
            type="text"
            value={prize}
            onChange={(e) => setPrize(e.target.value)}
          />
        </div>
        <div className="flex justify-center space-x-4 mt-4">
          <button 
            className="bg-gray-500 text-white p-2 rounded cursor-pointer"
            disabled={createSessionMutation.isPending}
            onClick={() => navigate('/')}
          >
            {t('cancel')}
          </button>
          <button
            className={`p-2 rounded cursor-pointer ${(!isSessionIdValid || createSessionMutation.isPending) ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-500 text-white'}`}
            disabled={!isSessionIdValid || createSessionMutation.isPending}
            onClick={handleCreateSession}
          >
            {createSessionMutation.isPending ? t('creating') : t('createSessionButton')}
          </button>
        </div>
      </div>
    </div>
  );
};