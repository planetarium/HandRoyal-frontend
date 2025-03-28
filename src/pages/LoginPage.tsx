import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAccountContext } from '../context/AccountContext';
import subscriptionClient from '../subscriptionClient';
import { USER_SUBSCRIPTION } from '../queries';
import StyledButton from '../components/StyledButton';
import logo from '../assets/logo.png';
import metamaskIcon from '../assets/MetaMask-icon-fox.svg';

const TEST_ACCOUNTS = [
  {
    name: 'test1',
    privateKey: '27950e31daa29df8cb3639377a056a03836f79867ce65d1a715f52278b46a479',
    address: '0x3df656F6E8Ed3C9ba5fE5596FC69eDbe8614EB2C'
  },
  {
    name: 'test2',
    privateKey: '92a0a4fac1a19af90eeded2bdd422d65a56612ad8fba9b3f96052e3c309be23d',
    address: '0x798f0D17a47b120069329313BaDdAd1eC97b5a83'
  },
  {
    name: 'test3',
    privateKey: 'a487c5a2cf88e00a4dd57f60baadb0ba4ec24caa52d01ae21dd2f79bef52795c',
    address: '0xF17D2337858EcD8e4e9DFEa8953f7a38109799fe'
  },
  {
    name: 'test4',
    privateKey: '330524c8f5d3040c3c54619f36e9c226c3368f0af390615599542e7cd230d853',
    address: '0xE8F6027e487Ef52d261663099061dF9c6E159188'
  },
  {
    name: 'test5',
    privateKey: '4ce92198f27d05f80a318f34ad9d0cd43ef7d2a138e022bc66770acdd53f716a',
    address: '0xfdc4eE76d810635eC932E57de386DC0ef3C9e7e9'
  },
  {
    name: 'test6',
    privateKey: '74f101e78bf0ac924298f4d9b2dfed69ae84114fd7ac7bdc012bb4a66329f43b',
    address: '0x17fB691ac6B3793871d3b1c06B806C75C60240d0'
  }
];

type LoginType = 'raw' | 'metamask';

const LoginPage: React.FC = () => {
  const { t } = useTranslation();
  const { account, createAccount } = useAccountContext();
  const [privateKeyInput, setPrivateKeyInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!account) return;

    const unsubscribe = subscriptionClient.subscribe(
      {
        query: USER_SUBSCRIPTION,
        variables: { userId: account.address.toString() },
      },
      {
        next: (result) => {
          const data = result.data as { onUserChanged: { id: string } };
          if (data.onUserChanged.id) {
            setIsLoggingIn(false);
            navigate('/');
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
  }, [navigate, account]);

  const handleLogin = useCallback(async (type: LoginType, param?: any) => {
    setIsLoggingIn(true);
    try {
      await createAccount(type, param);
      setErrorMessage(null);
      navigate('/');
      setIsLoggingIn(true);
    } catch (error) {
      if (error instanceof Error && error.message === 'Failed to fetch') {
        setErrorMessage(t('ui:login.networkError'));
      } else {
        setErrorMessage(t('ui:login.failedToLogin'));
      }

      console.error('Failed to login', error);
      setIsLoggingIn(false);
    }
  }, [navigate, createAccount, t]);

  const isDisabled = () => {
    return isLoggingIn;
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <img alt="logo" className="w-120 h-auto object-contain mb-4" src={logo} />
      <div className="flex flex-col w-full">
        <div className="flex items-center gap-2">
          <input
            className={`font-sans-serif flex-grow p-3 border border-black bg-gray-100 rounded-lg ${(isDisabled()) ? 'bg-gray-300 text-gray-500' : ''}`}
            disabled={isDisabled()}
            placeholder={t('ui:enterName')}
            type="text"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
          />
          <input
            className={`font-sans-serif flex-grow p-3 border border-black bg-gray-100 rounded-lg ${(isDisabled()) ? 'bg-gray-300 text-gray-500' : ''}`}
            disabled={isDisabled()}
            placeholder={t('ui:enterPrivateKey')}
            type="password"
            value={privateKeyInput}
            onChange={(e) => setPrivateKeyInput(e.target.value)}
          />
          <StyledButton
            disabled={isDisabled() || !nameInput.trim()}
            onClick={() => handleLogin('raw', privateKeyInput)}
          >
            {isLoggingIn ? 'Logging in...' : t('ui:login.loginButton')}
          </StyledButton>
        </div>
        <div className="text-center my-4 text-gray-500 flex items-center justify-center">
          <span className="mx-4">{t('ui:or')}</span>
        </div>
        <StyledButton
          disabled={isDisabled()}
          onClick={() => handleLogin('metamask')}
        >
          <img 
            alt="MetaMask" 
            className="w-6 h-6 mr-2"
            src={metamaskIcon}
          />
          {isLoggingIn ? 'Logging in...' : t('ui:connectWithMetamask')}
        </StyledButton>
        {errorMessage && (
          <div className="text-red-500 italic mt-4 text-center">
            {errorMessage}
          </div>
        )}
      </div>

      <div className="flex flex-col w-full">
        <h2 className="text-xl font-semibold mt-50 mb-4">{t('ui:testAccounts')}</h2>
        <div className="md:overflow-visible overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-3 border-b text-left">{t('ui:name')}</th>
                <th className="px-4 py-3 border-b text-left">{t('ui:privateKey')}</th>
                <th className="px-4 py-3 border-b text-left">{t('ui:address')}</th>
                <th className="px-4 py-3 border-b text-left w-32">{t('ui:login.loginButton')}</th>
              </tr>
            </thead>
            <tbody>
              {TEST_ACCOUNTS.map((account) => (
                <tr key={account.privateKey} className="hover:bg-gray-50">
                  <td className="px-4 py-4 border-b font-mono text-sm">
                    {account.name}
                  </td>
                  <td className="px-4 py-4 border-b font-mono text-sm break-all">
                    <button
                      className="text-left hover:text-blue-600 hover:underline w-full"
                      onClick={() => {
                        setNameInput(account.name);
                        setPrivateKeyInput(account.privateKey);
                      }}
                    >
                      {account.privateKey}
                    </button>
                  </td>
                  <td className="px-4 py-4 border-b font-mono text-sm break-all">
                    {account.address}
                  </td>
                  <td className="px-4 py-4 border-b w-32">
                    <StyledButton
                      disabled={isDisabled()}
                      onClick={() => {
                        setNameInput(account.name);
                        setPrivateKeyInput(account.privateKey);
                        handleLogin('raw', account.privateKey);
                      }}
                    >
                      {isLoggingIn ? t('ui:login.loggingIn') : t('ui:login.loginButton')}
                    </StyledButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 