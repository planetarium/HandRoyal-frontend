import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { JoinSession } from './components/JoinSession';
import { CreateSession } from './components/CreateSession';
import { GameBoard } from './components/GameBoard';
import { ResultPage } from './components/ResultPage';
import LoginPage from './pages/LoginPage';
import Navbar from './components/Navbar';
import { AccountProvider, useAccount } from './context/AccountContext';
import UserPage from './components/UserPage';

const ProtectedRoute: React.FC<{ children: JSX.Element }> = ({ children }) => {
  const { privateKey } = useAccount();
  return privateKey ? children : <Navigate to="/login" />;
};

const AppContent: React.FC = () => {
  return (
    <div>
      <Navbar />
      <main>
        <Routes>
          <Route element={<LoginPage />} path="/login" />
          <Route element={<ProtectedRoute><JoinSession /></ProtectedRoute>} path="/" />
          <Route element={<ProtectedRoute><CreateSession /></ProtectedRoute>} path="/create" />
          <Route element={<ProtectedRoute><GameBoard /></ProtectedRoute>} path="/game/:sessionId" />
          <Route element={<ProtectedRoute><ResultPage /></ProtectedRoute>} path="/result/:sessionId" />
          <Route element={<UserPage />} path="/user/:userAddress" />
        </Routes>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AccountProvider>
      <Router>
        <AppContent />
      </Router>
    </AccountProvider>
  );
};

export default App; 