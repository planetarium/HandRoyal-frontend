import React from 'react';
import { useTranslation } from 'react-i18next';
import AddressDisplay from './AddressDisplay';
import { getLocalGloveImage } from '../fetches';
import EffectDisplay from './EffectDisplay';
import type { EffectType } from '../gql/graphql';

enum GloveStatus {
  Winning = 'winning',
  Losing = 'losing',
  Neutral = 'neutral'
}

interface MoveDisplayProps {
  currentHp: number;
  gloveAddress: string;
  maxHp: number;
  effects: string[];
  userAddress: string;
  userName: string;
  gloveStatus: GloveStatus;
  effect?: EffectType;
}

const MoveDisplay: React.FC<MoveDisplayProps> = ({ currentHp, gloveAddress, maxHp, effects, userAddress, userName, gloveStatus }) => {
  const { t } = useTranslation(['ui']);
  const hpPercentage = (currentHp / maxHp) * 100;

  const borderColorClass = gloveStatus === GloveStatus.Winning 
    ? 'border-green-500' 
    : gloveStatus === GloveStatus.Losing
      ? 'border-red-500' 
      : 'border-black';

  const sizeClass = gloveStatus === GloveStatus.Winning
    ? 'scale-110'
    : gloveStatus === GloveStatus.Losing
      ? 'scale-90'
      : '';

  return (
    <div className={`flex flex-col items-center rounded-lg w-full border-2 ${borderColorClass} bg-gray-600 shadow-md transition-transform duration-300 ${sizeClass}`}>
      {/* 이펙트 표시 공간 */}
      {effects.length > 0 ? effects.map((effect) => (
        <div key={effect} className="flex justify-start w-full px-2 py-1">
          <EffectDisplay type={effect} />
        </div>
      )) : (
        <div className="flex justify-start w-full px-2 py-1">
          &nbsp;
        </div>
      )}
      {/* 이미지 공간 */}
      <div className="w-full h-30 bg-white rounded-t-lg flex items-center justify-center">
        {gloveAddress === '' ? (
          <div className="text-4xl">❓</div>
        ) : (
          <img alt={gloveAddress} className="w-30 h-30 object-cover" src={getLocalGloveImage(gloveAddress)} />
        )}
      </div>
      {/* 장갑 이름 공간 */}
      <div className="text-center text-black w-full bg-white">
        <div className="w-full max-w-[300px] mx-auto">
          <p className="whitespace-nowrap text-ellipsis">
            {gloveAddress === '' ? t('ui:notSubmitted') : t(`glove:${gloveAddress}.name`)}
          </p>
        </div>
      </div>
      {/* HP 표시 공간 */}
      <div className="w-full p-1 bg-gray-700">
        <div className="relative w-full h-4 bg-gray-800 rounded-full overflow-hidden">
          <div 
            className="absolute left-0 top-0 h-full bg-red-500 transition-all duration-500 ease-out"
            style={{ width: `${hpPercentage}%` }}
          />
          <div className="absolute inset-0 flex items-center justify-center text-white text-xs">
            {currentHp}/{maxHp}
          </div>
        </div>
      </div>
      {/* 플레이어 주소 공간 */}
      <div className="flex w-full items-center justify-center text-sm text-white p-1 bg-gray-800 rounded-b">
        {userAddress === 'you' ? t('ui:you') : <AddressDisplay address={userAddress} type='user' />}
      </div>
    </div>
  );
};

export default MoveDisplay;
