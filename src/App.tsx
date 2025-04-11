import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import GlovePage from './pages/GlovePage';
import { MainPage } from './pages/MainPage';
import { CreateSession } from './pages/CreateSession';
import { GamePage } from './pages/GamePage';
import { ResultPage } from './pages/ResultPage';
import LoginPage from './pages/LoginPage';
import Navbar from './components/Navbar';
import { AccountProvider, useAccountContext } from './context/AccountContext';
import UserPage from './pages/UserPage';
import { TipProvider } from './context/TipContext';
import RegisterGlove from './components/RegisterGlove';
import { EquippedGloveProvider } from './context/EquippedGloveContext';
import JoinPage from './pages/JoinPage';
import { GameRuleProvider } from './context/GameRuleContext';
import { LanguageProvider } from './context/LanguageContext';
import PickUpPage from './pages/PickUpPage';
import MatchingPage from './pages/MatchingPage';
import RankingPage from './pages/RankingPage';

const ProtectedRoute: React.FC<{ children: JSX.Element }> = ({ children }) => {
  const { account } = useAccountContext();
  return account ? children : <Navigate to="/login" />;
};

const AppContent: React.FC = () => {
  return (
    <div className="min-h-screen pt-16">
      <Navbar />
      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-yellow-100 to-blue-100 p-10">
        <div className="max-w-3xl mx-auto">
          <main>
            <Routes>
              <Route element={<LoginPage />} path="/login" />
              <Route element={<ProtectedRoute><MainPage /></ProtectedRoute>} path="/" />
              <Route element={<ProtectedRoute><CreateSession /></ProtectedRoute>} path="/create" />
              <Route element={<ProtectedRoute><GamePage /></ProtectedRoute>} path="/game/:sessionId" />
              <Route element={<ResultPage />} path="/result/:sessionId" />
              <Route element={<UserPage />} path="/user/:userId" />
              <Route element={<ProtectedRoute><RegisterGlove /></ProtectedRoute>} path="/registerGlove" />
              <Route element={<GlovePage />} path="/glove/:gloveId" />
              <Route element={<ProtectedRoute><JoinPage /></ProtectedRoute>} path="/join/:sessionId" />
              <Route element={<ProtectedRoute><PickUpPage /></ProtectedRoute>} path="/pickup" />
              <Route element={<ProtectedRoute><MatchingPage /></ProtectedRoute>} path="/matching" />
              <Route element={<RankingPage />} path="/ranking" />
            </Routes>
          </main>
        </div>
      </div>
    </div>
  );
};

const queryClient = new QueryClient();

const App: React.FC = () => {
  return (
    <LanguageProvider>
      <QueryClientProvider client={queryClient}>
        <AccountProvider>
          <TipProvider>
            <EquippedGloveProvider>
              <GameRuleProvider>
                <Router>
                  <AppContent />
                </Router>
              </GameRuleProvider>
            </EquippedGloveProvider>
          </TipProvider>
        </AccountProvider>
      </QueryClientProvider>
    </LanguageProvider>
  );
};

export default App; 