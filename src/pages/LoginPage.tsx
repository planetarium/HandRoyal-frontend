import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { RawPrivateKey } from '@planetarium/account';
import { useAccount } from '../context/AccountContext';

const LoginPage: React.FC = () => {
  const { t } = useTranslation();
  const { setPrivateKey } = useAccount();
  const [privateKeyInput, setPrivateKeyInput] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const privateKey = RawPrivateKey.fromHex(privateKeyInput);
      setPrivateKey(privateKey);
      setErrorMessage(null);
      navigate('/'); // 로그인 후 메인 페이지로 이동
    } catch (error) {
      console.error('Invalid private key format:', error);
      setErrorMessage('' + error);
    }
  };

  return (
    <div className="login-page p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">{t('login')}</h1>
      <input
        className="w-full p-2 border border-gray-300 rounded mb-4"
        placeholder={t('enterPrivateKey')}
        type="password"
        value={privateKeyInput}
        onChange={(e) => setPrivateKeyInput(e.target.value)}
      />
      {errorMessage && (
        <div className="text-red-500 italic mb-4">
          {errorMessage}
        </div>
      )}
      <button
        className="bg-blue-500 text-white p-2 rounded w-full"
        onClick={handleLogin}
      >
        {t('loginButton')}
      </button>
    </div>
  );
};

export default LoginPage; 