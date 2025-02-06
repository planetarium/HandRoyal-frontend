import React, { useState } from 'react';

interface JoinSessionProps {
  onJoin: (sessionId: string) => void;
  onCreateClick: () => void;
}

export const JoinSession: React.FC<JoinSessionProps> = ({ onJoin, onCreateClick }) => {
  const [sessionId, setSessionId] = useState('');

  return (
    <div className="join-session">
      <h1>HandRoyal(가제)</h1>
      <div className="join-form">
        <input
          type="text"
          placeholder="Enter Session ID..."
          value={sessionId}
          onChange={(e) => setSessionId(e.target.value)}
        />
        <button onClick={() => onJoin(sessionId)}>Enter</button>
      </div>
      <p className="create-session-link" onClick={onCreateClick}>
        Or you can create your own session
      </p>
    </div>
  );
}; 