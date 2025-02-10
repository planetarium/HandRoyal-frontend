import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

export const JoinSession: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [sessionId, setSessionId] = useState('');
  const [error, setError] = useState('');

  const handleJoin = () => {
    if (!validateSessionIdLength(sessionId)) {
      setError(t('invalidSessionIdLength'));
      return;
    }

    navigate(`/game/${sessionId}`);
  };

  const handleCreate = () => {
    navigate('/create');
  };

  const validateSessionIdLength = (id: string): boolean => {
    return id.length === 40;
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
        <button className="bg-blue-500 text-white p-2 rounded cursor-pointer" onClick={handleJoin}>
          {t('join')}
        </button>
      </div>
      {error && <p className="text-red-500">{error}</p>}
      <p className="create-session-link mt-4 text-center text-gray-500 cursor-pointer" onClick={handleCreate}>
        <i>{t('createNewSession')}</i>
      </p>
    </div>
  );
}; 