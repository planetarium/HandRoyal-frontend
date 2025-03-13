import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { request } from 'graphql-request';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { useAccount } from '../context/AccountContext';
import { 
  GRAPHQL_ENDPOINT,
  isValidSessionIdDocument,
  SESSION_SUBSCRIPTION,
  createSessionAction, 
  getUserDocument
} from '../queries';
import subscriptionClient from '../subscriptionClient';
import StyledButton from '../components/StyledButton';
import { executeTransaction, waitForTransaction } from '../utils/transaction';
interface GameRules {
  maximumUser: number,
  minimumUser: number,
  remainingUser: number,
  startAfter: number,
  roundLength: number,
  roundInterval: number
}

export const CreateSession: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { account } = useAccount();
  const [sessionIdCandidate, setSessionIdCandidate] = useState<string>('0000000000000000000000000000000000000000');
  const [sessionId, setSessionId] = useState<string>('');
  const [isSessionIdValid, setIsSessionIdValid] = useState<boolean>(false);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [isPolling, setIsPolling] = useState<boolean>(false);
  const [gameRules, setGameRules] = useState<GameRules>({
    maximumUser: 8,
    minimumUser: 2,
    remainingUser: 1,
    startAfter: 20,
    roundLength: 20,
    roundInterval: 7,
  });
  const [selectedPrize, setSelectedPrize] = useState('');
  const [pollingError, setPollingError] = useState<string | null>(null);
  const isFirstMount = useRef(true);
  const queryClient = useQueryClient();
  
  const { data, error, isLoading } = useQuery({
    queryKey: ['getUser', account],
    queryFn: async () => {
      const response = await request(GRAPHQL_ENDPOINT, getUserDocument, { address: account?.address.toString() });
      return response?.stateQuery?.user;
    }
  });

  useEffect(() => {
    if (!sessionId) return;

    if (!account) {
      throw new Error('Account not connected');
    }

    const unsubscribe = subscriptionClient.subscribe(
      {
        query: SESSION_SUBSCRIPTION, // Define this query in your queries file
        variables: { sessionId: sessionId, userId: account.address.toString() },
      },
      {
        next: (result) => {
          const data = result.data as { onSessionChanged: { state: string } };
          if (data.onSessionChanged.state === 'READY') {
            navigate(`/game/${sessionId}`);
          }
        },
        error: (err) => {
          console.error('Subscription error:', err);
        },
        complete: () => {
          console.error('Subscription completed');
        },
      }
    );

    return () => {
      unsubscribe();
    };
  }, [sessionId, navigate, account]);

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
    setSessionIdCandidate(newSessionId);
    
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
      if (!account) {
        throw new Error('Account not connected');
      }

      const createSessionResponse = await request(GRAPHQL_ENDPOINT, createSessionAction, {
        sessionId: sessionIdCandidate,
        prize: selectedPrize,
        maximumUser: gameRules.maximumUser,
        minimumUser: gameRules.minimumUser,
        remainingUser: gameRules.remainingUser,
        startAfter: gameRules.startAfter,
        roundLength: gameRules.roundLength,
        roundInterval: gameRules.roundInterval
      });
      if (!createSessionResponse.actionQuery?.createSession) {
        throw new Error('Failed to create session');
      }

      const txId = await executeTransaction(account, createSessionResponse.actionQuery.createSession);
      console.error(txId);
      await waitForTransaction(txId);
    },
    onSuccess: () => {
      setIsPolling(true);
    },
    onError: (error) => {
      console.error('Failed to create session:', error);
    }
  });

  const handleCreateSession = () => {
    setSessionId(sessionIdCandidate);
    createSessionMutation.mutate();
    setTimeout(() => {
      setPollingError('Session creation timed out. Please try again.');
    }, 30000); // 30 seconds timeout
  };

  if (isLoading) return <p>{t('loading')}</p>;
  if (error) return <p>{t('error')}: {error.message}</p>;

  return (
    <div className="flex flex-col items-center create-session w-full mx-auto bg-gray-700 border-2 border-black rounded-lg text-white">
      <div className="w-full flex flex-col items-center bg-gray-900 p-4 rounded-t-lg border-b border-black">
        <h1 className="text-2xl font-bold" style={{ textShadow: '2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000' }}>{t('createSession')}</h1>
      </div>
      {pollingError && <p className="text-red-500">{pollingError}</p>}
      {isPolling && <p className="text-blue-500">{t('creatingSession')}</p>}
      <div className="w-full p-6 session-form space-y-4">
        <div className="form-group">
          <label className="block text-sm font-medium text-black-700">{t('sessionId')}</label>
          <div className="flex items-center space-x-2">
            <input
              readOnly
              className="flex-grow mt-1 block text-gray-400 w-full border border-gray-300 rounded-md shadow-sm p-2 bg-gray-100 text-black"
              type="text"
              value={(!isSessionIdValid || isFetching) ? 'Checking...' : sessionIdCandidate}
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

        <div className="rules-section mt-8 mb-8 space-y-1">
          <h2 className="text-xl mb-2 text-center">{t('gameRules')}</h2>
          <div className="form-group">
            <label className="block text-sm">{t('maximumUser')}</label>
            <input
              className="mt-1 block w-full bg-gray-200 border border-black rounded-md shadow-sm p-2 mb-2 text-black"
              disabled={isPolling}
              min="1"
              type="number"
              value={gameRules.maximumUser}
              onChange={(e) => handleGameRulesChange('maximumUser', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="block text-sm">{t('minimumUser')}</label>
            <input
              className="mt-1 block w-full bg-gray-200 border border-black rounded-md shadow-sm p-2 mb-2 text-black"
              disabled={isPolling}
              min="1"
              type="number"
              value={gameRules.minimumUser}
              onChange={(e) => handleGameRulesChange('minimumUser', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="block text-sm">{t('remainingUser')}</label>
            <input
              className="mt-1 block w-full bg-gray-200 border border-black rounded-md shadow-sm p-2 mb-2 text-black"
              disabled={isPolling}
              min="1"
              type="number"
              value={gameRules.remainingUser}
              onChange={(e) => handleGameRulesChange('remainingUser', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="block text-sm">{t('startAfter')}</label>
            <input
              className="mt-1 block w-full bg-gray-200 border border-black rounded-md shadow-sm p-2 mb-2 text-black"
              disabled={isPolling}
              min="1"
              type="number"
              value={gameRules.startAfter}
              onChange={(e) => handleGameRulesChange('startAfter', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="block text-sm">{t('roundLength')}</label>
            <input
              className="mt-1 block w-full bg-gray-200 border border-black rounded-md shadow-sm p-2 mb-2 text-black"
              disabled={isPolling}
              min="1"
              type="number"
              value={gameRules.roundLength}
              onChange={(e) => handleGameRulesChange('roundLength', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="block text-sm">{t('roundInterval')}</label>
            <input
              className="mt-1 block w-full bg-gray-200 border border-black rounded-md shadow-sm p-2 mb-2 text-black"
              disabled={isPolling}
              min="1"
              type="number"
              value={gameRules.roundInterval}
              onChange={(e) => handleGameRulesChange('roundInterval', e.target.value)}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="block text-sm font-medium text-black-700">{t('prize')}</label>
          <select
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-gray-100 text-black"
            value={selectedPrize}
            onChange={(e) => setSelectedPrize(e.target.value)}
          >
            <option value="">{t('selectPrize')}</option>
            {(data?.registeredGloves || []).map(glove => (
              <option key={glove} value={glove}>{glove}</option>
            ))}
          </select>
        </div>
        <div className="flex justify-center space-x-4 mt-4">
          <StyledButton 
            bgColor="#FFE55C"
            shadowColor='#FF9F0A'
            onClick={handleCreateSession}
          >
            {createSessionMutation.isPending ? t('creatingSession') : t('createSessionButton')}
          </StyledButton>
          <StyledButton
            bgColor='#909090'
            disabled={createSessionMutation.isPending || isPolling}
            shadowColor='#777777'
            textColor="#FFFFFF"
            onClick={() => navigate('/')}
          >
            {t('cancel')}
          </StyledButton>
        </div>
      </div>
    </div>
  );
};

export default CreateSession;