import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { JoinSession } from './components/JoinSession';
import { CreateSession } from './components/CreateSession';
import { GameBoard } from './components/GameBoard';
import { Session, HandType } from './types/types';

const AppContent: React.FC = () => {
  const navigate = useNavigate();

  const handleJoinSession = (sessionId: string) => {
    // TODO: 실제 세션 참가 로직 구현
    console.log('Joining session:', sessionId);
    navigate(`/game/${sessionId}`);
  };

  const handleCreateSession = (newSession: Session) => {
    // TODO: 실제 세션 생성 로직 구현
    console.log('Created session:', newSession);
    navigate(`/game/${newSession.id}`);
  };

  const handleSubmitHand = (hand: HandType) => {
    // TODO: 실제 가위바위보 제출 로직 구현
    console.log('Submitted hand:', hand);
  };

  return (
    <Routes>
      <Route 
        path="/" 
        element={
          <JoinSession 
            onJoin={handleJoinSession}
            onCreateClick={() => navigate('/create')}
          />
        } 
      />
      <Route 
        path="/create" 
        element={<CreateSession onCreate={handleCreateSession} />} 
      />
      <Route 
        path="/game/:sessionId" 
        element={<GameBoard blocksLeft={10} onSubmit={handleSubmitHand} />} 
      />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App; 