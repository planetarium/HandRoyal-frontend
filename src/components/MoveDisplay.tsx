import React from 'react';
import { useTranslation } from 'react-i18next';
import logo from '../assets/logo.webp';
import { MoveType } from '../gql/graphql';
import AddressDisplay from './AddressDisplay';

interface MoveDisplayProps {
  gloveAddress: string;
  userAddress: string;
  moveType: MoveType; // 가위, 바위, 보 중 하나
}

const MoveDisplay: React.FC<MoveDisplayProps> = ({ gloveAddress, userAddress, moveType }) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center rounded-lg w-full border-2 border-black bg-gray-700 shadow-md">
      {/* 이미지 공간 */}
      <div className="w-full h-64 bg-white rounded-t-lg flex items-center justify-center">
        <img alt="logo" className="w-32 h-32 object-cover" src={logo} />
      </div>
      {/* 가위, 바위, 보 텍스트 공간 */}
      <div className="flex w-full items-center justify-center text-2xl text-white font-bold border-black border-b p-2">
        {moveType === MoveType.Paper ? '✋ ' + t("paper") + ' ✋' : moveType === MoveType.Rock ? '✊ ' + t("rock") + ' ✊' : moveType === MoveType.Scissors ? '✌️ ' + t("scissors") + ' ✌️' : '-'}
      </div>
      {/* 플레이어 주소 공간 */}
      <div className="flex-1 flex items-center justify-center text-sm text-white p-1">
        {userAddress === 'you' ? t('you') : <AddressDisplay type='user' address={userAddress} />}
      </div>
    </div>
  );
};

export default MoveDisplay;
