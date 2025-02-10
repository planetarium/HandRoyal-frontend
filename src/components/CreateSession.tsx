import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { request } from 'graphql-request';
import { useQuery } from '@tanstack/react-query';
import { graphql } from '../gql/gql'
import type { Session } from '../types/types';


interface GameRules {
  minPlayers: number;
  maxPlayers: number;
  blocksPerRound: number;
}

const GRAPHQL_ENDPOINT = 'http://localhost:5259/graphql';
const isValidSessionIdDocument = graphql(/* GraphQL */ `
  query IsValidSessionId($sessionId: String!) {
    isValidSessionId(sessionId: $sessionId)
  }
`)
 

export const CreateSession: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [sessionId, setSessionId] = useState<string>('0000000000000000000000000000000000000000');
  const [isSessionIdValid, setIsSessionIdValid] = useState<boolean>(false);
  const [gameRules, setGameRules] = useState<GameRules>({
    minPlayers: 10,
    maxPlayers: 100,
    blocksPerRound: 10
  });
  const [prize, setPrize] = useState('');
  const [firstAttempt, setFirstAttempt] = useState<boolean>(true);

  const generateRandomAddress = () => {
    let address = '';
    for (let i = 0; i < 40; i++) {
      address += Math.floor(Math.random() * 16).toString(16);
    }
    return address;
  };

  const { refetch, data, isFetching, isError } = useQuery({
    queryKey: ['checkSessionId', sessionId],
    queryFn: async () =>
      request(GRAPHQL_ENDPOINT, isValidSessionIdDocument, { sessionId: sessionId }),
    enabled: false // 쿼리를 수동으로 실행하도록 설정
  });

  const generateAndValidateSessionId = useCallback(() => {
    const newSessionId = generateRandomAddress();
    setSessionId(newSessionId);
    setIsSessionIdValid(false); // 유효성 초기화
    refetch();
  }, [refetch]);

  useEffect(() => {
    if (!isSessionIdValid) {
      if (firstAttempt) {
        generateAndValidateSessionId();
        setFirstAttempt(false);
      } else {
        const timeoutId = setTimeout(() => {
          generateAndValidateSessionId();
        }, 1000); // 1초 대기 후 실행

        return () => clearTimeout(timeoutId); // 컴포넌트 언마운트 시 타이머 정리
      }
    }
  }, [generateAndValidateSessionId, isSessionIdValid, firstAttempt]);

  useEffect(() => {
    if (data?.isValidSessionId) {
      setIsSessionIdValid(true);
    } else {
      setIsSessionIdValid(false);
    }
  }, [data]);

  const handleGameRulesChange = (field: keyof GameRules, value: string) => {
    const numValue = parseInt(value, 10) || 0;
    setGameRules(prev => ({
      ...prev,
      [field]: numValue
    }));
  };

  const handleCreateSession = () => {
    const session: Session = {
      id: sessionId,
      rule: JSON.stringify(gameRules),
      prize
    };
    navigate(`/game/${session.id}`);
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
              value={(!isSessionIdValid || isFetching || isError) ? 'Checking...' : sessionId}
            />
            <button
              aria-label={t('refresh')}
              className="text-blue-500 text-2xl cursor-pointer"
              disabled={!isSessionIdValid || isFetching || isError}
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
            disabled
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            placeholder={t('enterPrize')}
            type="text"
            value={prize}
            onChange={(e) => setPrize(e.target.value)}
          />
        </div>
        <div className="flex justify-center space-x-4 mt-4">
          <button className="bg-gray-500 text-white p-2 rounded cursor-pointer" onClick={() => navigate('/')}>
            {t('cancel')}
          </button>
          <button
            className={`p-2 rounded cursor-pointer ${(!isSessionIdValid || isFetching || isError) ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-500 text-white'}`}
            disabled={!isSessionIdValid || isFetching || isError}
            onClick={handleCreateSession}
          >
            {t('createSessionButton')}
          </button>
        </div>
      </div>
    </div>
  );
};