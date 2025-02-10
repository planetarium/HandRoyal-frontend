import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { JoinSession } from './components/JoinSession';
import { CreateSession } from './components/CreateSession';
import { GameBoard } from './components/GameBoard';
import { ResultPage } from './components/ResultPage';
import Navbar from './components/Navbar';

const AppContent: React.FC = () => {
  return (
    <div>
      <Navbar />
      <main>
        <Routes>
          <Route element={<JoinSession />} path="/" />
          <Route element={<CreateSession />} path="/create" />
          <Route element={<GameBoard />} path="/game/:sessionId" />
          <Route element={<ResultPage />} path="/result/:sessionId" />
        </Routes>
      </main>
    </div>
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