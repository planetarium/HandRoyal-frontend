import React, { createContext, useContext, useState } from 'react';
import { CustomGameRule, SoloGameRule } from '../types/GameRules';
import type { GameRuleType } from '../types/GameRules';

interface GameRuleContextType {
  gameRule: CustomGameRule | SoloGameRule;
  setGameRule: (ruleOrType: CustomGameRule | SoloGameRule | GameRuleType) => void;
}

const GameRuleContext = createContext<GameRuleContextType | undefined>(undefined);

export const GameRuleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [gameRule, setGameRuleState] = useState<CustomGameRule | SoloGameRule>(new SoloGameRule());

  const setGameRule = (ruleOrType: CustomGameRule | SoloGameRule | GameRuleType) => {
    if (typeof ruleOrType === 'string') {
      const newRule = ruleOrType === 'solo' ? new SoloGameRule() : new CustomGameRule();
      setGameRuleState(newRule);
    } else {
      setGameRuleState(ruleOrType);
    }
  };

  return (
    <GameRuleContext.Provider
      value={{
        gameRule,
        setGameRule,
      }}
    >
      {children}
    </GameRuleContext.Provider>
  );
};

export const useGameRule = () => {
  const context = useContext(GameRuleContext);
  if (context === undefined) {
    throw new Error('useGameRule must be used within a GameRuleProvider');
  }
  return context;
}; 