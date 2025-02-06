import React, { useState } from 'react';
import { Session } from '../types/types';

interface CreateSessionProps {
  onCreate: (session: Session) => void;
}

export const CreateSession: React.FC<CreateSessionProps> = ({ onCreate }) => {
  const [rule, setRule] = useState('');
  const [prize, setPrize] = useState('');

  const handleSubmit = () => {
    const session: Session = {
      id: Math.random().toString(36).substr(2, 9),
      startAt: new Date(),
      rule,
      prize
    };
    onCreate(session);
  };

  return (
    <div className="create-session">
      <h1>새 세션 만들기</h1>
      <div className="session-form">
        <div className="form-group">
          <label>게임 규칙</label>
          <input
            type="text"
            placeholder="게임 규칙을 입력하세요"
            value={rule}
            onChange={(e) => setRule(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>상품</label>
          <input
            type="text"
            placeholder="상품을 입력하세요"
            value={prize}
            onChange={(e) => setPrize(e.target.value)}
          />
        </div>
        <button onClick={handleSubmit}>세션 생성하기</button>
      </div>
    </div>
  );
}; 