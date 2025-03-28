import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { request } from 'graphql-request';
import { useQueryClient } from '@tanstack/react-query';
import { useRequiredAccount } from '../context/AccountContext';
import { useGameRule } from '../context/GameRuleContext';
import {
  GRAPHQL_ENDPOINT,
  isValidSessionIdDocument,
  SESSION_SUBSCRIPTION,
} from '../queries';
import subscriptionClient from '../subscriptionClient';
import StyledButton from '../components/StyledButton';
import { CustomGameRuleForm } from '../components/CustomGameRuleForm';
import type { GameRuleType, CustomGameRule } from '../types/GameRules';

const GLOVES = [
  '0x0000000000000000000000000000000000000000',
  '0x1000000000000000000000000000000000000000',
  '0x2000000000000000000000000000000000000000',
];

export const CreateSession: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const account = useRequiredAccount();
  const { gameRule, setGameRule } = useGameRule();
  const [sessionIdCandidate, setSessionIdCandidate] = useState<string>(
    '0000000000000000000000000000000000000000',
  );
  const [sessionId, setSessionId] = useState<string>('');
  const [isSessionIdValid, setIsSessionIdValid] = useState<boolean>(false);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [isPolling, setIsPolling] = useState<boolean>(false);
  const [pollingError, setPollingError] = useState<string | null>(null);
  const [prize, setPrize] = useState<string>('');
  const [isPrivate, setIsPrivate] = useState<boolean>(false);
  const [userAddress, setUserAddress] = useState<string>('');
  const [userAddressError, setUserAddressError] = useState<string | null>(null);
  const [users, setUsers] = useState<string[]>([]);
  const [joinAfterCreation, setJoinAfterCreation] = useState<boolean>(true);
  const isFirstMount = useRef(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!sessionId) return;

    const unsubscribe = subscriptionClient.subscribe(
      {
        query: SESSION_SUBSCRIPTION,
        variables: { sessionId: sessionId, userId: account.address.toString() },
      },
      {
        next: (result) => {
          const data = result.data as {
            onSessionChanged: { sessionState: string };
          };
          if (data.onSessionChanged.sessionState === 'READY' && isPolling) {
            if (joinAfterCreation) {
              navigate(`/join/${sessionId}`);
            } else {
              navigate(`/game/${sessionId}`);
            }
          }
        },
        error: (err) => {
          console.error('Subscription error:', err);
        },
        complete: () => {
          console.error('Subscription completed');
        },
      },
    );

    return () => {
      unsubscribe();
    };
  }, [sessionId, navigate, account, joinAfterCreation, isPolling]);

  useEffect(() => {
    if (isPrivate && joinAfterCreation) {
      const accountAddress = account.address.toString();
      if (!users.includes(accountAddress)) {
        setUsers([accountAddress, ...users]);
      }
    }
  }, [isPrivate, account, users, joinAfterCreation]);

  useEffect(() => {
    if (isPrivate && joinAfterCreation) {
      const oldAccount = users.length > 0 ? users[0] : '';
      const newAccount = account.address.toString();

      if (oldAccount && oldAccount !== newAccount) {
        const updatedUsers = users.filter((addr) => addr !== oldAccount);
        setUsers([newAccount, ...updatedUsers]);
      }
    }
  }, [account, isPrivate, joinAfterCreation, users]);

  useEffect(() => {
    if (isPrivate && joinAfterCreation) {
      const accountAddress = account.address.toString();
      if (!users.includes(accountAddress)) {
        setUsers([accountAddress, ...users]);
      }
    }
  }, [isPrivate, joinAfterCreation, account, users]);

  useEffect(() => {
    if (isPrivate && joinAfterCreation) {
      const oldAccount = users.length > 0 ? users[0] : '';
      const newAccount = account.address.toString();

      if (oldAccount && oldAccount !== newAccount) {
        const updatedUsers = users.filter((addr) => addr !== oldAccount);
        setUsers([newAccount, ...updatedUsers]);
      }
    }
  }, [account, isPrivate, joinAfterCreation, users]);

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
          const response = await request(
            GRAPHQL_ENDPOINT,
            isValidSessionIdDocument,
            { sessionId: newSessionId },
          );
          return response;
        },
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

  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      generateAndValidateSessionId();
    }
  }, [generateAndValidateSessionId]);

  const handleCreateSession = async () => {
    setSessionId(sessionIdCandidate);
    setIsPolling(true);
    setPollingError('');

    gameRule.users = isPrivate ? users : [];
    try {
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('Session creation timed out. Please try again.'));
        }, 30000);
      });

      await Promise.race([
        gameRule.CreateSession(account, sessionIdCandidate, prize),
        timeoutPromise
      ]);
    } catch (error) {
      console.error('Failed to create session:', error);
      setPollingError(t('ui:createSession.failedToCreateSession'));
      setIsPolling(false);
    }
  };

  const isValidAddress = useCallback((address: string): boolean => {
    return /^0x[0-9a-fA-F]{40}$/.test(address);
  }, []);

  const formatAddress = useCallback((address: string): string => {
    if (address.startsWith('0x')) {
      return address;
    }
    return `0x${address}`;
  }, []);

  const validateUserAddress = useCallback(
    (address: string) => {
      const isAddressInputValid = (addr: string): boolean => {
        if (!addr) return true;

        const formattedAddr = addr.startsWith('0x') ? addr : `0x${addr}`;

        if (formattedAddr.length === 42) {
          return isValidAddress(formattedAddr);
        }

        return /^0x[0-9a-fA-F]{40}$/.test(formattedAddr);
      };

      if (!address) {
        setUserAddressError(null);
        return;
      }

      const formattedAddress = formatAddress(address);

      if (!isAddressInputValid(address)) {
        setUserAddressError('invalidAddress');
        return;
      }

      if (users.includes(formattedAddress)) {
        setUserAddressError('addressAlreadyAdded');
        return;
      }

      setUserAddressError(null);
    },
    [users, formatAddress, isValidAddress],
  );

  useEffect(() => {
    validateUserAddress(userAddress);
  }, [userAddress, validateUserAddress]);

  const addUser = () => {
    if (!userAddress) return;

    const formattedAddress = formatAddress(userAddress);

    if (!isValidAddress(formattedAddress)) return;

    if (!users.includes(formattedAddress)) {
      setUsers([...users, formattedAddress]);
      setUserAddress('');
    }
  };

  const removeUser = (address: string) => {
    if (address === account.address.toString() && joinAfterCreation) {
      return;
    }
    setUsers(users.filter((a) => a !== address));
  };

  return (
    <div className="flex flex-col items-center create-session w-full mx-auto bg-gray-700 border-2 border-black rounded-lg text-white">
      <div className="w-full flex flex-col items-center bg-gray-900 p-4 rounded-t-lg border-b border-black">
        <h1
          className="text-2xl font-bold"
          style={{
            textShadow:
              '2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000',
          }}
        >
          {t('ui:createSession.title')}
        </h1>
      </div>
      <div className="mt-4">
        {pollingError && <p className="text-red-500">{pollingError}</p>}
        {isPolling && (
          <p className="text-blue-500">{t('ui:createSession.creatingSession')}</p>
        )}
      </div>
      <div className="w-full p-6 session-form space-y-4">
        <div className="form-group">
          <label className="block text-sm font-medium text-black-700">
            {t('ui:createSession.sessionId')}
          </label>
          <div className="flex items-center space-x-2">
            <input
              readOnly
              className="flex-grow mt-1 block text-gray-400 w-full border border-gray-300 rounded-md shadow-sm p-2 bg-gray-100 text-black"
              type="text"
              value={
                !isSessionIdValid || isFetching
                  ? 'Checking...'
                  : sessionIdCandidate
              }
            />
            <button
              aria-label={t('ui:refresh')}
              className="text-blue-500 text-2xl cursor-pointer"
              disabled={!isSessionIdValid || isFetching || isPolling}
              onClick={generateAndValidateSessionId}
            >
              🔄
            </button>
          </div>
        </div>

        <div className="form-group">
          <label className="block text-sm font-medium text-black-700">
            {t('ui:createSession.gameType')}
          </label>
          <select
            className="mt-1 block w-full bg-gray-200 border border-black rounded-md shadow-sm p-2 mb-2 text-black"
            disabled={isPolling}
            value={gameRule.type}
            onChange={(e) => setGameRule(e.target.value as GameRuleType)}
          >
            <option value="solo">{t('ui:createSession.solo')}</option>
            <option value="custom">{t('ui:createSession.custom')}</option>
          </select>
        </div>

        <div className="form-group">
          <div className="flex justify-between items-center">
            <label className="block text-sm font-medium text-black-700">
              {t('ui:createSession.prize')}
            </label>
            {!prize && (
              <span className="text-red-500 text-sm">
                {t('ui:createSession.prizeRequired')}
              </span>
            )}
          </div>
          <select
            className="mt-1 block w-full bg-gray-200 border border-black rounded-md shadow-sm p-2 mb-2 text-black"
            disabled={isPolling}
            value={prize}
            onChange={(e) => setPrize(e.target.value)}
          >
            <option value="">{t('ui:createSession.selectPrize')}</option>
            {GLOVES.map((glove) => (
              <option key={glove} value={glove}>
                {glove}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <div className="flex items-center">
            <input
              checked={isPrivate}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              disabled={isPolling}
              id="is-private"
              type="checkbox"
              onChange={(e) => setIsPrivate(e.target.checked)}
            />
            <label
              className="ml-2 block text-sm font-medium text-black-700"
              htmlFor="is-private"
            >
              {t('ui:createSession.privateSession')}
            </label>
          </div>
        </div>

        {isPrivate && (
          <div className="form-group border border-gray-300 rounded-md p-4 bg-gray-800">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-white">
                {t('ui:createSession.allowedAddresses')}
              </label>
              {userAddressError && (
                <span className="text-red-500 text-sm">
                  {t(`ui:createSession.${userAddressError}`)}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2 mb-3">
              <input
                disabled={isPolling || users.length >= gameRule.maximumUsers}
                placeholder="0x..."
                type="text"
                value={userAddress}
                className={`flex-grow mt-1 block w-full bg-gray-200 border ${
                  userAddressError ? 'border-red-500' : 'border-black'
                } rounded-md shadow-sm p-2 text-black text-sm`}
                onChange={(e) => {
                  const trimmedValue = e.target.value.trim();
                  setUserAddress(trimmedValue);
                }}
                onKeyDown={(e) => {
                  if (
                    e.key === 'Enter' &&
                    !isPolling &&
                    users.length < gameRule.maximumUsers
                  ) {
                    e.preventDefault();
                    addUser();
                  }
                }}
              />
              <button
                className={`font-bold py-2 px-4 rounded ${
                  isPolling ||
                  users.length >= gameRule.maximumUsers ||
                  !userAddress ||
                  !isValidAddress(formatAddress(userAddress)) ||
                  users.includes(formatAddress(userAddress)) ||
                  userAddressError !== null
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed border-2 border-gray-500'
                    : 'bg-blue-500 hover:bg-blue-700 text-white border-2 border-black'
                }`}
                disabled={
                  isPolling ||
                  users.length >= gameRule.maximumUsers ||
                  !userAddress ||
                  !isValidAddress(formatAddress(userAddress)) ||
                  users.includes(formatAddress(userAddress)) ||
                  userAddressError !== null
                }
                onClick={addUser}
              >
                +
              </button>
            </div>

            {users.length > 0 ? (
              <>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-white">
                    {t('ui:createSession.participantCount')}: {users.length} /{' '}
                    {gameRule.maximumUsers}
                  </span>
                  {users.length !== gameRule.maximumUsers && (
                    <span className="text-sm text-red-500">
                      {t('ui:createSession.exactParticipantsNeeded', {
                        count: gameRule.maximumUsers,
                      })}
                    </span>
                  )}
                </div>
                <ul className="mt-2 space-y-1 max-h-40 overflow-y-auto">
                  {users.map((address, index) => (
                    <li
                      key={index}
                      className="flex justify-between items-center bg-gray-700 p-2 rounded h-10"
                    >
                      <span
                        className={`text-sm ${address === account.address.toString() ? 'text-yellow-300 font-bold' : 'text-gray-300'}`}
                      >
                        {address === account.address.toString()
                          ? `${address} (${t('ui:createSession.sessionCreator')})`
                          : address}
                      </span>
                      <div className="w-6 flex justify-center">
                        {!(
                          address === account.address.toString() &&
                          joinAfterCreation
                        ) && (
                          <button
                            className="text-red-500 hover:text-red-700"
                            disabled={isPolling}
                            onClick={() => removeUser(address)}
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="text-sm text-gray-400">
                {t('ui:createSession.noAddressesAdded')}
              </p>
            )}
          </div>
        )}

        <div className="form-group">
          <div className="flex items-center">
            <input
              checked={joinAfterCreation}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              disabled={isPolling}
              id="join-after-creation"
              type="checkbox"
              onChange={(e) => setJoinAfterCreation(e.target.checked)}
            />
            <label
              className="ml-2 block text-sm font-medium text-black-700"
              htmlFor="join-after-creation"
            >
              {t('ui:createSession.joinAfterCreation')}
            </label>
          </div>
        </div>

        {gameRule.type === 'custom' && (
          <CustomGameRuleForm
            customRule={gameRule as CustomGameRule}
            isPolling={isPolling}
            setCustomRule={(rule) => setGameRule(rule)}
          />
        )}

        <div className="flex justify-center space-x-4">
          <StyledButton
            disabled={
              !isSessionIdValid ||
              isPolling ||
              !prize ||
              (isPrivate &&
                (users.length === 0 || users.length !== gameRule.maximumUsers))
            }
            onClick={handleCreateSession}
          >
            {t('ui:createSession.createSessionButton')}
          </StyledButton>
          <StyledButton
            bgColor='#909090'
            disabled={!isPolling}
            shadowColor='#777777'
            textColor="#FFFFFF"
            onClick={() => navigate('/')}
          >
            {t('ui:cancel')}
          </StyledButton>
        </div>
      </div>
    </div>
  );
};

export default CreateSession;
