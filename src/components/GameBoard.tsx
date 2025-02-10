import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import type { HandType } from '../types/types';

export const GameBoard: React.FC = () => {
  const { t } = useTranslation();
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [blocksLeft, setBlocksLeft] = useState(0);
  const [round, setRound] = useState(0);
  const [selectedHand, setSelectedHand] = useState<HandType | null>(null);
  const [displayedEmoji, setDisplayedEmoji] = useState<string | null>(null);
  const [opponentEmoji, setOpponentEmoji] = useState<string | null>(null);
  const [showNoSessionMessage, setShowNoSessionMessage] = useState(false);

  useEffect(() => {
    if (sessionId == undefined) {
      setShowNoSessionMessage(true);
      setTimeout(() => {
        navigate('/');
      }, 1000); // 1초 후 메인 페이지로 리디렉트
    }
    else if (round == 100) {
      navigate(`/result/${sessionId}`);
    }
    else {
      setBlocksLeft(10);
      setRound(0);
    }
  }, [round, sessionId, navigate]);



  const handleSubmit = () => {
    if (selectedHand) {
      // onSubmit(selectedHand);
      const emojiMap: Record<HandType, string> = {
        rock: '✊',
        paper: '✋',
        scissors: '✌️',
      };
      setDisplayedEmoji(emojiMap[selectedHand]);

      // 임의의 상대방 선택 (예시)
      const opponentChoices: HandType[] = ['rock', 'paper', 'scissors'];
      const randomChoice = opponentChoices[Math.floor(Math.random() * opponentChoices.length)];
      setOpponentEmoji(emojiMap[randomChoice]);
    }
  };

  return (
    <div className="game-board p-4 max-w-md mx-auto">
      {showNoSessionMessage ? (
        <p className="text-red-500 text-center mb-4">{t('noSessionFound')}</p>
      ) : (
        <>
          <h1 className="text-2xl font-bold mb-4">{t('gameBoardTitle')}</h1>
          <p className="mb-2">{t('sessionId')}: {sessionId}</p>
          <p className="mb-4">{t('blocksLeft', { count: blocksLeft })}</p>
          <p className="mb-4">{t('round', { count: round })}</p>
          <div className="bg-gray-100 h-64 mb-4 flex items-center justify-center space-x-4">
            {displayedEmoji ? (
              <>
                <span className="text-6xl">{displayedEmoji}</span>
                <span className="text-2xl text-gray-700">VS</span>
                <span className="text-6xl">{opponentEmoji}</span>
              </>
            ) : (
              <span className="text-gray-500">Image Placeholder</span>
            )}
          </div>
          <div className="flex justify-center space-x-4 mb-4">
            <button
              className={`p-2 rounded cursor-pointer ${selectedHand === 'rock' ? 'bg-blue-500 text-white' : 'bg-white text-black'}`}
              onClick={() => setSelectedHand('rock')}
            >
              ✊ {t('rock')}
            </button>
            <button
              className={`p-2 rounded cursor-pointer ${selectedHand === 'paper' ? 'bg-blue-500 text-white' : 'bg-white text-black'}`}
              onClick={() => setSelectedHand('paper')}
            >
              ✋ {t('paper')}
            </button>
            <button
              className={`p-2 rounded cursor-pointer ${selectedHand === 'scissors' ? 'bg-blue-500 text-white' : 'bg-white text-black'}`}
              onClick={() => setSelectedHand('scissors')}
            >
              ✌️ {t('scissors')}
            </button>
          </div>
          <div className="flex justify-center">
            <button
              className="bg-blue-500 text-white p-2 rounded cursor-pointer"
              disabled={!selectedHand}
              onClick={handleSubmit}
            >
              {t('submit')}
            </button>
          </div>
        </>
      )}
    </div>
  );
}; 