import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export const ResultPage: React.FC = () => {
  const { t } = useTranslation();
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const host = 'Alice';
  const prize = '0x0000000000000000000000000000000000000010';
  const participants = ['Alice', 'Bob', 'Charlie'];
  const matches = [
    { player1: 'Alice', player2: 'Bob', winner: 'Alice' },
    { player1: 'Bob', player2: 'Charlie', winner: 'Charlie' },
    { player1: 'Alice', player2: 'Charlie', winner: 'Alice' },
  ];

  return (
    <div className="result-page p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">{t('sessionResults')}</h1>
      <p className="mb-2">{t('sessionId')}: {sessionId}</p>
      <p className="mb-2">{t('host')}: {host}</p>
      <p className="mb-2">{t('prize')}: {prize}</p>
      <h2 className="text-xl font-semibold mt-4 mb-2">{t('participants')}</h2>
      <ul className="list-disc list-inside">
        {participants.map((participant, index) => (
          <li key={index}>{participant}</li>
        ))}
      </ul>
      <h2 className="text-xl font-semibold mt-4 mb-2">{t('winner')}</h2>
      <p className="mb-2">{t('winner')}: {'나'}</p>
      <h2 className="text-xl font-semibold mt-4 mb-2">{t('matches')}</h2>
      <ul className="list-disc list-inside">
        {matches.map((match, index) => (
          <li key={index}>
            {match.player1} vs {match.player2} - {t('winner')}: {match.winner}
          </li>
        ))}
      </ul>
      <div className="flex justify-center mt-4">
        <button
          className="bg-blue-500 text-white p-2 rounded cursor-pointer"
          onClick={() => navigate('/')}
        >
          {t('backToMain')}
        </button>
      </div>
    </div>
  );
}; 