import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { HandType } from '../types/types';

interface GameBoardProps {
  blocksLeft: number;
  onSubmit: (hand: HandType) => void;
}

export const GameBoard: React.FC<GameBoardProps> = ({ blocksLeft, onSubmit }) => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [selectedHand, setSelectedHand] = useState<HandType | null>(null);

  return (
    <div className="game-board">
      <div className="session-info">
        Session ID: {sessionId}
      </div>
      <div className="progress-bar">
        <div className="blocks-left">Blocks Left: {blocksLeft}</div>
      </div>
      
      <div className="battle-area">
        <div className="player-hand">YOU</div>
        <div className="vs">VS</div>
        <div className="opponent-hand">?</div>
      </div>

      <div className="hand-selection">
        <button 
          className={selectedHand === 'rock' ? 'selected' : ''} 
          onClick={() => setSelectedHand('rock')}
        >
          ✊
        </button>
        <button 
          className={selectedHand === 'paper' ? 'selected' : ''} 
          onClick={() => setSelectedHand('paper')}
        >
          ✋
        </button>
        <button 
          className={selectedHand === 'scissors' ? 'selected' : ''} 
          onClick={() => setSelectedHand('scissors')}
        >
          ✌️
        </button>
      </div>

      <button 
        className="submit-button"
        onClick={() => selectedHand && onSubmit(selectedHand)}
      >
        Submit
      </button>
    </div>
  );
}; 