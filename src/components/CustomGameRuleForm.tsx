import React from 'react';
import { useTranslation } from 'react-i18next';
import { CustomGameRule } from '../types/GameRules';

interface CustomGameRuleFormProps {
  customRule: CustomGameRule;
  isPolling: boolean;
  setCustomRule: (rule: CustomGameRule) => void;
}

export const CustomGameRuleForm: React.FC<CustomGameRuleFormProps> = ({
  customRule,
  isPolling,
  setCustomRule,
}) => {
  const { t } = useTranslation();

  const handleChange = (field: keyof CustomGameRule, value: number) => {
    const updatedRule = new CustomGameRule();
    Object.assign(updatedRule, customRule);
    (updatedRule[field] as number) = value;
    setCustomRule(updatedRule);
  };

  return (
    <div className="rules-section mt-8 mb-8 space-y-1">
      <h2 className="text-xl mb-2 text-center">{t('ui:gameRules')}</h2>
      <div className="form-group">
        <label className="block text-sm">{t('ui:maximumUser')}</label>
        <input
          className="mt-1 block w-full bg-gray-200 border border-black rounded-md shadow-sm p-2 mb-2 text-black"
          disabled={isPolling}
          min="1"
          type="number"
          value={customRule.maximumUsers}
          onChange={(e) => handleChange('maximumUsers', Number(e.target.value))}
        />
      </div>

      <div className="form-group">
        <label className="block text-sm">{t('ui:minimumUser')}</label>
        <input
          className="mt-1 block w-full bg-gray-200 border border-black rounded-md shadow-sm p-2 mb-2 text-black"
          disabled={isPolling}
          min="1"
          type="number"
          value={customRule.minimumPlayers}
          onChange={(e) => handleChange('minimumPlayers', Number(e.target.value))}
        />
      </div>

      <div className="form-group">
        <label className="block text-sm">{t('ui:remainingUser')}</label>
        <input
          className="mt-1 block w-full bg-gray-200 border border-black rounded-md shadow-sm p-2 mb-2 text-black"
          disabled={isPolling}
          min="1"
          type="number"
          value={customRule.remainingUsers}
          onChange={(e) => handleChange('remainingUsers', Number(e.target.value))}
        />
      </div>

      <div className="form-group">
        <label className="block text-sm">{t('ui:startAfter')}</label>
        <input
          className="mt-1 block w-full bg-gray-200 border border-black rounded-md shadow-sm p-2 mb-2 text-black"
          disabled={isPolling}
          min="0"
          type="number"
          value={customRule.startAfter}
          onChange={(e) => handleChange('startAfter', Number(e.target.value))}
        />
      </div>

      <div className="form-group">
        <label className="block text-sm">{t('ui:maxRounds')}</label>
        <input
          className="mt-1 block w-full bg-gray-200 border border-black rounded-md shadow-sm p-2 mb-2 text-black"
          disabled={isPolling}
          min="1"
          type="number"
          value={customRule.maxRounds}
          onChange={(e) => handleChange('maxRounds', Number(e.target.value))}
        />
      </div>

      <div className="form-group">
        <label className="block text-sm">{t('ui:roundLength')}</label>
        <input
          className="mt-1 block w-full bg-gray-200 border border-black rounded-md shadow-sm p-2 mb-2 text-black"
          disabled={isPolling}
          min="1"
          type="number"
          value={customRule.roundLength}
          onChange={(e) => handleChange('roundLength', Number(e.target.value))}
        />
      </div>

      <div className="form-group">
        <label className="block text-sm">{t('ui:roundInterval')}</label>
        <input
          className="mt-1 block w-full bg-gray-200 border border-black rounded-md shadow-sm p-2 mb-2 text-black"
          disabled={isPolling}
          min="0"
          type="number"
          value={customRule.roundInterval}
          onChange={(e) => handleChange('roundInterval', Number(e.target.value))}
        />
      </div>

      <div className="form-group">
        <label className="block text-sm">{t('ui:initialHealthPoint')}</label>
        <input
          className="mt-1 block w-full bg-gray-200 border border-black rounded-md shadow-sm p-2 mb-2 text-black"
          disabled={isPolling}
          min="1"
          type="number"
          value={customRule.initialHealthPoint}
          onChange={(e) => handleChange('initialHealthPoint', Number(e.target.value))}
        />
      </div>
    </div>
  );
}; 