import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { JoinSession } from './components/JoinSession';
import { CreateSession } from './components/CreateSession';
import { GamePage } from './components/GamePage';
import { ResultPage } from './components/ResultPage';
import LoginPage from './pages/LoginPage';
import Navbar from './components/Navbar';
import { AccountProvider, useAccount } from './context/AccountContext';
import UserPage from './components/UserPage';
import { TipProvider } from './context/TipContext';

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
          <Route element={<ProtectedRoute><GamePage /></ProtectedRoute>} path="/game/:sessionId" />
          <Route element={<ResultPage />} path="/result/:sessionId" />
          <Route element={<UserPage />} path="/user/:userAddress" />
        </Routes>
      </main>
    </div>
  );
};

const queryClient = new QueryClient();

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AccountProvider>
        <TipProvider>
          <Router>
            <AppContent />
          </Router>
        </TipProvider>
      </AccountProvider>
    </QueryClientProvider>
  );
};

export default App; 