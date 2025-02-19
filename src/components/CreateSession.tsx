import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { request } from 'graphql-request';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { useAccount } from '../context/AccountContext';
import { TxStatus } from '../gql/graphql';
import { GRAPHQL_ENDPOINT, isValidSessionIdDocument, createSessionDocument, transactionResultDocument } from '../queries';
import type { Scalars } from '../gql/graphql';

interface GameRules {
  maximumUser: number,
  minimumUser: number,
  remainingUser: number,
  roundInterval: number,
  waitingInterval: number
}

export const CreateSession: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [sessionId, setSessionId] = useState<string>('0000000000000000000000000000000000000000');
  const [isSessionIdValid, setIsSessionIdValid] = useState<boolean>(false);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [isPolling, setIsPolling] = useState<boolean>(false);
  const [gameRules, setGameRules] = useState<GameRules>({
    maximumUser: 8,
    minimumUser: 2,
    remainingUser: 1,
    roundInterval: 5,
    waitingInterval: 10
  });
  const [prize, setPrize] = useState('0000000000000000000000000000000000000000');
  const [txId, setTxId] = useState<string | null>(null);
  const [pollingError, setPollingError] = useState<string | null>(null);
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
      
      const response = await request(GRAPHQL_ENDPOINT, createSessionDocument, {
        privateKey: privateKeyHex,
        sessionId,
        prize,
        maximumUser: gameRules.maximumUser,
        minimumUser: gameRules.minimumUser,
        remainingUser: gameRules.remainingUser,
        roundInterval: gameRules.roundInterval,
        waitingInterval: gameRules.waitingInterval
      });
      return response.createSession;
    },
    onSuccess: (data) => {
      setTxId(data);
      setIsPolling(true);
    },
    onError: (error) => {
      console.error('Failed to create session:', error);
      // TODO: 에러 처리
    }
  });

  useEffect(() => {
    const pollTransactionResult = async () => {
      if (txId) {
        try {
          const data = await queryClient.fetchQuery({
            queryKey: ['transactionResult', txId],
            queryFn: async () => {
              const response = await request(GRAPHQL_ENDPOINT, transactionResultDocument, { txId: txId as Scalars['TxId']['output'] });
              return response.transaction?.transactionResult;
            }
          });

          if (data?.txStatus === TxStatus.Success) {
            setIsPolling(false);
            navigate(`/game/${sessionId}`);
          } else if (data?.txStatus === TxStatus.Failure) {
            setIsPolling(false);
            setPollingError('Session creation failed.');
          }
        } catch (error) {
          console.error('Polling error:', error);
        }
      }
    };

    if (isPolling) {
      const interval = setInterval(pollTransactionResult, 5000);
      return () => clearInterval(interval);
    }
  }, [txId, queryClient, navigate, sessionId, isPolling]);

  const handleCreateSession = () => {
    createSessionMutation.mutate();
  };

  return (
    <div className="create-session p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">{t('createSession')}</h1>
      {pollingError && <p className="text-red-500">{pollingError}</p>}
      {isPolling && <p className="text-blue-500">{t('creatingSession')}</p>}
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
              disabled={!isSessionIdValid || isFetching || isPolling}
              onClick={generateAndValidateSessionId}
            >
              🔄
            </button>
          </div>
        </div>

        <div className="rules-section mt-8 mb-8">
          <h2 className="text-xl font-semibold mb-2">{t('gameRules')}</h2>
          <div className="form-group">
            <label className="block text-sm font-medium text-gray-700">{t('maximumUser')}</label>
            <input
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              disabled={isPolling}
              min="1"
              type="number"
              value={gameRules.maximumUser}
              onChange={(e) => handleGameRulesChange('maximumUser', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="block text-sm font-medium text-gray-700">{t('minimumUser')}</label>
            <input
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              disabled={isPolling}
              min="1"
              type="number"
              value={gameRules.minimumUser}
              onChange={(e) => handleGameRulesChange('minimumUser', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="block text-sm font-medium text-gray-700">{t('remainingUser')}</label>
            <input
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              disabled={isPolling}
              min="1"
              type="number"
              value={gameRules.remainingUser}
              onChange={(e) => handleGameRulesChange('remainingUser', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="block text-sm font-medium text-gray-700">{t('roundInterval')}</label>
            <input
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              disabled={isPolling}
              min="1"
              type="number"
              value={gameRules.roundInterval}
              onChange={(e) => handleGameRulesChange('roundInterval', e.target.value)}
            />
          </div>
          
          <div className="form-group">
            <label className="block text-sm font-medium text-gray-700">{t('waitingInterval')}</label>
            <input
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              disabled={isPolling}
              min="1"
              type="number"
              value={gameRules.waitingInterval}
              onChange={(e) => handleGameRulesChange('waitingInterval', e.target.value)}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="block text-sm font-medium text-gray-700">{t('prize')}</label>
          <input
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            disabled={isPolling}
            placeholder={t('enterPrize')}
            type="text"
            value={prize}
            onChange={(e) => setPrize(e.target.value)}
          />
        </div>
        <div className="flex justify-center space-x-4 mt-4">
          <button 
            className="bg-gray-500 text-white p-2 rounded cursor-pointer"
            disabled={createSessionMutation.isPending || isPolling}
            onClick={() => navigate('/')}
          >
            {t('cancel')}
          </button>
          <button
            className={`p-2 rounded cursor-pointer ${(!isSessionIdValid || createSessionMutation.isPending || isPolling) ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-500 text-white'}`}
            disabled={!isSessionIdValid || createSessionMutation.isPending || isPolling}
            onClick={handleCreateSession}
          >
            {createSessionMutation.isPending ? t('creatingSession') : t('createSessionButton')}
          </button>
        </div>
      </div>
    </div>
  );
};