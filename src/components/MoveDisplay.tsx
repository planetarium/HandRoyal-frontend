import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import logo from '../assets/logo.webp';
import { MoveType } from '../gql/graphql';
import AddressDisplay from './AddressDisplay';
import { getGloveImage } from '../fetches';

interface MoveDisplayProps {
  gloveAddress: string;
  userAddress: string;
  moveType: MoveType; // 가위, 바위, 보 중 하나
}

const MoveDisplay: React.FC<MoveDisplayProps> = ({ gloveAddress, userAddress, moveType }) => {
  const { t } = useTranslation();
  const [moveImage, setMoveImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const response = await getGloveImage(gloveAddress, moveType);
        const blob = await response.blob();
        const imageUrl = URL.createObjectURL(blob);
        setMoveImage(imageUrl);
      } catch (error) {
        console.error('Failed to fetch glove image:', error);
      }
    };

    fetchImage();
  }, [gloveAddress, moveType]);

  return (
    <div className="flex flex-col items-center rounded-lg w-full border-2 border-black bg-gray-600 shadow-md">
      {/* 이미지 공간 */}
      <div className="w-full h-64 bg-white rounded-t-lg flex items-center justify-center">
        {moveImage ? (
          <img alt="move" className="w-32 h-32 object-cover" src={moveImage} />
        ) : (
          <img alt="logo" className="w-32 h-32 object-cover" src={logo} />
        )}
      </div>
      {/* 가위, 바위, 보 텍스트 공간 */}
      <div className="flex w-full items-center justify-center text-2xl text-white font-bold border-black border-b p-2">
        {moveType === MoveType.Paper ? '✋ ' + t("paper") + ' ✋' : moveType === MoveType.Rock ? '✊ ' + t("rock") + ' ✊' : moveType === MoveType.Scissors ? '✌️ ' + t("scissors") + ' ✌️' : '-'}
      </div>
      {/* 플레이어 주소 공간 */}
      <div className="flex w-full items-center justify-center text-sm text-white p-1 bg-gray-800 rounded-b">
        {userAddress === 'you' ? t('you') : <AddressDisplay address={userAddress} type='user' />}
      </div>
    </div>
  );
};

export default MoveDisplay;
